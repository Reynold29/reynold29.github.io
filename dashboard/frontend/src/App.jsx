import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './components/Auth/Login'
import SongList from './components/Songs/SongList'
import SongDetail from './components/Songs/SongDetail'
import { apiUrl } from './config'
import './App.css'
import { FaMoon, FaSun } from 'react-icons/fa'

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true; // Default to dark mode
  });
  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);
  return [dark, setDark];
}

function Header({ user, onLogout, dark, setDark }) {
  return (
    <div className="header">
      <h1>Welcome, {user?.username || 'User'}!</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button onClick={() => setDark(d => !d)} className="theme-toggle" title="Toggle dark mode">
          {dark ? <FaSun /> : <FaMoon />}
        </button>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </div>
    </div>
  );
}

function ProtectedLayout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [dark, setDark] = useDarkMode();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  return (
    <div className="home-container">
      <Header user={user} onLogout={handleLogout} dark={dark} setDark={setDark} />
      {children}
    </div>
  );
}

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        navigate('/login');
        return;
      }
      try {
        const response = await fetch(`${apiUrl}/verify-token`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (error) {
        console.error('Token verification error:', error);
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [navigate]);
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <div style={{ 
          padding: '20px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Verifying authentication...
        </div>
      </div>
    );
  }
  return isAuthenticated ? children : null;
}

function Home() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="home-grid">
        {/* Hymns Box */}
        <div 
          onClick={() => navigate('/hymns')}
          className="home-box"
        >
          <div className="home-icon">🎵</div>
          <h2 className="home-title">Hymns</h2>
          <p className="home-description">
            Browse and manage the collection of hymns
          </p>
        </div>
        {/* Keerthane Box */}
        <div 
          onClick={() => navigate('/keerthanes')}
          className="home-box"
        >
          <div className="home-icon">🎼</div>
          <h2 className="home-title">Keerthane</h2>
          <p className="home-description">
            Browse and manage the collection of keerthane
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Home />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hymns"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <SongList type="hymns" />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/keerthanes"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <SongList type="keerthane" />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hymns/:number"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <SongDetail type="hymns" />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/keerthanes/:number"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <SongDetail type="keerthane" />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}
