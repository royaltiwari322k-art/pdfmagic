const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\abhis\\OneDrive\\Desktop\\pdfmagic';
const domain = 'https://www.wwwpdfmagic.live';

const allFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

for (const file of allFiles) {
  if (file === 'index.html' || file.startsWith('google')) continue;
  const urlPath = file.replace('.html', '');
  
  let priority = '0.9';
  if (urlPath === 'about' || urlPath === 'contact' || urlPath === 'privacy' || urlPath === 'terms' || urlPath === 'pricing') {
    priority = '0.5';
  }

  sitemap += `
  <url>
    <loc>${domain}/${urlPath}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

sitemap += `\n</urlset>`;

fs.writeFileSync(path.join(dir, 'sitemap.xml'), sitemap);
console.log('sitemap.xml generated.');

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${domain}/sitemap.xml
`;

fs.writeFileSync(path.join(dir, 'robots.txt'), robotsTxt);
console.log('robots.txt generated.');
