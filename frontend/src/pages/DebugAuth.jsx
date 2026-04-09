import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function DebugAuth() {
  const { user, token } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth Debug Page</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current User</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {token && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Access Token</h2>
            <div className="bg-gray-100 p-4 rounded break-all text-sm">
              {token}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(token)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Copy Token
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test API Call</h2>
          <button
            onClick={async () => {
              try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://sempiternal-carey-uninnately.ngrok-free.dev')
                const response = await fetch(`${API_BASE}/api/cases`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                })
                
                console.log('Response status:', response.status)
                const result = await response.json()
                console.log('Response data:', result)
                
                alert(`Status: ${response.status}\nCheck console for details`)
              } catch (err) {
                console.error('Error:', err)
                alert('Error: ' + err.message)
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test /api/cases
          </button>
        </div>
      </div>
    </div>
  )
}
