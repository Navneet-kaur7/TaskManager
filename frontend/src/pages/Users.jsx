import { useState, useEffect } from 'react'
import api from '../utils/api'

function initials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' })
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users')
      setUsers(res.data)
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handle = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setFormErrors(fe => ({ ...fe, [e.target.name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    if (!form.password || form.password.length < 6) e.password = 'Minimum 6 characters'
    return e
  }

  const createUser = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setSaving(true)
    try {
      await api.post('/api/users', form)
      setShowModal(false)
      setForm({ name: '', email: '', password: '', role: 'USER' })
      await fetchUsers()
    } catch (err) {
      setFormErrors({ general: err.response?.data?.message || 'Failed to create user' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage team members</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/>
          </svg>
          Add user
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-container">
        {loading ? (
          <div className="loading">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <h3>No users yet</h3>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar">{initials(u.name)}</div>
                      <span style={{fontWeight:500}}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{color:'var(--text-2)',fontSize:13}}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{color:'var(--text-3)',fontSize:12,fontFamily:'DM Mono, monospace'}}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add user</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {formErrors.general && <div className="alert alert-error">{formErrors.general}</div>}
            <form onSubmit={createUser}>
              <div className="form-group">
                <label>Full name</label>
                <input name="name" value={form.name} onChange={handle} autoFocus />
                {formErrors.name && <div className="form-error">{formErrors.name}</div>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handle} />
                {formErrors.email && <div className="form-error">{formErrors.email}</div>}
              </div>
              <div className="form-group">
                <label>Password</label>
                <input name="password" type="password" value={form.password} onChange={handle} />
                {formErrors.password && <div className="form-error">{formErrors.password}</div>}
              </div>
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={form.role} onChange={handle}>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating…' : 'Create user'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
