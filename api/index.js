const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const pdfParse = require('pdf-parse');
const Jimp = require('jimp');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const archiver = require('archiver');
const PDFMerger = require('pdf-merger-js');

// Optional imports for advanced features
let pdf2pic = null;
let Tesseract = null;

try {
  pdf2pic = require('pdf2pic');
} catch (e) {
  console.warn('pdf2pic not available:', e.message);
}

try {
  Tesseract = require('tesseract.js');
} catch (e) {
  console.warn('Tesseract not available:', e.message);
}

const app = express();

console.log('PDFMagic server starting...');
console.log('__dirname:', __dirname);
console.log('process.cwd():', process.cwd());

// Helper to get file path
const getFilePath = (filename) => {
  const rootPath = process.env.VERCEL ? '/var/task' : path.join(__dirname, '..');
  return path.join(rootPath, filename);
};

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
const staticPath = process.env.VERCEL ? '/var/task' : path.join(__dirname, '..');
app.use(express.static(staticPath));
console.log('Serving static files from:', staticPath);

// Ensure uploads directory exists
const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, '..', 'uploads');
try {
  fs.ensureDirSync(uploadsDir);
  console.log('Uploads directory ensured at:', uploadsDir);
} catch (error) {
  console.error('Error creating uploads directory:', error);
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = uploadsDir;
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|jpg|jpeg|png|gif|webp|bmp|tiff|html|htm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Helper function to clean up files
const cleanupFiles = async (files) => {
  for (const file of files) {
    try {
      if (fs.existsSync(file)) {
        await fs.unlink(file);
      }
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
};

// Helper function to create download response
const createDownloadResponse = async (filePath, res, filename) => {
  try {
    const fileBuffer = await fs.readFile(filePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(fileBuffer);
    
    // Clean up after sending
    setTimeout(() => cleanupFiles([filePath]), 2000);
  } catch (error) {
    console.error('Error sending file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Individual tool pages for SEO
app.get('/merge-pdf', (req, res) => res.sendFile(path.join(__dirname, '..', 'merge-pdf.html')));
app.get('/split-pdf', (req, res) => res.sendFile(path.join(__dirname, '..', 'split-pdf.html')));
app.get('/compress-pdf', (req, res) => res.sendFile(path.join(__dirname, '..', 'compress-pdf.html')));
app.get('/pdf-to-word', (req, res) => res.sendFile(path.join(__dirname, '..', 'pdf-to-word.html')));
app.get('/pdf-to-jpg', (req, res) => res.sendFile(path.join(__dirname, '..', 'pdf-to-jpg.html')));
app.get('/jpg-to-pdf', (req, res) => res.sendFile(path.join(__dirname, '..', 'jpg-to-pdf.html')));
app.get('/word-to-pdf', (req, res) => res.sendFile(path.join(__dirname, '..', 'word-to-pdf.html')));
app.get('/rotate-pdf', (req, res) => res.sendFile(path.join(__dirname, '..', 'rotate-pdf.html')));
app.get('/ocr-pdf', (req, res) => res.sendFile(path.join(__dirname, '..', 'ocr-pdf.html')));
app.get('/add-watermark', (req, res) => res.sendFile(path.join(__dirname, '..', 'add-watermark.html')));
app.get('/remove-pages', (req, res) => res.sendFile(path.join(__dirname, '..', 'remove-pages.html')));
app.get('/extract-pages', (req, res) => res.sendFile(path.join(__dirname, '..', 'extract-pages.html')));
app.get('/organize-pdf', (req, res) => res.sendFile(path.join(__dirname, '..', 'organize-pdf.html')));
app.get('/excel-to-pdf', (req, res) => res.sendFile(path.join(__dirname, '..', 'excel-to-pdf.html')));
app.get('/ppt-to-pdf', (req, res) => res.sendFile(path.join(__dirname, '..', 'ppt-to-pdf.html')));
app.get('/html-to-pdf', (req, res) => res.sendFile(path.join(__dirname, '..', 'html-to-pdf.html')));
app.get('/pdf-to-excel', (req, res) => res.sendFile(path.join(__dirname, '..', 'pdf-to-excel.html')));
app.get('/pdf-to-ppt', (req, res) => res.sendFile(path.join(__dirname, '..', 'pdf-to-ppt.html')));
app.get('/repair-pdf', (req, res) => res.sendFile(path.join(__dirname, '..', 'repair-pdf.html')));
app.get('/edit-pdf', (req, res) => res.sendFile(path.join(__dirname, '..', 'edit-pdf.html')));
app.get('/page-numbers', (req, res) => res.sendFile(path.join(__dirname, '..', 'page-numbers.html')));
app.get('/protect-pdf', (req, res) => res.sendFile(path.join(__dirname, '..', 'protect-pdf.html')));
app.get('/unlock-pdf', (req, res) => res.sendFile(path.join(__dirname, '..', 'unlock-pdf.html')));
app.get('/sign-pdf', (req, res) => res.sendFile(path.join(__dirname, '..', 'sign-pdf.html')));
app.get('/compare-pdf', (req, res) => res.sendFile(path.join(__dirname, '..', 'compare-pdf.html')));
app.get('/redact-pdf', (req, res) => res.sendFile(path.join(__dirname, '..', 'redact-pdf.html')));

// Blog pages for SEO
app.get('/blog/ilovepdf-alternative', (req, res) => res.sendFile(path.join(__dirname, '..', 'blog/ilovepdf-alternative.html')));
app.get('/blog/compress-pdf-guide', (req, res) => res.sendFile(path.join(__dirname, '..', 'blog/compress-pdf-guide.html')));
app.get('/blog/pdf-merge-hindi-guide', (req, res) => res.sendFile(path.join(__dirname, '..', 'blog/pdf-merge-hindi-guide.html')));

// Footer pages
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, '..', 'about.html')));
app.get('/blog', (req, res) => res.sendFile(path.join(__dirname, '..', 'blog.html')));
app.get('/pricing', (req, res) => res.sendFile(path.join(__dirname, '..', 'pricing.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, '..', 'contact.html')));
app.get('/privacy', (req, res) => res.sendFile(path.join(__dirname, '..', 'privacy.html')));
app.get('/terms', (req, res) => res.sendFile(path.join(__dirname, '..', 'terms.html')));

// Sitemap for SEO
app.get('/sitemap.xml', (req, res) => res.sendFile(path.join(__dirname, '..', 'sitemap.xml')));

// Google site verification
app.get('/google7e82ca2f14a0908c.html', (req, res) => res.sendFile(path.join(__dirname, '..', 'google7e82ca2f14a0908c.html')));

// 1. Merge PDF
app.post('/merge-pdf', upload.array('pdfs', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'Please upload at least 2 PDF files' });
    }

    const merger = new PDFMerger();
    
    for (const file of req.files) {
      await merger.add(file.path);
    }

    const outputPath = path.join(uploadsDir, `merged-${Date.now()}.pdf`);
    await merger.save(outputPath);
    
    await cleanupFiles(req.files.map(f => f.path));
    await createDownloadResponse(outputPath, res, 'merged.pdf');
    
  } catch (error) {
    console.error('Merge PDF error:', error);
    res.status(500).json({ error: 'Failed to merge PDFs' });
  }
});

// 2. Split PDF
app.post('/split-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const { pageRanges } = req.body;
    const existingPdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    const zip = archiver('zip');
    const zipPath = path.join(uploadsDir, `split-${Date.now()}.zip`);
    const output = fs.createWriteStream(zipPath);
    
    zip.pipe(output);
    
    if (pageRanges) {
      // Split by custom page ranges
      const ranges = pageRanges.split(',').map(range => range.trim());
      
      for (let i = 0; i < ranges.length; i++) {
        const newPdfDoc = await PDFDocument.create();
        const pages = ranges[i].split('-').map(n => parseInt(n.trim()) - 1);
        
        for (const pageNum of pages) {
          if (pageNum >= 0 && pageNum < pdfDoc.getPageCount()) {
            const [page] = await newPdfDoc.copyPages(pdfDoc, [pageNum]);
            newPdfDoc.addPage(page);
          }
        }
        
        const pdfBytes = await newPdfDoc.save();
        zip.append(pdfBytes, { name: `split-${i + 1}.pdf` });
      }
    } else {
      // Split each page into separate PDF
      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const newPdfDoc = await PDFDocument.create();
        const [page] = await newPdfDoc.copyPages(pdfDoc, [i]);
        newPdfDoc.addPage(page);
        
        const pdfBytes = await newPdfDoc.save();
        zip.append(pdfBytes, { name: `page-${i + 1}.pdf` });
      }
    }
    
    await zip.finalize();
    await cleanupFiles([req.file.path]);
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="split-pdfs.zip"');
    res.sendFile(path.resolve(zipPath), () => cleanupFiles([zipPath]));
    
  } catch (error) {
    console.error('Split PDF error:', error);
    res.status(500).json({ error: 'Failed to split PDF' });
  }
});

// 3. Compress PDF
app.post('/compress-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const { quality = 'medium' } = req.body;
    const existingPdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // Create new PDF with optimized settings
    const newPdfDoc = await PDFDocument.create();
    
    // Copy pages with compression
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const [page] = await newPdfDoc.copyPages(pdfDoc, [i]);
      newPdfDoc.addPage(page);
    }
    
    // Save with compression based on quality
    const compressOptions = {
      useObjectStreams: true,
      addDefaultPage: false,
    };
    
    if (quality === 'low') {
      compressOptions.compress = true;
    } else if (quality === 'high') {
      compressOptions.compress = false;
    }
    
    const pdfBytes = await newPdfDoc.save(compressOptions);
    const outputPath = path.join(uploadsDir, `compressed-${Date.now()}.pdf`);
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    await createDownloadResponse(outputPath, res, 'compressed.pdf');
    
  } catch (error) {
    console.error('Compress PDF error:', error);
    res.status(500).json({ error: 'Failed to compress PDF' });
  }
});

// 4. PDF to Word
app.post('/pdf-to-word', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const dataBuffer = await fs.readFile(req.file.path);
    const data = await pdfParse(dataBuffer);
    
    // Create simple Word document (HTML format that can be opened in Word)
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Converted PDF</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
          h1 { color: #333; }
          p { margin-bottom: 16px; }
        </style>
      </head>
      <body>
        <h1>Converted from PDF</h1>
        <p>${data.text.replace(/\n/g, '</p><p>')}</p>
      </body>
      </html>
    `;
    
    const outputPath = path.join(uploadsDir, `converted-${Date.now()}.doc`);
    await fs.writeFile(outputPath, htmlContent);
    
    await cleanupFiles([req.file.path]);
    
    res.setHeader('Content-Type', 'application/msword');
    res.setHeader('Content-Disposition', 'attachment; filename="converted.doc"');
    res.sendFile(outputPath, () => cleanupFiles([outputPath]));
    
  } catch (error) {
    console.error('PDF to Word error:', error);
    res.status(500).json({ error: 'Failed to convert PDF to Word' });
  }
});

// 5. PDF to JPG (Basic implementation - page extraction)
app.post('/pdf-to-jpg', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const existingPdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    const zip = archiver('zip');
    const zipPath = path.join(uploadsDir, `pdf-pages-${Date.now()}.zip`);
    const output = fs.createWriteStream(zipPath);
    
    zip.pipe(output);
    
    for (let i = 0; i < Math.min(pdfDoc.getPageCount(), 10); i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <rect width="100%" height="100%" fill="white"/>
        <text x="50%" y="50%" text-anchor="middle" font-size="20" fill="#666">
          Page ${i + 1} (${Math.round(width)}x${Math.round(height)})
        </text>
      </svg>`;
      
      zip.append(Buffer.from(svgContent), { name: `page-${i + 1}.svg` });
    }
    
    await zip.finalize();
    await cleanupFiles([req.file.path]);
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="pdf-pages.zip"');
    res.sendFile(path.resolve(zipPath), () => cleanupFiles([zipPath]));
    
  } catch (error) {
    console.error('PDF to JPG error:', error);
    res.status(500).json({ error: 'Failed to convert PDF' });
  }
});

// 6. JPG to PDF
app.post('/jpg-to-pdf', upload.array('pdfs', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Please upload at least one image' });
    }

    const pdfDoc = await PDFDocument.create();
    
    for (const file of req.files) {
      try {
        const imageBytes = await fs.readFile(file.path);
        let image;
        
        console.log(`Processing file: ${file.originalname}, mimetype: ${file.mimetype}`);
        
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
          try {
            image = await pdfDoc.embedJpg(imageBytes);
          } catch (e) {
            console.log('JPG embed failed, trying PNG conversion');
            const jimpImage = await Jimp.read(imageBytes);
            const pngBuffer = await jimpImage.getBufferAsync(Jimp.MIME_PNG);
            image = await pdfDoc.embedPng(pngBuffer);
          }
        } else if (file.mimetype === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          // Convert other formats to PNG first
          console.log('Converting to PNG format');
          const jimpImage = await Jimp.read(imageBytes);
          const pngBuffer = await jimpImage.getBufferAsync(Jimp.MIME_PNG);
          image = await pdfDoc.embedPng(pngBuffer);
        }
        
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      } catch (error) {
        console.error(`Error processing ${file.originalname}:`, error);
        // Skip this image and continue with others
        continue;
      }
    }
    
    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(uploadsDir, `images-to-pdf-${Date.now()}.pdf`);
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles(req.files.map(f => f.path));
    await createDownloadResponse(outputPath, res, 'images-to-pdf.pdf');
    
  } catch (error) {
    console.error('JPG to PDF error:', error);
    res.status(500).json({ error: 'Failed to convert images to PDF' });
  }
});

// 7. Word to PDF
app.post('/word-to-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a Word document' });
    }

    const result = await mammoth.convertToHtml({ path: req.file.path });
    const htmlContent = result.value;
    
    // Create PDF from HTML content
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Standard letter size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Simple text extraction from HTML (basic implementation)
    const textContent = htmlContent.replace(/<[^>]*>/g, '').substring(0, 4000);
    
    page.drawText(textContent, {
      x: 50,
      y: 700,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
      maxWidth: 512,
      lineHeight: 16,
    });
    
    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(uploadsDir, `word-to-pdf-${Date.now()}.pdf`);
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    await createDownloadResponse(outputPath, res, 'word-to-pdf.pdf');
    
  } catch (error) {
    console.error('Word to PDF error:', error);
    res.status(500).json({ error: 'Failed to convert Word to PDF' });
  }
});

// 8. Rotate PDF
app.post('/rotate-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const { rotation = 90 } = req.body;
    const existingPdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // Rotate all pages
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      // Simple rotation - just pass the rotation value directly
      page.setRotation(parseInt(rotation) || 90);
    }
    
    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(uploadsDir, `rotated-${Date.now()}.pdf`);
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    await createDownloadResponse(outputPath, res, 'rotated.pdf');
    
  } catch (error) {
    console.error('Rotate PDF error:', error);
    res.status(500).json({ error: 'Failed to rotate PDF' });
  }
});

// 9. OCR PDF
app.post('/ocr-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    // Simple implementation: Extract text from PDF
    const dataBuffer = await fs.readFile(req.file.path);
    const data = await pdfParse(dataBuffer);
    
    // Create new PDF with extracted text
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Split text into pages (roughly 40 lines per page)
    const lines = data.text.split('\n');
    let currentPageLines = [];
    let pageNumber = 0;
    
    for (const line of lines) {
      currentPageLines.push(line);
      
      if (currentPageLines.length >= 40) {
        const page = pdfDoc.addPage([612, 792]);
        page.drawText(currentPageLines.join('\n'), {
          x: 50,
          y: 700,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
          maxWidth: 512,
          lineHeight: 14,
        });
        currentPageLines = [];
        pageNumber++;
      }
    }
    
    // Add remaining lines
    if (currentPageLines.length > 0) {
      const page = pdfDoc.addPage([612, 792]);
      page.drawText(currentPageLines.join('\n'), {
        x: 50,
        y: 700,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
        maxWidth: 512,
        lineHeight: 14,
      });
    }
    
    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(uploadsDir, `ocr-${Date.now()}.pdf`);
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    await createDownloadResponse(outputPath, res, 'ocr-pdf.pdf');
    
  } catch (error) {
    console.error('OCR PDF error:', error);
    res.status(500).json({ error: 'Failed to perform OCR on PDF' });
  }
});

// 10. Add Watermark
app.post('/add-watermark', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const { text = 'Watermark', opacity = 0.3 } = req.body;
    const existingPdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    for (const page of pages) {
      const { width, height } = page.getSize();
      page.drawText(text, {
        x: width / 2 - 100,
        y: height / 2,
        size: 48,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
        opacity: parseFloat(opacity),
        rotate: -45,
      });
    }
    
    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(uploadsDir, `watermarked-${Date.now()}.pdf`);
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    await createDownloadResponse(outputPath, res, 'watermarked.pdf');
    
  } catch (error) {
    console.error('Add Watermark error:', error);
    res.status(500).json({ error: 'Failed to add watermark' });
  }
});

// Health check endpoint for Vercel
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'PDFMagic server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: error.message || 'Internal server error' });
});

// Export for Vercel serverless
module.exports = app;
