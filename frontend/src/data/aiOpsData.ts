// ─── Types ──────────────────────────────────────────────────────────────────

export type StageStatus = 'pass' | 'fail' | 'warn' | 'skip'
export type RunStatus = 'pass' | 'fail' | 'warn'
export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type FailureType = 'OCR' | 'Extraction' | 'Validation' | 'Routing' | 'Submission' | 'Config' | 'Prompt' | 'Data'
export type TriageStatus = 'open' | 'investigating' | 'resolved'
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
export type TestCategory = 'pass' | 'fail' | 'edge'

export interface PipelineStage {
  name: string
  status: StageStatus
  durationMs: number
  detail?: string
}

export interface PipelineRun {
  id: string
  tenant: string
  docType: string
  instructionType: string
  stages: PipelineStage[]
  status: RunStatus
  timestamp: string
  totalDurationMs: number
  agentId: string
  documentName: string
}

export interface TestCase {
  id: string
  name: string
  docType: string
  category: TestCategory
  promptVersion: string
  extractionAccuracy: number
  validationPassed: boolean
  routingCorrect: boolean
  notes: string
}

export interface PromptVersion {
  version: string
  date: string
  passRate: number
  avgAccuracy: number
  totalCases: number
  changes: string
}

export interface AgentDefinition {
  agentId: string
  name: string
  description: string
  model: string
  instructionType: string
  tenants: string[]
  mappers: string[]
  endpoints: string[]
  configYaml: string
}

export interface APIEndpoint {
  method: HTTPMethod
  path: string
  description: string
  auth: string
  statusCode: number
  responseTimeMs: number
  lastTested: string
  requestExample: string
  responseExample: string
}

export interface TriageCase {
  id: string
  title: string
  failureType: FailureType
  severity: Severity
  tenant: string
  pipelineRunId: string
  status: TriageStatus
  observed: string
  reproSteps: string[]
  diagnosis: string
  resolution: string
  openedAt: string
  closedAt?: string
}

// ─── Pipeline Runs ───────────────────────────────────────────────────────────

export const pipelineRuns: PipelineRun[] = [
  {
    id: 'run-2024-001',
    tenant: 'Investec Wealth',
    docType: 'Switch Instruction',
    instructionType: 'fund-switch',
    agentId: 'agent-switch-v3',
    documentName: 'INV-SWITCH-20240718.pdf',
    timestamp: '2024-07-18T09:12:44Z',
    totalDurationMs: 4210,
    status: 'pass',
    stages: [
      { name: 'OCR', status: 'pass', durationMs: 820, detail: 'Azure Document Intelligence — 97% confidence' },
      { name: 'Extraction', status: 'pass', durationMs: 1540, detail: 'All 12 fields extracted' },
      { name: 'Validation', status: 'pass', durationMs: 390, detail: 'FICA checks passed, ISIN resolved' },
      { name: 'Routing', status: 'pass', durationMs: 210, detail: 'Routed to Investec SWIFT gateway' },
      { name: 'Submission', status: 'pass', durationMs: 1250, detail: 'Submitted — ref #IW-88120' },
    ],
  },
  {
    id: 'run-2024-002',
    tenant: 'Coronation Fund Managers',
    docType: 'Redemption Form',
    instructionType: 'redemption',
    agentId: 'agent-redeem-v2',
    documentName: 'CFM-REDEMPTION-20240718.pdf',
    timestamp: '2024-07-18T10:05:11Z',
    totalDurationMs: 6890,
    status: 'fail',
    stages: [
      { name: 'OCR', status: 'warn', durationMs: 1820, detail: 'Low-res scan — 71% confidence on page 3' },
      { name: 'Extraction', status: 'fail', durationMs: 2100, detail: 'Bank account number missing — field not detected' },
      { name: 'Validation', status: 'skip', durationMs: 0, detail: 'Skipped — upstream extraction failed' },
      { name: 'Routing', status: 'skip', durationMs: 0, detail: 'Skipped' },
      { name: 'Submission', status: 'skip', durationMs: 0, detail: 'Skipped' },
    ],
  },
  {
    id: 'run-2024-003',
    tenant: 'Allan Gray',
    docType: 'Lump Sum Investment',
    instructionType: 'lump-sum',
    agentId: 'agent-lumpsum-v4',
    documentName: 'AG-LUMPSUM-20240718.pdf',
    timestamp: '2024-07-18T11:33:02Z',
    totalDurationMs: 3780,
    status: 'pass',
    stages: [
      { name: 'OCR', status: 'pass', durationMs: 610, detail: 'Native PDF — text extracted directly' },
      { name: 'Extraction', status: 'pass', durationMs: 1320, detail: '9/9 fields extracted' },
      { name: 'Validation', status: 'pass', durationMs: 440, detail: 'Source of funds validated' },
      { name: 'Routing', status: 'pass', durationMs: 195, detail: 'CIS instruction queue' },
      { name: 'Submission', status: 'pass', durationMs: 1215, detail: 'Submitted — ref #AG-55490' },
    ],
  },
  {
    id: 'run-2024-004',
    tenant: 'Ninety One',
    docType: 'Debit Order Amendment',
    instructionType: 'debit-order',
    agentId: 'agent-debit-v1',
    documentName: 'N1-DEBIT-AMEND-20240719.pdf',
    timestamp: '2024-07-19T08:21:17Z',
    totalDurationMs: 5120,
    status: 'warn',
    stages: [
      { name: 'OCR', status: 'pass', durationMs: 740, detail: '99% confidence' },
      { name: 'Extraction', status: 'pass', durationMs: 1690, detail: '11/11 fields extracted' },
      { name: 'Validation', status: 'warn', durationMs: 520, detail: 'Bank verification timeout — fallback to manual review flag' },
      { name: 'Routing', status: 'pass', durationMs: 180, detail: 'Flagged queue — manual review' },
      { name: 'Submission', status: 'pass', durationMs: 1990, detail: 'Submitted with REVIEW flag — ref #N1-33017' },
    ],
  },
  {
    id: 'run-2024-005',
    tenant: 'Sanlam Investments',
    docType: 'Beneficiary Change',
    instructionType: 'beneficiary',
    agentId: 'agent-beneficiary-v2',
    documentName: 'SAN-BENE-20240719.pdf',
    timestamp: '2024-07-19T13:47:55Z',
    totalDurationMs: 2990,
    status: 'pass',
    stages: [
      { name: 'OCR', status: 'pass', durationMs: 510, detail: 'Azure DI — form recognised' },
      { name: 'Extraction', status: 'pass', durationMs: 1100, detail: '7/7 beneficiary fields extracted' },
      { name: 'Validation', status: 'pass', durationMs: 310, detail: 'ID numbers verified' },
      { name: 'Routing', status: 'pass', durationMs: 155, detail: 'Beneficiary update queue' },
      { name: 'Submission', status: 'pass', durationMs: 915, detail: 'Submitted — ref #SAN-12890' },
    ],
  },
  {
    id: 'run-2024-006',
    tenant: 'Coronation Fund Managers',
    docType: 'Switch Instruction',
    instructionType: 'fund-switch',
    agentId: 'agent-switch-v3',
    documentName: 'CFM-SWITCH-20240720.pdf',
    timestamp: '2024-07-20T07:55:30Z',
    totalDurationMs: 7200,
    status: 'fail',
    stages: [
      { name: 'OCR', status: 'pass', durationMs: 990, detail: '94% confidence' },
      { name: 'Extraction', status: 'pass', durationMs: 1700, detail: 'All fields extracted' },
      { name: 'Validation', status: 'fail', durationMs: 880, detail: 'ISIN ZACFM0001234 not found in security master' },
      { name: 'Routing', status: 'skip', durationMs: 0, detail: 'Skipped' },
      { name: 'Submission', status: 'skip', durationMs: 0, detail: 'Skipped' },
    ],
  },
]

// ─── Prompt Regression Test Cases ────────────────────────────────────────────

export const testCases: TestCase[] = [
  { id: 'tc-001', name: 'Clean native-PDF switch instruction', docType: 'Switch', category: 'pass', promptVersion: 'v1.4.2', extractionAccuracy: 100, validationPassed: true, routingCorrect: true, notes: 'Baseline golden case' },
  { id: 'tc-002', name: 'Low-res scanned redemption (300 DPI)', docType: 'Redemption', category: 'pass', promptVersion: 'v1.4.2', extractionAccuracy: 92, validationPassed: true, routingCorrect: true, notes: 'OCR confidence 78% — extraction still succeeds' },
  { id: 'tc-003', name: 'Handwritten beneficiary fields', docType: 'Beneficiary', category: 'edge', promptVersion: 'v1.4.2', extractionAccuracy: 74, validationPassed: false, routingCorrect: false, notes: 'Handwriting causes low confidence — routes to manual' },
  { id: 'tc-004', name: 'Missing bank account on redemption', docType: 'Redemption', category: 'fail', promptVersion: 'v1.4.2', extractionAccuracy: 64, validationPassed: false, routingCorrect: false, notes: 'Expected failure — pipeline should halt and alert' },
  { id: 'tc-005', name: 'Multi-page lump sum with attachments', docType: 'Lump Sum', category: 'pass', promptVersion: 'v1.4.2', extractionAccuracy: 98, validationPassed: true, routingCorrect: true, notes: 'Pages 1-2 instruction, page 3 FICA — correctly ignored' },
  { id: 'tc-006', name: 'ISIN not in security master', docType: 'Switch', category: 'fail', promptVersion: 'v1.4.2', extractionAccuracy: 100, validationPassed: false, routingCorrect: false, notes: 'Data defect — ISIN extracted correctly but master stale' },
  { id: 'tc-007', name: 'Dual-currency debit order', docType: 'Debit Order', category: 'edge', promptVersion: 'v1.4.2', extractionAccuracy: 88, validationPassed: true, routingCorrect: true, notes: 'ZAR + USD amounts — mapper handles currency split' },
  { id: 'tc-008', name: 'Old-format switch form (pre-2022 template)', docType: 'Switch', category: 'edge', promptVersion: 'v1.4.2', extractionAccuracy: 81, validationPassed: true, routingCorrect: true, notes: 'Legacy layout — fallback mapper triggered' },
  { id: 'tc-009', name: 'Corrupted PDF (partial content)', docType: 'Lump Sum', category: 'fail', promptVersion: 'v1.4.2', extractionAccuracy: 0, validationPassed: false, routingCorrect: false, notes: 'OCR fails entirely — pipeline exits with OCR_ERROR' },
  { id: 'tc-010', name: 'Correct debit order with future date', docType: 'Debit Order', category: 'pass', promptVersion: 'v1.4.2', extractionAccuracy: 100, validationPassed: true, routingCorrect: true, notes: 'Date parsing handles dd/mm/yyyy and yyyy-mm-dd' },
]

export const promptVersionHistory: PromptVersion[] = [
  { version: 'v1.2.0', date: '2024-03-01', passRate: 68, avgAccuracy: 79, totalCases: 8, changes: 'Initial extraction prompt — field enumeration approach' },
  { version: 'v1.3.0', date: '2024-04-15', passRate: 76, avgAccuracy: 84, totalCases: 8, changes: 'Added output schema enforcement via JSON mode' },
  { version: 'v1.3.5', date: '2024-05-20', passRate: 80, avgAccuracy: 87, totalCases: 9, changes: 'Few-shot examples added for handwritten fields' },
  { version: 'v1.4.0', date: '2024-06-10', passRate: 84, avgAccuracy: 89, totalCases: 10, changes: 'Chain-of-thought reasoning for ambiguous layouts' },
  { version: 'v1.4.2', date: '2024-07-01', passRate: 86, avgAccuracy: 91, totalCases: 10, changes: 'Currency normalisation fix + ISIN extraction rule' },
]

// ─── Agent Definitions ───────────────────────────────────────────────────────

export const agentDefinitions: AgentDefinition[] = [
  {
    agentId: 'agent-switch-v3',
    name: 'Fund Switch Agent',
    description: 'Extracts and validates fund switch instructions from PDFs and scanned forms. Supports CIS and LISP switch types across registered tenants.',
    model: 'gpt-4o',
    instructionType: 'fund-switch',
    tenants: ['Investec Wealth', 'Coronation Fund Managers', 'Ninety One'],
    mappers: ['switch-mapper-v3', 'legacy-switch-mapper-v1'],
    endpoints: ['/api/v1/instructions/switch', '/api/v1/validate/isin'],
    configYaml: `agent_id: agent-switch-v3
version: "3.0"
model: gpt-4o
temperature: 0.1
instruction_type: fund-switch
tenants:
  - investec-wealth
  - coronation
  - ninety-one
extraction:
  fields:
    - name: client_id
      required: true
      type: string
    - name: from_fund_isin
      required: true
      type: isin
    - name: to_fund_isin
      required: true
      type: isin
    - name: switch_percentage
      required: false
      type: decimal
    - name: switch_amount_zar
      required: false
      type: currency
    - name: effective_date
      required: true
      type: date
  at_least_one: [switch_percentage, switch_amount_zar]
mappers:
  primary: switch-mapper-v3
  fallback: legacy-switch-mapper-v1
validation:
  isin_lookup: true
  fica_check: true
  min_switch_amount: 500
routing:
  destination: swift-gateway
  queue: instruction-queue-prod`,
  },
  {
    agentId: 'agent-redeem-v2',
    name: 'Redemption Agent',
    description: 'Processes full and partial redemption instructions. Validates bank account details via third-party verification service.',
    model: 'gpt-4o',
    instructionType: 'redemption',
    tenants: ['Coronation Fund Managers', 'Allan Gray'],
    mappers: ['redemption-mapper-v2'],
    endpoints: ['/api/v1/instructions/redeem', '/api/v1/validate/bank'],
    configYaml: `agent_id: agent-redeem-v2
version: "2.1"
model: gpt-4o
temperature: 0.1
instruction_type: redemption
tenants:
  - coronation
  - allan-gray
extraction:
  fields:
    - name: client_id
      required: true
      type: string
    - name: portfolio_number
      required: true
      type: string
    - name: redemption_type
      required: true
      type: enum
      values: [full, partial]
    - name: redemption_amount
      required: false
      type: currency
    - name: bank_account_number
      required: true
      type: string
    - name: bank_branch_code
      required: true
      type: string
    - name: bank_name
      required: true
      type: string
mappers:
  primary: redemption-mapper-v2
validation:
  bank_verification: true
  verification_timeout_ms: 5000
  on_timeout: flag_for_manual_review
routing:
  destination: payment-gateway
  queue: redemption-queue-prod`,
  },
  {
    agentId: 'agent-beneficiary-v2',
    name: 'Beneficiary Change Agent',
    description: 'Captures beneficiary addition, removal, and percentage split changes. Validates South African ID numbers.',
    model: 'gpt-4o-mini',
    instructionType: 'beneficiary',
    tenants: ['Sanlam Investments', 'Investec Wealth'],
    mappers: ['beneficiary-mapper-v2'],
    endpoints: ['/api/v1/instructions/beneficiary', '/api/v1/validate/id-number'],
    configYaml: `agent_id: agent-beneficiary-v2
version: "2.0"
model: gpt-4o-mini
temperature: 0.05
instruction_type: beneficiary
tenants:
  - sanlam
  - investec-wealth
extraction:
  max_beneficiaries: 6
  fields_per_beneficiary:
    - name: full_name
      required: true
      type: string
    - name: id_number
      required: true
      type: sa_id
    - name: relationship
      required: true
      type: string
    - name: allocation_percentage
      required: true
      type: decimal
  total_allocation_must_equal: 100
mappers:
  primary: beneficiary-mapper-v2
validation:
  id_number_check: true
  allocation_sum_check: true
routing:
  destination: policy-admin
  queue: beneficiary-queue-prod`,
  },
]

// ─── API Endpoints ────────────────────────────────────────────────────────────

export const apiEndpoints: APIEndpoint[] = [
  {
    method: 'POST',
    path: '/api/v1/instructions/switch',
    description: 'Submit a fund switch instruction for processing',
    auth: 'Bearer JWT',
    statusCode: 202,
    responseTimeMs: 143,
    lastTested: '2024-07-20T08:00:00Z',
    requestExample: JSON.stringify({
      tenant_id: 'investec-wealth',
      document_url: 'https://blob.core.windows.net/instructions/INV-SWITCH-20240718.pdf',
      agent_id: 'agent-switch-v3',
      metadata: { submitted_by: 'ops-user-01', priority: 'normal' },
    }, null, 2),
    responseExample: JSON.stringify({
      run_id: 'run-2024-001',
      status: 'accepted',
      message: 'Pipeline queued',
      estimated_completion_s: 8,
    }, null, 2),
  },
  {
    method: 'GET',
    path: '/api/v1/pipeline-runs/{run_id}',
    description: 'Retrieve status and stage details for a pipeline run',
    auth: 'Bearer JWT',
    statusCode: 200,
    responseTimeMs: 38,
    lastTested: '2024-07-20T08:01:00Z',
    requestExample: 'GET /api/v1/pipeline-runs/run-2024-001\nAuthorization: Bearer <token>',
    responseExample: JSON.stringify({
      run_id: 'run-2024-001',
      status: 'pass',
      tenant: 'investec-wealth',
      stages: [
        { name: 'OCR', status: 'pass', duration_ms: 820 },
        { name: 'Extraction', status: 'pass', duration_ms: 1540 },
        { name: 'Validation', status: 'pass', duration_ms: 390 },
      ],
    }, null, 2),
  },
  {
    method: 'GET',
    path: '/api/v1/pipeline-runs',
    description: 'List recent pipeline runs with optional filters',
    auth: 'Bearer JWT',
    statusCode: 200,
    responseTimeMs: 62,
    lastTested: '2024-07-20T08:02:00Z',
    requestExample: 'GET /api/v1/pipeline-runs?tenant=investec-wealth&status=fail&limit=10\nAuthorization: Bearer <token>',
    responseExample: JSON.stringify({
      total: 2,
      runs: [
        { run_id: 'run-2024-002', status: 'fail', tenant: 'coronation', doc_type: 'Redemption' },
        { run_id: 'run-2024-006', status: 'fail', tenant: 'coronation', doc_type: 'Switch' },
      ],
    }, null, 2),
  },
  {
    method: 'POST',
    path: '/api/v1/validate/isin',
    description: 'Validate one or more ISINs against the security master',
    auth: 'API Key',
    statusCode: 200,
    responseTimeMs: 21,
    lastTested: '2024-07-20T08:03:00Z',
    requestExample: JSON.stringify({ isins: ['ZAAG0001234', 'ZACFM0001234'] }, null, 2),
    responseExample: JSON.stringify({
      results: [
        { isin: 'ZAAG0001234', valid: true, fund_name: 'Allan Gray Equity Fund' },
        { isin: 'ZACFM0001234', valid: false, reason: 'Not found in security master' },
      ],
    }, null, 2),
  },
  {
    method: 'POST',
    path: '/api/v1/eval/run',
    description: 'Run the prompt regression suite against a given prompt version',
    auth: 'Bearer JWT',
    statusCode: 202,
    responseTimeMs: 189,
    lastTested: '2024-07-19T15:00:00Z',
    requestExample: JSON.stringify({
      prompt_version: 'v1.4.2',
      dataset: 'golden-v3',
      agent_id: 'agent-switch-v3',
    }, null, 2),
    responseExample: JSON.stringify({
      eval_id: 'eval-20240719-001',
      status: 'queued',
      estimated_duration_s: 120,
    }, null, 2),
  },
  {
    method: 'GET',
    path: '/api/v1/agents/{agent_id}/config',
    description: 'Retrieve the current configuration for an agent',
    auth: 'Bearer JWT',
    statusCode: 200,
    responseTimeMs: 29,
    lastTested: '2024-07-20T08:04:00Z',
    requestExample: 'GET /api/v1/agents/agent-switch-v3/config\nAuthorization: Bearer <token>',
    responseExample: JSON.stringify({
      agent_id: 'agent-switch-v3',
      version: '3.0',
      model: 'gpt-4o',
      instruction_type: 'fund-switch',
    }, null, 2),
  },
]

// ─── Triage Cases ─────────────────────────────────────────────────────────────

export const triageCases: TriageCase[] = [
  {
    id: 'triage-001',
    title: 'Bank account extraction fails on CFM redemption scans',
    failureType: 'OCR',
    severity: 'high',
    tenant: 'Coronation Fund Managers',
    pipelineRunId: 'run-2024-002',
    status: 'investigating',
    observed: 'Pipeline run-2024-002 failed at Extraction stage. Bank account number field returns null. OCR confidence on page 3 was 71% — below the 80% threshold.',
    reproSteps: [
      'POST /api/v1/instructions/redeem with document CFM-REDEMPTION-20240718.pdf',
      'Observe run status via GET /api/v1/pipeline-runs/run-2024-002',
      'Stage Extraction reports missing field: bank_account_number',
      'Check OCR output: page 3 confidence = 0.71 (threshold: 0.80)',
    ],
    diagnosis: 'Root cause is OCR quality, not extraction prompt. The scanned page is low resolution (150 DPI). Prompt correctly attempts extraction but the underlying text layer is degraded. This is a DATA issue — the document quality is insufficient.',
    resolution: 'Re-scan document at minimum 300 DPI. Alternatively lower OCR confidence threshold to 0.70 for CFM tenant and flag low-confidence runs for manual review.',
    openedAt: '2024-07-18T10:15:00Z',
  },
  {
    id: 'triage-002',
    title: 'ISIN ZACFM0001234 not found — security master stale',
    failureType: 'Data',
    severity: 'critical',
    tenant: 'Coronation Fund Managers',
    pipelineRunId: 'run-2024-006',
    status: 'resolved',
    observed: 'Validation stage fails for run-2024-006 with error: ISIN_NOT_FOUND. ISIN ZACFM0001234 is a legitimate newly-launched fund but is absent from the security master table.',
    reproSteps: [
      'POST /api/v1/validate/isin with body {"isins": ["ZACFM0001234"]}',
      'Response: {"valid": false, "reason": "Not found in security master"}',
      'Confirm fund exists on ASISA registry — it does (launched 2024-07-15)',
    ],
    diagnosis: 'Data defect. Extraction is correct, validation logic is correct. Security master sync job has not picked up the new ISIN. This is NOT a prompt or config issue — escalated to data engineering.',
    resolution: 'Data engineering ran manual security master sync. ISIN added at 2024-07-20 11:00 UTC. Re-processed run — passed.',
    openedAt: '2024-07-20T08:10:00Z',
    closedAt: '2024-07-20T11:30:00Z',
  },
  {
    id: 'triage-003',
    title: 'Bank verification timeout on Ninety One debit amendment',
    failureType: 'Validation',
    severity: 'medium',
    tenant: 'Ninety One',
    pipelineRunId: 'run-2024-004',
    status: 'resolved',
    observed: 'Validation stage times out on bank verification call after 5000ms. Run continues with REVIEW flag. Third-party bank verification service had a 6-second P95 latency spike at 08:21 UTC.',
    reproSteps: [
      'POST /api/v1/instructions/debit with document N1-DEBIT-AMEND-20240719.pdf',
      'Validation stage logs: BankVerificationTimeout after 5000ms',
      'Run proceeds — flagged for manual review with status WARN',
    ],
    diagnosis: 'Config and prompt are correct. External service latency exceeded the configured timeout. The fallback behaviour (flag + continue) is working as designed. No code defect.',
    resolution: 'No action required. Timeout is intentionally short to prevent pipeline stalls. Runbook updated to note that bank-verification timeout spikes correlate with 08:00–09:00 peak load. Consider async verification for future iteration.',
    openedAt: '2024-07-19T08:25:00Z',
    closedAt: '2024-07-19T09:10:00Z',
  },
  {
    id: 'triage-004',
    title: 'Handwritten beneficiary fields route to manual — expected?',
    failureType: 'Prompt',
    severity: 'low',
    tenant: 'Sanlam Investments',
    pipelineRunId: 'N/A',
    status: 'resolved',
    observed: 'Test case tc-003 (handwritten beneficiary fields) produces extraction accuracy of 74% and fails routing. Business query: should these be auto-accepted or always routed to manual?',
    reproSteps: [
      'Run eval suite against agent-beneficiary-v2 with dataset golden-v3',
      'tc-003 output: accuracy=0.74, validation_passed=false',
      'Routing rule: accuracy < 0.85 → manual_review queue',
    ],
    diagnosis: 'Prompt is performing as designed. The 0.85 accuracy threshold is intentionally conservative for beneficiary changes (high compliance risk). This is a configuration decision, not a defect.',
    resolution: 'Discussed with business — threshold confirmed correct for beneficiary instructions. Test case tc-003 is correctly categorised as an edge case that routes to manual. No change required.',
    openedAt: '2024-07-17T14:00:00Z',
    closedAt: '2024-07-17T16:00:00Z',
  },
]

// ─── Summary Stats ────────────────────────────────────────────────────────────

export function getPipelineStats() {
  const total = pipelineRuns.length
  const passed = pipelineRuns.filter(r => r.status === 'pass').length
  const failed = pipelineRuns.filter(r => r.status === 'fail').length
  const warned = pipelineRuns.filter(r => r.status === 'warn').length
  const avgDuration = Math.round(pipelineRuns.reduce((acc, r) => acc + r.totalDurationMs, 0) / total)
  return { total, passed, failed, warned, passRate: Math.round((passed / total) * 100), avgDuration }
}

export function getTestStats() {
  const total = testCases.length
  const passing = testCases.filter(t => t.category === 'pass' && t.validationPassed).length
  const failing = testCases.filter(t => t.category === 'fail').length
  const edge = testCases.filter(t => t.category === 'edge').length
  const avgAccuracy = Math.round(testCases.reduce((acc, t) => acc + t.extractionAccuracy, 0) / total)
  return { total, passing, failing, edge, avgAccuracy }
}
