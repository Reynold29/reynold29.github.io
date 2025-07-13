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
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);
  
  return [dark, setDark];
}

function Header({ user, onLogout, dark, setDark }) {
  return (
    <div className="header">
      <h1>Welcome, {user?.username || 'User'}!</h1>
      <div className="header-controls">
        <button 
          onClick={() => setDark(d => !d)} 
          className="theme-toggle" 
          title="Toggle dark mode"
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <FaSun /> : <FaMoon />}
        </button>
        <button 
          onClick={onLogout} 
          className="logout-button"
          aria-label="Logout"
        >
          Logout
        </button>
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
      <div className="loading">
        Verifying authentication...
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
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate('/hymns');
            }
          }}
          aria-label="Navigate to Hymns section"
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
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate('/keerthanes');
            }
          }}
          aria-label="Navigate to Keerthane section"
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
