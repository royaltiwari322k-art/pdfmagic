const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\abhis\\OneDrive\\Desktop\\pdfmagic';

const newFormatTools = [
  'add-watermark.html', 'compare-pdf.html', 'edit-pdf.html', 'excel-to-pdf.html',
  'extract-pages.html', 'html-to-pdf.html', 'ocr-pdf.html', 'organize-pdf.html',
  'page-numbers.html', 'ppt-to-pdf.html', 'protect-pdf.html', 'redact-pdf.html',
  'remove-pages.html', 'repair-pdf.html', 'rotate-pdf.html', 'sign-pdf.html',
  'unlock-pdf.html', 'word-to-pdf.html'
];

for (const file of newFormatTools) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add Inline Panel
  content = content.replace(
    /        <\/div>\r?\n      <\/div>\r?\n    <\/div>\r?\n    \r?\n    <!-- CTA BANNER INLINE -->/,
    `        </div>
      </div>

      <!-- INLINE RESULT PREVIEW PANEL -->
      <div class="file-preview-panel" id="finalResultPanel" style="display:none;">
        <div class="file-preview-header" style="background:#ecfdf5;border-color:#10b981;">
          <h4 style="color:#059669;">✅ Conversion Complete!</h4>
        </div>
        <div style="padding:16px;">
          <iframe id="pdfPreviewIframe" style="width:100%;height:450px;border:2px solid var(--border);border-radius:var(--radius);margin-bottom:16px;" src=""></iframe>
          <div style="display:flex;gap:12px;">
            <button class="btn btn-primary" id="finalDownloadBtn" style="flex:1;">⬇️ Download PDF</button>
            <button class="btn btn-white" id="finalStartAgainBtn" style="flex:1;">🔄 Start Again</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- CTA BANNER INLINE -->`
  );

  // 2. Remove resultArea from Modal
  content = content.replace(
    /    <p id="modalText" style="text-align:center;color:var\(--text-muted\);">Please wait while we process your file\.<\/p>\r?\n    <div id="resultArea" style="display:none;">[\s\S]*?<\/div>\r?\n  <\/div>/,
    `    <p id="modalText" style="text-align:center;color:var(--text-muted);">Please wait while we process your file.</p>\n  </div>`
  );

  // 3. JS Variables
  content = content.replace(
    /  const resultArea = document\.getElementById\('resultArea'\);\r?\n  const downloadBtn = document\.getElementById\('downloadBtn'\);\r?\n  const newFileBtn = document\.getElementById\('newFileBtn'\);\r?\n  const previewPanel = document\.getElementById\('previewPanel'\);/,
    `  const previewPanel = document.getElementById('previewPanel');\n  const finalResultPanel = document.getElementById('finalResultPanel');\n  const pdfPreviewIframe = document.getElementById('pdfPreviewIframe');\n  const finalDownloadBtn = document.getElementById('finalDownloadBtn');\n  const finalStartAgainBtn = document.getElementById('finalStartAgainBtn');`
  );

  // 4. changeFile / renderPreview
  content = content.replace(
    /  function changeFile\(\) {\r?\n    selectedFile = null;\r?\n    fileInput\.value = '';\r?\n    previewPanel\.style\.display = 'none';\r?\n    uploadArea\.style\.display = 'block';\r?\n  }/,
    `  function changeFile() {\n    selectedFile = null;\n    fileInput.value = '';\n    previewPanel.style.display = 'none';\n    finalResultPanel.style.display = 'none';\n    uploadArea.style.display = 'block';\n  }`
  );
  content = content.replace(
    /  function renderPreview\(\) {\r?\n    if \(selectedFiles\.length === 0\) {/,
    `  function renderPreview() {\n    finalResultPanel.style.display = 'none';\n    if (selectedFiles.length === 0) {`
  );

  // 5. setTimeout success block
  content = content.replace(
    /      setTimeout\(\(\) => {\r?\n        document\.getElementById\('modalTitle'\)\.textContent = 'Complete! 🎉';\r?\n        document\.getElementById\('modalText'\)\.style\.display = 'none';\r?\n        resultArea\.style\.display = 'block';\r?\n        downloadBtn\.onclick = \(\) => {\r?\n          const a = document\.createElement\('a'\);\r?\n          a\.href = url;\r?\n          a\.download = 'result\.pdf';\r?\n          a\.click\(\);\r?\n        };\r?\n      }, 500\);/,
    `      setTimeout(() => {
        modal.classList.remove('active');
        previewPanel.style.display = 'none';
        finalResultPanel.style.display = 'block';
        pdfPreviewIframe.src = url;
        
        finalDownloadBtn.onclick = () => {
          const a = document.createElement('a');
          a.href = url;
          a.download = 'converted.pdf';
          a.click();
        };
      }, 500);`
  );

  // 6. newFileBtn onclick
  content = content.replace(
    /  newFileBtn\.onclick = \(\) => {\r?\n    modal\.classList\.remove\('active'\);\r?\n    changeFile\(\);\r?\n  };/,
    `  finalStartAgainBtn.onclick = () => {\n    changeFile();\n  };`
  );
  content = content.replace(
    /  newFileBtn\.onclick = \(\) => {\r?\n    modal\.classList\.remove\('active'\);\r?\n    clearAllFiles\(\);\r?\n  };/,
    `  finalStartAgainBtn.onclick = () => {\n    clearAllFiles();\n  };`
  );

  fs.writeFileSync(filePath, content);
  console.log('Updated: ' + file);
}
