import { useState, useEffect } from 'react'

export default function TaskModal({ task, users, onSave, onClose }) {
  const isEdit = !!task?.id
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'TODO',
    assignedToId: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'TODO',
        assignedToId: task.assignedTo?.id || '',
      })
    }
  }, [task])

  const handle = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    return e
  }

  const submit = async e => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setLoading(true)
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        assignedToId: form.assignedToId || null,
      })
      onClose()
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Something went wrong' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit task' : 'New task'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {errors.general && <div className="alert alert-error">{errors.general}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Title</label>
            <input name="title" value={form.title} onChange={handle} autoFocus />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>
          <div className="form-group">
            <label>Description <span style={{fontWeight:400,color:'var(--text-3)'}}>— optional</span></label>
            <textarea name="description" value={form.description} onChange={handle} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handle}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
          <div className="form-group">
            <label>Assign to <span style={{fontWeight:400,color:'var(--text-3)'}}>— optional</span></label>
            <select name="assignedToId" value={form.assignedToId} onChange={handle}>
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
