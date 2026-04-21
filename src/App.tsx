import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { AppointmentPage } from './pages/AppointmentPage';
import { AuthPage } from './pages/AuthPage';
import { CoursesPage } from './pages/CoursesPage';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/courses" replace /> : <AuthPage />}
      />
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/courses' : '/auth'} replace />}
      />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/appointments" element={<AppointmentPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
