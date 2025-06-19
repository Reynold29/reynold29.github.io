import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Songs.css';

const SongList = ({ type }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSongs();
  }, [type]);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }

      const data = await response.json();
      setSongs(Array.isArray(data) ? data : (data.hymns || data.keerthane || []));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.number.toString().includes(searchTerm)
  );

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="songs-container">
      <div className="songs-header">
        <h1>{type === 'hymns' ? 'Hymns' : 'Keerthanes'}</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by title or number..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      <div className="songs-grid">
        {filteredSongs.map(song => (
          <div
            key={song.number}
            className="song-card"
            onClick={() => navigate(`/${type === 'hymns' ? 'hymns' : 'keerthanes'}/${song.number}`)}
          >
            <div className="song-number">{song.number}</div>
            <div className="song-title">{song.title}</div>
          </div>
        ))}
      </div>

      {filteredSongs.length === 0 && (
        <div className="no-results">
          No songs found matching your search.
        </div>
      )}
    </div>
  );
};

export default SongList; 