// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OAuthCallback from './pages/OAuthCallback';
import supabase from './lib/supabaseClient';

// ... (seus componentes IdleLogout, PrivateRoute)

function App() {
  return (
    <Router>
      <IdleLogout />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App; // ✅ ÚNICA exportação necessária