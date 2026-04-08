import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'

export default function AdminPortal() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState([])
  const [stats, setStats] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [docType, setDocType] = useState('BNS')
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    try {
      const result = await api.checkAdminStatus()
      if (!result.is_admin) {
        navigate('/dashboard')
        return
      }
      setIsAdmin(true)
      loadData()
    } catch (error) {
      console.error('Error checking admin status:', error)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    try {
      const [docsData, statsData] = await Promise.all([
        api.getAdminDocuments(),
        api.getAdminStats()
      ])
      setDocuments(docsData.documents || [])
      setStats(statsData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
    } else {
      alert('Please select a PDF file')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first')
      return
    }

    setUploading(true)
    try {
      const result = await api.uploadDocument(selectedFile, docType)
      alert(`Document uploaded successfully! Processed ${result.result.chunks_processed} chunks.`)
      setSelectedFile(null)
      loadData()
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (uploadId) => {
    if (!confirm('Are you sure you want to delete this document and all its embeddings?')) {
      return
    }

    try {
      await api.deleteDocument(uploadId)
      alert('Document deleted successfully')
      loadData()
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'uploading': 'bg-blue-100 text-blue-800',
      'processing': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              User Dashboard
            </button>
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={signOut}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total Documents</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total_documents}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total Embeddings</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total_embeddings}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total Cases</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total_cases}</div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload Legal Document</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-justice-blue focus:border-justice-blue"
              >
                <option value="BNS">Bharatiya Nyaya Sanhita (BNS)</option>
                <option value="CPA">Consumer Protection Act</option>
                <option value="IPC">Indian Penal Code</option>
                <option value="CrPC">Criminal Procedure Code</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF File
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-justice-blue focus:border-justice-blue"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full px-4 py-2 bg-justice-blue text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Processing...' : 'Upload and Process'}
            </button>

            <p className="text-sm text-gray-500">
              The document will be automatically chunked, embedded, and stored in the vector database.
              This may take a few minutes depending on the document size.
            </p>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Uploaded Documents</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {documents.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No documents uploaded yet
              </div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{doc.filename}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {doc.doc_type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Chunks: {doc.chunks_count || 0}</div>
                        <div>Uploaded: {new Date(doc.created_at).toLocaleString()}</div>
                        {doc.completed_at && (
                          <div>Completed: {new Date(doc.completed_at).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
