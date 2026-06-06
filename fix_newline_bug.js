const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\abhis\\OneDrive\\Desktop\\pdfmagic';
const allFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

for (const file of allFiles) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Look for the literal string '\n' and replace it with a real newline
  if (content.includes('\\n')) {
    content = content.replace(/\\n/g, '\n');
    fs.writeFileSync(filePath, content);
    console.log('Fixed literal \\n in: ' + file);
  }
}
