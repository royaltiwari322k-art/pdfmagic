// PDF Processing Tool Interface - AUTO PROCESS VERSION
class PDFProcessor {
  constructor() {
    this.apiBase = window.location.origin;
    this.currentModal = null;
    this.currentToolUrl = null;
    this.selectedFiles = [];
    this.initToolHandlers();
  }

  initToolHandlers() {
    // Tool cards now use direct navigation to individual pages
    // Commented out modal functionality to allow normal link behavior
    /*
    document.querySelectorAll('.tool-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const toolUrl = card.getAttribute('href');
        const toolName = card.querySelector('h3').textContent;
        const toolDesc = card.querySelector('p').textContent;
        this.openToolModal(toolUrl, toolName, toolDesc);
      });
    });
    */
  }

  openToolModal(toolUrl, toolName, toolDesc) {
    this.currentToolUrl = toolUrl;
    this.selectedFiles = [];
    
    const existing = document.querySelector('.pdf-tool-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.className = 'pdf-tool-modal';
    modal.id = 'pdfToolModal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="window.pdfProcessor.closeModal()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>${toolName}</h2>
          <button class="close-btn" onclick="window.pdfProcessor.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          <p class="tool-desc">${toolDesc}</p>
          
          <!-- Upload Area -->
          <div class="upload-area" id="uploadArea">
            <div class="upload-icon">📁</div>
            <h3>Drop files here or click to browse</h3>
            <p id="supportedFormats">Loading...</p>
            <input type="file" id="fileInput" multiple style="display: none;">
            <button class="browse-btn" id="browseBtn">Choose Files</button>
            <div class="file-list" id="fileList"></div>
          </div>
          
          <!-- Options (hidden initially) -->
          <div class="options-area" id="optionsArea" style="display: none;">
            <h4>Options</h4>
            <div id="toolOptions"></div>
          </div>
          
          <!-- Progress (shows after upload) -->
          <div class="progress-area" id="progressArea" style="display: none;">
            <div class="progress-bar">
              <div class="progress-fill" id="progressFill"></div>
            </div>
            <p id="progressText">Starting...</p>
          </div>
          
          <!-- Result (shows after processing) -->
          <div class="result-area" id="resultArea" style="display: none;">
            <h4>✅ Complete!</h4>
            <p id="resultInfo"></p>
            <button class="download-btn" id="downloadBtn">📥 Download</button>
            <button class="new-file-btn" id="newFileBtn">🔄 New File</button>
          </div>
        </div>
      </div>
    `;

    this.addStyles();
    document.body.appendChild(modal);
    this.currentModal = modal;
    this.initUpload(toolUrl);
  }

  addStyles() {
    const existing = document.getElementById('pdf-tool-styles');
    if (existing) existing.remove();
    
    const style = document.createElement('style');
    style.id = 'pdf-tool-styles';
    style.textContent = `
      .pdf-tool-modal {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      .modal-overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.7);
        backdrop-filter: blur(4px);
      }
      .modal-content {
        position: relative;
        background: white;
        border-radius: 16px;
        width: 90%;
        max-width: 600px;
        max-height: 85vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        animation: modalSlideIn 0.3s ease;
      }
      @keyframes modalSlideIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        border-bottom: 1px solid #e5e7eb;
      }
      .modal-header h2 {
        margin: 0;
        color: #1a1a2e;
        font-size: 1.5rem;
        font-weight: 700;
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 2rem;
        color: #6b7280;
        cursor: pointer;
        width: 32px; height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
      }
      .close-btn:hover { background: #f7f8fc; color: #e8273c; }
      .modal-body { padding: 24px; }
      .tool-desc { color: #6b7280; margin-bottom: 20px; }
      
      .upload-area {
        border: 2px dashed #e5e7eb;
        border-radius: 12px;
        padding: 40px 20px;
        text-align: center;
        transition: all 0.3s;
        cursor: pointer;
      }
      .upload-area:hover { border-color: #e8273c; background: #fff0f2; }
      .upload-area.dragover { border-color: #e8273c; background: #fff0f2; transform: scale(1.02); }
      .upload-area.processing { border-color: #0891b2; background: #ecfeff; pointer-events: none; }
      .upload-icon { font-size: 3rem; margin-bottom: 12px; }
      .upload-area h3 { color: #1a1a2e; margin-bottom: 8px; font-size: 1.1rem; }
      #supportedFormats { color: #6b7280; margin-bottom: 20px; font-size: 0.9rem; }
      .browse-btn {
        background: #e8273c; color: white;
        border: none; padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600; cursor: pointer;
        font-family: inherit;
      }
      .browse-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      
      .file-list { margin-top: 16px; text-align: left; }
      .file-item {
        display: flex; justify-content: space-between;
        align-items: center; padding: 10px 14px;
        background: #f7f8fc; border-radius: 8px;
        margin-bottom: 8px; border: 1px solid #e5e7eb;
      }
      .file-name { font-size: 0.9rem; color: #1a1a2e; word-break: break-all; }
      .file-size { font-size: 0.8rem; color: #6b7280; }
      
      .options-area {
        margin: 20px 0; padding: 16px;
        background: #f7f8fc; border-radius: 12px;
        border: 1px solid #e5e7eb;
      }
      .options-area h4 { margin-bottom: 12px; color: #1a1a2e; }
      .option-group { margin-bottom: 12px; }
      .option-group label { display: block; margin-bottom: 4px; color: #1a1a2e; font-weight: 500; font-size: 0.9rem; }
      .option-group input, .option-group select {
        width: 100%; padding: 8px 12px;
        border: 1px solid #e5e7eb; border-radius: 6px;
        font-family: inherit;
      }
      
      .progress-area {
        margin: 20px 0; padding: 20px;
        background: #f0f9ff; border-radius: 12px;
        border: 1px solid #bae6fd;
      }
      .progress-bar {
        width: 100%; height: 10px;
        background: #e5e7eb; border-radius: 5px;
        overflow: hidden; margin-bottom: 12px;
      }
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #e8273c, #0891b2);
        width: 0%; transition: width 0.4s ease;
        border-radius: 5px;
      }
      #progressText { color: #1a1a2e; font-weight: 600; }
      
      .result-area {
        text-align: center; padding: 24px;
        background: #ecfdf5; border-radius: 12px;
        border: 1px solid #10b981;
        margin: 20px 0;
        animation: resultIn 0.4s ease;
      }
      @keyframes resultIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      .result-area h4 { color: #059669; margin-bottom: 8px; }
      #resultInfo { color: #6b7280; margin-bottom: 16px; font-size: 0.9rem; }
      
      .download-btn {
        background: #059669; color: white;
        border: none; padding: 12px 24px;
        border-radius: 8px; font-weight: 600;
        cursor: pointer; margin-right: 8px;
      }
      .download-btn:hover { background: #047857; }
      .new-file-btn {
        background: white; color: #1a1a2e;
        border: 1px solid #e5e7eb;
        padding: 12px 24px; border-radius: 8px;
        font-weight: 600; cursor: pointer;
      }
      .new-file-btn:hover { border-color: #e8273c; color: #e8273c; }
    `;
    document.head.appendChild(style);
  }

  initUpload(toolUrl) {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const formats = document.getElementById('supportedFormats');
    
    // Set supported formats text
    const formatMap = {
      '/merge-pdf': 'PDF files', '/split-pdf': 'PDF files',
      '/compress-pdf': 'PDF files', '/pdf-to-word': 'PDF files',
      '/pdf-to-jpg': 'PDF files', '/jpg-to-pdf': 'JPG, PNG, etc.',
      '/word-to-pdf': 'DOC, DOCX', '/rotate-pdf': 'PDF files',
      '/ocr-pdf': 'PDF files', '/add-watermark': 'PDF files'
    };
    if (formats) formats.textContent = `Supports: ${formatMap[toolUrl] || 'PDF files'}`;
    
    browseBtn.onclick = (e) => { e.stopPropagation(); fileInput.click(); };
    uploadArea.onclick = (e) => {
      if (e.target !== browseBtn && !e.target.closest('.file-list')) {
        fileInput.click();
      }
    };
    
    // Auto-process on file selection
    fileInput.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        this.selectedFiles = files;
        this.showFiles();
        this.autoProcess(toolUrl);
      }
    };
    
    // Auto-process on drop
    uploadArea.ondragover = (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); };
    uploadArea.ondragleave = (e) => { e.preventDefault(); uploadArea.classList.remove('dragover'); };
    uploadArea.ondrop = (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        this.selectedFiles = files;
        this.showFiles();
        this.autoProcess(toolUrl);
      }
    };
  }

  showFiles() {
    const list = document.getElementById('fileList');
    const area = document.getElementById('uploadArea');
    if (!list) return;
    
    list.innerHTML = '';
    this.selectedFiles.forEach((file, i) => {
      const item = document.createElement('div');
      item.className = 'file-item';
      item.innerHTML = `
        <div>
          <div class="file-name">${file.name}</div>
          <div class="file-size">${this.formatSize(file.size)}</div>
        </div>
      `;
      list.appendChild(item);
    });
    
    if (area) {
      area.classList.add('processing');
      const btn = document.getElementById('browseBtn');
      if (btn) btn.disabled = true;
    }
  }

  async autoProcess(toolUrl) {
    const progress = document.getElementById('progressArea');
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    
    // Show options if needed
    const optionsArea = document.getElementById('optionsArea');
    const toolOptions = document.getElementById('toolOptions');
    
    let hasOptions = false;
    let optionsHTML = '';
    
    switch(toolUrl) {
      case '/compress-pdf':
        hasOptions = true;
        optionsHTML = `
          <div class="option-group">
            <label>Quality:</label>
            <select id="quality">
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        `;
        break;
      case '/rotate-pdf':
        hasOptions = true;
        optionsHTML = `
          <div class="option-group">
            <label>Rotation:</label>
            <select id="rotation">
              <option value="90" selected>90°</option>
              <option value="180">180°</option>
              <option value="270">270°</option>
            </select>
          </div>
        `;
        break;
    }
    
    if (hasOptions && toolOptions && optionsArea) {
      toolOptions.innerHTML = optionsHTML;
      optionsArea.style.display = 'block';
      await new Promise(r => setTimeout(r, 800));
    }
    
    // Show progress
    if (optionsArea) optionsArea.style.display = 'none';
    if (progress) {
      progress.style.display = 'block';
      progress.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Animate progress
    await this.animate(fill, text, 0, 20, '📤 Uploading...', 400);
    await this.animate(fill, text, 20, 50, '🔄 Processing...', 1000);
    
    try {
      // API call
      const formData = new FormData();
      const field = (toolUrl === '/merge-pdf' || toolUrl === '/jpg-to-pdf') ? 'pdfs' : 'pdf';
      this.selectedFiles.forEach(f => formData.append(field, f));
      
      // Add options
      const quality = document.getElementById('quality');
      const rotation = document.getElementById('rotation');
      if (quality) formData.append('quality', quality.value);
      if (rotation) formData.append('rotation', rotation.value);
      
      console.log('Sending to:', toolUrl, 'Field:', field, 'Files:', this.selectedFiles.length);
      
      const res = await fetch(toolUrl, { method: 'POST', body: formData });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server error:', errorText);
        throw new Error(`Server error: ${res.status} - ${errorText}`);
      }
      await this.animate(fill, text, 50, 90, '⚡ Finalizing...', 800);
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      await this.animate(fill, text, 90, 100, '✅ Done!', 300);
      
      setTimeout(() => this.showResult(toolUrl, url), 400);
      
    } catch (err) {
      if (text) text.innerHTML = `<span style="color:#e8273c">❌ Error: ${err.message}</span>`;
      if (fill) fill.style.background = '#e8273c';
    }
  }

  animate(fill, text, start, end, msg, time) {
    return new Promise(r => {
      if (fill) fill.style.width = start + '%';
      if (text) text.textContent = msg;
      setTimeout(() => { if (fill) fill.style.width = end + '%'; r(); }, time);
    });
  }

  showResult(toolUrl, downloadUrl) {
    const progress = document.getElementById('progressArea');
    const result = document.getElementById('resultArea');
    const downloadBtn = document.getElementById('downloadBtn');
    const newFileBtn = document.getElementById('newFileBtn');
    const info = document.getElementById('resultInfo');
    
    if (progress) progress.style.display = 'none';
    if (result) {
      result.style.display = 'block';
      result.scrollIntoView({ behavior: 'smooth' });
    }
    
    if (info) info.textContent = `Processed: ${this.selectedFiles[0]?.name || 'file'}`;
    
    const names = {
      '/merge-pdf': 'merged.pdf', '/split-pdf': 'split.zip',
      '/compress-pdf': 'compressed.pdf', '/pdf-to-word': 'converted.doc',
      '/pdf-to-jpg': 'images.zip', '/jpg-to-pdf': 'images.pdf',
      '/word-to-pdf': 'word.pdf', '/rotate-pdf': 'rotated.pdf',
      '/ocr-pdf': 'ocr.pdf', '/add-watermark': 'watermarked.pdf'
    };
    
    if (downloadBtn) {
      downloadBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = names[toolUrl] || 'processed.pdf';
        a.click();
      };
    }
    
    if (newFileBtn) {
      newFileBtn.onclick = () => {
        this.closeModal();
        setTimeout(() => {
          const card = document.querySelector(`[href="${toolUrl}"]`);
          if (card) {
            const name = card.querySelector('h3')?.textContent;
            const desc = card.querySelector('p')?.textContent;
            this.openToolModal(toolUrl, name, desc);
          }
        }, 100);
      };
    }
  }

  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  closeModal() {
    const modal = document.getElementById('pdfToolModal');
    if (modal) modal.remove();
    this.currentModal = null;
    this.selectedFiles = [];
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.pdfProcessor = new PDFProcessor();
});
window.PDFProcessor = PDFProcessor;
