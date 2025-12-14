import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const CreateUser = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await api.post('/auth/register', form);
      navigate('/dashboard');
    } catch (err) {
      console.error('Create user failed', err);
      setError(err?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create User</h1>
      <form className="bg-card p-4 rounded shadow space-y-3" onSubmit={submit}>
        <input className="w-full border p-2 rounded" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" required />
        <input type="email" className="w-full border p-2 rounded" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" required />
        <input type="password" className="w-full border p-2 rounded" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Password" required />
        <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))} className="border p-2 rounded">
          <option value="EMPLOYEE">EMPLOYEE</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <div className="flex gap-2">
          <button type="submit" className="bg-green-600 text-white px-3 py-2 rounded" disabled={loading}>{loading ? (<><Spinner size={14} color="white" /> Creating...</>) : 'Create User'}</button>
          <button type="button" className="px-3 py-2 rounded border" onClick={() => navigate('/dashboard')}>Cancel</button>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
      </form>
    </div>
  );
};

export default CreateUser;
