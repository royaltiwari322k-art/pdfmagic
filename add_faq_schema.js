const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\abhis\\OneDrive\\Desktop\\pdfmagic';
const domain = 'https://www.wwwpdfmagic.live';

const faqMap = {
  'merge-pdf': [
    { q: "Is it safe to merge PDF files online?", a: "Yes. PDFMagic uses SSL encryption to ensure your files are processed securely. Your files are automatically deleted from our servers within minutes of processing." },
    { q: "Can I merge PDFs on my mobile phone?", a: "Absolutely! PDFMagic is fully optimized for all devices including Android and iOS. You can merge files directly from your mobile browser." },
    { q: "Is there a limit to how many files I can merge?", a: "You can merge up to 20 PDF files at once, completely free of charge without any premium paywalls." }
  ],
  'compress-pdf': [
    { q: "Will compressing my PDF reduce its quality?", a: "Our advanced compression algorithm optimizes your PDF by reducing file size while maintaining the visual quality of text and images." },
    { q: "Is this PDF compressor free to use?", a: "Yes, our PDF compression tool is 100% free with no hidden fees or watermarks added to your documents." },
    { q: "How long does it take to compress a PDF?", a: "Compression usually takes only a few seconds, depending on the original file size and your internet connection speed." }
  ],
  'split-pdf': [
    { q: "How do I extract only one page from a PDF?", a: "Simply upload your PDF, choose the 'Extract Pages' option, and select the specific page number you want to separate into a new document." },
    { q: "Are my split PDF files kept private?", a: "Yes, all processing is done securely. We do not store or analyze your documents. They are wiped from our servers immediately." }
  ],
  'pdf-to-jpg': [
    { q: "How do I convert a PDF to an image?", a: "Upload your PDF file, and our tool will automatically convert each page of your PDF into a high-quality JPG image for you to download." },
    { q: "Do I lose quality when converting PDF to JPG?", a: "No, PDFMagic extracts images and converts pages at a high resolution to ensure your JPGs look crisp and clear." }
  ],
  'jpg-to-pdf': [
    { q: "Can I convert multiple JPGs into one PDF?", a: "Yes! You can upload multiple JPG images at once, arrange them in your preferred order, and convert them into a single PDF document." },
    { q: "Does converting images to PDF reduce their quality?", a: "Our converter preserves the original quality of your images while packaging them neatly into a standard PDF format." }
  ]
};

// Default FAQs for tools not explicitly defined above
const defaultFaqs = [
  { q: "Is it safe to use this tool online?", a: "Yes. PDFMagic uses SSL encryption to ensure your files are processed securely. Your files are automatically deleted from our servers within minutes." },
  { q: "Does this tool work on mobile devices?", a: "Absolutely! PDFMagic is fully optimized for all devices including smartphones and tablets. You can process files directly from your mobile browser." },
  { q: "Is this service completely free?", a: "Yes, all PDFMagic tools are 100% free to use. There are no premium subscriptions, no hidden fees, and no watermarks." }
];

const allFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

for (const file of allFiles) {
  if (file === 'index.html' || file === 'blog.html' || file === 'about.html' || file === 'contact.html' || file === 'privacy.html' || file === 'terms.html' || file === 'pricing.html') continue;
  
  const toolKey = file.replace('.html', '');
  const faqs = faqMap[toolKey] || defaultFaqs;
  
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has FAQs
  if (content.includes('<!-- FAQ SECTION -->')) continue;

  // 1. GENERATE HTML
  let faqHtml = `\n    <!-- FAQ SECTION -->\n    <div class="page-content" style="padding:48px 0; border-top:1px solid var(--border); margin-top:48px;">\n      <h2 style="text-align:center; margin-bottom:32px;">Frequently Asked Questions</h2>\n      <div class="faq-container" style="max-width:800px; margin:0 auto;">\n`;
  
  faqs.forEach(faq => {
    faqHtml += `        <div style="margin-bottom:24px; background:#fff; padding:24px; border-radius:12px; border:1px solid var(--border); box-shadow:0 2px 8px rgba(0,0,0,0.02);">
          <h3 style="font-size:1.2rem; margin-bottom:12px; color:var(--text-color);">🤔 ${faq.q}</h3>
          <p style="color:var(--text-muted); line-height:1.6;">${faq.a}</p>
        </div>\n`;
  });
  faqHtml += `      </div>\n    </div>\n`;

  // 2. GENERATE JSON-LD SCHEMA
  const mainEntity = faqs.map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.a
    }
  }));

  const schemaHtml = `\n  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": ${JSON.stringify(mainEntity)}
  }
  </script>\n`;

  // Inject HTML right before RELATED TOOLS
  const htmlTarget = '<!-- RELATED TOOLS -->';
  if (content.includes(htmlTarget)) {
    content = content.replace(htmlTarget, faqHtml + '    ' + htmlTarget);
  }

  // Inject Schema right before </head>
  const headTarget = '</head>';
  if (content.includes(headTarget)) {
    content = content.replace(headTarget, schemaHtml + '</head>');
  }

  fs.writeFileSync(filePath, content);
  console.log('Injected FAQs for: ' + file);
}
