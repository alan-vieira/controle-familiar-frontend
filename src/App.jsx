// src/App.jsx
import OAuthCallback from './pages/OAuthCallback';

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