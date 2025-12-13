import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { loginSuccess, logout } from "../redux/authSlice";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE' });
  const [form, setForm] = useState({ title: "", description: "", due_date: "", assigned_to: null });
  const [tasksLoading, setTasksLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [showMine, setShowMine] = useState(false);
  const [query, setQuery] = useState('');
  const [createTaskLoading, setCreateTaskLoading] = useState(false);
  const [createUserLoading, setCreateUserLoading] = useState(false);

  // Fetch tasks/users and set state - defined inline in useEffect to avoid stale closures

  useEffect(() => {
    const fn = async () => {
      try {
        setTasksLoading(true);
        setUsersLoading(true);
        setError(null);

        const tasksData = await api.get('/tasks');
        setTasks(tasksData);

        if (user?.role === 'ADMIN') {
          const usersData = await api.get('/auth/users');
          setUsers(usersData);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load data');
      } finally {
        setTasksLoading(false);
        setUsersLoading(false);
      }
    };
    fn();
  }, [user]);

  const submitTask = async (e) => {
    e.preventDefault();
    try {
      setCreateTaskLoading(true);
      setError(null);
      setMessage(null);

      const assignedTo = user.role === 'EMPLOYEE' ? user.id : (form.assigned_to || null);

      const newTask = await api.post('/tasks', {
        title: form.title,
        description: form.description,
        due_date: form.due_date,
        userId: assignedTo,
      });

      setTasks(prev => [newTask, ...prev]);
      setForm({ title: '', description: '', due_date: '', assigned_to: null });
      setMessage('Task created successfully');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.message || 'Error creating task');
    } finally {
      setCreateTaskLoading(false);
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      setError(null);
      const resp = await api.patch(`/tasks/${taskId}/status`, { status });
      setTasks(prev => prev.map(t => t.id === taskId ? resp : t));
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message || 'Failed to update task status');
    }
  };

  const updateTask = async (taskId, data) => {
    try {
      setError(null);
      const updatedTask = await api.put(`/tasks/${taskId}`, data);
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      return true;
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.message || 'Failed to update task');
      return false;
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return false;
    }

    try {
      setError(null);
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setMessage('Task deleted successfully');
      setTimeout(() => setMessage(null), 3000);
      return true;
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.message || 'Failed to delete task');
      return false;
    }
  };

  const assignTask = async (taskId, assignedToId) => {
    try {
      setError(null);
      const updated = await api.patch(`/tasks/${taskId}/assign`, { assigned_to: assignedToId });
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      setMessage('Task assigned');
      setTimeout(() => setMessage(null), 3000);
      return true;
    } catch (err) {
      console.error('Assign failed', err);
      setError(err.message || 'Failed to assign task');
      return false;
    }
  };

  const createUser = async (userData) => {
    try {
      setCreateUserLoading(true);
      setError(null);
      setMessage(null);

      const newUser = await api.post('/auth/register', userData);
      setUsers(prev => [newUser, ...prev]);
      setMessage('User created successfully');
      setTimeout(() => setMessage(null), 3000);
      return true;
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message || 'Error creating user');
      return false;
    } finally {
      setCreateUserLoading(false);
    }
  };

  const submitUser = async (e) => {
    e.preventDefault();
    await createUser(newUser);
    setNewUser({ name: '', email: '', password: '', role: 'EMPLOYEE' });
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return false;
    }

    try {
      setError(null);
      await api.delete(`/auth/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setMessage('User deleted successfully');
      setTimeout(() => setMessage(null), 3000);
      return true;
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user');
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    dispatch(logout());
    navigate('/login');
  };

  const refreshSession = async () => {
    try {
      const res = await api.post('/auth/refresh');
      if (res?.user) {
        // update local user state in redux if needed
        dispatch(loginSuccess(res.user));
      }
      setMessage('Session refreshed');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Failed refresh', err);
      setError('Failed to refresh session');
    }
  };

  const filteredTasks = useMemo(() => {
    let results = tasks;
    if (filter !== 'ALL') {
      results = results.filter(t => t.status === filter);
    }
    if (showMine) {
      results = results.filter(t => (t.assignedTo && t.assignedTo.id === user.id) || t.assigned_to === user.id);
    }
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(t => (t.title || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));
    }
    return results.sort((a,b) => new Date(a.due_date || 0) - new Date(b.due_date || 0));
  }, [tasks, filter, showMine, query, user]);

  const statusClass = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-200 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-200 text-blue-800';
      case 'COMPLETED': return 'bg-green-200 text-green-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">{user?.name} <span className="text-xs text-gray-400">({user?.role})</span></span>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
        </div>
      </header>
      {message && <div className="mt-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
      {error && <div className="mt-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}

      <section className="mt-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Create Task</h2>
          {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
          <form onSubmit={submitTask} className="space-y-3">
            <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Title" required className="w-full border p-2 rounded" />
            <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Description" className="w-full border p-2 rounded" rows={3} />
            <div className="flex gap-3">
              <input type="date" value={form.due_date} onChange={(e) => setForm({...form, due_date: e.target.value})} className="border p-2 rounded" />
              {user?.role === 'ADMIN' ? (
                <select value={form.assigned_to || ''} onChange={(e) => setForm({...form, assigned_to: e.target.value})} className="border p-2 rounded">
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              ) : (
                <input type="text" value={user?.name || ''} disabled className="border p-2 rounded text-gray-500" />
              )}
              <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded disabled:opacity-60" disabled={createTaskLoading}>{createTaskLoading ? 'Creating...' : 'Create'}</button>
            </div>
          </form>
          <div className="mt-3">
            <button className="text-sm text-gray-600 underline" onClick={refreshSession}>Refresh Session</button>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Tasks</h2>
          <div className="flex items-center gap-2">
            <input className="border p-1 rounded" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
            <select className="border p-1 rounded" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="ALL">All</option>
              <option value="PENDING">PENDING</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
            <label className="text-sm flex items-center gap-1"><input type="checkbox" checked={showMine} onChange={() => setShowMine(v => !v)} /> My tasks</label>
          </div>
        </div>
        {tasksLoading ? <div>Loading tasks…</div> : (
          filteredTasks.map(task => (
          <div key={task.id} style={{border: '1px solid #ddd', margin: 8, padding: 8}}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{task.title}</div>
                <div className="text-sm text-gray-600">Assigned: {task.assignedTo?.name || task.assigned_to || 'Unassigned'}</div>
                  <div className="text-sm">{task.description}</div>
                  <div className="text-xs text-gray-400">Created by: {task.createdBy?.name || 'Unknown'}</div>
              </div>
              <div className="text-sm text-gray-500">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</div>
            </div>
            <div>Details: {task.description}</div>
            <div className="mt-3 flex items-center justify-between">
              <label className="mr-2">Status:</label>
              <select
                value={task.status}
                onChange={(e) => updateStatus(task.id, e.target.value)}
                className="border p-1 rounded"
                disabled={user?.role === 'EMPLOYEE' && !(task.assignedTo && task.assignedTo.id === user.id)}
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
              <div className={`px-2 py-1 text-xs rounded ${statusClass(task.status)}`}>{task.status}</div>
            </div>
            {user?.role === 'ADMIN' && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => updateTask(task.id, { title: task.title + ' (edited)' })} className="px-2 py-1 bg-yellow-300 rounded">Quick Edit</button>
                <button onClick={() => deleteTask(task.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            )}
            {user?.role === 'ADMIN' && (
              <div className="mt-2">
                <label className="text-sm mr-2">Assign: </label>
                <select defaultValue={task.assignedTo?.id || ''} onChange={(e) => assignTask(task.id, e.target.value)} className="border p-1 rounded">
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          ))
        )}
        {!tasksLoading && filteredTasks.length === 0 && <div className="text-sm text-gray-500">No tasks found for current filters.</div>}
      </section>

      {user?.role === 'ADMIN' && (
        <section className="mt-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Users</h2>
            <form onSubmit={submitUser} className="grid grid-cols-1 gap-2 mb-3">
              <input value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} placeholder="Name" required className="border p-2 rounded" />
              <input value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} placeholder="Email" type="email" required className="border p-2 rounded" />
              <input value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} placeholder="Password" type="password" required className="border p-2 rounded" />
              <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="border p-2 rounded">
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <button type="submit" className="bg-green-600 text-white py-1 px-3 rounded w-max disabled:opacity-60" disabled={createUserLoading}>{createUserLoading ? 'Creating...' : 'Create User'}</button>
            </form>
            <ul className="space-y-2">
              {usersLoading ? (
                <div>Loading users…</div>
              ) : (
                users.map(u => (
                  <li key={u.id} className="flex items-center justify-between">
                    <div>{u.name} <span className="text-sm text-gray-500">({u.role})</span></div>
                    <div>
                      <button onClick={() => deleteUser(u.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
};

export { Dashboard };

