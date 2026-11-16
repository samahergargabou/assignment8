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

app.listen(PORT, () => {
  console.log(`Server actively listening at: http://localhost:${PORT}`);
});