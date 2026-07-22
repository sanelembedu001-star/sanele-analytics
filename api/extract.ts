export const config = { runtime: 'edge' }

// ── Demo result returned when GEMINI_API_KEY is not set ──────────────────────

const DEMO: Record<string, unknown> = {
  instruction_type: 'fund-switch',
  client_id: 'JS-20190423-001',
  portfolio_number: 'IW-EQUITY-7834',
  fund_names: ['Allan Gray Equity Fund', 'Coronation Equity Fund'],
  amounts: [],
  dates: [{ label: 'effective_date', value: '2024-07-30' }],
  key_fields: {
    from_isin: 'ZAAG0001234',
    to_isin: 'ZACFM0004567',
    switch_type: 'full_balance',
    client_name: 'John Smith',
    submitted_by: 'Sarah Dlamini',
    institution: 'Investec Wealth',
  },
  confidence: 0.97,
  flags: ['FICA compliance check required before execution'],
  _meta: {
    model: 'gemini-2.0-flash (demo)',
    input_tokens: 187,
    output_tokens: 112,
    latency_ms: 1180,
  },
  _demo: true,
}

// ── Prompt ────────────────────────────────────────────────────────────────────

function buildPrompt(text: string): string {
  return `You are an AI extraction agent for an investment operations platform.
Extract structured data from the investment instruction below and return ONLY a valid JSON object — no markdown, no code fences, no explanation.

Required schema:
{
  "instruction_type": "fund-switch" | "redemption" | "lump-sum" | "debit-order" | "beneficiary" | "other",
  "client_id": string | null,
  "portfolio_number": string | null,
  "fund_names": string[],
  "amounts": [{ "currency": string, "value": number }],
  "dates": [{ "label": string, "value": "YYYY-MM-DD" }],
  "key_fields": { [key: string]: string },
  "confidence": number (0.0–1.0),
  "flags": string[]
}

flags should list: missing required fields, compliance notes, data ambiguities.

Investment instruction:
---
${text}
---`
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let text = ''
  try {
    const body = (await request.json()) as { text?: string }
    text = body.text?.trim() ?? ''
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!text) {
    return new Response(JSON.stringify({ error: '"text" is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    await new Promise(r => setTimeout(r, 1100 + Math.random() * 400))
    return Response.json(DEMO)
  }

  const t0 = Date.now()

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(text) }] }],
          generationConfig: { temperature: 0.05, maxOutputTokens: 1024 },
        }),
        signal: AbortSignal.timeout(20_000),
      }
    )

    const gd = (await geminiRes.json()) as {
      candidates?: Array<{ content: { parts: Array<{ text: string }> } }>
      usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number }
      modelVersion?: string
      error?: { message: string }
    }

    if (!geminiRes.ok || gd.error) {
      throw new Error(gd.error?.message ?? `Gemini HTTP ${geminiRes.status}`)
    }

    const raw = gd.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned) as Record<string, unknown>

    return Response.json({
      ...parsed,
      _meta: {
        model: gd.modelVersion ?? 'gemini-2.0-flash',
        input_tokens: gd.usageMetadata?.promptTokenCount,
        output_tokens: gd.usageMetadata?.candidatesTokenCount,
        latency_ms: Date.now() - t0,
      },
    })
  } catch (err) {
    // Graceful fallback — never return 5xx to client
    return Response.json({
      ...DEMO,
      _error: String(err),
      _demo: true,
    })
  }
}
