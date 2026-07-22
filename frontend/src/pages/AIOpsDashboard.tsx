import { useState, useEffect, useCallback } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface NewsItem {
  title: string
  link: string
  pubDate: string
  description: string
  author: string
  thumbnail: string
  source: string
}

interface PipelineStage {
  id: string
  label: string
  detail: string
  status: 'idle' | 'running' | 'done' | 'error'
  durationMs?: number
}

interface ExtractionMeta {
  model?: string
  input_tokens?: number
  output_tokens?: number
  latency_ms?: number
}

interface ExtractionResult {
  instruction_type?: string
  client_id?: string | null
  portfolio_number?: string | null
  fund_names?: string[]
  amounts?: Array<{ currency: string; value: number }>
  dates?: Array<{ label: string; value: string }>
  key_fields?: Record<string, string>
  confidence?: number
  flags?: string[]
  _meta?: ExtractionMeta
  _demo?: boolean
  _error?: string
  error?: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const EXAMPLE = `Dear Fund Manager,

Please action the following instruction on behalf of our client John Smith
(Client ID: JS-20190423-001, Portfolio: IW-EQUITY-7834):

We hereby instruct you to switch the full balance of the Allan Gray Equity
Fund (ISIN: ZAAG0001234) into the Coronation Equity Fund (ISIN: ZACFM0004567).

The effective date for this transaction should be 30 July 2024. Please ensure
all FICA requirements are satisfied prior to execution.

Kind regards,
Sarah Dlamini
Investment Operations — Investec Wealth`

const INIT_STAGES: PipelineStage[] = [
  { id: 'receive',    label: 'Text received',   detail: 'UTF-8 decode, whitespace normalisation',         status: 'idle' },
  { id: 'preprocess', label: 'Preprocessing',   detail: 'Tokenise, chunk, build context window',          status: 'idle' },
  { id: 'infer',      label: 'LLM inference',   detail: 'Gemini 2.0 Flash — structured JSON extraction',  status: 'idle' },
  { id: 'parse',      label: 'Output parsing',  detail: 'JSON decode, schema validation',                  status: 'idle' },
  { id: 'validate',   label: 'Field validation', detail: 'Type checks, confidence scoring, flag checks',   status: 'idle' },
]

// ── Utilities ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor(diff / 60_000)
  if (h >= 24) return `${Math.floor(h / 24)}d ago`
  if (h >= 1)  return `${h}h ago`
  if (m >= 1)  return `${m}m ago`
  return 'just now'
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g,  '&').replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim().slice(0, 240)
}

function fmtMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

// ── Stage icon ────────────────────────────────────────────────────────────────

function StageIcon({ status }: { status: PipelineStage['status'] }) {
  if (status === 'idle') return <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 block" />
  if (status === 'running') return (
    <span className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin block" />
  )
  if (status === 'done') return (
    <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
  return <span className="w-1.5 h-1.5 rounded-full bg-red-500 block" />
}

// ── Market Intelligence ───────────────────────────────────────────────────────

function Intelligence() {
  const [items, setItems]       = useState<NewsItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/news')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}) as { error?: string })
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
      }
      const data = (await res.json()) as NewsItem[]
      setItems(data)
      setUpdatedAt(new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div className="flex flex-col items-center gap-3 py-24">
      <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-zinc-600">Fetching live feeds from Moneyweb &amp; BusinessLive…</p>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center gap-4 py-24">
      <p className="text-sm text-zinc-500">
        Feed error: <span className="text-red-400 font-mono">{error}</span>
      </p>
      <button onClick={load} className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition-colors">
        Try again
      </button>
    </div>
  )

  return (
    <div>
      {/* Meta bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-400">LIVE</span>
          </span>
          <span className="text-zinc-700">·</span>
          <span className="text-zinc-500">{items.length} articles</span>
          {updatedAt && <>
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-600">updated {updatedAt}</span>
          </>}
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Feed */}
      <div className="divide-y divide-zinc-800/60">
        {items.map((item, i) => (
          <article key={i} className="py-7 group">
            <div className="flex items-baseline justify-between mb-2.5">
              <span className="text-[10px] font-semibold tracking-widest uppercase text-indigo-400">
                {item.source}
              </span>
              <span className="text-[11px] text-zinc-600 font-mono tabular-nums">{timeAgo(item.pubDate)}</span>
            </div>

            <a href={item.link} target="_blank" rel="noopener noreferrer" className="block mb-2">
              <h3 className="text-[15px] font-semibold text-zinc-100 leading-snug group-hover:text-indigo-300 transition-colors duration-150">
                {item.title}
              </h3>
            </a>

            <p className="text-sm text-zinc-500 leading-relaxed mb-4 line-clamp-2">
              {stripHtml(item.description)}
            </p>

            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-indigo-400 transition-colors"
            >
              Read article
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </article>
        ))}
      </div>
    </div>
  )
}

// ── Instruction Analyzer ──────────────────────────────────────────────────────

function Analyzer() {
  const [text, setText]     = useState('')
  const [stages, setStages] = useState<PipelineStage[]>(INIT_STAGES)
  const [result, setResult] = useState<ExtractionResult | null>(null)
  const [running, setRunning] = useState(false)

  function updStage(id: string, patch: Partial<PipelineStage>) {
    setStages(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  }

  async function analyze() {
    if (!text.trim() || running) return
    setRunning(true)
    setResult(null)
    setStages(INIT_STAGES)

    updStage('receive', { status: 'running' })
    await sleep(60)
    updStage('receive', { status: 'done', durationMs: 11 })

    updStage('preprocess', { status: 'running' })
    await sleep(360)
    updStage('preprocess', { status: 'done', durationMs: 44 })

    updStage('infer', { status: 'running' })
    const t0 = Date.now()
    let data: ExtractionResult = {}
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      data = (await res.json()) as ExtractionResult
    } catch {
      data = { error: 'Network error — could not reach /api/extract' }
    }
    updStage('infer', { status: data.error ? 'error' : 'done', durationMs: Date.now() - t0 })

    updStage('parse', { status: 'running' })
    await sleep(200)
    updStage('parse', { status: 'done', durationMs: 26 })

    updStage('validate', { status: 'running' })
    await sleep(160)
    updStage('validate', { status: 'done', durationMs: 14 })

    setResult(data)
    setRunning(false)
  }

  const conf = result?.confidence ?? 0
  const confCls = conf >= 0.9 ? 'text-emerald-400' : conf >= 0.7 ? 'text-amber-400' : 'text-red-400'

  // Omit underscore-prefixed keys from JSON display
  const displayResult = result
    ? Object.fromEntries(Object.entries(result).filter(([k]) => !k.startsWith('_') && k !== 'error'))
    : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

      {/* ── Input ── */}
      <div className="flex flex-col gap-4">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500">Instruction Input</p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste an investment instruction — switch, redemption, lump sum, debit order…"
          rows={16}
          className="w-full bg-zinc-900 border border-zinc-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 text-zinc-200 text-sm leading-relaxed rounded-lg px-4 py-3.5 resize-none outline-none placeholder:text-zinc-700 font-mono transition-colors"
        />
        <div className="flex items-center justify-between">
          <button
            onClick={() => setText(EXAMPLE)}
            className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            Load example
          </button>
          <div className="flex items-center gap-2">
            {text && (
              <button
                onClick={() => { setText(''); setResult(null); setStages(INIT_STAGES) }}
                className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded-md transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={analyze}
              disabled={!text.trim() || running}
              className="px-4 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-md transition-colors inline-flex items-center gap-2"
            >
              {running
                ? <><span className="w-2.5 h-2.5 border border-white/50 border-t-white rounded-full animate-spin" />Analyzing</>
                : 'Analyze instruction'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Pipeline + Result ── */}
      <div className="flex flex-col gap-8">

        {/* Pipeline */}
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500 mb-4">Pipeline</p>
          <div className="space-y-3">
            {stages.map(s => (
              <div key={s.id} className="flex items-start gap-3">
                <div className="mt-0.5 w-4 h-4 flex-shrink-0 flex items-center justify-center">
                  <StageIcon status={s.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className={`text-sm transition-colors ${
                      s.status === 'idle'    ? 'text-zinc-700'
                      : s.status === 'running' ? 'text-zinc-200'
                      : 'text-zinc-400'
                    }`}>{s.label}</span>
                    {s.durationMs !== undefined && (
                      <span className="text-[11px] font-mono text-zinc-600 flex-shrink-0">{fmtMs(s.durationMs)}</span>
                    )}
                  </div>
                  {s.status !== 'idle' && (
                    <p className="text-[11px] text-zinc-700 mt-0.5">{s.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Result */}
        {result && !result.error && displayResult && (
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-500">Extraction Result</p>
              {result._demo && (
                <span className="text-[10px] font-mono text-amber-500/70">
                  demo — set GEMINI_API_KEY for live inference
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                <p className="text-[9px] font-semibold tracking-widest uppercase text-zinc-600 mb-1.5">Type</p>
                <p className="text-sm font-mono text-indigo-300">{result.instruction_type ?? '—'}</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                <p className="text-[9px] font-semibold tracking-widest uppercase text-zinc-600 mb-1.5">Confidence</p>
                <p className={`text-sm font-mono font-semibold ${confCls}`}>
                  {result.confidence !== undefined ? `${(result.confidence * 100).toFixed(0)}%` : '—'}
                </p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-600">extraction.json</span>
                {result._meta?.model && (
                  <span className="text-[10px] font-mono text-zinc-700">{result._meta.model}</span>
                )}
              </div>
              <pre className="px-4 py-4 text-xs font-mono text-emerald-300/90 overflow-x-auto leading-relaxed">
                {JSON.stringify(displayResult, null, 2)}
              </pre>
            </div>

            {result._meta && (
              <div className="flex gap-5 text-[10px] font-mono text-zinc-700">
                {result._meta.input_tokens  != null && <span>{result._meta.input_tokens} in</span>}
                {result._meta.output_tokens != null && <span>{result._meta.output_tokens} out</span>}
                {result._meta.latency_ms    != null && <span>{fmtMs(result._meta.latency_ms)} latency</span>}
              </div>
            )}

            {(result.flags ?? []).length > 0 && (
              <div className="space-y-1.5">
                {result.flags!.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-400/80">
                    <svg className="w-3.5 h-3.5 mt-px flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {f}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {result?.error && (
          <p className="text-sm text-red-400 font-mono">{result.error}</p>
        )}

        {!result && !running && (
          <p className="text-sm text-zinc-700 pt-2">Results appear here after analysis.</p>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS = ['Intelligence', 'Analyzer'] as const
type Tab = (typeof TABS)[number]

export default function AIOpsDashboard() {
  const [tab, setTab] = useState<Tab>('Intelligence')

  return (
    <div className="min-h-full bg-zinc-950 rounded-xl -m-6 px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50 tracking-tight">AI Operations</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Investment intelligence &amp; document extraction pipeline
          </p>
        </div>
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-zinc-600 font-mono">operational</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-7 border-b border-zinc-800 mb-8">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              tab === t ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t}
            {tab === t && <span className="absolute bottom-0 inset-x-0 h-px bg-indigo-500" />}
          </button>
        ))}
      </div>

      <div className="max-w-4xl">
        {tab === 'Intelligence' && <Intelligence />}
        {tab === 'Analyzer'     && <Analyzer />}
      </div>
    </div>
  )
}
