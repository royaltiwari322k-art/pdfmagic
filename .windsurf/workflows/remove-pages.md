---
description: How to implement the Remove Pages PDF feature
---

# Remove Pages Implementation Guide

## Overview
Remove specific pages from a PDF document while preserving the rest of the content.

## Technical Implementation

### Step 1: Backend Endpoint

Add to `server.js`:

```javascript
// Remove Pages from PDF
app.post('/remove-pages', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }

    const { pagesToRemove } = req.body; // e.g., "1,3,5" or "1-3,7,10-12"
    
    if (!pagesToRemove) {
      return res.status(400).json({ error: 'Please specify pages to remove' });
    }

    // Parse page ranges
    const pagesToRemoveSet = parsePageRanges(pagesToRemove);
    
    const existingPdfBytes = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    const totalPages = pdfDoc.getPageCount();
    const pagesToKeep = [];
    
    for (let i = 0; i < totalPages; i++) {
      if (!pagesToRemoveSet.has(i + 1)) { // Pages are 1-indexed in UI
        pagesToKeep.push(i);
      }
    }
    
    // Create new PDF with only kept pages
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

// Helper function to parse page ranges
function parsePageRanges(rangeString) {
  const pages = new Set();
  const parts = rangeString.split(',');
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
      for (let i = start; i <= end; i++) {
        pages.add(i);
      }
    } else {
      pages.add(parseInt(trimmed));
    }
  }
  
  return pages;
}
```

### Step 2: Frontend Options

Add to `pdf-processor.js` in `showOptionsAndProcess()`:

```javascript
case '/remove-pages':
  optionsHTML = `
    <div class="option-group">
      <label>Pages to Remove (e.g., 1,3,5 or 1-3,7):</label>
      <input type="text" id="pagesToRemove" placeholder="1,3,5-7" required>
      <small style="color: #6b7280;">Separate pages with commas, use dash for ranges</small>
    </div>
    <div class="page-preview" id="pagePreview" style="margin-top: 12px; padding: 12px; background: #f9fafb; border-radius: 8px;">
      <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">Total pages: <span id="totalPages">Loading...</span></p>
    </div>
  `;
  break;
```

### Step 3: Add Form Data

In `addToolOptionsToFormData()`:

```javascript
case '/remove-pages':
  const pagesToRemove = document.getElementById('pagesToRemove');
  if (pagesToRemove) formData.append('pagesToRemove', pagesToRemove.value);
  break;
```

### Step 4: Download Filename

In `getDownloadFileName()`:

```javascript
'/remove-pages': `removed-pages-${now}.pdf`,
```

## UI/UX Considerations

1. **Page Preview**: Show total pages in the uploaded PDF
2. **Validation**: Validate page numbers before processing
3. **Visual Feedback**: Show which pages will be removed
4. **Confirmation**: Warn if removing many pages

## Testing

Test cases:
- Remove single page: "5"
- Remove multiple pages: "1,3,5"
- Remove range: "2-6"
- Remove mixed: "1,3-5,8,10-12"
- Edge case: Remove all pages (should error)
- Edge case: Invalid page numbers (should error)

## Future Enhancements

1. Visual page thumbnails with checkboxes
2. Drag-to-select multiple pages
3. Preview of resulting PDF
4. Undo/Redo functionality
