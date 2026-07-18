import { useState, useEffect } from 'react'

interface HealthCheckResponse {
  status: string
}

function App() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/health')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: HealthCheckResponse = await response.json()
        setHealth(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        setHealth(null)
      } finally {
        setLoading(false)
      }
    }

    fetchHealth()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Full-Stack App
        </h1>

        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            Backend Health Status:
          </p>

          {loading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="text-red-700 text-sm font-medium">
                Error: {error}
              </p>
            </div>
          )}

          {health && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p className="text-green-700 font-semibold text-center">
                ✓ Status: {health.status}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            React + Vite + TypeScript + Tailwind
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            Node + Express + MongoDB
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
