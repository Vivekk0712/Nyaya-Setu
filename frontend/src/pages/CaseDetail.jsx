import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function CaseDetail() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCase()
  }, [caseId])

  const loadCase = async () => {
    try {
      const data = await api.getCase(caseId)
      setCaseData(data)
    } catch (error) {
      console.error('Error loading case:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.updateCaseStatus(caseId, newStatus)
      loadCase()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleNudge = async () => {
    try {
      await api.triggerNudge(caseId)
      alert('Nudge sent successfully!')
      loadCase()
    } catch (error) {
      console.error('Error sending nudge:', error)
      alert('Failed to send nudge')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading case...</div>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Case not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-justice-blue hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Case Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Incident */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Incident Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {caseData.incident_description}
              </p>
            </div>

            {/* Legal Sections */}
            {caseData.legal_sections && caseData.legal_sections.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Relevant Legal Sections</h2>
                <div className="flex flex-wrap gap-2">
                  {caseData.legal_sections.map((section, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
                      {section}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Draft Content */}
            {caseData.draft_content && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Legal Draft</h2>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                    {caseData.draft_content}
                  </pre>
                </div>
                {caseData.pdf_url && (
                  <div className="mt-4">
                    <a
                      href={caseData.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-justice-blue text-white rounded-md hover:bg-blue-700"
                    >
                      Download PDF
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Status & Actions */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Case Status</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-600">Current Status:</span>
                  <div className="mt-1">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {caseData.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Created:</span>
                  <div className="mt-1 text-sm">
                    {new Date(caseData.created_at).toLocaleDateString()}
                  </div>
                </div>
                {caseData.filed_at && (
                  <div>
                    <span className="text-sm text-gray-600">Filed:</span>
                    <div className="mt-1 text-sm">
                      {new Date(caseData.filed_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <div className="space-y-2">
                {caseData.status === 'drafted' && (
                  <button
                    onClick={() => handleStatusUpdate('filed')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Mark as Filed
                  </button>
                )}
                {caseData.status === 'filed' && (
                  <>
                    <button
                      onClick={handleNudge}
                      className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                    >
                      Send Nudge
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('resolved')}
                      className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Mark as Resolved
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Timeline</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <div>
                    <div className="font-semibold text-sm">Created</div>
                    <div className="text-xs text-gray-600">
                      {new Date(caseData.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                {caseData.filed_at && (
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></div>
                    <div>
                      <div className="font-semibold text-sm">Filed</div>
                      <div className="text-xs text-gray-600">
                        {new Date(caseData.filed_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
                {caseData.last_nudge_at && (
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3"></div>
                    <div>
                      <div className="font-semibold text-sm">Nudge Sent</div>
                      <div className="text-xs text-gray-600">
                        {new Date(caseData.last_nudge_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
