export const config = { runtime: 'edge' }

const FEEDS = [
  { source: 'Moneyweb', url: 'https://www.moneyweb.co.za/feed/', count: 12 },
  { source: 'BusinessLive', url: 'https://www.businesslive.co.za/feed/', count: 8 },
]

export default async function handler() {
  const settled = await Promise.allSettled(
    FEEDS.map(async ({ source, url, count }) => {
      const endpoint = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=${count}`
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(6000) })
      if (!res.ok) throw new Error(`${source}: HTTP ${res.status}`)
      const json = await res.json() as { status: string; items?: unknown[] }
      if (json.status !== 'ok') throw new Error(`${source}: feed error`)
      return (json.items ?? []).map((item) => ({ ...(item as object), source }))
    })
  )

  const items = settled
    .filter((r): r is PromiseFulfilledResult<unknown[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .sort((a, b) => {
      const ta = new Date((a as { pubDate: string }).pubDate).getTime()
      const tb = new Date((b as { pubDate: string }).pubDate).getTime()
      return tb - ta
    })

  if (items.length === 0) {
    return new Response(JSON.stringify({ error: 'All feeds failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return Response.json(items, {
    headers: {
      'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
    },
  })
}
