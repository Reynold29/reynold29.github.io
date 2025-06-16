import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { Octokit } from '@octokit/rest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Enhanced user management
const users = [
  {
    username: 'admin',
    password: 'secret',  // Plain text for now
    role: 'admin'
  },
  {
    username: 'reynold',
    password: 'password123',  // Plain text for now
    role: 'user'
  }
];

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
    if (Array.isArray(data)) data = { hymns: data };
    res.json(data);
  } catch (error) {
    console.error('Error fetching hymns:', error);
    // Fallback to local file if GitHub fetch fails
    try {
      let localData = JSON.parse(fs.readFileSync(hymnsFile, 'utf8'));
      if (Array.isArray(localData)) localData = { hymns: localData };
      res.json(localData);
    } catch (localError) {
      res.status(500).json({ error: 'Failed to fetch hymns' });
    }
  }
});

app.get('/api/keerthane', authMiddleware, async (req, res) => {
  try {
    let data = await fetchFromGitHub(KEERTHANE_PATH);
    if (Array.isArray(data)) data = { keerthane: data };
    res.json(data);
  } catch (error) {
    console.error('Error fetching keerthane:', error);
    // Fallback to local file if GitHub fetch fails
    try {
      let localData = JSON.parse(fs.readFileSync(keerthaneFile, 'utf8'));
      if (Array.isArray(localData)) localData = { keerthane: localData };
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

    // Update the hymn
    const hymnIndex = data.hymns.findIndex(h => h.number === parseInt(number));
    if (hymnIndex === -1) {
      return res.status(404).json({ error: 'Hymn not found' });
    }

    data.hymns[hymnIndex] = { ...data.hymns[hymnIndex], ...updates };

    // Update on GitHub
    await updateOnGitHub(HYMNS_PATH, data, user);

    // Log the edit
    logEdit(user, number, updates.title || data.hymns[hymnIndex].title, 'hymn');

    res.json(data.hymns[hymnIndex]);
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

    // Update the keerthane
    const keerthaneIndex = data.keerthane.findIndex(k => k.number === parseInt(number));
    if (keerthaneIndex === -1) {
      return res.status(404).json({ error: 'Keerthane not found' });
    }

    data.keerthane[keerthaneIndex] = { ...data.keerthane[keerthaneIndex], ...updates };

    // Update on GitHub
    await updateOnGitHub(KEERTHANE_PATH, data, user);

    // Log the edit
    logEdit(user, number, updates.title || data.keerthane[keerthaneIndex].title, 'keerthane');

    res.json(data.keerthane[keerthaneIndex]);
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