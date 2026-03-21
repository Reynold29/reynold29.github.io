import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../../config';
import { FaCheckCircle, FaFilter, FaTimesCircle } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import './Songs.css';

const SongList = ({ type }) => {
  const { category } = useParams();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [filterReviewed, setFilterReviewed] = useState(false);
  const [filterNotReviewed, setFilterNotReviewed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSongs();
  }, [type, category]);

  useEffect(() => {
    // Debounced search filtering
    const timeoutId = setTimeout(() => {
      const filtered = songs.filter(song => {
        const songId = song.number || song.id || '';
        const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            songId.toString().includes(searchTerm);
        
        if (!filterReviewed && !filterNotReviewed) return matchesSearch;
        
        const isReviewed = song.reviewed === true;
        if (filterReviewed && filterNotReviewed) return matchesSearch;
        if (filterReviewed) return matchesSearch && isReviewed;
        if (filterNotReviewed) return matchesSearch && !isReviewed;
        
        return matchesSearch;
      });
      setFilteredSongs(filtered);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, songs, filterReviewed, filterNotReviewed]);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const fetchUrl = type === 'worship' 
        ? `${apiUrl}/api/worship/songs/${category}`
        : `${apiUrl}/api/${type}`;
        
      const response = await fetch(fetchUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch songs (${response.status})`);
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

  const handleCardClick = (songId) => {
    if (type === 'worship') {
      navigate(`/worship/${category}/${songId}`);
    } else {
      navigate(`/${type === 'hymns' ? 'hymns' : 'keerthanes'}/${songId}`);
    }
  };

  const handleKeyDown = (e, songId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(songId);
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
        <h1>{type === 'worship' ? category.charAt(0).toUpperCase() + category.slice(1) : (type === 'hymns' ? 'Hymns' : 'Keerthanes')}</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by title or number..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <button 
            className={`filter-btn reviewed ${filterReviewed ? 'active' : ''}`}
            onClick={() => setFilterReviewed(!filterReviewed)}
          >
            <FaCheckCircle /> Reviewed
          </button>
          <button 
            className={`filter-btn not-reviewed ${filterNotReviewed ? 'active' : ''}`}
            onClick={() => setFilterNotReviewed(!filterNotReviewed)}
          >
            <FaTimesCircle /> Non-Reviewed
          </button>
        </div>
      </div>

      <div className="songs-grid">
        {filteredSongs.map((song, index) => {
          const songId = song.number || song.id;
          return (
            <div
              key={songId}
              className="song-card"
              onClick={() => handleCardClick(songId)}
              onKeyDown={(e) => handleKeyDown(e, songId)}
              role="button"
              tabIndex={0}
              aria-label={`Song ${songId}: ${song.title}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {song.reviewed && (
                <div className="reviewed-chip">
                  <FaCheckCircle /> Reviewed
                </div>
              )}
              <div className="song-number">{songId}</div>
              <div className="song-title">{song.title}</div>
            </div>
          );
        })}
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