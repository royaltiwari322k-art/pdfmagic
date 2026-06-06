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

for (const relativeFile of allHtmlFiles) {
  const filePath = path.join(dir, relativeFile);
  let content = fs.readFileSync(filePath, 'utf8');

  let updated = false;

  // Replace Navbar logo height
  if (content.includes('style="height: 36px; width: auto;"')) {
    content = content.replace(/style="height: 36px; width: auto;"/g, 'style="height: 50px; width: auto;"');
    updated = true;
  }

  // Replace Footer logo height
  if (content.includes('style="height: 40px; width: auto; margin-bottom: 12px;"')) {
    content = content.replace(/style="height: 40px; width: auto; margin-bottom: 12px;"/g, 'style="height: 60px; width: auto; margin-bottom: 16px;"');
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log('Increased logo size in: ' + relativeFile);
  }
}
