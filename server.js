// Bare-bones resume backend: upload -> extract text -> keyword search -> open resume
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mammoth = require('mammoth');
const { PDFParse } = require('pdf-parse');
const fs = require('fs');
const path = require('path');


const PORT = 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const DB_FILE = path.join(__dirname, 'resumes.json'); // simple "database"
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ---- tiny JSON "database" ----
const loadDB = () => (fs.existsSync(DB_FILE) ? JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) : []);
const saveDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// ---- text extraction ----
async function extractText(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const buffer = fs.readFileSync(filePath);
   if (ext === '.pdf') {
     const parser = new PDFParse({ data: buffer });
     try { return (await parser.getText()).text; }
     finally { await parser.destroy(); }
   }
  if (ext === '.docx') return (await mammoth.extractRawText({ buffer })).value;
  throw new Error('Only PDF and DOCX supported');
}

const upload = multer({ dest: UPLOAD_DIR });
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// 1) Upload one or many resumes
app.post('/api/resumes', upload.array('files'), async (req, res) => {
  const db = loadDB();
  const added = [];
  for (const f of req.files || []) {
    try {
      const text = await extractText(f.path, f.originalname);
      const record = {
        id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        filename: f.originalname,
        storedName: f.filename,
        ext: path.extname(f.originalname).toLowerCase(),
        text,
        uploadedAt: new Date().toISOString(),
      };
      db.push(record);
      added.push({ id: record.id, filename: record.filename });
    } catch (err) {
      fs.unlinkSync(f.path);
      added.push({ filename: f.originalname, error: err.message });
    }
  }
  saveDB(db);
  res.json({ added });
});

// 2) List all resumes
app.get('/api/resumes', (req, res) => {
  res.json(loadDB().map(({ text, storedName, ...rest }) => rest));
});

// 3) Search. Default: every word must appear. mode=any: any word counts (used by Matching)
app.get('/api/search', (req, res) => {
  const words = [...new Set((req.query.q || '').toLowerCase().split(/\s+/).filter(Boolean))];
  if (!words.length) return res.json([]);
  const any = req.query.mode === 'any';
  const results = [];
  for (const r of loadDB()) {
    const lower = r.text.toLowerCase();
    const matched = words.filter((w) => lower.includes(w));
    if (any ? matched.length === 0 : matched.length !== words.length) continue;
    const idx = lower.indexOf(matched[0]);
    const snippet = r.text.slice(Math.max(0, idx - 60), idx + 140).replace(/\s+/g, ' ');
    const score = matched.reduce((n, w) => n + lower.split(w).length - 1, 0);
    results.push({ id: r.id, filename: r.filename, ext: r.ext, snippet, score, matched: matched.length, total: words.length });
  }
  results.sort((a, b) => b.matched - a.matched || b.score - a.score);
  res.json(results);
});

// 4) Get one resume's text (used for the popup)
app.get('/api/resumes/:id/text', (req, res) => {
  const r = loadDB().find((x) => x.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  res.json({ filename: r.filename, text: r.text });
});

// 5) Open the original file (PDFs display in the browser)
app.get('/api/resumes/:id/file', (req, res) => {
  const r = loadDB().find((x) => x.id === req.params.id);
  if (!r) return res.status(404).end();
  res.type(r.ext === '.pdf' ? 'application/pdf' : 'application/octet-stream');
  res.sendFile(path.join(UPLOAD_DIR, r.storedName));
});

app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));
