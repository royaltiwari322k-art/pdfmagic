const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\abhis\\OneDrive\\Desktop\\pdfmagic';

// Gather all html files in root
const allFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

// Also get html files in views/blog
const blogDir = path.join(dir, 'views', 'blog');
let blogFiles = [];
if (fs.existsSync(blogDir)) {
  blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.html')).map(f => path.join('views', 'blog', f));
}

const allHtmlFiles = [...allFiles, ...blogFiles];

const navBrandRegex = /<a class="nav-brand" href="\/">\s*<div class="nav-brand-icon">📄<\/div>\s*PDF<span>Magic<\/span>\s*<\/a>/;
const navBrandNew = `<a class="nav-brand" href="/">
      <img src="/logo.png" alt="PDFMagic Logo" style="height: 36px; width: auto;">
    </a>`;

const footerBrandRegex = /<h3>📄 PDF<span>Magic<\/span><\/h3>/;
const footerBrandNew = `<img src="/logo.png" alt="PDFMagic Logo" style="height: 40px; width: auto; margin-bottom: 12px;">`;

for (const relativeFile of allHtmlFiles) {
  const filePath = path.join(dir, relativeFile);
  let content = fs.readFileSync(filePath, 'utf8');

  let updated = false;

  if (navBrandRegex.test(content)) {
    content = content.replace(navBrandRegex, navBrandNew);
    updated = true;
  }

  if (footerBrandRegex.test(content)) {
    content = content.replace(footerBrandRegex, footerBrandNew);
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log('Updated logo in: ' + relativeFile);
  }
}
