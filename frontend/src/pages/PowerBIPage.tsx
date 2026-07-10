import PowerBIViewer from '../components/PowerBIViewer'

export default function PowerBIPage() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Tsunami Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">
          Real-time analytics and KPIs — Power BI Report
        </p>
      </div>
      <PowerBIViewer />
    </div>
  )
}
