import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function initials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>Team<span>Flow</span></h1>
        </div>
        <nav className="sidebar-nav">
          <div className="section-label">Workspace</div>
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="1" width="6" height="6" rx="1.5"/>
              <rect x="9" y="1" width="6" height="6" rx="1.5"/>
              <rect x="1" y="9" width="6" height="6" rx="1.5"/>
              <rect x="9" y="9" width="6" height="6" rx="1.5"/>
            </svg>
            Dashboard
          </NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="5" r="3"/>
                <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
              </svg>
              Users
            </NavLink>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-cell">
            <div className="avatar">{initials(user?.name)}</div>
            <div className="user-info">
              <strong>{user?.name}</strong>
              <div className="badge-row">
                <span className={`badge ${user?.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                  {user?.role}
                </span>
                <span className="status-indicator active" title="Active"></span>
              </div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
