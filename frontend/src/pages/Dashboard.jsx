import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";
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
  const [updatingTask, setUpdatingTask] = useState(null);
  const [highlightedTask, setHighlightedTask] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [taskErrors, setTaskErrors] = useState({});
  const [userErrors, setUserErrors] = useState({});

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

  useEffect(() => {
    const _theme = localStorage.getItem('theme');
    if (_theme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const submitTask = async (e) => {
    e.preventDefault();
    setTaskErrors({});
    // Basic validation
    const errors = {};
    if (!form.title || form.title.trim() === '') errors.title = 'Title is required.';
    if (form.due_date && isNaN(new Date(form.due_date).getTime())) errors.due_date = 'Invalid due date.';
    if (Object.keys(errors).length) {
      setTaskErrors(errors);
      return false;
    }
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
      setHighlightedTask(newTask.id);
      setTimeout(() => setHighlightedTask(null), 1600);
      setForm({ title: '', description: '', due_date: '', assigned_to: null });
      setMessage('Task created successfully');
      setTimeout(() => setMessage(null), 3000);
      setTimeout(() => setMessage(null), 3000);
      return true;
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.message || 'Error creating task');
      return false;
    } finally {
      setCreateTaskLoading(false);
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      setError(null);
      setUpdatingTask(taskId);
      const resp = await api.patch(`/tasks/${taskId}/status`, { status });
      setTasks(prev => prev.map(t => t.id === taskId ? resp : t));
      setUpdatingTask(null);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message || 'Failed to update task status');
      setUpdatingTask(null);
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
    setUserErrors({});
    const errors = {};
    if (!newUser.name || newUser.name.trim().length === 0) errors.name = 'Name is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newUser.email || !emailRegex.test(newUser.email)) errors.email = 'Please enter a valid email.';
    if (!newUser.password || newUser.password.length < 6) errors.password = 'Password must be at least 6 characters.';
    if (Object.keys(errors).length) {
      setUserErrors(errors);
      return;
    }
    const ok = await createUser(newUser);
    if (ok) {
      setShowUserModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'EMPLOYEE' });
    }
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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button
            className="p-2 rounded-full bg-green-600 text-white text-sm plus-button btn-smooth"
            title="Create Task"
            onClick={() => setShowTaskModal(true)}
            aria-label="Create task"
          >
            +
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted">{user?.name} <span className="text-xs text-muted-2">({user?.role})</span></span>
          <button
            className="px-2 py-1 rounded border text-sm"
            onClick={() => {
              const next = !isDark;
              setIsDark(next);
              if (next) document.documentElement.classList.add('dark');
              else document.documentElement.classList.remove('dark');
              localStorage.setItem('theme', next ? 'dark' : 'light');
            }}
          >
            {isDark ? '🌙' : '☀️'}
          </button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">Logout</button>
        </div>
      </header>
      {message && <div className="mt-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
      {error && <div className="mt-4 p-2 bg-red-100 text-red-800 rounded">{error}</div>}

      <section className="mt-6">
        <div className="bg-card p-4 rounded shadow">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted">Click the plus button (top-left) to create a new task using the modal.</div>
            <div>
              <button className="px-3 py-1 rounded bg-blue-600 text-white btn-smooth" onClick={() => setShowTaskModal(true)}>Open Create Task</button>
            </div>
          </div>
          <div className="mt-3">
            <button className="text-sm text-muted underline" onClick={refreshSession}>Refresh Session</button>
          </div>
        </div>
      </section>

      <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <button className="p-1 rounded-full bg-green-600 text-white plus-button" title="Create Task" onClick={() => setShowTaskModal(true)}>+</button>
          </div>
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
          <div key={task.id} className={`p-2 rounded task-card ${highlightedTask === task.id ? 'task-flash' : ''}`} style={{border: '1px solid #ddd', margin: 8}}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{task.title}</div>
                <div className="text-sm text-muted">Assigned: {task.assignedTo?.name || task.assigned_to || 'Unassigned'}</div>
                  <div className="text-sm">{task.description}</div>
                  <div className="text-xs text-gray-400">Created by: {task.createdBy?.name || 'Unknown'}</div>
              </div>
              <div className="text-sm text-muted">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</div>
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
              {updatingTask === task.id && (<span className="ml-2 inline-block align-middle"><Spinner size={14} color="var(--text)" /></span>)}
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
        {!tasksLoading && filteredTasks.length === 0 && <div className="text-sm text-muted">No tasks found for current filters.</div>}
      </section>

      {user?.role === 'ADMIN' && (
        <section className="mt-6">
          <div className="bg-card p-4 rounded shadow">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold mb-2">Users</h2>
                <button className="p-1 rounded-full bg-blue-600 text-white plus-button btn-smooth" onClick={() => setShowUserModal(true)} aria-label="Create user">+</button>
              </div>
              <div className="grid grid-cols-1 gap-2 mb-3">
              <input value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} placeholder="Name" required className="border p-2 rounded" />
              <input value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} placeholder="Email" type="email" required className="border p-2 rounded" />
              <input value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} placeholder="Password" type="password" required className="border p-2 rounded" />
              <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="border p-2 rounded">
                <option value="EMPLOYEE">EMPLOYEE</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <div className="text-sm text-muted">Click plus icon to open the create user modal for a richer experience.</div>
            </div>
            <ul className="space-y-2">
              {usersLoading ? (
                <div>Loading users…</div>
              ) : (
                users.map(u => (
                  <li key={u.id} className="flex items-center justify-between">
                    <div>{u.name} <span className="text-sm text-muted">({u.role})</span></div>
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

      {/* Modal for creating task */}
      <Modal open={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task">
        <form onSubmit={async (e) => { const ok = await submitTask(e); if (ok) setShowTaskModal(false); }} className="space-y-3">
          <div>
           <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Title" required className="w-full border p-2 rounded" />
           {taskErrors.title && <div className="text-sm text-red-500 mt-1">{taskErrors.title}</div>}
          </div>
          <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Description" className="w-full border p-2 rounded" rows={3} />
          <div className="flex gap-3">
            <input type="date" value={form.due_date} onChange={(e) => setForm({...form, due_date: e.target.value})} className="border p-2 rounded" />
            {taskErrors.due_date && <div className="text-sm text-red-500 mt-1">{taskErrors.due_date}</div>}
            {user?.role === 'ADMIN' ? (
              <select value={form.assigned_to || ''} onChange={(e) => setForm({...form, assigned_to: e.target.value})} className="border p-2 rounded">
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            ) : (
                <input type="text" value={user?.name || ''} disabled className="border p-2 rounded text-muted" />
            )}
            <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded disabled:opacity-60 btn-smooth" disabled={createTaskLoading}>
              {createTaskLoading && (<span className="inline-block mr-2 align-middle"><Spinner size={14} color="white" /></span>)}
              <span>{createTaskLoading ? 'Creating...' : 'Create'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Toasts */}
      <Toast message={message} type="success" onClose={() => setMessage(null)} />
      <Toast message={error} type="error" onClose={() => setError(null)} />

      {/* Modal for creating user (admin-only) */}
      <Modal open={showUserModal} onClose={() => setShowUserModal(false)} title="Create User">
        <form onSubmit={submitUser} className="grid grid-cols-1 gap-2 mb-3">
          <div>
            <input value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} placeholder="Name" required className="border p-2 rounded" />
            {userErrors.name && <div className="text-sm text-red-500 mt-1">{userErrors.name}</div>}
          </div>
          <input value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} placeholder="Email" type="email" required className="border p-2 rounded" />
          {userErrors.email && <div className="text-sm text-red-500 mt-1">{userErrors.email}</div>}
          <input value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} placeholder="Password" type="password" required className="border p-2 rounded" />
          {userErrors.password && <div className="text-sm text-red-500 mt-1">{userErrors.password}</div>}
          <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="border p-2 rounded">
            <option value="EMPLOYEE">EMPLOYEE</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <div className="flex gap-2 items-center">
            <button type="submit" className="bg-green-600 text-white py-1 px-3 rounded w-max disabled:opacity-60 btn-smooth" disabled={createUserLoading}>
              {createUserLoading && (<span className="inline-block mr-2 align-middle"><Spinner size={14} color="white" /></span>)}
              <span>{createUserLoading ? 'Creating...' : 'Create User'}</span>
            </button>
            <button type="button" className="px-3 py-1 rounded border" onClick={() => setShowUserModal(false)}>Cancel</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export { Dashboard };

