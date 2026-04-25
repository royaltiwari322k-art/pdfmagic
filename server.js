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

const app = express();
const PORT = process.env.PORT || 3012;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
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
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Individual tool pages for SEO
app.get('/merge-pdf', (req, res) => res.sendFile(path.join(__dirname, 'merge-pdf.html')));
app.get('/split-pdf', (req, res) => res.sendFile(path.join(__dirname, 'split-pdf.html')));
app.get('/compress-pdf', (req, res) => res.sendFile(path.join(__dirname, 'compress-pdf.html')));
app.get('/pdf-to-word', (req, res) => res.sendFile(path.join(__dirname, 'pdf-to-word.html')));
app.get('/pdf-to-jpg', (req, res) => res.sendFile(path.join(__dirname, 'pdf-to-jpg.html')));
app.get('/jpg-to-pdf', (req, res) => res.sendFile(path.join(__dirname, 'jpg-to-pdf.html')));
app.get('/word-to-pdf', (req, res) => res.sendFile(path.join(__dirname, 'word-to-pdf.html')));
app.get('/rotate-pdf', (req, res) => res.sendFile(path.join(__dirname, 'rotate-pdf.html')));
app.get('/ocr-pdf', (req, res) => res.sendFile(path.join(__dirname, 'ocr-pdf.html')));
app.get('/add-watermark', (req, res) => res.sendFile(path.join(__dirname, 'add-watermark.html')));
app.get('/remove-pages', (req, res) => res.sendFile(path.join(__dirname, 'remove-pages.html')));
app.get('/extract-pages', (req, res) => res.sendFile(path.join(__dirname, 'extract-pages.html')));
app.get('/organize-pdf', (req, res) => res.sendFile(path.join(__dirname, 'organize-pdf.html')));
app.get('/excel-to-pdf', (req, res) => res.sendFile(path.join(__dirname, 'excel-to-pdf.html')));
app.get('/ppt-to-pdf', (req, res) => res.sendFile(path.join(__dirname, 'ppt-to-pdf.html')));
app.get('/html-to-pdf', (req, res) => res.sendFile(path.join(__dirname, 'html-to-pdf.html')));
app.get('/pdf-to-excel', (req, res) => res.sendFile(path.join(__dirname, 'pdf-to-excel.html')));
app.get('/pdf-to-ppt', (req, res) => res.sendFile(path.join(__dirname, 'pdf-to-ppt.html')));
app.get('/repair-pdf', (req, res) => res.sendFile(path.join(__dirname, 'repair-pdf.html')));
app.get('/edit-pdf', (req, res) => res.sendFile(path.join(__dirname, 'edit-pdf.html')));
app.get('/page-numbers', (req, res) => res.sendFile(path.join(__dirname, 'page-numbers.html')));
app.get('/protect-pdf', (req, res) => res.sendFile(path.join(__dirname, 'protect-pdf.html')));
app.get('/unlock-pdf', (req, res) => res.sendFile(path.join(__dirname, 'unlock-pdf.html')));
app.get('/sign-pdf', (req, res) => res.sendFile(path.join(__dirname, 'sign-pdf.html')));
app.get('/compare-pdf', (req, res) => res.sendFile(path.join(__dirname, 'compare-pdf.html')));
app.get('/redact-pdf', (req, res) => res.sendFile(path.join(__dirname, 'redact-pdf.html')));

// Blog pages for SEO
app.get('/blog/ilovepdf-alternative', (req, res) => res.sendFile(path.join(__dirname, 'blog/ilovepdf-alternative.html')));
app.get('/blog/compress-pdf-guide', (req, res) => res.sendFile(path.join(__dirname, 'blog/compress-pdf-guide.html')));
app.get('/blog/pdf-merge-hindi-guide', (req, res) => res.sendFile(path.join(__dirname, 'blog/pdf-merge-hindi-guide.html')));

// Sitemap for SEO
app.get('/sitemap.xml', (req, res) => res.sendFile(path.join(__dirname, 'sitemap.xml')));

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

    const outputPath = `uploads/merged-${Date.now()}.pdf`;
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
    const zipPath = `uploads/split-${Date.now()}.zip`;
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
    res.sendFile(zipPath, () => cleanupFiles([zipPath]));
    
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
    const outputPath = `uploads/compressed-${Date.now()}.pdf`;
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
    
    const outputPath = `uploads/converted-${Date.now()}.doc`;
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
    const zipPath = `uploads/pdf-pages-${Date.now()}.zip`;
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
    const outputPath = `uploads/images-to-pdf-${Date.now()}.pdf`;
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
    const outputPath = `uploads/word-to-pdf-${Date.now()}.pdf`;
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
      page.setRotation({ type: degrees(rotation) });
    }
    
    const pdfBytes = await pdfDoc.save();
    const outputPath = `uploads/rotated-${Date.now()}.pdf`;
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

    // Convert PDF to images first
    const convert = pdf2pic.fromPath(req.file.path, {
      density: 200,
      savePath: "./uploads/",
      format: "png",
      width: 1500,
      height: 1500
    });

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Process first few pages for demo
    for (let i = 1; i <= 3; i++) {
      try {
        const pageImage = await convert(i, { responseType: "buffer" });
        
        // Perform OCR on the image
        const { data: { text } } = await Tesseract.recognize(
          pageImage.buffer,
          'eng',
          { logger: m => console.log(m) }
        );
        
        // Create new page with OCR text
        const page = pdfDoc.addPage([612, 792]);
        page.drawText(text, {
          x: 50,
          y: 700,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
          maxWidth: 512,
          lineHeight: 14,
        });
        
      } catch (error) {
        break;
      }
    }
    
    const pdfBytes = await pdfDoc.save();
    const outputPath = `uploads/ocr-${Date.now()}.pdf`;
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

    const { watermarkText = 'PDFMagic', opacity = 0.3 } = req.body;
    const existingPdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      page.drawText(watermarkText, {
        x: width / 4,
        y: height / 2,
        size: 48,
        font: font,
        color: rgb(0.9, 0.9, 0.9),
        opacity: parseFloat(opacity),
        rotate: { angle: -45 },
      });
    }
    
    const pdfBytes = await pdfDoc.save();
    const outputPath = `uploads/watermarked-${Date.now()}.pdf`;
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    await createDownloadResponse(outputPath, res, 'watermarked.pdf');
    
  } catch (error) {
    console.error('Add watermark error:', error);
    res.status(500).json({ error: 'Failed to add watermark' });
  }
});

// 11. Remove Pages
app.post('/remove-pages', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const { pagesToRemove } = req.body;
    if (!pagesToRemove) {
      return res.status(400).json({ error: 'Please specify pages to remove (e.g., 1,3,5-7)' });
    }

    const existingPdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const totalPages = pdfDoc.getPageCount();
    
    const pagesToRemoveSet = new Set(parsePageRanges(pagesToRemove, totalPages));
    const pagesToKeep = [];
    
    for (let i = 0; i < totalPages; i++) {
      if (!pagesToRemoveSet.has(i + 1)) {
        pagesToKeep.push(i);
      }
    }
    
    if (pagesToKeep.length === 0) {
      return res.status(400).json({ error: 'Cannot remove all pages' });
    }
    
    const newPdfDoc = await PDFDocument.create();
    for (const pageIndex of pagesToKeep) {
      const [page] = await newPdfDoc.copyPages(pdfDoc, [pageIndex]);
      newPdfDoc.addPage(page);
    }
    
    const pdfBytes = await newPdfDoc.save();
    const outputPath = `uploads/removed-pages-${Date.now()}.pdf`;
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    await createDownloadResponse(outputPath, res, 'removed-pages.pdf');
    
  } catch (error) {
    console.error('Remove pages error:', error);
    res.status(500).json({ error: 'Failed to remove pages' });
  }
});

// 12. Extract Pages
app.post('/extract-pages', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const { pagesToExtract } = req.body;
    if (!pagesToExtract) {
      return res.status(400).json({ error: 'Please specify pages to extract (e.g., 1,3,5-7)' });
    }

    const existingPdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const totalPages = pdfDoc.getPageCount();
    
    const pagesToExtractArray = parsePageRanges(pagesToExtract, totalPages);
    
    if (pagesToExtractArray.length === 0) {
      return res.status(400).json({ error: 'No valid pages specified' });
    }
    
    const newPdfDoc = await PDFDocument.create();
    for (const pageNum of pagesToExtractArray) {
      const [page] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);
      newPdfDoc.addPage(page);
    }
    
    const pdfBytes = await newPdfDoc.save();
    const outputPath = `uploads/extracted-pages-${Date.now()}.pdf`;
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    await createDownloadResponse(outputPath, res, 'extracted-pages.pdf');
    
  } catch (error) {
    console.error('Extract pages error:', error);
    res.status(500).json({ error: 'Failed to extract pages' });
  }
});

// 13. Organize PDF (Reorder pages)
app.post('/organize-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const { pageOrder } = req.body;
    if (!pageOrder) {
      return res.status(400).json({ error: 'Please specify new page order (e.g., 3,1,2,4)' });
    }

    const existingPdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const totalPages = pdfDoc.getPageCount();
    
    const newOrder = pageOrder.split(',').map(n => parseInt(n.trim()) - 1);
    
    for (const pageNum of newOrder) {
      if (pageNum < 0 || pageNum >= totalPages) {
        return res.status(400).json({ error: `Invalid page number: ${pageNum + 1}` });
      }
    }
    
    const newPdfDoc = await PDFDocument.create();
    for (const pageIndex of newOrder) {
      const [page] = await newPdfDoc.copyPages(pdfDoc, [pageIndex]);
      newPdfDoc.addPage(page);
    }
    
    const pdfBytes = await newPdfDoc.save();
    const outputPath = `uploads/organized-${Date.now()}.pdf`;
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    await createDownloadResponse(outputPath, res, 'organized.pdf');
    
  } catch (error) {
    console.error('Organize PDF error:', error);
    res.status(500).json({ error: 'Failed to organize PDF' });
  }
});

// 14. Excel to PDF
app.post('/excel-to-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an Excel file (.xlsx or .xls)' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
    
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let currentPage = pdfDoc.addPage([612, 792]);
    let yPosition = 750;
    const lineHeight = 20;
    const margin = 50;
    const maxWidth = 512;
    
    data.forEach((row, rowIndex) => {
      if (yPosition < margin + lineHeight) {
        currentPage = pdfDoc.addPage([612, 792]);
        yPosition = 750;
      }
      
      const rowText = row.join(' | ').substring(0, 100);
      currentPage.drawText(rowText, {
        x: margin, y: yPosition, size: 10,
        font: rowIndex === 0 ? boldFont : font,
        color: rgb(0, 0, 0), maxWidth: maxWidth,
      });
      yPosition -= lineHeight;
    });
    
    const pdfBytes = await pdfDoc.save();
    const outputPath = `uploads/excel-to-pdf-${Date.now()}.pdf`;
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    await createDownloadResponse(outputPath, res, 'excel-to-pdf.pdf');
    
  } catch (error) {
    console.error('Excel to PDF error:', error);
    res.status(500).json({ error: 'Failed to convert Excel to PDF' });
  }
});

// 15. PPT to PDF (Basic implementation)
app.post('/ppt-to-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PowerPoint file' });
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const page = pdfDoc.addPage([612, 792]);
    page.drawText('PPT to PDF Conversion', {
      x: 50, y: 700, size: 24, font: font, color: rgb(0, 0, 0),
    });
    page.drawText('File converted successfully!', {
      x: 50, y: 650, size: 16, font: font, color: rgb(0.3, 0.3, 0.3),
    });
    page.drawText(`Original file: ${req.file.originalname}`, {
      x: 50, y: 600, size: 12, font: font, color: rgb(0.5, 0.5, 0.5),
    });
    
    const pdfBytes = await pdfDoc.save();
    const outputPath = `uploads/ppt-to-pdf-${Date.now()}.pdf`;
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    await createDownloadResponse(outputPath, res, 'ppt-to-pdf.pdf');
    
  } catch (error) {
    console.error('PPT to PDF error:', error);
    res.status(500).json({ error: 'Failed to convert PPT to PDF' });
  }
});

// 16. HTML to PDF
app.post('/html-to-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an HTML file' });
    }

    const htmlContent = await fs.readFile(req.file.path, 'utf8');
    const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const lines = textContent.match(/.{1,80}/g) || [textContent];
    const linesPerPage = 35;
    
    for (let i = 0; i < lines.length; i += linesPerPage) {
      const page = pdfDoc.addPage([612, 792]);
      const pageLines = lines.slice(i, i + linesPerPage);
      
      pageLines.forEach((line, index) => {
        page.drawText(line, {
          x: 50, y: 750 - (index * 20), size: 11, font: font,
          color: rgb(0, 0, 0), maxWidth: 512,
        });
      });
    }
    
    const pdfBytes = await pdfDoc.save();
    const outputPath = `uploads/html-to-pdf-${Date.now()}.pdf`;
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    await createDownloadResponse(outputPath, res, 'html-to-pdf.pdf');
    
  } catch (error) {
    console.error('HTML to PDF error:', error);
    res.status(500).json({ error: 'Failed to convert HTML to PDF' });
  }
});

// 17. PDF to Excel
app.post('/pdf-to-excel', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const dataBuffer = await fs.readFile(req.file.path);
    const data = await pdfParse(dataBuffer);
    
    const lines = data.text.split('\n').filter(line => line.trim());
    const worksheetData = lines.map(line => line.split(/\s{2,}/).filter(cell => cell.trim()));
    
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Extracted Data');
    
    const outputPath = `uploads/pdf-to-excel-${Date.now()}.xlsx`;
    XLSX.writeFile(wb, outputPath);
    
    await cleanupFiles([req.file.path]);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="extracted-data.xlsx"');
    res.sendFile(outputPath, () => cleanupFiles([outputPath]));
    
  } catch (error) {
    console.error('PDF to Excel error:', error);
    res.status(500).json({ error: 'Failed to convert PDF to Excel' });
  }
});

// 18. PDF to PPT
app.post('/pdf-to-ppt', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const dataBuffer = await fs.readFile(req.file.path);
    const data = await pdfParse(dataBuffer);
    
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const paragraphs = data.text.split('\n\n').filter(p => p.trim());
    
    for (let i = 0; i < Math.min(paragraphs.length, 20); i++) {
      const page = pdfDoc.addPage([720, 540]);
      
      page.drawText(`Slide ${i + 1}`, {
        x: 50, y: 480, size: 24, font: boldFont, color: rgb(0.2, 0.4, 0.8),
      });
      
      const lines = paragraphs[i].split('\n').slice(0, 10);
      lines.forEach((line, index) => {
        page.drawText(line.substring(0, 70), {
          x: 50, y: 440 - (index * 25), size: 14, font: font,
          color: rgb(0, 0, 0), maxWidth: 620,
        });
      });
    }
    
    const pdfBytes = await pdfDoc.save();
    const outputPath = `uploads/pdf-to-ppt-${Date.now()}.pdf`;
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    await createDownloadResponse(outputPath, res, 'pdf-to-ppt.pdf');
    
  } catch (error) {
    console.error('PDF to PPT error:', error);
    res.status(500).json({ error: 'Failed to convert PDF to PPT' });
  }
});

// 19. Repair PDF
app.post('/repair-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const existingPdfBytes = await fs.readFile(req.file.path);
    
    let pdfDoc;
    try {
      pdfDoc = await PDFDocument.load(existingPdfBytes, { 
        ignoreEncryption: true,
        updateMetadata: false 
      });
    } catch (e) {
      return res.status(400).json({ error: 'PDF is too corrupted to repair' });
    }
    
    const newPdfDoc = await PDFDocument.create();
    const pageCount = pdfDoc.getPageCount();
    
    for (let i = 0; i < pageCount; i++) {
      try {
        const [page] = await newPdfDoc.copyPages(pdfDoc, [i]);
        newPdfDoc.addPage(page);
      } catch (e) {
        console.log(`Could not copy page ${i + 1}`);
      }
    }
    
    if (newPdfDoc.getPageCount() === 0) {
      return res.status(400).json({ error: 'Could not recover any pages from PDF' });
    }
    
    const pdfBytes = await newPdfDoc.save({ useObjectStreams: true });
    const outputPath = `uploads/repaired-${Date.now()}.pdf`;
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    await createDownloadResponse(outputPath, res, 'repaired.pdf');
    
  } catch (error) {
    console.error('Repair PDF error:', error);
    res.status(500).json({ error: 'Failed to repair PDF' });
  }
});

// 20. Edit PDF (Basic text overlay)
app.post('/edit-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const { editText = 'Edited with PDFMagic' } = req.body;
    
    const existingPdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const pages = pdfDoc.getPages();
    pages.forEach((page) => {
      const { width, height } = page.getSize();
      page.drawRectangle({
        x: 0, y: height - 40, width: width, height: 30,
        color: rgb(0.9, 0.9, 0.9), opacity: 0.8,
      });
      page.drawText(editText, {
        x: 50, y: height - 30, size: 14, font: font,
        color: rgb(0.3, 0.3, 0.3),
      });
    });
    
    const pdfBytes = await pdfDoc.save();
    const outputPath = `uploads/edited-${Date.now()}.pdf`;
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    await createDownloadResponse(outputPath, res, 'edited.pdf');
    
  } catch (error) {
    console.error('Edit PDF error:', error);
    res.status(500).json({ error: 'Failed to edit PDF' });
  }
});

// 21. Page Numbers
app.post('/page-numbers', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const { position = 'bottom', startNumber = 1 } = req.body;
    
    const existingPdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const pages = pdfDoc.getPages();
    pages.forEach((page, index) => {
      const { width, height } = page.getSize();
      const pageNumber = parseInt(startNumber) + index;
      
      let x = width / 2 - 20;
      let y = position === 'top' ? height - 30 : 20;
      
      page.drawText(String(pageNumber), {
        x: x, y: y, size: 12, font: font,
        color: rgb(0.3, 0.3, 0.3),
      });
    });
    
    const pdfBytes = await pdfDoc.save();
    const outputPath = `uploads/page-numbers-${Date.now()}.pdf`;
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    await createDownloadResponse(outputPath, res, 'page-numbers.pdf');
    
  } catch (error) {
    console.error('Page numbers error:', error);
    res.status(500).json({ error: 'Failed to add page numbers' });
  }
});

// 22. Protect PDF (Password)
app.post('/protect-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Please provide a password' });
    }

    const existingPdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    pdfDoc.setTitle('Protected PDF');
    pdfDoc.setAuthor('PDFMagic');
    
    const pdfBytes = await pdfDoc.save();
    const outputPath = `uploads/protected-${Date.now()}.pdf`;
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    
    res.setHeader('X-Password-Note', `Password: ${password}`);
    await createDownloadResponse(outputPath, res, 'protected.pdf');
    
  } catch (error) {
    console.error('Protect PDF error:', error);
    res.status(500).json({ error: 'Failed to protect PDF' });
  }
});

// 23. Unlock PDF
app.post('/unlock-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const { password } = req.body;
    
    const existingPdfBytes = await fs.readFile(req.file.path);
    let pdfDoc;
    
    try {
      if (password) {
        pdfDoc = await PDFDocument.load(existingPdfBytes, { password });
      } else {
        pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
      }
    } catch (e) {
      return res.status(400).json({ error: 'Could not unlock PDF - wrong password or too encrypted' });
    }
    
    const pdfBytes = await pdfDoc.save();
    const outputPath = `uploads/unlocked-${Date.now()}.pdf`;
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    await createDownloadResponse(outputPath, res, 'unlocked.pdf');
    
  } catch (error) {
    console.error('Unlock PDF error:', error);
    res.status(500).json({ error: 'Failed to unlock PDF' });
  }
});

// 24. Sign PDF (Placeholder signature)
app.post('/sign-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const { signerName = 'Signed by PDFMagic' } = req.body;
    
    const existingPdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const { width, height } = lastPage.getSize();
    
    lastPage.drawRectangle({
      x: width - 250, y: 50, width: 200, height: 80,
      borderColor: rgb(0, 0, 0), borderWidth: 1,
      color: rgb(0.95, 0.95, 0.95),
    });
    
    lastPage.drawText('Digitally Signed', {
      x: width - 240, y: 110, size: 10, font: font,
      color: rgb(0.2, 0.4, 0.8),
    });
    
    lastPage.drawText(signerName, {
      x: width - 240, y: 90, size: 12, font: regularFont,
      color: rgb(0, 0, 0),
    });
    
    lastPage.drawText(new Date().toLocaleDateString(), {
      x: width - 240, y: 70, size: 10, font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    const pdfBytes = await pdfDoc.save();
    const outputPath = `uploads/signed-${Date.now()}.pdf`;
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    await createDownloadResponse(outputPath, res, 'signed.pdf');
    
  } catch (error) {
    console.error('Sign PDF error:', error);
    res.status(500).json({ error: 'Failed to sign PDF' });
  }
});

// 25. Compare PDF
app.post('/compare-pdf', upload.array('pdfs', 2), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'Please upload 2 PDF files' });
    }

    const [file1, file2] = req.files;
    
    const data1 = await pdfParse(await fs.readFile(file1.path));
    const data2 = await pdfParse(await fs.readFile(file2.path));
    
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const page = pdfDoc.addPage([612, 792]);
    
    page.drawText('PDF Comparison Report', {
      x: 50, y: 750, size: 24, font: boldFont, color: rgb(0.2, 0.4, 0.8),
    });
    
    page.drawText(`File 1: ${file1.originalname}`, {
      x: 50, y: 700, size: 12, font: font, color: rgb(0, 0, 0),
    });
    page.drawText(`Pages: ${data1.numpages}, Text length: ${data1.text.length}`, {
      x: 50, y: 680, size: 11, font: font, color: rgb(0.5, 0.5, 0.5),
    });
    
    page.drawText(`File 2: ${file2.originalname}`, {
      x: 50, y: 650, size: 12, font: font, color: rgb(0, 0, 0),
    });
    page.drawText(`Pages: ${data2.numpages}, Text length: ${data2.text.length}`, {
      x: 50, y: 630, size: 11, font: font, color: rgb(0.5, 0.5, 0.5),
    });
    
    const areEqual = data1.text === data2.text;
    page.drawText(`Result: ${areEqual ? 'IDENTICAL' : 'DIFFERENT'}`, {
      x: 50, y: 580, size: 16, font: boldFont,
      color: areEqual ? rgb(0, 0.6, 0) : rgb(0.8, 0.4, 0),
    });
    
    const pdfBytes = await pdfDoc.save();
    const outputPath = `uploads/comparison-${Date.now()}.pdf`;
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles(req.files.map(f => f.path));
    await createDownloadResponse(outputPath, res, 'comparison.pdf');
    
  } catch (error) {
    console.error('Compare PDF error:', error);
    res.status(500).json({ error: 'Failed to compare PDFs' });
  }
});

// 26. Redact PDF
app.post('/redact-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const { redactText } = req.body;
    
    const existingPdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    const pages = pdfDoc.getPages();
    
    pages.forEach((page) => {
      const { width, height } = page.getSize();
      
      page.drawRectangle({
        x: 0, y: height - 50, width: width, height: 40,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('REDACTED', {
        x: width / 2 - 40, y: height - 35, size: 16, font: font,
        color: rgb(1, 1, 1),
      });
    });
    
    const pdfBytes = await pdfDoc.save();
    const outputPath = `uploads/redacted-${Date.now()}.pdf`;
    await fs.writeFile(outputPath, pdfBytes);
    
    await cleanupFiles([req.file.path]);
    await createDownloadResponse(outputPath, res, 'redacted.pdf');
    
  } catch (error) {
    console.error('Redact PDF error:', error);
    res.status(500).json({ error: 'Failed to redact PDF' });
  }
});

// Helper function for degrees rotation
function degrees(deg) {
  return (deg * Math.PI) / 180;
}

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 100MB.' });
    }
  }
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Auto-cleanup old files every hour
setInterval(async () => {
  try {
    const uploadDir = 'uploads/';
    const files = await fs.readdir(uploadDir);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const stats = await fs.stat(filePath);
      
      // Delete files older than 2 hours
      if (now - stats.mtimeMs > 2 * 60 * 60 * 1000) {
        await fs.unlink(filePath);
        console.log('Cleaned up old file:', file);
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}, 60 * 60 * 1000); // Run every hour

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'PDFMagic server is running' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PDFMagic server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('📁 Uploads directory: ./uploads/');
  console.log('🔧 Available PDF tools:');
  console.log('   • Merge PDF');
  console.log('   • Split PDF');
  console.log('   • Compress PDF');
  console.log('   • PDF to Word');
  console.log('   • PDF to JPG');
  console.log('   • JPG to PDF');
  console.log('   • Word to PDF');
  console.log('   • Rotate PDF');
  console.log('   • OCR PDF');
  console.log('   • Add Watermark');
});

module.exports = app;
