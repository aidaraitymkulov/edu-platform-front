import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import FullScreenLoader from './components/FullScreenLoader'
import { useMeQuery } from './store/api'

function AppRoutes() {
  const { data: user, isLoading } = useMeQuery()

  if (isLoading) {
    return <FullScreenLoader />
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={user ? <HomePage /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  )
}

function App() {
  return <AppRoutes />
}

export default App
