import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { AppointmentPage } from './pages/AppointmentPage';
import { AuthPage } from './pages/AuthPage';
import { CoursesPage } from './pages/CoursesPage';
import { AppointmentsListPage } from './pages/AppointmentsListPage';
import { EnrollmentsListPage } from './pages/EnrollmentsListPage';
import { CoursesCreatePage } from './pages/CoursesCreatePage';
import { AdminCreateAppointmentPage } from './pages/AdminCreateAppointmentPage';
import { AppointmentsProvider } from './context/AppointmentsContext';
import { EnrollmentsProvider } from './context/EnrollmentsContext';
import { CoursesProvider } from './context/CoursesContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <AppointmentsProvider>
      <EnrollmentsProvider>
        <CoursesProvider>
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
              <Route path="/courses/create" element={<CoursesCreatePage />} />
              <Route path="/appointments" element={<AppointmentPage />} />
              <Route path="/appointments/list" element={<AppointmentsListPage />} />
              <Route path="/appointments/create-for-user" element={<AdminCreateAppointmentPage />} />
              <Route path="/enrollments" element={<EnrollmentsListPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CoursesProvider>
      </EnrollmentsProvider>
    </AppointmentsProvider>
  );
}

export default App;
