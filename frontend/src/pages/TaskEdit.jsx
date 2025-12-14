import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const TaskEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', due_date: '', assigned_to: '' });

  useEffect(() => {
    const fn = async () => {
      try {
        setLoading(true);
        const [t, u] = await Promise.all([api.get(`/tasks/${id}`), api.get('/auth/users')]);
        setTask(t);
        setUsers(u);
        setForm({
          title: t.title || '',
          description: t.description || '',
          due_date: t.due_date ? new Date(t.due_date).toISOString().slice(0,10) : '',
          assigned_to: t.assignedTo?.id || t.assigned_to || ''
        });
      } catch (err) {
        console.error('Failed to load task', err);
        setError(err.message || 'Failed to load task');
      } finally {
        setLoading(false);
      }
    };
    fn();
  }, [id]);

  const save = async () => {
    try {
      setSaving(true);
      await api.patch(`/tasks/${id}`, {
        title: form.title,
        description: form.description,
        due_date: form.due_date || null,
        assigned_to: form.assigned_to || null,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Save failed', err);
      setError(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this task?')) return;
    try {
      setDeleting(true);
      await api.delete(`/tasks/${id}`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Delete failed', err);
      setError(err?.message || 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-6">Loading task…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Edit Task</h1>
      <div className="bg-card p-4 rounded shadow space-y-3">
        <input className="w-full border p-2 rounded" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title" />
        <textarea className="w-full border p-2 rounded" rows={4} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
        <div className="flex gap-3 items-center">
          <input type="date" value={form.due_date} onChange={(e) => setForm(f => ({ ...f, due_date: e.target.value }))} className="border p-2 rounded" />
          <select value={form.assigned_to || ''} onChange={(e) => setForm(f => ({ ...f, assigned_to: e.target.value }))} className="border p-2 rounded">
            <option value="">Unassigned</option>
            {users.map(u => (<option key={u.id} value={u.id}>{u.name} ({u.role})</option>))}
          </select>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={save} disabled={saving}>{saving ? (<><Spinner size={14} color="white" /> Saving...</>) : 'Save'}</button>
          <button className="px-3 py-2 rounded border" onClick={() => navigate('/dashboard')}>Cancel</button>
          <button className="ml-auto px-3 py-2 rounded bg-red-500 text-white" onClick={remove} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</button>
        </div>
        {task && <div className="text-sm text-muted">Status: {task.status}</div>}
      </div>
    </div>
  );
};

export default TaskEdit;
