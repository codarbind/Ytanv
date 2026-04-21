import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Vanty Platform</p>
          <h1>Learning and Booking Dashboard</h1>
        </div>
        <div className="topbar-actions">
          <div className="user-chip">
            <span>{user?.username}</span>
            <small>{user?.role}</small>
          </div>
          <button className="secondary-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="tabs">
        <NavLink
          to="/courses"
          className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
        >
          Browse Courses
        </NavLink>
        {user?.role === 'ADMIN' && (
          <NavLink
            to="/courses/create"
            className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
          >
            Create Course
          </NavLink>
        )}
        <NavLink
          to="/enrollments"
          className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
        >
          My Enrollments
        </NavLink>
        {user?.role === 'USER' && (
          <NavLink
            to="/appointments"
            className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
          >
            Book Appointment
          </NavLink>
        )}
        {user?.role === 'ADMIN' && (
          <>
            <NavLink
              to="/appointments/list"
              className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
            >
              View Appointments
            </NavLink>
            <NavLink
              to="/appointments/create-for-user"
              className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
            >
              Create Appointment
            </NavLink>
          </>
        )}
      </nav>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}
