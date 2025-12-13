import { BrowserRouter, Route, Routes } from "react-router-dom";
import React, { Suspense, lazy } from 'react';
import ProtectedRoute from "./components/ProtectedRoute";

const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-8">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><Dashboard /></ProtectedRoute>} />
          <Route path="/employee" element={<ProtectedRoute role="EMPLOYEE"><Dashboard /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
