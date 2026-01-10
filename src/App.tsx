import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import FullScreenLoader from './components/FullScreenLoader'
import { useMeQuery } from './store/api'
import AdminTeachersPage from './pages/admin/AdminTeachersPage'
import AdminStudentsPage from './pages/admin/AdminStudentsPage'
import AdminGroupsPage from './pages/admin/AdminGroupsPage'

function AppRoutes() {
  const { data: user, isLoading } = useMeQuery()

  if (isLoading) {
    return <FullScreenLoader />
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" replace />} />
      <Route
        path="/admin/teachers"
        element={user?.role === 'admin' ? <AdminTeachersPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/admin/students"
        element={user?.role === 'admin' ? <AdminStudentsPage /> : <Navigate to="/" replace />}
      />
      <Route
        path="/admin/groups"
        element={user?.role === 'admin' ? <AdminGroupsPage /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  )
}

function App() {
  return <AppRoutes />
}

export default App
