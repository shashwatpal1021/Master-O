import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { loginSuccess } from "../redux/authSlice";




const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();


    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const submit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Email and password are required');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await api.post("/auth/login", { email, password });
            // Server sets auth cookies (access_token & refresh_token). The response returns the user object.
            dispatch(loginSuccess(response.user));
            const role = response.user?.role;
            if (role === 'ADMIN') navigate('/admin/dashboard');
            else navigate('/dashboard');
        } catch (err) {
            console.error('Login failed', err);
            setError(err.message || 'Login failed. Please check your credentials and try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
            <div className="bg-card p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">Sign in</h1>
                {error && <div className="mb-4 text-red-600">{error}</div>}
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="mt-1 block w-full border rounded p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="mt-1 block w-full border rounded p-2" required />
                    </div>
                    <div className="flex items-center justify-between">
                        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50 btn-smooth" disabled={loading}>{loading ? (<><span className="inline-block mr-2 align-middle"><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="white" stroke-opacity="0.2" stroke-width="4" /><path d="M22 12a10 10 0 00-10-10" stroke="white" stroke-width="4" stroke-linecap="round" /></svg></span>Signing in...</>) : 'Sign in'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export { Login };

