import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PHOTO_API_PORT || 3001;

const COOKIE_NAME = 'photo-auth';
const UNLOCKED_VALUE = 'unlocked';
const PASSWORD = process.env.PHOTO_PASSWORD || 'ineveryway';

const IMAGES_DIR = path.join(__dirname, 'images');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

app.use(express.json());
app.use(cookieParser());

app.get('/api/auth/check', (req, res) => {
  const value = req.cookies[COOKIE_NAME];
  res.json({ unlocked: value === UNLOCKED_VALUE });
});

app.post('/api/auth/unlock', (req, res) => {
  const { password } = req.body || {};
  const input = String(password ?? '').trim().toLowerCase();
  if (input === PASSWORD.toLowerCase()) {
    res.cookie(COOKIE_NAME, UNLOCKED_VALUE, cookieOptions);
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Invalid password' });
});

app.post('/api/auth/lock', (req, res) => {
  res.cookie(COOKIE_NAME, '', { ...cookieOptions, maxAge: 0, expires: new Date(0) });
  res.json({ success: true });
});

function safePath(relativePath) {
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
  if (normalized.includes('..') || path.isAbsolute(normalized)) return null;
  return normalized;
}

app.get(/^\/api\/images\/?(.*)$/, (req, res) => {
  const value = req.cookies[COOKIE_NAME];
  if (value !== UNLOCKED_VALUE) {
    return res.status(403).send('Forbidden: Photos are locked');
  }
  const relativePath = (req.path.replace(/^\/api\/images\/?/, '').split('?')[0] || '').trim();
  const safe = safePath(relativePath);
  if (!safe) return res.status(400).send('Invalid path');
  const filePath = path.join(IMAGES_DIR, safe);
  if (!filePath.startsWith(IMAGES_DIR)) return res.status(400).send('Invalid path');
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return res.status(404).send('Not found');
  }
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.sendFile(filePath);
});

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  fs.writeFileSync(path.join(IMAGES_DIR, '.gitkeep'), '');
}

app.listen(PORT, () => {
  console.log(`Photo auth API running on http://localhost:${PORT}`);
});
