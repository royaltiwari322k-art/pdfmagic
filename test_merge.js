const fs = require('fs');
const FormData = require('form-data');
const { PDFDocument } = require('pdf-lib');

async function createTestPDF(filename) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  page.drawText('Test ' + filename, { x: 50, y: 500 });
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filename, pdfBytes);
}

async function testMerge() {
  await createTestPDF('test1.pdf');
  await createTestPDF('test2.pdf');

  const form = new FormData();
  form.append('pdfs', fs.createReadStream('test1.pdf'));
  form.append('pdfs', fs.createReadStream('test2.pdf'));

  const fetch = (await import('node-fetch')).default;
  try {
    const res = await fetch('http://localhost:3000/merge-pdf', {
      method: 'POST',
      body: form
    });
    console.log('Status:', res.status);
    if (!res.ok) {
      console.log('Error:', await res.text());
    } else {
      console.log('Success, received blob size:', (await res.blob()).size);
    }
  } catch (e) {
    console.log('Fetch error:', e.message);
  }
}

testMerge();
