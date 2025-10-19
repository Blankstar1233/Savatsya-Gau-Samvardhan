const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const archiveDir = path.join(ROOT, 'devops', 'archive-comments', new Date().toISOString().replace(/[:.]/g, '-'));
const exts = [
  '.js', '.ts', '.tsx', '.jsx', '.css', '.scss', '.html', '.json', '.py', '.java', '.go', '.xml', '.yaml', '.yml', 'Dockerfile'
];

function shouldProcess(file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (rel.startsWith('devops/') || rel.startsWith('.git/')) return false;
  if (rel.endsWith('.md') || rel.endsWith('.sh') || rel.endsWith('.bat')) return false;
  if (fs.lstatSync(file).isDirectory()) return false;
  const ext = path.extname(file) || path.basename(file);
  return exts.includes(ext) || exts.includes(path.basename(file));
}

function walk(dir, files=[]) {
  const items = fs.readdirSync(dir);
  for (const it of items) {
    const full = path.join(dir, it);
    try {
      const stat = fs.lstatSync(full);
      if (stat.isDirectory()) {
        if (it === 'node_modules' || it === '.git' || it === 'devops/archive-comments') continue;
        walk(full, files);
      } else {
        if (shouldProcess(full)) files.push(full);
      }
    } catch (e) { }
  }
  return files;
}

function stripComments(content, file) {
  const ext = path.extname(file) || path.basename(file);
  let out = content;
 
  out = out.replace(/\/\*[\s\S]*?\*
 
  out = out.replace(/(^|[^:]|^)\/\/.*$/gm, '');
 
  if (ext === '.py' || /Dockerfile/.test(ext) || /Dockerfile/.test(file) || ext === '.sh') {
    out = out.replace(/(^|\n)\s*#.*$/gm, '');
  }
 
  out = out.replace(//g, '');
  return out;
}

function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

(function main(){
  ensureDir(archiveDir);
  const files = walk(ROOT);
  console.log('Files to process:', files.length);
  for (const file of files) {
    const rel = path.relative(ROOT, file);
    const targetArchive = path.join(archiveDir, rel);
    ensureDir(path.dirname(targetArchive));
    fs.copyFileSync(file, targetArchive);
    const content = fs.readFileSync(file, 'utf8');
    const stripped = stripComments(content, file);
    fs.writeFileSync(file, stripped, 'utf8');
    console.log('Processed', rel);
  }
  console.log('Done. Backed up originals to', archiveDir);
})();
