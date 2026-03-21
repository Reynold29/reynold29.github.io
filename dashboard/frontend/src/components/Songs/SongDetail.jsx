import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiUrl } from '../../config';
import { FaArrowLeft, FaPlus, FaMinus, FaEdit, FaCheck, FaTimes, FaCheckCircle } from 'react-icons/fa';
import './Songs.css';

export default function SongDetail({ type }) {
  const { number, category, id } = useParams();
  const songId = id || number;
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSong, setEditedSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lang, setLang] = useState('kannada');
  const [fontSize, setFontSize] = useState(20);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const fetchUrl = type === 'worship'
          ? `${apiUrl}/api/worship/song/${category}/${id}`
          : `${apiUrl}/api/${type}`;
          
        const response = await fetch(fetchUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch song');
        const data = await response.json();
        
        let foundSong;
        if (type === 'worship') {
          foundSong = data;
        } else {
          const songList = Array.isArray(data) ? data : (type === 'hymns' ? (data.hymns || data) : (data.keerthane || data));
          foundSong = songList.find(s => s.number === parseInt(songId));
        }

        if (foundSong) {
          setSong(foundSong);
          setEditedSong(foundSong);
        } else {
          setError('Song not found');
        }
      } catch (err) {
        setError('Failed to load song. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [type, songId, category]);

  const handleEdit = () => setIsEditing(true);
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const updateUrl = type === 'worship'
        ? `${apiUrl}/api/worship/song/${category}/${id}`
        : `${apiUrl}/api/${type}/${songId}`;

      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedSong)
      });
      if (!response.ok) throw new Error('Failed to update song');
      setSong(editedSong);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update song. Please try again.');
    }
  };
  const handleCancel = () => { setEditedSong(song); setIsEditing(false); };
  const handleLang = (l) => setLang(l);
  const handleFont = (delta) => setFontSize(f => Math.max(12, Math.min(40, f + delta)));

  if (loading) return <div className="loading">Loading song...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!song) return <div className="error-message">Song not found</div>;

  // Split lyrics into stanzas
  const getLyrics = () => {
    if (type === 'worship') {
      return lang === 'english' ? (song.lyrics || '') : (song.trans_lyrics || song.lyrics || '');
    }
    return lang === 'english' ? song.lyrics : (song.kannadaLyrics || '');
  };

  const lyricsToSplit = getLyrics();
  const stanzas = lyricsToSplit.split(/\n\s*\n/);

  return (
    <div className="song-detail-dark song-detail-outer">
      <div className="song-detail-header">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <FaArrowLeft />
        </button>
        <span className="song-title">{song.title}</span>
      </div>
      {song.reviewed && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-md)' }}>
          <div className="reviewed-chip" style={{ position: 'static' }}>
            <FaCheckCircle /> Reviewed & Verified
          </div>
        </div>
      )}
      <div className="song-meta-row">
        <span className="song-number">
          {type === 'worship' ? category : (type === 'hymns' ? 'Hymn' : 'Keerthane')} {song.number || song.id}
        </span>
        <div className="lang-toggle-group">
          <button className={`lang-toggle${lang === 'english' ? ' active' : ''}`} onClick={() => handleLang('english')}>
            {type === 'worship' ? 'Original' : 'English'}
          </button>
          <button className={`lang-toggle${lang === 'kannada' ? ' active' : ''}`} onClick={() => handleLang('kannada')}>
            {type === 'worship' ? 'Translation' : 'ಕನ್ನಡ'}
          </button>
        </div>
      </div>
      {(song.signature || song.key_signature || song.bpm) && (
        <div className="song-signature">
          {song.signature || `${song.key_signature || ''} ${song.bpm ? `| ${song.bpm} BPM` : ''}`}
        </div>
      )}
      {song.author_name && <div className="song-author">By {song.author_name}</div>}
      {song.chords && (
        <div className="chords-display">
          <h3>Chords</h3>
          <pre>{song.chords}</pre>
        </div>
      )}
      {song.youtube_link && (
        <div className="youtube-link">
          <a href={song.youtube_link} target="_blank" rel="noopener noreferrer">Watch on YouTube</a>
        </div>
      )}
      <div className="font-controls">
        <button onClick={() => handleFont(-2)} className="font-btn" aria-label="Decrease font size">
          <FaMinus />
        </button>
        <span style={{ margin: '0 1rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Font</span>
        <button onClick={() => handleFont(2)} className="font-btn" aria-label="Increase font size">
          <FaPlus />
        </button>
      </div>
      <div className="lyrics-stanzas">
        {stanzas.map((stanza, idx) => (
          <div className="stanza" key={idx}>
            <div className="stanza-number">{idx + 1}.</div>
            <div className="stanza-text" style={{ fontSize: fontSize }}>
              {stanza.trim().split('\n').map((line, i) => <div key={i}>{line}</div>)}
            </div>
          </div>
        ))}
      </div>
      <div className="song-detail-actions">
        <button onClick={handleEdit} className="edit-button">
          <FaEdit style={{ marginRight: '8px' }} />
          Edit Song
        </button>
      </div>
      {isEditing && (
        <div className="edit-form">
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={editedSong.title} onChange={e => setEditedSong({ ...editedSong, title: e.target.value })} />
          </div>
          {type === 'worship' && (
            <>
              <div className="form-group">
                <label>English Title</label>
                <input type="text" value={editedSong.english_title || ''} onChange={e => setEditedSong({ ...editedSong, english_title: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Key Signature</label>
                  <input type="text" value={editedSong.key_signature || ''} onChange={e => setEditedSong({ ...editedSong, key_signature: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>BPM</label>
                  <input type="number" value={editedSong.bpm || ''} onChange={e => setEditedSong({ ...editedSong, bpm: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Author Name</label>
                <input type="text" value={editedSong.author_name || ''} onChange={e => setEditedSong({ ...editedSong, author_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>YouTube Link</label>
                <input type="text" value={editedSong.youtube_link || ''} onChange={e => setEditedSong({ ...editedSong, youtube_link: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Chords</label>
                <textarea value={editedSong.chords || ''} onChange={e => setEditedSong({ ...editedSong, chords: e.target.value })} rows="4" />
              </div>
            </>
          )}
          {type !== 'worship' && (
            <div className="form-group">
              <label>Signature</label>
              <input type="text" value={editedSong.signature} onChange={e => setEditedSong({ ...editedSong, signature: e.target.value })} />
            </div>
          )}
          <div className="form-group">
            <label>{type === 'worship' ? 'Lyrics (Original)' : 'English Lyrics'}</label>
            <textarea value={editedSong.lyrics} onChange={e => setEditedSong({ ...editedSong, lyrics: e.target.value })} rows="8" />
          </div>
          <div className="form-group">
            <label>{type === 'worship' ? 'Translated Lyrics' : 'Kannada Lyrics'}</label>
            <textarea 
              value={type === 'worship' ? (editedSong.trans_lyrics || '') : (editedSong.kannadaLyrics || '')} 
              onChange={e => setEditedSong(type === 'worship' ? { ...editedSong, trans_lyrics: e.target.value } : { ...editedSong, kannadaLyrics: e.target.value })} 
              rows="8" 
            />
          </div>
          <div className="button-group">
            <button onClick={handleSave} className="edit-button">
              <FaCheck style={{ marginRight: '8px' }} />
              Save Changes
            </button>
            <button onClick={handleCancel} className="cancel-button">
              <FaTimes style={{ marginRight: '8px' }} />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 