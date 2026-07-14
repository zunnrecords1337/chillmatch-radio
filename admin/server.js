const express = require('express');
const multer = require('multer');
const net = require('net');
const fs = require('fs');
const path = require('path');

const app = express();
const MUSIC_DIR = '/var/www/radio/music';
const ADMIN_PASSWORD = 'kiruxA2212';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Auth middleware
app.use((req, res, next) => {
  if (req.path === '/login' || req.path === '/login.html') return next();
  const auth = req.headers['x-admin-password'];
  if (auth !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
  next();
});

// Liquidsoap telnet command
function liqCommand(cmd) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let data = '';
    client.connect(1234, 'localhost', () => client.write(cmd + '\n'));
    client.on('data', chunk => { data += chunk.toString(); if (data.includes('END')) { client.destroy(); resolve(data); } });
    client.on('error', reject);
    setTimeout(() => { client.destroy(); resolve(data); }, 3000);
  });
}

// File upload
const storage = multer.diskStorage({
  destination: MUSIC_DIR,
  filename: (req, file, cb) => cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8'))
});
const upload = multer({ storage, fileFilter: (req, file, cb) => cb(null, file.mimetype.includes('audio') || file.originalname.match(/\.(mp3|flac|ogg|wav)$/i)) });

// Routes
app.get('/api/tracks', (req, res) => {
  const files = fs.readdirSync(MUSIC_DIR).filter(f => f.match(/\.(mp3|flac|ogg|wav)$/i)).sort();
  res.json(files);
});

app.post('/api/upload', upload.array('files'), (req, res) => {
  liqCommand('playlist.reload').catch(() => {});
  res.json({ uploaded: req.files.map(f => f.filename) });
});

app.post('/api/skip', async (req, res) => {
  await liqCommand('playlist.skip');
  res.json({ ok: true });
});

app.post('/api/play', async (req, res) => {
  const { track } = req.body;
  const fullPath = path.join(MUSIC_DIR, track);
  if (!fs.existsSync(fullPath)) return res.status(404).json({ error: 'Not found' });
  await liqCommand(`playlist.push ${fullPath}`);
  await liqCommand('playlist.skip');
  res.json({ ok: true });
});

app.delete('/api/tracks/:name', (req, res) => {
  const file = path.join(MUSIC_DIR, decodeURIComponent(req.params.name));
  if (fs.existsSync(file)) fs.unlinkSync(file);
  res.json({ ok: true });
});

app.get('/api/status', async (req, res) => {
  try {
    const data = await liqCommand('playlist.remaining');
    res.json({ remaining: data.trim() });
  } catch {
    res.json({ remaining: 'unknown' });
  }
});

app.listen(3000, () => console.log('Admin panel running on :3000'));
