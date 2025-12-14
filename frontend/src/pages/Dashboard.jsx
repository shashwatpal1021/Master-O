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
  const [assigningTask, setAssigningTask] = useState(null);
  const [highlightedTask, setHighlightedTask] = useState(null);
  // Theme toggle removed; app uses a single light theme
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [taskErrors, setTaskErrors] = useState({});
  const [userErrors, setUserErrors] = useState({});
  const [editingTask, setEditingTask] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [inlineEditId, setInlineEditId] = useState(null);
  const [inlineForm, setInlineForm] = useState({ title: '', description: '' });
  const [fetchingTask, setFetchingTask] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Fetch tasks/users and set state - defined inline in useEffect to avoid stale closures

  useEffect(() => {
    // fetch initial tasks and users; also re-fetch on external events (e.g., task created)
    const fetchData = async () => {
      try {
        setTasksLoading(true);
        setUsersLoading(true);
        setError(null);

        const tasksData = await api.get('/tasks');
        setTasks(tasksData);

        // Fetch users for everyone so assignee lists are available to assign tasks
        const usersData = await api.get('/auth/users');
        setUsers(usersData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load data');
      } finally {
        setTasksLoading(false);
        setUsersLoading(false);
      }
    };
    fetchData();
    const onCreated = (e) => { fetchData(); setMessage(e?.detail ? 'Task created successfully' : 'Task created'); setTimeout(() => setMessage(null), 3000); };
    window.addEventListener('taskCreated', onCreated);
    return () => window.removeEventListener('taskCreated', onCreated);
  }, [user]);

  // Theme persistence removed

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

      const assignedTo = form.assigned_to || null;

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
      setEditingTask(taskId);
      const updatedTask = await api.put(`/tasks/${taskId}`, data);
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      setHighlightedTask(taskId);
      setTimeout(() => setHighlightedTask(null), 1200);
      setMessage('Task updated successfully');
      setTimeout(() => setMessage(null), 2500);
      setEditingTask(null);
      return true;
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.message || 'Failed to update task');
      setEditingTask(null);
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
      setAssigningTask(taskId);
      const updated = await api.patch(`/tasks/${taskId}/assign`, { assigned_to: assignedToId });
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      setMessage('Task assigned');
      setTimeout(() => setMessage(null), 3000);
      setAssigningTask(null);
      return true;
    } catch (err) {
      console.error('Assign failed', err);
      setError(err.message || 'Failed to assign task');
      setAssigningTask(null);
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
  if (showMine && user?.role !== 'ADMIN') {  // Only filter by 'My tasks' if not admin
    results = results.filter(t =>
      (t.assignedTo && t.assignedTo.id === user?.id) ||
      t.assigned_to === user?.id
    );
  }
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(t =>
      (t.title || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    );
  }
  return results.sort((a,b) => new Date(a.due_date || 0) - new Date(b.due_date || 0));
}, [tasks, filter, showMine, query, user]);

  const statusClass = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-200';
      case 'IN_PROGRESS': return 'bg-blue-200';
      case 'COMPLETED': return 'bg-green-200';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {/* <button
            className="p-2 rounded-full bg-green-600 text-white text-sm plus-button btn-smooth"
            title="Create Task"
            onClick={() => setShowTaskModal(true)}
            aria-label="Create task"
          >
            +
          </button> */}
        </div>
          <div className="flex items-center space-x-4">
          <span className="text-sm text-muted">{user?.name} <span className="text-xs text-muted-2">({user?.role})</span></span>
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
              <button
                className="px-3 py-1 rounded bg-blue-600 text-white btn-smooth"
                onClick={() => { navigate('/tasks/create'); }}
              >Create Task</button>
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

          </div>
          <div className="flex items-center rounded-md p-2 gap-2">
            <input className="border p-1 rounded" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
            <select className="border p-1 rounded" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="ALL">All</option>
              <option value="PENDING">PENDING</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
        </div>
        {tasksLoading ? <div>Loading tasks…</div> : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`p-3 rounded task-row ${highlightedTask === task.id ? 'task-flash' : 'hover:bg-gray-50'}`}
              style={{ border: '1px solid #e6e6e6', margin: 6 }}
              role="button"
              tabIndex={0}
              onClick={async (e) => {
                // ignore clicks on interactive controls (handled by stopPropagation below)
                try {
                  setFetchingTask(task.id);
                  const fresh = await api.get(`/tasks/${task.id}`);
                  setForm({
                    title: fresh.title || '',
                    description: fresh.description || '',
                    due_date: fresh.due_date ? new Date(fresh.due_date).toISOString().slice(0,10) : '',
                    assigned_to: fresh.assignedTo?.id || fresh.assigned_to || ''
                  });
                  setEditingId(task.id);
                  setShowTaskModal(true);
                } catch (err) {
                  console.error('Failed to fetch task for open', err);
                  setError(err.message || 'Failed to fetch task');
                } finally {
                  setFetchingTask(null);
                }
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="font-semibold truncate">{task.title}</div>
                  <div className="text-sm text-muted truncate">{task.description}</div>
                </div>
                <div className="w-40 text-right text-sm">
                  <div className={`inline-block px-2 py-1 text-xs rounded ${statusClass(task.status)}`}>{task.status}</div>
                </div>
                <div className="w-32 text-sm text-muted text-right">{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</div>
                <div className="relative">
                  <button
                    className="px-2 py-1 rounded hover:bg-gray-100"
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === task.id ? null : task.id); }}
                    aria-haspopup="true"
                    aria-expanded={openMenuId === task.id}
                    title="Open menu"
                  >
                    ⋯
                  </button>
                  {openMenuId === task.id && (
                    <div className="absolute right-0 mt-2 bg-white border rounded shadow z-10" onClick={(e) => e.stopPropagation()}>
                      <button className="block px-3 py-2 w-full text-left hover:bg-gray-100" onClick={() => { setOpenMenuId(null); navigate(`/tasks/${task.id}`); }}>Edit</button>


                      {user?.role === 'ADMIN' && (
                        <button className="block px-3 py-2 w-full text-left text-red-600 hover:bg-gray-100" onClick={async () => {
                          setOpenMenuId(null);
                          await deleteTask(task.id);
                        }}>Delete</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {!tasksLoading && filteredTasks.length === 0 && <div className="text-sm text-muted">No tasks found for current filters.</div>}
      </section>

      {user && user.role === 'ADMIN' && (
        <section className="mt-6">
          <div className="bg-card p-5 rounded shadow">
              <div className="flex  items-center justify-between">
                <h2 className="text-lg font-semibold mb-5">List of the User</h2>
                <button className="p-2 rounded-md bg-blue-600 text-white plus-button btn-smooth" onClick={() => navigate('/users/create')} aria-label="Create user">Create User</button>
              </div>

            <ul className="space-y-2 p-2">
              {usersLoading ? (
                <div>Loading users…</div>
              ) : (
                users.map(u => (
                  <li key={u.id} className="flex items-center justify-between">
                    <div>{u.name.charAt(0).toUpperCase() + u.name.slice(1)} </div><span className="text-sm text-muted">{u.role}</span>
                    <div>
                      <button onClick={() => deleteUser(u.id)} className="px-3 py-1 bg-red-500 text-white rounded-full">X</button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      )}

      {/* Modal for creating task */}
      <Modal open={showTaskModal} onClose={() => { setShowTaskModal(false); setEditingId(null); setForm({ title: '', description: '', due_date: '', assigned_to: null }); }} title={editingId ? 'Task' : 'Create Task'}>
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (editingId) {
            const ok = await updateTask(editingId, {
              title: form.title,
              description: form.description,
              due_date: form.due_date,
              assigned_to: form.assigned_to || null
            });
            if (ok) {
              setShowTaskModal(false);
              setEditingId(null);
              setForm({ title: '', description: '', due_date: '', assigned_to: null });
            }
          } else {
            const ok = await submitTask(e);
            if (ok) setShowTaskModal(false);
          }
        }} className="space-y-3">
          <div>
           <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Title" required className="w-full border p-2 rounded" />
           {taskErrors.title && <div className="text-sm text-red-500 mt-1">{taskErrors.title}</div>}
          </div>
          <textarea
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
            onInput={(e) => setForm({...form, description: e.target.value})}
            onKeyDown={(e) => { if (e.key === ' ') e.stopPropagation(); }}
            placeholder="Description"
            className="w-full border p-2 rounded"
            rows={3}
          />
          <div className="flex gap-3">
            <input type="date" value={form.due_date} onChange={(e) => setForm({...form, due_date: e.target.value})} className="border p-2 rounded" />
            {taskErrors.due_date && <div className="text-sm text-red-500 mt-1">{taskErrors.due_date}</div>}
            <div className="flex items-center gap-2">
              <select value={form.assigned_to || ''} onChange={(e) => setForm({...form, assigned_to: e.target.value})} className="border p-2 rounded">
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
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


