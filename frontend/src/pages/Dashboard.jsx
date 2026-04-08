import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'

export default function Dashboard() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const { user, token, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Only load data if user is authenticated
    if (user && token) {
      loadCases()
      checkAdmin()
    } else {
      setLoading(false)
    }
  }, [user, token])

  const checkAdmin = async () => {
    try {
      const result = await api.checkAdminStatus()
      setIsAdmin(result.is_admin)
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

  const loadCases = async () => {
    try {
      const data = await api.getCases()
      setCases(data.cases || [])
    } catch (error) {
      console.error('Error loading cases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const getStatusColor = (status) => {
    const colors = {
      'intake': 'bg-blue-100 text-blue-800',
      'draft': 'bg-yellow-100 text-yellow-800',
      'drafted': 'bg-green-100 text-green-800',
      'filed': 'bg-purple-100 text-purple-800',
      'resolved': 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Nyaya-Setu Dashboard</h1>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-semibold"
              >
                Admin Portal
              </button>
            )}
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New Case Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/new-case')}
            className="px-6 py-3 bg-justice-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + New Case
          </button>
        </div>

        {/* Cases List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Cases</h2>
          {loading ? (
            <div className="text-center py-8">Loading cases...</div>
          ) : cases.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 mb-4">You haven't created any cases yet.</p>
              <button
                onClick={() => navigate('/new-case')}
                className="px-6 py-2 bg-justice-blue text-white rounded-lg hover:bg-blue-700"
              >
                Create Your First Case
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {cases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  onClick={() => navigate(`/case/${caseItem.id}`)}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">
                      {caseItem.incident_description.substring(0, 100)}...
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Created: {new Date(caseItem.created_at).toLocaleDateString()}
                  </p>
                  {caseItem.legal_sections && caseItem.legal_sections.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {caseItem.legal_sections.map((section, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {section}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
