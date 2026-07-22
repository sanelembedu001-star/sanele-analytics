import { useState } from 'react'
import {
  pipelineRuns,
  testCases,
  promptVersionHistory,
  agentDefinitions,
  apiEndpoints,
  triageCases,
  getPipelineStats,
  getTestStats,
  type PipelineRun,
  type StageStatus,
  type RunStatus,
  type Severity,
  type TriageStatus,
  type HTTPMethod,
  type TestCategory,
  type FailureType,
} from '../data/aiOpsData'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stageColor(s: StageStatus): string {
  return s === 'pass' ? 'bg-emerald-500' : s === 'fail' ? 'bg-red-500' : s === 'warn' ? 'bg-amber-400' : 'bg-gray-200'
}

function stageBadge(s: StageStatus): string {
  return s === 'pass'
    ? 'bg-emerald-100 text-emerald-700'
    : s === 'fail'
    ? 'bg-red-100 text-red-700'
    : s === 'warn'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-gray-100 text-gray-400'
}

function runBadge(s: RunStatus): string {
  return s === 'pass' ? 'bg-emerald-100 text-emerald-700' : s === 'fail' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
}

function severityBadge(s: Severity): string {
  return s === 'critical' ? 'bg-red-100 text-red-700' : s === 'high' ? 'bg-orange-100 text-orange-700' : s === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
}

function triageStatusBadge(s: TriageStatus): string {
  return s === 'open' ? 'bg-red-100 text-red-700' : s === 'investigating' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
}

function methodBadge(m: HTTPMethod): string {
  return m === 'GET' ? 'bg-blue-100 text-blue-700' : m === 'POST' ? 'bg-emerald-100 text-emerald-700' : m === 'PUT' ? 'bg-amber-100 text-amber-700' : m === 'DELETE' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'
}

function categoryBadge(c: TestCategory): string {
  return c === 'pass' ? 'bg-emerald-100 text-emerald-700' : c === 'fail' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
}

function failureTypeBadge(f: FailureType): string {
  const colors: Record<FailureType, string> = {
    OCR: 'bg-purple-100 text-purple-700',
    Extraction: 'bg-blue-100 text-blue-700',
    Validation: 'bg-amber-100 text-amber-700',
    Routing: 'bg-orange-100 text-orange-700',
    Submission: 'bg-pink-100 text-pink-700',
    Config: 'bg-teal-100 text-teal-700',
    Prompt: 'bg-indigo-100 text-indigo-700',
    Data: 'bg-red-100 text-red-700',
  }
  return colors[f]
}

function formatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-ZA', { dateStyle: 'short', timeStyle: 'short' })
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col gap-1 ${accent ?? ''}`}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  )
}

// ─── Tab Button ───────────────────────────────────────────────────────────────

function TabBtn({ id, label, icon, active, onClick }: { id: string; label: string; icon: string; active: boolean; onClick: (id: string) => void }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
        active ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  )
}

// ─── Pipeline Monitor Tab ─────────────────────────────────────────────────────

function PipelineMonitor() {
  const [selected, setSelected] = useState<PipelineRun | null>(null)
  const stats = getPipelineStats()

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard label="Total Runs" value={stats.total} />
        <StatCard label="Passed" value={stats.passed} sub={`${stats.passRate}% pass rate`} />
        <StatCard label="Failed" value={stats.failed} />
        <StatCard label="Warnings" value={stats.warned} />
        <StatCard label="Avg Duration" value={formatMs(stats.avgDuration)} sub="end-to-end" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Run list */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 text-sm">Recent Pipeline Runs</h3>
            <span className="text-xs text-gray-400">Click a run to inspect stages</span>
          </div>
          <ul className="divide-y divide-gray-100">
            {pipelineRuns.map(run => (
              <li
                key={run.id}
                onClick={() => setSelected(selected?.id === run.id ? null : run)}
                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${selected?.id === run.id ? 'bg-indigo-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-800 truncate max-w-[60%]">{run.documentName}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${runBadge(run.status)}`}>
                    {run.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{run.tenant}</span>
                  <span>·</span>
                  <span>{run.docType}</span>
                  <span>·</span>
                  <span>{formatMs(run.totalDurationMs)}</span>
                </div>
                {/* Mini stage strip */}
                <div className="flex gap-1 mt-2">
                  {run.stages.map(st => (
                    <div key={st.name} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className={`h-1.5 w-full rounded-full ${stageColor(st.status)}`} />
                      <span className="text-[9px] text-gray-400">{st.name}</span>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Stage detail */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700 text-sm">Stage Inspector</h3>
          </div>
          {selected ? (
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Run ID</p>
                <p className="font-mono text-xs text-gray-700">{selected.id}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><p className="text-gray-400">Tenant</p><p className="font-medium text-gray-800">{selected.tenant}</p></div>
                <div><p className="text-gray-400">Agent</p><p className="font-mono text-gray-800">{selected.agentId}</p></div>
                <div><p className="text-gray-400">Type</p><p className="text-gray-800">{selected.docType}</p></div>
                <div><p className="text-gray-400">Timestamp</p><p className="text-gray-800">{formatDate(selected.timestamp)}</p></div>
              </div>
              <div className="space-y-2">
                {selected.stages.map(st => (
                  <div key={st.name} className={`rounded-lg p-3 ${stageBadge(st.status)} bg-opacity-20 border border-opacity-30`} style={{ borderColor: 'currentColor' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs">{st.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{formatMs(st.durationMs)}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stageBadge(st.status)}`}>
                          {st.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    {st.detail && <p className="text-xs opacity-80">{st.detail}</p>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">
              Select a run to inspect its stages
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Prompt Regression Tab ────────────────────────────────────────────────────

function PromptRegression() {
  const [selectedVersion, setSelectedVersion] = useState('v1.4.2')
  const stats = getTestStats()
  const filtered = testCases.filter(t => t.promptVersion === selectedVersion)

  return (
    <div className="space-y-6">
      {/* Prompt version chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <h3 className="font-semibold text-gray-700 text-sm mb-4">Prompt Version History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="text-left pb-2 pr-4 font-medium">Version</th>
                <th className="text-left pb-2 pr-4 font-medium">Date</th>
                <th className="text-left pb-2 pr-4 font-medium">Pass Rate</th>
                <th className="text-left pb-2 pr-4 font-medium">Avg Accuracy</th>
                <th className="text-left pb-2 pr-4 font-medium">Cases</th>
                <th className="text-left pb-2 font-medium">Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {promptVersionHistory.map(v => (
                <tr
                  key={v.version}
                  onClick={() => setSelectedVersion(v.version)}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedVersion === v.version ? 'bg-indigo-50' : ''}`}
                >
                  <td className="py-2 pr-4 font-mono font-semibold text-indigo-600">{v.version}</td>
                  <td className="py-2 pr-4 text-gray-500">{v.date}</td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${v.passRate}%` }} />
                      </div>
                      <span className="font-medium text-gray-700">{v.passRate}%</span>
                    </div>
                  </td>
                  <td className="py-2 pr-4 font-medium text-gray-700">{v.avgAccuracy}%</td>
                  <td className="py-2 pr-4 text-gray-600">{v.totalCases}</td>
                  <td className="py-2 text-gray-500 max-w-xs">{v.changes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test cases */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 text-sm">
            Golden Dataset — <span className="font-mono text-indigo-600">{selectedVersion}</span>
          </h3>
          <div className="flex gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Pass ({stats.passing})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Fail ({stats.failing})</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Edge ({stats.edge})</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2 font-medium">Test Case</th>
                <th className="text-left px-4 py-2 font-medium">Type</th>
                <th className="text-left px-4 py-2 font-medium">Category</th>
                <th className="text-left px-4 py-2 font-medium">Accuracy</th>
                <th className="text-left px-4 py-2 font-medium">Validation</th>
                <th className="text-left px-4 py-2 font-medium">Routing</th>
                <th className="text-left px-4 py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(filtered.length > 0 ? filtered : testCases).map(tc => (
                <tr key={tc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-gray-800 max-w-xs">{tc.name}</td>
                  <td className="px-4 py-2.5 text-gray-600">{tc.docType}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${categoryBadge(tc.category)}`}>
                      {tc.category.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-14 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${tc.extractionAccuracy >= 85 ? 'bg-emerald-500' : tc.extractionAccuracy >= 70 ? 'bg-amber-400' : 'bg-red-500'}`}
                          style={{ width: `${tc.extractionAccuracy}%` }}
                        />
                      </div>
                      <span className="font-medium text-gray-700">{tc.extractionAccuracy}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={tc.validationPassed ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {tc.validationPassed ? '✓' : '✗'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={tc.routingCorrect ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {tc.routingCorrect ? '✓' : '✗'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 max-w-xs truncate">{tc.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Agent Config Tab ─────────────────────────────────────────────────────────

function AgentConfig() {
  const [selected, setSelected] = useState(agentDefinitions[0])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Agent list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700 text-sm">Registered Agents</h3>
        </div>
        <ul className="divide-y divide-gray-100">
          {agentDefinitions.map(agent => (
            <li
              key={agent.agentId}
              onClick={() => setSelected(agent)}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${selected.agentId === agent.agentId ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
            >
              <p className="text-sm font-semibold text-gray-800">{agent.name}</p>
              <p className="font-mono text-[10px] text-gray-400 mt-0.5">{agent.agentId}</p>
              <div className="flex gap-2 mt-1.5">
                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{agent.model}</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded">{agent.instructionType}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Config detail */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 text-base mb-1">{selected.name}</h3>
          <p className="text-sm text-gray-500 mb-4">{selected.description}</p>
          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 mb-1">Model</p>
              <p className="font-mono font-semibold text-gray-800">{selected.model}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 mb-1">Instruction Type</p>
              <p className="font-semibold text-indigo-700">{selected.instructionType}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 mb-1">Tenants</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {selected.tenants.map(t => (
                  <span key={t} className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-400 mb-1">Mappers</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {selected.mappers.map(m => (
                  <span key={m} className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded font-mono">{m}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="mb-3">
            <p className="text-xs text-gray-400 mb-1.5">Endpoints</p>
            <div className="space-y-1">
              {selected.endpoints.map(ep => (
                <p key={ep} className="font-mono text-xs text-gray-700 bg-gray-50 px-3 py-1.5 rounded">{ep}</p>
              ))}
            </div>
          </div>
        </div>

        {/* YAML config */}
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-mono">agent-config.yaml</span>
            <span className="text-[10px] text-gray-500 font-mono">{selected.agentId}</span>
          </div>
          <pre className="text-xs text-emerald-300 p-4 overflow-x-auto font-mono leading-relaxed">
            {selected.configYaml}
          </pre>
        </div>
      </div>
    </div>
  )
}

// ─── API Explorer Tab ─────────────────────────────────────────────────────────

function APIExplorer() {
  const [selected, setSelected] = useState(apiEndpoints[0])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Endpoint list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700 text-sm">REST Endpoints</h3>
          <p className="text-xs text-gray-400 mt-0.5">FastAPI microservice — internal ops API</p>
        </div>
        <ul className="divide-y divide-gray-100">
          {apiEndpoints.map((ep, i) => (
            <li
              key={i}
              onClick={() => setSelected(ep)}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${selected === ep ? 'bg-indigo-50' : ''}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${methodBadge(ep.method)}`}>{ep.method}</span>
                <span className="font-mono text-xs text-gray-700 truncate">{ep.path}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{ep.description}</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                <span>HTTP {ep.statusCode}</span>
                <span>·</span>
                <span>{ep.responseTimeMs}ms</span>
                <span>·</span>
                <span>{ep.auth}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Detail */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-bold px-2 py-1 rounded font-mono ${methodBadge(selected.method)}`}>{selected.method}</span>
            <span className="font-mono text-sm text-gray-800">{selected.path}</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{selected.description}</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-gray-50 rounded p-2 text-center">
              <p className="text-gray-400">Status</p>
              <p className="font-bold text-gray-800">HTTP {selected.statusCode}</p>
            </div>
            <div className="bg-gray-50 rounded p-2 text-center">
              <p className="text-gray-400">Response</p>
              <p className="font-bold text-gray-800">{selected.responseTimeMs}ms</p>
            </div>
            <div className="bg-gray-50 rounded p-2 text-center">
              <p className="text-gray-400">Auth</p>
              <p className="font-bold text-gray-800">{selected.auth}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-3">Last tested: {formatDate(selected.lastTested)}</p>
        </div>

        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-gray-800">
            <span className="text-xs text-gray-400 font-mono">Request</span>
          </div>
          <pre className="text-xs text-blue-300 p-4 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">
            {selected.requestExample}
          </pre>
        </div>

        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-mono">Response</span>
            <span className="text-[10px] font-bold text-emerald-400">HTTP {selected.statusCode}</span>
          </div>
          <pre className="text-xs text-emerald-300 p-4 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">
            {selected.responseExample}
          </pre>
        </div>
      </div>
    </div>
  )
}

// ─── Triage Center Tab ────────────────────────────────────────────────────────

function TriageCenter() {
  const [selected, setSelected] = useState(triageCases[0])
  const open = triageCases.filter(t => t.status !== 'resolved').length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Open / Investigating" value={open} sub="requiring attention" />
        <StatCard label="Resolved" value={triageCases.filter(t => t.status === 'resolved').length} />
        <StatCard label="Failure Types" value={new Set(triageCases.map(t => t.failureType)).size} sub="distinct categories" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issue list */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700 text-sm">Triage Cases</h3>
          </div>
          <ul className="divide-y divide-gray-100">
            {triageCases.map(tc => (
              <li
                key={tc.id}
                onClick={() => setSelected(tc)}
                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${selected.id === tc.id ? 'bg-indigo-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-medium text-gray-800 leading-snug">{tc.title}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${triageStatusBadge(tc.status)}`}>
                    {tc.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${failureTypeBadge(tc.failureType)}`}>{tc.failureType}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${severityBadge(tc.severity)}`}>{tc.severity.toUpperCase()}</span>
                  <span className="text-[10px] text-gray-400">{tc.tenant}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Detail */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${failureTypeBadge(selected.failureType)}`}>{selected.failureType}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${severityBadge(selected.severity)}`}>{selected.severity.toUpperCase()}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto ${triageStatusBadge(selected.status)}`}>{selected.status.toUpperCase()}</span>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-28rem)]">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-1">{selected.title}</h4>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{selected.tenant}</span>
                <span>·</span>
                <span className="font-mono">{selected.pipelineRunId}</span>
                <span>·</span>
                <span>{formatDate(selected.openedAt)}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-amber-700 mb-1">Observed</p>
              <p className="text-xs text-amber-900 leading-relaxed">{selected.observed}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Reproduction Steps</p>
              <ol className="space-y-1">
                {selected.reproSteps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-xs text-gray-700">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[9px] flex items-center justify-center">{i + 1}</span>
                    <span className="font-mono leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">Diagnosis</p>
              <p className="text-xs text-blue-900 leading-relaxed">{selected.diagnosis}</p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-emerald-700 mb-1">Resolution</p>
              <p className="text-xs text-emerald-900 leading-relaxed">{selected.resolution}</p>
              {selected.closedAt && (
                <p className="text-[10px] text-emerald-600 mt-1.5">Closed: {formatDate(selected.closedAt)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'pipeline', label: 'Pipeline Monitor', icon: '⚡' },
  { id: 'regression', label: 'Prompt Regression', icon: '🧪' },
  { id: 'agents', label: 'Agent Config', icon: '🤖' },
  { id: 'api', label: 'API Explorer', icon: '🔌' },
  { id: 'triage', label: 'Triage Center', icon: '🔍' },
]

export default function AIOpsDashboard() {
  const [activeTab, setActiveTab] = useState('pipeline')

  return (
    <div className="h-full flex flex-col">
      {/* Page header */}
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-800">AI Operations Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">
          Pipeline monitoring · Prompt regression · Agent configuration · API testing · Failure triage
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap mb-5 flex-shrink-0 bg-gray-100 p-1.5 rounded-xl w-fit">
        {TABS.map(tab => (
          <TabBtn
            key={tab.id}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            active={activeTab === tab.id}
            onClick={setActiveTab}
          />
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === 'pipeline' && <PipelineMonitor />}
        {activeTab === 'regression' && <PromptRegression />}
        {activeTab === 'agents' && <AgentConfig />}
        {activeTab === 'api' && <APIExplorer />}
        {activeTab === 'triage' && <TriageCenter />}
      </div>
    </div>
  )
}
