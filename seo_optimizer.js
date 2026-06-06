const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\abhis\\OneDrive\\Desktop\\pdfmagic';
const domain = 'https://www.wwwpdfmagic.live';

const seoMap = {
  'merge-pdf': {
    title: 'Merge PDF Files Online for Free | Combine Multiple PDFs',
    desc: 'Combine multiple PDF files into a single document instantly. Free, fast and secure PDF merger. No registration or watermarks.',
    keys: 'merge pdf, combine pdf, join pdf files, pdf merger, merge multiple pdfs, free pdf merger online'
  },
  'split-pdf': {
    title: 'Split PDF Online | Extract Pages from PDF for Free',
    desc: 'Separate one page or a whole set for easy conversion into independent PDF files. Free and secure PDF splitter.',
    keys: 'split pdf, extract pdf pages, separate pdf pages, cut pdf, divide pdf, free pdf splitter'
  },
  'compress-pdf': {
    title: 'Compress PDF Online | Reduce PDF File Size for Free',
    desc: 'Reduce file size while optimizing for maximal PDF quality. Compress PDF files quickly and securely without losing formatting.',
    keys: 'compress pdf, reduce pdf size, shrink pdf, compress pdf online, free pdf compressor, optimize pdf'
  },
  'pdf-to-word': {
    title: 'Convert PDF to Word Online | Free PDF to DOCX Converter',
    desc: 'Convert PDF to editable Word documents for free. PDF to Word conversion is fast, secure and almost 100% accurate.',
    keys: 'pdf to word, convert pdf to word, pdf to docx, free pdf to word converter, editable word document'
  },
  'jpg-to-pdf': {
    title: 'Convert JPG to PDF Online | Free Image to PDF Converter',
    desc: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins. Free, secure, and fast image to PDF converter.',
    keys: 'jpg to pdf, image to pdf, convert jpg to pdf, jpeg to pdf, pictures to pdf, free jpg to pdf converter'
  },
  'pdf-to-jpg': {
    title: 'Convert PDF to JPG Online | Extract Images from PDF Free',
    desc: 'Convert each PDF page into a JPG or extract all images contained in a PDF. Fast and secure PDF to JPG converter online.',
    keys: 'pdf to jpg, convert pdf to jpg, pdf to image, extract images from pdf, free pdf to jpg converter'
  },
  'word-to-pdf': {
    title: 'Convert Word to PDF Online | Free DOCX to PDF Converter',
    desc: 'Make DOC and DOCX files easy to read by converting them to PDF. Fast, secure and free Word to PDF converter.',
    keys: 'word to pdf, convert word to pdf, doc to pdf, docx to pdf, free word to pdf converter'
  },
  'excel-to-pdf': {
    title: 'Convert Excel to PDF Online | Free XLSX to PDF Converter',
    desc: 'Make EXCEL spreadsheets easy to read by converting them to PDF. Free and secure Excel to PDF converter.',
    keys: 'excel to pdf, convert excel to pdf, xlsx to pdf, spreadsheet to pdf, free excel to pdf converter'
  },
  'pdf-to-excel': {
    title: 'Convert PDF to Excel Online | Free PDF to XLSX Converter',
    desc: 'Convert PDF data to EXCEL spreadsheets. Extract table data from PDF. Free and secure PDF to Excel converter.',
    keys: 'pdf to excel, convert pdf to excel, pdf to xlsx, extract tables from pdf, free pdf to excel converter'
  },
  'ppt-to-pdf': {
    title: 'Convert PPT to PDF Online | Free PowerPoint to PDF Converter',
    desc: 'Make PPT and PPTX slideshows easy to view by converting them to PDF. Fast, secure and free PowerPoint to PDF converter.',
    keys: 'ppt to pdf, powerpoint to pdf, convert ppt to pdf, pptx to pdf, free powerpoint to pdf converter'
  },
  'pdf-to-ppt': {
    title: 'Convert PDF to PPT Online | Free PDF to PowerPoint Converter',
    desc: 'Turn your PDF files into easy to edit PPT and PPTX slideshows. Fast and free PDF to PowerPoint converter.',
    keys: 'pdf to ppt, convert pdf to ppt, pdf to powerpoint, free pdf to ppt converter'
  },
  'html-to-pdf': {
    title: 'Convert HTML to PDF Online | Free Webpage to PDF Converter',
    desc: 'Convert webpages in HTML to PDF. Capture full web pages as PDF documents. Free and fast HTML to PDF converter.',
    keys: 'html to pdf, convert html to pdf, webpage to pdf, url to pdf, free html to pdf converter'
  },
  'rotate-pdf': {
    title: 'Rotate PDF Online | Rotate PDF Pages for Free',
    desc: 'Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once! Free and secure PDF rotator.',
    keys: 'rotate pdf, rotate pdf pages, turn pdf, change pdf orientation, free pdf rotator'
  },
  'ocr-pdf': {
    title: 'OCR PDF Online | Extract Text from Scanned PDF Free',
    desc: 'Convert scanned PDFs into searchable and selectable text. Free optical character recognition (OCR) software online.',
    keys: 'ocr pdf, extract text from pdf, scanned pdf to text, image to text, free ocr online'
  },
  'add-watermark': {
    title: 'Add Watermark to PDF Online | Free PDF Watermark Creator',
    desc: 'Stamp an image or text over your PDF in seconds. Choose the typography, transparency and position. Free PDF watermarking tool.',
    keys: 'add watermark to pdf, watermark pdf, stamp pdf, pdf watermark creator, free pdf watermark'
  },
  'remove-pages': {
    title: 'Remove Pages from PDF Online | Free PDF Page Deleter',
    desc: 'Remove pages from a PDF document in seconds. Delete unneeded pages easily. Free and secure PDF page remover.',
    keys: 'remove pages from pdf, delete pdf pages, remove pdf pages, delete pages from pdf free'
  },
  'extract-pages': {
    title: 'Extract Pages from PDF Online | Free PDF Page Extractor',
    desc: 'Get a new document containing only the desired pages. Free, fast and easy to use PDF page extractor.',
    keys: 'extract pages from pdf, extract pdf pages, split pdf pages, save specific pages from pdf'
  },
  'organize-pdf': {
    title: 'Organize PDF Online | Rearrange PDF Pages for Free',
    desc: 'Sort, add and delete PDF pages. Drag and drop the page thumbnails and sort them in our PDF organizer.',
    keys: 'organize pdf, rearrange pdf pages, sort pdf pages, move pdf pages, free pdf organizer'
  },
  'repair-pdf': {
    title: 'Repair PDF Online | Fix Corrupted PDF Files for Free',
    desc: 'Repair a damaged PDF and recover data from corrupt PDF. Fix PDF files with our advanced repair tool for free.',
    keys: 'repair pdf, fix corrupt pdf, recover damaged pdf, repair corrupted pdf file free'
  },
  'edit-pdf': {
    title: 'Edit PDF Online | Free PDF Editor & Annotator',
    desc: 'Add text, images, shapes or freehand annotations to a PDF document. Edit PDF files online securely and easily.',
    keys: 'edit pdf, pdf editor, annotate pdf, write on pdf, draw on pdf, free online pdf editor'
  },
  'page-numbers': {
    title: 'Add Page Numbers to PDF Online | Free PDF Numbering Tool',
    desc: 'Add page numbers into PDFs with ease. Choose your positions, dimensions, typography. Free online PDF numbering.',
    keys: 'add page numbers to pdf, number pdf pages, insert page numbers in pdf free'
  },
  'protect-pdf': {
    title: 'Protect PDF Online | Encrypt & Add Password to PDF Free',
    desc: 'Encrypt your PDF with a password to keep sensitive data confidential. Free and secure PDF protection tool.',
    keys: 'protect pdf, encrypt pdf, add password to pdf, secure pdf, lock pdf free'
  },
  'unlock-pdf': {
    title: 'Unlock PDF Online | Remove PDF Password for Free',
    desc: 'Remove PDF password security, giving you the freedom to use your PDFs as you want. Free PDF unlocker tool.',
    keys: 'unlock pdf, remove pdf password, decrypt pdf, unlock pdf file free'
  },
  'sign-pdf': {
    title: 'Sign PDF Online | Free Electronic Signature for PDF',
    desc: 'Sign yourself or request electronic signatures from others. Secure, legally binding e-signatures for your PDF documents.',
    keys: 'sign pdf, electronic signature pdf, e-sign pdf, digitally sign pdf free'
  },
  'compare-pdf': {
    title: 'Compare PDF Online | Free PDF Diff & Comparison Tool',
    desc: 'Compare two PDF documents side by side to quickly spot differences. Free online PDF comparison software.',
    keys: 'compare pdf, pdf diff, spot differences in pdf, compare two pdf files online free'
  },
  'redact-pdf': {
    title: 'Redact PDF Online | Blackout Text in PDF for Free',
    desc: 'Permanently remove sensitive information or blackout text in a PDF document. Free and secure PDF redaction tool.',
    keys: 'redact pdf, blackout text in pdf, censor pdf, hide text in pdf free'
  }
};

const allFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

for (const file of allFiles) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip files that are not tools (e.g. index.html, about.html, etc.) unless we want to optimize them.
  // We'll focus on the tool pages mapped in seoMap.
  const toolKey = file.replace('.html', '');
  const seoData = seoMap[toolKey];
  
  if (!seoData) continue;
  
  const pageUrl = `${domain}/${toolKey}`;
  const toolNameRaw = toolKey.split('-').map(w => {
    if (w === 'pdf') return 'PDF';
    if (w === 'jpg') return 'JPG';
    if (w === 'ocr') return 'OCR';
    if (w === 'ppt') return 'PPT';
    if (w === 'html') return 'HTML';
    if (w === 'doc' || w === 'docx') return 'Word';
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');

  const injectedHead = `  <title>${seoData.title}</title>
  <meta name="description" content="${seoData.desc}" />
  <meta name="keywords" content="${seoData.keys}" />
  <meta name="author" content="PDFMagic" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${pageUrl}" />
  
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${pageUrl}" />
  <meta property="og:title" content="${seoData.title}" />
  <meta property="og:description" content="${seoData.desc}" />
  <meta property="og:image" content="${domain}/og-image.svg" />
  
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${seoData.title}" />
  <meta name="twitter:description" content="${seoData.desc}" />
  
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "PDFMagic ${toolNameRaw}",
        "url": "${pageUrl}",
        "description": "${seoData.desc}",
        "applicationCategory": "UtilityApplication",
        "operatingSystem": "All",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      },
      {
        "@type": "HowTo",
        "name": "How to ${toolNameRaw} Online Free",
        "description": "${seoData.desc}",
        "step": [
          { "@type": "HowToStep", "text": "Select or drag & drop your files into the upload area." },
          { "@type": "HowToStep", "text": "Adjust any necessary settings and options." },
          { "@type": "HowToStep", "text": "Click the process button to start." },
          { "@type": "HowToStep", "text": "Download your new file instantly." }
        ]
      }
    ]
  }
  </script>`;

  // Regex to match from <title> up to the end of the <script type="application/ld+json"> block
  // The current files have <title>...</title> then meta tags then <link rel="canonical"> then OpenGraph tags then JSON-LD schema
  // We can just replace everything from <title> up to </script> before <link rel="stylesheet"
  
  const headRegex = /<title>[\s\S]*?<\/script>\s*(?=<link rel="stylesheet" href="\/styles\.css">)/;
  
  if (headRegex.test(content)) {
    content = content.replace(headRegex, injectedHead + '\\n  ');
    fs.writeFileSync(filePath, content);
    console.log('Optimized SEO for: ' + file);
  } else {
    // If it fails to match, let's try a broader regex from <title> to before </head>
    const fallbackRegex = /<title>[\s\S]*?(?=<\/head>)/;
    if (fallbackRegex.test(content)) {
        // We need to keep the stylesheet link if it's there
        let existingStyles = content.match(/<link rel="stylesheet"[\s\S]*?(?=<\/head>)/);
        let finalReplacement = injectedHead + '\\n  ';
        if (existingStyles && !injectedHead.includes(existingStyles[0])) {
            finalReplacement += existingStyles[0] + '\\n';
        }
        content = content.replace(fallbackRegex, finalReplacement);
        fs.writeFileSync(filePath, content);
        console.log('Optimized SEO (fallback) for: ' + file);
    } else {
        console.log('Failed to match head block in: ' + file);
    }
  }
}
