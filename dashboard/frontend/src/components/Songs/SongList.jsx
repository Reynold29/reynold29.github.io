import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../../config';
import './Songs.css';

const SongList = ({ type }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSongs, setFilteredSongs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSongs();
  }, [type]);

  useEffect(() => {
    // Debounced search filtering
    const timeoutId = setTimeout(() => {
      const filtered = songs.filter(song => 
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.number.toString().includes(searchTerm)
      );
      setFilteredSongs(filtered);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, songs]);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }

      const data = await response.json();
      const songsData = Array.isArray(data) ? data : (data.hymns || data.keerthane || []);
      setSongs(songsData);
      setFilteredSongs(songsData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCardClick = (songNumber) => {
    navigate(`/${type === 'hymns' ? 'hymns' : 'keerthanes'}/${songNumber}`);
  };

  const handleKeyDown = (e, songNumber) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(songNumber);
    }
  };

  if (loading) {
    return (
      <div className="songs-container">
        <div className="songs-header">
          <h1>{type === 'hymns' ? 'Hymns' : 'Keerthanes'}</h1>
        </div>
        <div className="loading">Loading songs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="songs-container">
        <div className="songs-header">
          <h1>{type === 'hymns' ? 'Hymns' : 'Keerthanes'}</h1>
        </div>
        <div className="error-message">
          <p>Error: {error}</p>
          <button 
            onClick={fetchSongs}
            className="edit-button"
            style={{ marginTop: '1rem' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
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
            aria-label="Search songs"
          />
        </div>
      </div>

      <div className="songs-grid">
        {filteredSongs.map((song, index) => (
          <div
            key={song.number}
            className="song-card"
            onClick={() => handleCardClick(song.number)}
            onKeyDown={(e) => handleKeyDown(e, song.number)}
            role="button"
            tabIndex={0}
            aria-label={`Song ${song.number}: ${song.title}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="song-number">{song.number}</div>
            <div className="song-title">{song.title}</div>
          </div>
        ))}
      </div>

      {filteredSongs.length === 0 && searchTerm && (
        <div className="no-results">
          <p>No songs found matching "{searchTerm}"</p>
          <p>Try a different search term or browse all songs.</p>
        </div>
      )}

      {filteredSongs.length === 0 && !searchTerm && (
        <div className="no-results">
          <p>No songs available.</p>
        </div>
      )}
    </div>
  );
};

export default SongList; 