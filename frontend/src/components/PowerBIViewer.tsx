import { PowerBIEmbed } from 'powerbi-client-react'
import { models } from 'powerbi-client'
import TsunamiDashboard from './TsunamiDashboard'

const iframeUrl = import.meta.env.VITE_POWERBI_IFRAME_URL as string | undefined
const embedUrl = import.meta.env.VITE_POWERBI_EMBED_URL as string | undefined
const accessToken = import.meta.env.VITE_POWERBI_ACCESS_TOKEN as string | undefined
const reportId = import.meta.env.VITE_POWERBI_REPORT_ID as string | undefined

const isIframe = Boolean(iframeUrl)
const isConfigured = Boolean(embedUrl && accessToken && reportId)

function SetupGuide() {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="max-w-lg w-full mx-4 text-center">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Power BI Configuration Required
        </h3>

        <p className="text-gray-500 text-sm mb-5">
          Choose one of the options below, then create a{' '}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-700">.env</code>{' '}
          file in the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-700">frontend/</code> folder.
        </p>

        <div className="text-left space-y-4 mb-4">
          <div className="bg-gray-900 rounded-lg p-4 text-xs font-mono">
            <p className="text-gray-400 mb-2"># Option A — Publish to web (easiest, public)</p>
            <p className="text-gray-400 mb-1"># 1. Open Tsunami_dash.pbix in Power BI Desktop</p>
            <p className="text-gray-400 mb-1"># 2. File → Publish → Publish to Power BI</p>
            <p className="text-gray-400 mb-1"># 3. In app.powerbi.com: File → Embed report → Publish to web</p>
            <p className="text-gray-400 mb-2"># 4. Copy the src URL from the generated iframe tag</p>
            <p className="text-green-400">VITE_POWERBI_IFRAME_URL=&lt;iframe src url&gt;</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 text-xs font-mono">
            <p className="text-gray-400 mb-2"># Option B — Secure embed (requires Azure AD app)</p>
            <p className="text-green-400">VITE_POWERBI_EMBED_URL=&lt;embed url&gt;</p>
            <p className="text-green-400">VITE_POWERBI_ACCESS_TOKEN=&lt;access token&gt;</p>
            <p className="text-green-400">VITE_POWERBI_REPORT_ID=&lt;report id&gt;</p>
          </div>
        </div>

        <p className="text-gray-400 text-xs">
          See{' '}
          <span className="font-medium text-gray-500">.env.example</span>
          {' '}for step-by-step setup instructions.
        </p>
      </div>
    </div>
  )
}

export default function PowerBIViewer() {
  if (isIframe) {
    return (
      <iframe
        src={iframeUrl}
        title="Tsunami Dashboard"
        className="w-full h-full border-none"
        allowFullScreen
      />
    )
  }

  if (!isConfigured) {
    return (
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-4">
        <TsunamiDashboard />
      </div>
    )
  }

  return (
    <PowerBIEmbed
      embedConfig={{
        type: 'report',
        id: reportId!,
        embedUrl: embedUrl!,
        accessToken: accessToken!,
        tokenType: models.TokenType.Embed,
        settings: {
          panes: {
            filters: { visible: false },
            pageNavigation: { visible: true },
          },
          background: models.BackgroundType.Transparent,
        },
      }}
      cssClassName="powerbi-report-container"
    />
  )
}
