import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './components/Auth/Login'
import SongList from './components/Songs/SongList'
import './App.css'

// Protected Route component
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
        const response = await fetch('http://localhost:5001/verify-token', {
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

// Home component
function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="home-container">
      <div className="header">
        <h1>Welcome, {user.username}!</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
      
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
          onClick={() => navigate('/keerthane')}
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
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hymns"
          element={
            <ProtectedRoute>
              <SongList type="hymns" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/keerthanes"
          element={
            <ProtectedRoute>
              <SongList type="keerthanes" />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}
