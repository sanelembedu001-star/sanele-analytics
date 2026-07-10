import { useState } from 'react'

export default function NotebookPage() {
  const [hasError, setHasError] = useState(false)

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold text-gray-800">Loan Targeting Analysis</h2>
        <p className="text-gray-500 text-sm mt-1">
          Exploratory data analysis and model insights — Jupyter Notebook
        </p>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white min-h-0">
        {hasError ? (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Notebook not found</h3>
              <p className="text-gray-500 text-sm">
                The notebook HTML was not generated. Ensure the Docker image was built correctly
                so that{' '}
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                  nbconvert
                </code>{' '}
                ran during the build.
              </p>
            </div>
          </div>
        ) : (
          <iframe
            src="/notebooks/loan_targeting_analysis.html"
            title="Loan Targeting Analysis Notebook"
            className="w-full h-full border-none"
            sandbox="allow-same-origin allow-scripts"
            onError={() => setHasError(true)}
          />
        )}
      </div>
    </div>
  )
}
