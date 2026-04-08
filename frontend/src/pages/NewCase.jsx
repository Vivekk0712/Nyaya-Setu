import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function NewCase() {
  const [incident, setIncident] = useState('')
  const [loading, setLoading] = useState(false)
  const [interpretation, setInterpretation] = useState(null)
  const [caseId, setCaseId] = useState(null)
  const [draftLoading, setDraftLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await api.submitIncident(incident)
      setInterpretation(result)
      setCaseId(result.case_id)
    } catch (error) {
      console.error('Error submitting incident:', error)
      alert('Failed to process your incident. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateDraft = async () => {
    setDraftLoading(true)

    try {
      const result = await api.generateDraft(caseId, {})
      navigate(`/case/${caseId}`)
    } catch (error) {
      console.error('Error generating draft:', error)
      alert('Failed to generate draft. Please try again.')
    } finally {
      setDraftLoading(false)
    }
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Describe Your Legal Issue</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Input */}
          <div>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tell us what happened
              </label>
              <textarea
                value={incident}
                onChange={(e) => setIncident(e.target.value)}
                rows={10}
                placeholder="Describe your incident in detail. For example: 'My landlord locked me out of my apartment and refused to return my security deposit...'"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-justice-blue focus:border-justice-blue"
                required
              />
              <button
                type="submit"
                disabled={loading || !incident.trim()}
                className="mt-4 w-full px-4 py-2 bg-justice-blue text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Analyze My Case'}
              </button>
            </form>
          </div>

          {/* Right: Response */}
          <div>
            {loading && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            )}

            {interpretation && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Legal Analysis</h2>
                
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">Explanation:</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {interpretation.simplified_explanation}
                  </p>
                </div>

                {interpretation.relevant_laws && interpretation.relevant_laws.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Relevant Laws:</h3>
                    <div className="flex flex-wrap gap-2">
                      {interpretation.relevant_laws.map((law, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {law}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleGenerateDraft}
                  disabled={draftLoading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {draftLoading ? 'Generating Draft...' : 'Generate Formal Legal Draft'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
