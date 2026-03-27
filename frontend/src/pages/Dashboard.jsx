import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import TaskModal from '../components/TaskModal'

function StatusBadge({ status }) {
  const map = {
    TODO: { label: 'To Do', cls: 'badge-todo', dot: 'dot-todo' },
    IN_PROGRESS: { label: 'In Progress', cls: 'badge-progress', dot: 'dot-progress' },
    DONE: { label: 'Done', cls: 'badge-done', dot: 'dot-done' },
  }
  const s = map[status] || map.TODO
  return (
    <span className={`badge ${s.cls}`}>
      <span className={`dot ${s.dot}`} />
      {s.label}
    </span>
  )
}

function initials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

export default function Dashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ status: '', assignedTo: '' })
  const [modal, setModal] = useState(null) // null | 'create' | task object for edit

  const fetchTasks = useCallback(async () => {
    try {
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.assignedTo) params.assignedTo = filters.assignedTo
      const res = await api.get('/api/tasks', { params })
      setTasks(res.data)
    } catch {
      setError('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    api.get('/api/users/assignees').then(res => setUsers(res.data)).catch(() => {})
  }, [])

  const createTask = async (data) => {
    await api.post('/api/tasks', data)
    await fetchTasks()
  }

  const updateTask = async (id, data) => {
    await api.put(`/api/tasks/${id}`, data)
    await fetchTasks()
  }

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return
    await api.delete(`/api/tasks/${id}`)
    await fetchTasks()
  }

  const quickStatus = async (task, newStatus) => {
    await api.put(`/api/tasks/${task.id}`, {
      title: task.title,
      description: task.description,
      status: newStatus,
      assignedToId: task.assignedTo?.id || null,
    })
    await fetchTasks()
  }

  const counts = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Track and manage all tasks</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/>
          </svg>
          New task
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total</div>
          <div className="stat-value">{counts.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">To Do</div>
          <div className="stat-value" style={{color:'var(--text-2)'}}>{counts.todo}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-value" style={{color:'var(--amber)'}}>{counts.inProgress}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Done</div>
          <div className="stat-value" style={{color:'var(--green)'}}>{counts.done}</div>
        </div>
      </div>

      <div className="filters-row">
        <select
          className="filter"
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
        >
          <option value="">All statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
        <select
          className="filter"
          value={filters.assignedTo}
          onChange={e => setFilters(f => ({ ...f, assignedTo: e.target.value }))}
        >
          <option value="">All assignees</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        {(filters.status || filters.assignedTo) && (
          <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ status: '', assignedTo: '' })}>
            Clear filters
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-container">
        {loading ? (
          <div className="loading">Loading tasks…</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks found</h3>
            <p>Create your first task to get started</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Assigned to</th>
                <th>Created by</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td>
                    <div style={{fontWeight: 500}}>{task.title}</div>
                    {task.description && (
                      <div style={{fontSize:13,color:'var(--text-3)',marginTop:2}}>{task.description}</div>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={task.status} />
                  </td>
                  <td>
                    {task.assignedTo ? (
                      <div className="user-cell">
                        <div className="avatar">{initials(task.assignedTo.name)}</div>
                        {task.assignedTo.name}
                      </div>
                    ) : (
                      <span style={{color:'var(--text-3)',fontSize:13}}>—</span>
                    )}
                  </td>
                  <td style={{color:'var(--text-2)',fontSize:13}}>{task.createdBy?.name}</td>
                  <td style={{color:'var(--text-3)',fontSize:12,fontFamily:'DM Mono, monospace'}}>
                    {new Date(task.updatedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="actions-cell">
                      {task.status !== 'DONE' && (user?.role === 'ADMIN' || task.assignedTo?.id === user?.id || task.createdBy?.id === user?.id) && (
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Mark next status"
                          onClick={() => quickStatus(task, task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE')}
                        >
                          {task.status === 'TODO' ? '▶' : '✓'}
                        </button>
                      )}
                      {(user?.role === 'ADMIN' || task.createdBy?.id === user?.id || task.assignedTo?.id === user?.id) && (
                        <>
                          <button className="btn btn-ghost btn-sm" onClick={() => setModal(task)}>Edit</button>
                          {user?.role === 'ADMIN' && (
                            <button className="btn btn-danger btn-sm" onClick={() => deleteTask(task.id)}>Del</button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <TaskModal
          task={modal === 'create' ? null : modal}
          users={users}
          onSave={modal === 'create' ? createTask : (data) => updateTask(modal.id, data)}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
