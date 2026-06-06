const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\abhis\\OneDrive\\Desktop\\pdfmagic';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f.includes('-'));

const skipFiles = ['merge-pdf.html', 'compress-pdf.html'];

for (const file of files) {
  if (skipFiles.includes(file)) continue;
  
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has FEATURES
  if (content.includes('<!-- FEATURES -->')) continue;

  const toolNameRaw = file.replace('.html', '');
  // capitalize
  const toolName = toolNameRaw.split('-').map(w => {
    if (w === 'pdf') return 'PDF';
    if (w === 'jpg') return 'JPG';
    if (w === 'ocr') return 'OCR';
    if (w === 'ppt') return 'PPT';
    if (w === 'html') return 'HTML';
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');

  const injectedHTML = `
    <!-- FEATURES -->
    <div class="features-grid" style="margin-top:32px;">
      <div class="feature-card">
        <div class="feature-icon-big" style="background:#fff0f2;">🔒</div>
        <h3>Secure</h3>
        <p>Your files are encrypted and deleted automatically after processing.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon-big" style="background:#f5f3ff;">⚡</div>
        <h3>Fast</h3>
        <p>Process PDFs in seconds with our optimized processing engine.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon-big" style="background:#ecfdf5;">🆓</div>
        <h3>Free</h3>
        <p>No registration, no watermarks, completely free to use.</p>
      </div>
    </div>

    <!-- HOW-TO -->
    <div class="page-content" style="padding:48px 0;">
      <h2>How to ${toolName}</h2>
      <p>1. Select or drag & drop your files into the upload area.</p>
      <p>2. Adjust any necessary settings and options.</p>
      <p>3. Click the process button to start.</p>
      <p>4. Download your new file instantly.</p>

      <h2>Why Use PDFMagic to ${toolName}?</h2>
      <p>PDFMagic provides the easiest way to process files online. Our tool works on any device — Windows, Mac, Linux, Android, or iOS. Perfect for professionals, students, and businesses looking for a reliable PDF solution.</p>

      <h2>Features of Our Tool</h2>
      <ul>
        <li>Process unlimited files efficiently</li>
        <li>Preserve original formatting and quality</li>
        <li>No file size limits (up to 100MB)</li>
        <li>SSL encrypted for ultimate security</li>
        <li>Works natively on all devices and modern browsers</li>
      </ul>
    </div>

    <!-- RELATED TOOLS -->
    <div style="margin-top:16px;">
      <h2 style="text-align:center;margin-bottom:24px;">Related PDF Tools</h2>
      <div class="related-tools-grid">
        <a href="/merge-pdf" class="related-tool">
          <div class="related-tool-icon">🔗</div>
          <h3>Merge PDF</h3>
          <p>Combine multiple PDFs into one</p>
        </a>
        <a href="/split-pdf" class="related-tool">
          <div class="related-tool-icon">✂️</div>
          <h3>Split PDF</h3>
          <p>Separate PDF pages into multiple files</p>
        </a>
        <a href="/compress-pdf" class="related-tool">
          <div class="related-tool-icon">🗜️</div>
          <h3>Compress PDF</h3>
          <p>Reduce PDF file size without quality loss</p>
        </a>
        <a href="/pdf-to-word" class="related-tool">
          <div class="related-tool-icon">📝</div>
          <h3>PDF to Word</h3>
          <p>Convert PDF to editable Word document</p>
        </a>
        <a href="/jpg-to-pdf" class="related-tool">
          <div class="related-tool-icon">🖼️</div>
          <h3>JPG to PDF</h3>
          <p>Convert images to PDF document</p>
        </a>
        <a href="/organize-pdf" class="related-tool">
          <div class="related-tool-icon">📋</div>
          <h3>Organize PDF</h3>
          <p>Rearrange, add, or remove PDF pages</p>
        </a>
      </div>
    </div>

    <!-- CTA BANNER INLINE -->
    <div style="margin-top:40px;text-align:center;padding:30px;background:#fff0f2;border-radius:var(--radius-lg);border:2px solid var(--border);">
      <h3 style="margin-bottom:10px;">Need more tools?</h3>
      <p style="color:var(--text-muted);margin-bottom:15px;">Explore our complete suite of 20+ free PDF tools — all in one place!</p>
      <a href="/" class="btn btn-primary">🔍 Browse All Tools →</a>
    </div>`;

  // We find <!-- CTA BANNER INLINE --> and replace it and everything after it up to </div>\n  </div>\n</div>\n\n<!-- MODAL -->
  // Wait, let's just replace the exact CTA Banner block I added earlier.
  
  const regex = /    <!-- CTA BANNER INLINE -->[\s\S]*?<\/div>\r?\n  <\/div>\r?\n<\/div>\r?\n\r?\n<!-- MODAL -->/;
  
  if (regex.test(content)) {
    content = content.replace(regex, injectedHTML + '\n  </div>\n</div>\n\n<!-- MODAL -->');
    fs.writeFileSync(filePath, content);
    console.log('Updated: ' + file);
  } else {
    console.log('Skipped (regex mismatch): ' + file);
  }
}
