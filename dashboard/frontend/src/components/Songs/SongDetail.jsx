import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiUrl } from '../../config';
import './Songs.css';

export default function SongDetail({ type }) {
  const { number } = useParams();
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
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/api/${type}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch song');
        const data = await response.json();
        const songList = Array.isArray(data) ? data : (type === 'hymns' ? (data.hymns || data) : (data.keerthane || data));
        const foundSong = songList.find(s => s.number === parseInt(number));
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
  }, [type, number]);

  const handleEdit = () => setIsEditing(true);
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/${type}/${number}`, {
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
  const handleFont = (delta) => setFontSize(f => Math.max(14, Math.min(36, f + delta)));

  if (loading) return <div className="loading">Loading song...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!song) return <div className="error-message">Song not found</div>;

  // Split lyrics into stanzas
  const stanzas = (lang === 'english' ? song.lyrics : song.kannadaLyrics || '').split(/\n\s*\n/);

  return (
    <div className="song-detail-dark" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'center' }}>
      <div className="song-detail-header" style={{ justifyContent: 'center', width: '100%' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>&larr;</button>
        <span className="song-title" style={{ textAlign: 'center', width: '100%' }}>{song.title}</span>
      </div>
      <div className="song-meta-row" style={{ justifyContent: 'center', width: '100%' }}>
        <span className="song-number">{type === 'hymns' ? 'Hymn' : 'Keerthane'} {song.number}</span>
        <div className="lang-toggle-group">
          <button className={`lang-toggle${lang === 'english' ? ' active' : ''}`} onClick={() => handleLang('english')}>English</button>
          <button className={`lang-toggle${lang === 'kannada' ? ' active' : ''}`} onClick={() => handleLang('kannada')}>ಕನ್ನಡ</button>
        </div>
      </div>
      <div className="song-signature">{song.signature}</div>
      <div className="font-controls">
        <button onClick={() => handleFont(-2)} className="font-btn">-</button>
        <span>Font</span>
        <button onClick={() => handleFont(2)} className="font-btn">+</button>
      </div>
      <div className="lyrics-stanzas" style={{ fontSize: fontSize, width: '100%', maxWidth: 600 }}>
        {stanzas.map((stanza, idx) => (
          <div className="stanza" key={idx} style={{ flexDirection: 'column', alignItems: 'center', display: 'flex' }}>
            <div className="stanza-number" style={{ marginBottom: 4}}>{idx + 1}.</div>
            <div className="stanza-text">
              {stanza.trim().split('\n').map((line, i) => <div key={i}>{line}</div>)}
            </div>
          </div>
        ))}
      </div>
      <div className="song-detail-actions">
        <button onClick={handleEdit} className="edit-button">Edit Song</button>
      </div>
      {isEditing && (
        <div className="edit-form">
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={editedSong.title} onChange={e => setEditedSong({ ...editedSong, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Signature</label>
            <input type="text" value={editedSong.signature} onChange={e => setEditedSong({ ...editedSong, signature: e.target.value })} />
          </div>
          <div className="form-group">
            <label>English Lyrics</label>
            <textarea value={editedSong.lyrics} onChange={e => setEditedSong({ ...editedSong, lyrics: e.target.value })} rows="8" />
          </div>
          <div className="form-group">
            <label>Kannada Lyrics</label>
            <textarea value={editedSong.kannadaLyrics} onChange={e => setEditedSong({ ...editedSong, kannadaLyrics: e.target.value })} rows="8" />
          </div>
          <div className="button-group">
            <button onClick={handleSave} className="edit-button">Save Changes</button>
            <button onClick={handleCancel} className="cancel-button">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
} 