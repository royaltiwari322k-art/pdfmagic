const fs = require('fs');
const PDFMerger = require('pdf-merger-js');
const { PDFDocument } = require('pdf-lib');

async function createTestPDF(filename) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  page.drawText('Test ' + filename, { x: 50, y: 500 });
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filename, pdfBytes);
}

async function run() {
  await createTestPDF('test1.pdf');
  await createTestPDF('test2.pdf');

  try {
    console.log('Testing pdf-merger-js...');
    const merger = new PDFMerger();
    await merger.add('test1.pdf');
    await merger.add('test2.pdf');
    await merger.save('merged.pdf');
    console.log('Merge successful!');
  } catch (e) {
    console.log('Merge failed:', e);
  }
}

run();
