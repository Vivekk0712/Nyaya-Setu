import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './components/auth/Login'
import SignUp from './components/auth/SignUp'
import Dashboard from './pages/Dashboard'
import NewCase from './pages/NewCase'
import CaseDetail from './pages/CaseDetail'
import AdminPortal from './pages/AdminPortal'
import DebugAuth from './pages/DebugAuth'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/debug-auth" element={<DebugAuth />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-case"
            element={
              <ProtectedRoute>
                <NewCase />
              </ProtectedRoute>
            }
          />
          <Route
            path="/case/:caseId"
            element={
              <ProtectedRoute>
                <CaseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPortal />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
