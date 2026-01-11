import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import FullScreenLoader from './components/FullScreenLoader'
import { useMeQuery } from './store/api'
import AdminTeachersPage from './pages/admin/AdminTeachersPage'
import AdminStudentsPage from './pages/admin/AdminStudentsPage'
import AdminGroupsPage from './pages/admin/AdminGroupsPage'
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage'
import TeacherTestsPage from './pages/teacher/TeacherTestsPage'
import TeacherTestDetailsPage from './pages/teacher/TeacherTestDetailsPage'
import TeacherTopicsPage from './pages/teacher/TeacherTopicsPage'
import TeacherGradesPage from './pages/teacher/TeacherGradesPage'

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
        element={
          user?.role === 'admin' || user?.role === 'teacher' ? (
            <AdminTeachersPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/admin/students"
        element={
          user?.role === 'admin' || user?.role === 'teacher' ? (
            <AdminStudentsPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/admin/groups"
        element={
          user?.role === 'admin' || user?.role === 'teacher' ? (
            <AdminGroupsPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/teacher/dashboard"
        element={
          user?.role === 'teacher' || user?.role === 'admin' ? (
            <TeacherDashboardPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/teacher/tests"
        element={
          user?.role === 'teacher' || user?.role === 'admin' ? (
            <TeacherTestsPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/teacher/tests/:testId"
        element={
          user?.role === 'teacher' || user?.role === 'admin' ? (
            <TeacherTestDetailsPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/teacher/topics"
        element={
          user?.role === 'teacher' || user?.role === 'admin' ? (
            <TeacherTopicsPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/teacher/grades"
        element={
          user?.role === 'teacher' || user?.role === 'admin' ? (
            <TeacherGradesPage />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  )
}

function App() {
  return <AppRoutes />
}

export default App
