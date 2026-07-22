export const config = { runtime: 'edge' }

// ── Feed sources (direct RSS — no third-party aggregator) ─────────────────────
// BBC and Yahoo are highly reliable from any server IP.
// Moneyweb is attempted with a browser UA; included if reachable.
const FEEDS = [
  { source: 'BBC Business',   url: 'https://feeds.bbci.co.uk/news/business/rss.xml',   max: 10 },
  { source: 'Yahoo Finance',  url: 'https://finance.yahoo.com/news/rssindex',           max: 8  },
  { source: 'Moneyweb',       url: 'https://www.moneyweb.co.za/feed/',                 max: 7  },
]

const UA = 'Mozilla/5.0 (compatible; RSS Reader/2.0)'

// ── Minimal RSS XML parser ────────────────────────────────────────────────────

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g,  '&').replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'").replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
}

function extractTag(xml: string, tag: string): string {
  // CDATA
  const cd = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>`, 'i').exec(xml)
  if (cd) return cd[1].trim()
  // Regular
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i').exec(xml)
  if (!re) return ''
  return decodeEntities(re[1].replace(/<[^>]+>/g, '').trim())
}

function extractLink(xml: string): string {
  // <link>url</link>
  const m1 = /<link[^/\s>]*>([^<]+)<\/link>/i.exec(xml)
  if (m1) return m1[1].trim()
  // <link href="url" />
  const m2 = /<link[^>]+href="([^"]+)"/i.exec(xml)
  if (m2) return m2[1]
  // <guid> as fallback
  return extractTag(xml, 'guid')
}

interface FeedItem {
  title: string; link: string; pubDate: string
  description: string; source: string; thumbnail: string; author: string
}

function parseRSS(xml: string, source: string, max: number): FeedItem[] {
  const out: FeedItem[] = []
  const re = /<item[^>]*>([\s\S]*?)<\/item>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null && out.length < max) {
    const chunk = m[1]
    const title = extractTag(chunk, 'title')
    const link  = extractLink(chunk)
    if (!title || !link) continue
    out.push({
      title,
      link,
      pubDate:     extractTag(chunk, 'pubDate') || new Date().toUTCString(),
      description: extractTag(chunk, 'description'),
      source,
      thumbnail:   '',
      author:      extractTag(chunk, 'dc:creator') || extractTag(chunk, 'author'),
    })
  }
  return out
}

// ── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(): Promise<Response> {
  const settled = await Promise.allSettled(
    FEEDS.map(async ({ source, url, max }) => {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, 'Accept': 'application/rss+xml, application/xml, text/xml, */*' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) throw new Error(`${source}: HTTP ${res.status}`)
      const xml = await res.text()
      return parseRSS(xml, source, max)
    })
  )

  const items = settled
    .filter((r): r is PromiseFulfilledResult<FeedItem[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

  if (items.length === 0) {
    const errors = settled
      .filter(r => r.status === 'rejected')
      .map(r => (r as PromiseRejectedResult).reason?.message ?? 'unknown')
      .join('; ')
    return new Response(JSON.stringify({ error: `All feeds failed: ${errors}` }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return Response.json(items, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
  })
}
