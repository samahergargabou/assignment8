import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;


// Hard-coded mock dataset
const COURSES = [
  { id: 'CS101', title: 'Foundations of Computer Systems', credits: 6 },
  { id: 'CS204', title: 'Data Structures and Algorithms', credits: 7 },
  { id: 'CS310', title: 'Cloud Systems and Web Architecture', credits: 6 }
];


let requestCount = 0;

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});


app.use((req, res, next) => {
  requestCount += 1;
  next();
});


app.use(express.static(path.join(__dirname, 'public')));

// Basic Routes
app.get('/hello', (req, res) => {
  res.type('text/plain').send("Hello from Samaher's server");
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow: /api/admin\nAllow: /');
});

app.get('/old-page', (req, res) => {
  res.redirect(302, '/hello');
});

// API Endpoints
app.get('/api/courses', (req, res) => {
  res.json(COURSES);
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime())
  });
});

app.get('/api/headers', (req, res) => {
  res.json({
    'user-agent': req.get('user-agent') || 'Unknown',
    'accept': req.get('accept') || '*/*'
  });
});

app.post('/api/subscribe', (req, res) => {
  res.status(201).json({ subscribed: true });
});

app.get('/api/admin', (req, res) => {
  res.status(403).json({ error: 'Forbidden' });
});

app.get('/api/stats', (req, res) => {
  res.json({ requestsServed: requestCount });
});


app.listen(PORT, () => {
  console.log(`Server actively listening at: http://localhost:${PORT}`);
});