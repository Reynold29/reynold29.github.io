import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { Octokit } from '@octokit/rest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();

// Configure CORS for both development and production
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // Alternative dev port
  'https://reyziecrafts.netlify.app', // Replace with your actual Netlify URL
  // 'https://your-custom-domain.com' // Replace with your custom domain
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Enhanced user management
let users = [];
try {
  if (process.env.USERS_JSON) {
    users = JSON.parse(process.env.USERS_JSON);
  } else {
    console.error('USERS_JSON not set in .env. No users loaded.');
  }
} catch (e) {
  console.error('Failed to parse USERS_JSON from .env:', e);
  users = [];
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

let activeSessions = {};
const hymnsFile = './hymns_data.json';
const keerthaneFile = './keerthane_data.json';
const logFile = './edit_logs.json';

// GitHub configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // You'll need to set this
const GITHUB_OWNER = 'Reynold29';
const GITHUB_REPO = 'csi-hymns-vault';
const HYMNS_PATH = 'hymns_data.json';
const KEERTHANE_PATH = 'keerthane_data.json';

const octokit = new Octokit({
  auth: GITHUB_TOKEN
});

// Function to fetch file content from GitHub
async function fetchFromGitHub(path) {
  try {
    const response = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: path
    });
    
    const content = Buffer.from(response.data.content, 'base64').toString();
    return JSON.parse(content);
  } catch (error) {
    console.error('Error fetching from GitHub:', error);
    throw error;
  }
}

// Function to update file content on GitHub
async function updateOnGitHub(path, content, user) {
  try {
    // First get the current file to get its SHA
    const currentFile = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: path
    });

    const response = await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: path,
      message: `Update ${path} by ${user}`,
      content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
      sha: currentFile.data.sha
    });

    return response.data;
  } catch (error) {
    console.error('Error updating GitHub:', error);
    throw error;
  }
}

// Initialize data files if they don't exist
function initializeDataFiles() {
  const defaultHymns = {
    hymns: [
      {
        number: 1,
        title: "Holy, Holy, Holy",
        lyrics: "Holy, holy, holy! Lord God Almighty!\nEarly in the morning our song shall rise to thee.",
        language: "English"
      },
      {
        number: 2,
        title: "Amazing Grace",
        lyrics: "Amazing grace! How sweet the sound\nThat saved a wretch like me!",
        language: "English"
      }
    ]
  };

  const defaultKeerthane = {
    keerthane: [
      {
        number: 1,
        title: "Nama Yesu",
        lyrics: "Nama Yesu, Nama Yesu\nNama Yesu, Nama Yesu",
        language: "Malayalam"
      },
      {
        number: 2,
        title: "Yesu Nama",
        lyrics: "Yesu Nama, Yesu Nama\nYesu Nama, Yesu Nama",
        language: "Malayalam"
      }
    ]
  };

  if (!fs.existsSync(hymnsFile)) {
    fs.writeFileSync(hymnsFile, JSON.stringify(defaultHymns, null, 2));
  }

  if (!fs.existsSync(keerthaneFile)) {
    fs.writeFileSync(keerthaneFile, JSON.stringify(defaultKeerthane, null, 2));
  }
}

// Initialize data files on server start
initializeDataFiles();

// Enhanced login endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password (plain text comparison for now)
    if (password !== user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        username: user.username,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      JWT_SECRET
    );

    // Sync local data files with latest from GitHub
    try {
      const [latestHymns, latestKeerthane] = await Promise.all([
        fetchFromGitHub(HYMNS_PATH),
        fetchFromGitHub(KEERTHANE_PATH)
      ]);
      fs.writeFileSync(hymnsFile, JSON.stringify(latestHymns, null, 2));
      fs.writeFileSync(keerthaneFile, JSON.stringify(latestKeerthane, null, 2));
    } catch (syncError) {
      console.error('Error syncing data from GitHub on login:', syncError);
      // Optionally, you can return an error here or just log it and proceed
    }

    res.json({ 
      token,
      user: {
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enhanced auth middleware
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Handle both "Bearer token" and just "token" formats
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(403).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Verify token endpoint
app.get('/verify-token', authMiddleware, (req, res) => {
  try {
    res.json({ 
      valid: true,
      user: {
        username: req.user.username,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enhanced data fetching endpoints
app.get('/api/hymns', authMiddleware, async (req, res) => {
  try {
    let data = await fetchFromGitHub(HYMNS_PATH);
    // Defensive: ensure data is always an array
    if (Array.isArray(data)) {
      // ok
    } else if (data && Array.isArray(data.hymns)) {
      data = data.hymns;
    } else {
      data = [];
    }
    // Write the latest data to the local file for sync (as array)
    fs.writeFileSync(hymnsFile, JSON.stringify(data, null, 2));
    res.json(data);
  } catch (error) {
    console.error('Error fetching hymns:', error);
    // Fallback to local file if GitHub fetch fails
    try {
      let localData = JSON.parse(fs.readFileSync(hymnsFile, 'utf8'));
      if (!Array.isArray(localData)) {
        if (localData && Array.isArray(localData.hymns)) {
          localData = localData.hymns;
        } else {
          localData = [];
        }
      }
      res.json(localData);
    } catch (localError) {
      res.status(500).json({ error: 'Failed to fetch hymns' });
    }
  }
});

app.get('/api/keerthane', authMiddleware, async (req, res) => {
  try {
    let data = await fetchFromGitHub(KEERTHANE_PATH);
    if (Array.isArray(data)) {
      // ok
    } else if (data && Array.isArray(data.keerthane)) {
      data = data.keerthane;
    } else {
      data = [];
    }
    // Write the latest data to the local file for sync (as array)
    fs.writeFileSync(keerthaneFile, JSON.stringify(data, null, 2));
    res.json(data);
  } catch (error) {
    console.error('Error fetching keerthane:', error);
    // Fallback to local file if GitHub fetch fails
    try {
      let localData = JSON.parse(fs.readFileSync(keerthaneFile, 'utf8'));
      if (!Array.isArray(localData)) {
        if (localData && Array.isArray(localData.keerthane)) {
          localData = localData.keerthane;
        } else {
          localData = [];
        }
      }
      res.json(localData);
    } catch (localError) {
      res.status(500).json({ error: 'Failed to fetch keerthane' });
    }
  }
});

// Enhanced update endpoints with logging
app.put('/api/hymns/:number', authMiddleware, async (req, res) => {
  try {
    const { number } = req.params;
    const updates = req.body;
    const user = req.user.username;

    // Fetch current data
    let data;
    try {
      data = await fetchFromGitHub(HYMNS_PATH);
    } catch (error) {
      data = JSON.parse(fs.readFileSync(hymnsFile, 'utf8'));
    }
    // Ensure data is always an array
    if (!Array.isArray(data)) {
      if (data && Array.isArray(data.hymns)) {
        data = data.hymns;
      } else {
        data = [];
      }
    }

    // Update the hymn
    const hymnIndex = data.findIndex(h => h.number === parseInt(number));
    if (hymnIndex === -1) {
      return res.status(404).json({ error: 'Hymn not found' });
    }

    data[hymnIndex] = { ...data[hymnIndex], ...updates };

    // Update on GitHub and local file as array
    await updateOnGitHub(HYMNS_PATH, data, user);
    fs.writeFileSync(hymnsFile, JSON.stringify(data, null, 2));

    // Log the edit
    logEdit(user, number, updates.title || data[hymnIndex].title, 'hymn');

    res.json(data[hymnIndex]);
  } catch (error) {
    console.error('Error updating hymn:', error);
    res.status(500).json({ error: 'Failed to update hymn' });
  }
});

app.put('/api/keerthane/:number', authMiddleware, async (req, res) => {
  try {
    const { number } = req.params;
    const updates = req.body;
    const user = req.user.username;

    // Fetch current data
    let data;
    try {
      data = await fetchFromGitHub(KEERTHANE_PATH);
    } catch (error) {
      data = JSON.parse(fs.readFileSync(keerthaneFile, 'utf8'));
    }
    // Ensure data is always an array
    if (!Array.isArray(data)) {
      if (data && Array.isArray(data.keerthane)) {
        data = data.keerthane;
      } else {
        data = [];
      }
    }

    // Update the keerthane
    const keerthaneIndex = data.findIndex(k => k.number === parseInt(number));
    if (keerthaneIndex === -1) {
      return res.status(404).json({ error: 'Keerthane not found' });
    }

    data[keerthaneIndex] = { ...data[keerthaneIndex], ...updates };

    // Update on GitHub and local file as array
    await updateOnGitHub(KEERTHANE_PATH, data, user);
    fs.writeFileSync(keerthaneFile, JSON.stringify(data, null, 2));

    // Log the edit
    logEdit(user, number, updates.title || data[keerthaneIndex].title, 'keerthane');

    res.json(data[keerthaneIndex]);
  } catch (error) {
    console.error('Error updating keerthane:', error);
    res.status(500).json({ error: 'Failed to update keerthane' });
  }
});

// Enhanced logging function
function logEdit(user, number, title, type) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    user,
    number,
    title,
    type
  };

  let logs = [];
  try {
    if (fs.existsSync(logFile)) {
      logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
    }
  } catch (error) {
    console.error('Error reading log file:', error);
  }

  logs.unshift(logEntry);
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

app.get('/api/logs', authMiddleware, (req, res) => {
    const logs = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, 'utf-8')) : [];
    res.json(logs);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(5001, () => console.log('Server running on http://localhost:5001'));