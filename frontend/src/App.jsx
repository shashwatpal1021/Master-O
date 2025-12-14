import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const TaskEdit = lazy(() => import('./pages/TaskEdit'));
const CreateUser = lazy(() => import('./pages/CreateUser'));
const CreateTask = lazy(() => import('./pages/CreateTask'));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));

function App() {
  useEffect(() => {
    // Theme persistence removed; app uses single light theme
  }, []);
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-8">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><Dashboard /></ProtectedRoute>} />
          <Route path="/tasks/:id" element={<ProtectedRoute><TaskEdit /></ProtectedRoute>} />
          <Route path="/tasks/create" element={<ProtectedRoute><CreateTask /></ProtectedRoute>} />
          <Route path="/users/create" element={<ProtectedRoute role="ADMIN"><CreateUser /></ProtectedRoute>} />
          <Route path="/employee" element={<ProtectedRoute role="EMPLOYEE"><Dashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
