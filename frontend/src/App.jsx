import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './components/auth/Login'
import SignUp from './components/auth/SignUp'
import Navbar from './components/Navbar'
import DashboardNew from './pages/DashboardNew'
import NewCase from './pages/NewCase'
import CaseHistory from './pages/CaseHistory'
import Settings from './pages/Settings'
import Help from './pages/Help'
import CaseDetail from './pages/CaseDetail'
import AdminPortal from './pages/AdminPortal'
import DebugAuth from './pages/DebugAuth'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/debug-auth" element={<DebugAuth />} />
          
          {/* Protected routes with new UI */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="flex flex-col h-screen">
                  <Navbar />
                  <DashboardNew />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-case"
            element={
              <ProtectedRoute>
                <div className="flex flex-col h-screen">
                  <Navbar />
                  <NewCase />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases"
            element={
              <ProtectedRoute>
                <div className="flex flex-col h-screen">
                  <Navbar />
                  <CaseHistory />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <div className="flex flex-col h-screen">
                  <Navbar />
                  <Settings />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <div className="flex flex-col h-screen">
                  <Navbar />
                  <Help />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/case/:caseId"
            element={
              <ProtectedRoute>
                <div className="flex flex-col h-screen">
                  <Navbar />
                  <CaseDetail />
                </div>
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
