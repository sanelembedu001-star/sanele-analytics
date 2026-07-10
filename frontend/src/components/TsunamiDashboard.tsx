import { useState, useMemo } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import tsunamiData, { type TsunamiEvent } from '../data/tsunamiData'

// ── Colour palettes ──────────────────────────────────────────────────────────
const CAUSE_COLORS: Record<string, string> = {
  Earthquake: '#3b82f6',
  Volcanic:   '#f97316',
  Landslide:  '#10b981',
  Other:      '#8b5cf6',
}

const VALIDITY_LABELS: Record<number, string> = {
  4: 'Definite',
  3: 'Probable',
  2: 'Questionable',
  1: 'Doubtful',
}

// ── Small stat card ──────────────────────────────────────────────────────────
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold text-gray-800">{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  )
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function ScatterTip({ active, payload }: { active?: boolean; payload?: { payload: TsunamiEvent }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs space-y-1">
      <p className="font-semibold text-gray-800">{d.country} ({d.year})</p>
      <p>Magnitude: <strong>{d.eqMagnitude ?? 'N/A'}</strong></p>
      <p>TS Intensity: <strong>{d.tsIntensity ?? 'N/A'}</strong></p>
      <p>Damage Severity: <strong>{d.damageSeverity ?? 'N/A'}</strong></p>
      <p>Cause: <strong>{d.cause}</strong></p>
    </div>
  )
}

// ── TAB 1: Map ────────────────────────────────────────────────────────────────
function EventMap({ data }: { data: TsunamiEvent[] }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">
        Tsunami event locations — circle size ∝ magnitude, colour = TS intensity
      </p>
      <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 450 }}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data.map((ev, i) => {
            const mag = ev.eqMagnitude ?? 5
            const intensity = ev.tsIntensity ?? 1
            const radius = Math.max(4, (mag - 5) * 5)
            const opacity = Math.min(0.9, 0.3 + intensity / 12)
            return (
              <CircleMarker
                key={i}
                center={[ev.latitude, ev.longitude]}
                radius={radius}
                pathOptions={{
                  fillColor: CAUSE_COLORS[ev.cause] ?? '#8b5cf6',
                  color: '#fff',
                  weight: 1,
                  fillOpacity: opacity,
                }}
              >
                <Popup>
                  <strong>{ev.country} — {ev.year}</strong><br />
                  Cause: {ev.cause}<br />
                  Magnitude: {ev.eqMagnitude ?? 'N/A'}<br />
                  TS Intensity: {ev.tsIntensity ?? 'N/A'}<br />
                  Region: {ev.region}
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>
      <div className="flex gap-4 flex-wrap">
        {Object.entries(CAUSE_COLORS).map(([cause, color]) => (
          <div key={cause} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: color }} />
            {cause}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── TAB 2: Scatter ────────────────────────────────────────────────────────────
function ScatterView({ data }: { data: TsunamiEvent[] }) {
  const filtered = data.filter(d => d.eqMagnitude != null && d.tsIntensity != null)
  const causes = [...new Set(filtered.map(d => d.cause))]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">
        Earthquake magnitude vs TS intensity — coloured by cause
      </p>
      <div style={{ height: 420 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              type="number" dataKey="eqMagnitude" name="Magnitude"
              domain={[5.5, 10]} label={{ value: 'EQ Magnitude', position: 'insideBottom', offset: -10, fontSize: 12 }}
            />
            <YAxis
              type="number" dataKey="tsIntensity" name="TS Intensity"
              label={{ value: 'TS Intensity', angle: -90, position: 'insideLeft', offset: 10, fontSize: 12 }}
            />
            <Tooltip content={<ScatterTip />} />
            <Legend verticalAlign="top" />
            {causes.map(cause => (
              <Scatter
                key={cause}
                name={cause}
                data={filtered.filter(d => d.cause === cause)}
                fill={CAUSE_COLORS[cause] ?? '#8b5cf6'}
                opacity={0.75}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── TAB 3: Bar chart ──────────────────────────────────────────────────────────
function RegionBarChart({ data }: { data: TsunamiEvent[]; regionColors?: Record<string, string> }) {
  const byRegion = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {}
    data.forEach(ev => {
      if (!counts[ev.region]) counts[ev.region] = { Definite: 0, Probable: 0, Questionable: 0, Doubtful: 0 }
      const label = VALIDITY_LABELS[ev.eventValidity] ?? 'Doubtful'
      counts[ev.region][label] = (counts[ev.region][label] ?? 0) + 1
    })
    return Object.entries(counts)
      .map(([region, vals]) => ({ region: region.replace(' OCEAN', '').replace(' SEA', ' Sea'), ...vals } as { region: string; Definite: number; Probable: number; Questionable: number; Doubtful: number }))
      .sort((a, b) => (b.Definite + b.Probable) - (a.Definite + a.Probable))
  }, [data])

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">Event count by region and validity</p>
      <div style={{ height: 420 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byRegion} margin={{ top: 10, right: 20, bottom: 60, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="region" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend verticalAlign="top" />
            <Bar dataKey="Definite"     stackId="a" fill="#3b82f6" />
            <Bar dataKey="Probable"     stackId="a" fill="#10b981" />
            <Bar dataKey="Questionable" stackId="a" fill="#f97316" />
            <Bar dataKey="Doubtful"     stackId="a" fill="#e5e7eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── TAB 4: Key drivers radar ──────────────────────────────────────────────────
function KeyDrivers({ data }: { data: TsunamiEvent[] }) {
  const causeStats = useMemo(() => {
    const grouped: Record<string, number[][]> = {}
    data.forEach(ev => {
      if (!grouped[ev.cause]) grouped[ev.cause] = [[], [], [], []]
      if (ev.eqMagnitude != null)  grouped[ev.cause][0].push(ev.eqMagnitude)
      if (ev.tsIntensity != null)  grouped[ev.cause][1].push(ev.tsIntensity)
      if (ev.damageSeverity != null) grouped[ev.cause][2].push(ev.damageSeverity)
      if (ev.eqDepth != null)      grouped[ev.cause][3].push(ev.eqDepth)
    })
    return Object.entries(grouped).map(([cause, arrs]) => ({
      cause,
      avgMagnitude: arrs[0].length ? +(arrs[0].reduce((a, b) => a + b) / arrs[0].length).toFixed(2) : 0,
      avgIntensity: arrs[1].length ? +(arrs[1].reduce((a, b) => a + b) / arrs[1].length).toFixed(2) : 0,
      avgDamage:    arrs[2].length ? +(arrs[2].reduce((a, b) => a + b) / arrs[2].length).toFixed(2) : 0,
      avgDepth:     arrs[3].length ? +(arrs[3].reduce((a, b) => a + b) / arrs[3].length).toFixed(2) : 0,
      count:        data.filter(d => d.cause === cause).length,
    }))
  }, [data])

  const radarData = [
    { metric: 'Avg Magnitude', ...Object.fromEntries(causeStats.map(c => [c.cause, c.avgMagnitude])) },
    { metric: 'Avg TS Intensity', ...Object.fromEntries(causeStats.map(c => [c.cause, c.avgIntensity])) },
    { metric: 'Avg Damage', ...Object.fromEntries(causeStats.map(c => [c.cause, c.avgDamage * 2])) },
  ]
  const causes = causeStats.map(c => c.cause)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">
        Key drivers — average impact metrics per cause
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
              {causes.map(cause => (
                <Radar key={cause} name={cause} dataKey={cause}
                  stroke={CAUSE_COLORS[cause] ?? '#8b5cf6'}
                  fill={CAUSE_COLORS[cause] ?? '#8b5cf6'}
                  fillOpacity={0.2} />
              ))}
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Cause</th>
                <th className="py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Events</th>
                <th className="py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Avg Mag</th>
                <th className="py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Avg Intensity</th>
                <th className="py-2 text-xs font-semibold text-gray-500 uppercase">Avg Damage</th>
              </tr>
            </thead>
            <tbody>
              {causeStats.map(row => (
                <tr key={row.cause} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 pr-4 font-medium text-gray-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                      style={{ background: CAUSE_COLORS[row.cause] ?? '#8b5cf6' }} />
                    {row.cause}
                  </td>
                  <td className="py-2 pr-4 text-gray-600">{row.count}</td>
                  <td className="py-2 pr-4 text-gray-600">{row.avgMagnitude || '—'}</td>
                  <td className="py-2 pr-4 text-gray-600">{row.avgIntensity || '—'}</td>
                  <td className="py-2 text-gray-600">{row.avgDamage || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Main dashboard ────────────────────────────────────────────────────────────
const TABS = ['Map', 'Scatter', 'By Region', 'Key Drivers'] as const
type Tab = typeof TABS[number]

export default function TsunamiDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('Map')

  const stats = useMemo(() => ({
    total:   tsunamiData.length,
    maxMag:  Math.max(...tsunamiData.map(d => d.eqMagnitude ?? 0)).toFixed(1),
    regions: new Set(tsunamiData.map(d => d.region)).size,
    deadliest: tsunamiData.reduce((a, b) =>
      (b.damageSeverity ?? 0) > (a.damageSeverity ?? 0) ? b : a
    ).country,
  }), [])

  return (
    <div className="flex flex-col gap-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Events"    value={stats.total}    sub="in dataset" />
        <StatCard label="Max Magnitude"   value={stats.maxMag}   sub="1960 Chile" />
        <StatCard label="Regions"         value={stats.regions}  sub="affected" />
        <StatCard label="Hardest Hit"     value={stats.deadliest} sub="severity 4" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200 flex-shrink-0">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab
                ? 'bg-white border border-b-white border-gray-200 -mb-px text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'Map'         && <EventMap        data={tsunamiData} />}
        {activeTab === 'Scatter'     && <ScatterView     data={tsunamiData} />}
        {activeTab === 'By Region'   && <RegionBarChart  data={tsunamiData} />}
        {activeTab === 'Key Drivers' && <KeyDrivers      data={tsunamiData} />}
      </div>
    </div>
  )
}
