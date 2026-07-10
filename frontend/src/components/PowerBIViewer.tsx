import { PowerBIEmbed } from 'powerbi-client-react'
import { models } from 'powerbi-client'
import TsunamiDashboard from './TsunamiDashboard'

const iframeUrl = import.meta.env.VITE_POWERBI_IFRAME_URL as string | undefined
const embedUrl = import.meta.env.VITE_POWERBI_EMBED_URL as string | undefined
const accessToken = import.meta.env.VITE_POWERBI_ACCESS_TOKEN as string | undefined
const reportId = import.meta.env.VITE_POWERBI_REPORT_ID as string | undefined

const isIframe = Boolean(iframeUrl)
const isConfigured = Boolean(embedUrl && accessToken && reportId)

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
