import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Chat from './pages/Chat';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  return user ? children : <Navigate to="/login" />;
};

// Public Route wrapper (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  return !user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute><Login /></PublicRoute>
      }/>
      <Route path="/register" element={
        <PublicRoute><Register /></PublicRoute>
      }/>

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute><Home /></ProtectedRoute>
      }/>
      <Route path="/profile" element={
        <ProtectedRoute><Profile /></ProtectedRoute>
      }/>
      <Route path="/chat/:roomId" element={
        <ProtectedRoute><Chat /></ProtectedRoute>
      }/>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;