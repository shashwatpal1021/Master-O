import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const CreateTask = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', due_date: '', assigned_to: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fn = async () => {
      try {
        const u = await api.get('/auth/users');
        setUsers(u);
      } catch (err) {
        // ignore
      }
    };
    fn();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.title || form.title.trim() === '') return setError('Title is required.');
    try {
      setLoading(true);
      const newTask = await api.post('/tasks', {
        title: form.title,
        description: form.description,
        due_date: form.due_date || null,
        userId: form.assigned_to || null,
      });
      // notify dashboard to refresh
      try { window.dispatchEvent(new CustomEvent('taskCreated', { detail: newTask })); } catch (e) {}
      navigate('/dashboard');
    } catch (err) {
      console.error('Create task failed', err);
      setError(err?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create Task</h1>
      <form className="bg-card p-4 rounded shadow space-y-3" onSubmit={submit}>
        <input className="w-full border p-2 rounded" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title" required />
        <textarea className="w-full border p-2 rounded" rows={4} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" />
        <div className="flex gap-3 items-center">
          <input type="date" value={form.due_date} onChange={(e) => setForm(f => ({ ...f, due_date: e.target.value }))} className="border p-2 rounded" />
          <select value={form.assigned_to || ''} onChange={(e) => setForm(f => ({ ...f, assigned_to: e.target.value }))} className="border p-2 rounded">
            <option value="">Unassigned</option>
            {users.map(u => (<option key={u.id} value={u.id}>{u.name} ({u.role})</option>))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded" disabled={loading}>{loading ? (<><Spinner size={14} color="white" /> Creating...</>) : 'Create'}</button>
          <button type="button" className="px-3 py-2 rounded border" onClick={() => navigate('/dashboard')}>Cancel</button>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
      </form>
    </div>
  );
};

export default CreateTask;
