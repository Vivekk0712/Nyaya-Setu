const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token')

  if (!token) {
    throw new Error('Not authenticated')
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

export const api = {
  // Intake endpoint
  submitIncident: async (description, language = 'en') => {
    const headers = getAuthHeader()
    const response = await fetch(`${API_BASE}/api/intake`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ incident_description: description, language })
    })

    if (!response.ok) {
      throw new Error('Failed to submit incident')
    }

    return response.json()
  },

  // Generate draft
  generateDraft: async (caseId, kycData) => {
    const headers = getAuthHeader()
    const response = await fetch(`${API_BASE}/api/generate-draft`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ case_id: caseId, user_kyc: kycData })
    })

    if (!response.ok) {
      throw new Error('Failed to generate draft')
    }

    return response.json()
  },

  // Get cases
  getCases: async () => {
    const headers = getAuthHeader()
    const response = await fetch(`${API_BASE}/api/cases`, { headers })

    if (!response.ok) {
      throw new Error('Failed to fetch cases')
    }

    return response.json()
  },

  // Get case detail
  getCase: async (caseId) => {
    const headers = getAuthHeader()
    const response = await fetch(`${API_BASE}/api/cases/${caseId}`, { headers })

    if (!response.ok) {
      throw new Error('Failed to fetch case')
    }

    return response.json()
  },

  // Update case status
  updateCaseStatus: async (caseId, status) => {
    const headers = getAuthHeader()
    const response = await fetch(`${API_BASE}/api/cases/${caseId}/status?status=${status}`, {
      method: 'PATCH',
      headers
    })

    if (!response.ok) {
      throw new Error('Failed to update case status')
    }

    return response.json()
  },

  // Trigger nudge
  triggerNudge: async (caseId) => {
    const headers = getAuthHeader()
    const response = await fetch(`${API_BASE}/api/nudge/${caseId}`, {
      method: 'POST',
      headers
    })

    if (!response.ok) {
      throw new Error('Failed to trigger nudge')
    }

    return response.json()
  },

  // Admin endpoints
  checkAdminStatus: async () => {
    const headers = getAuthHeader()
    const response = await fetch(`${API_BASE}/api/admin/check`, { headers })

    if (!response.ok) {
      return { is_admin: false }
    }

    return response.json()
  },

  uploadDocument: async (file, docType) => {
    const token = localStorage.getItem('access_token')
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE}/api/admin/documents/upload?doc_type=${docType}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload document')
    }

    return response.json()
  },

  getAdminDocuments: async () => {
    const headers = getAuthHeader()
    const response = await fetch(`${API_BASE}/api/admin/documents`, { headers })

    if (!response.ok) {
      throw new Error('Failed to fetch documents')
    }

    return response.json()
  },

  deleteDocument: async (uploadId) => {
    const headers = getAuthHeader()
    const response = await fetch(`${API_BASE}/api/admin/documents/${uploadId}`, {
      method: 'DELETE',
      headers
    })

    if (!response.ok) {
      throw new Error('Failed to delete document')
    }

    return response.json()
  },

  getAdminStats: async () => {
    const headers = getAuthHeader()
    const response = await fetch(`${API_BASE}/api/admin/stats`, { headers })

    if (!response.ok) {
      throw new Error('Failed to fetch stats')
    }

    return response.json()
  },

  // Chat endpoints
  chat: async (message, caseId = null, language = 'en') => {
    const headers = getAuthHeader()
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, case_id: caseId, language })
    })

    if (!response.ok) {
      throw new Error('Failed to send chat message')
    }

    return response.json()
  },

  getChatHistory: async (caseId) => {
    const headers = getAuthHeader()
    const response = await fetch(`${API_BASE}/api/chat/history/${caseId}`, { headers })

    if (!response.ok) {
      throw new Error('Failed to fetch chat history')
    }

    return response.json()
  },

  deleteChatHistory: async (caseId) => {
    const headers = getAuthHeader()
    const response = await fetch(`${API_BASE}/api/chat/history/${caseId}`, {
      method: 'DELETE',
      headers
    })

    if (!response.ok) {
      throw new Error('Failed to delete chat history')
    }

    return response.json()
  },

  clearChatSession: async (caseId = null) => {
    const headers = getAuthHeader()
    const response = await fetch(`${API_BASE}/api/chat/clear`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ case_id: caseId })
    })

    if (!response.ok) {
      throw new Error('Failed to clear chat session')
    }

    return response.json()
  },

  getChatSummary: async (caseId = null) => {
    const headers = getAuthHeader()
    const url = caseId
      ? `${API_BASE}/api/chat/summary?case_id=${caseId}`
      : `${API_BASE}/api/chat/summary`
    const response = await fetch(url, { headers })

    if (!response.ok) {
      throw new Error('Failed to fetch chat summary')
    }

    return response.json()
  }
}

// Add axios-like interface for easier usage
const axiosLikeApi = {
  get: async (url) => {
    const headers = getAuthHeader()
    const response = await fetch(`${API_BASE}${url}`, { headers })

    if (!response.ok) {
      throw new Error(`GET ${url} failed`)
    }

    return { data: await response.json() }
  },

  post: async (url, data) => {
    const headers = getAuthHeader()
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`POST ${url} failed`)
    }

    return { data: await response.json() }
  },

  delete: async (url) => {
    const headers = getAuthHeader()
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'DELETE',
      headers
    })

    if (!response.ok) {
      throw new Error(`DELETE ${url} failed`)
    }

    return { data: await response.json() }
  },

  patch: async (url, data) => {
    const headers = getAuthHeader()
    const response = await fetch(`${API_BASE}${url}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`PATCH ${url} failed`)
    }

    return { data: await response.json() }
  }
}

// Export default for axios-like usage
export default axiosLikeApi
