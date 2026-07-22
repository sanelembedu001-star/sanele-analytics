export default function Header() {
  return (
    <header className="bg-blue-700 text-white px-6 py-4 shadow-md flex-shrink-0">
      <div className="flex items-center gap-3">
        <svg
          className="w-8 h-8 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <div>
          <h1 className="text-xl font-bold tracking-wide">Analytics Platform</h1>
          <p className="text-blue-200 text-xs">Loan Targeting · Tsunami Dashboard · AI Ops</p>
        </div>
      </div>
    </header>
  )
}
