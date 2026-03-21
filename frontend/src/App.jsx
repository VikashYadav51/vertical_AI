import './App.css'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import AdminUsers from './pages/AdminUsers.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
            <Link to="/" className="text-xl font-semibold">Auth Demo</Link>
            <nav className="space-x-3">
              <Link to="/login" className="text-sm hover:underline">Login</Link>
              <Link to="/register" className="text-sm hover:underline">Register</Link>
              <Link to="/dashboard" className="text-sm hover:underline">Dashboard</Link>
              <Link to="/admin" className="text-sm hover:underline">Admin</Link>
            </nav>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="admin">
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
