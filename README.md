# Image Renamer

A browser-based tool to bulk rename and reorder images before downloading them as a ZIP file.

## Setup

**Requirements:** Node.js 18+

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

1. **Add images** — drag and drop image files onto the drop zone, or click to browse. You can add more images at any time.
2. **Set a prefix** — type a name in the prefix field. Images will be renamed to `{prefix}_01.jpg`, `{prefix}_02.jpg`, etc.
3. **Reorder** — drag cards to rearrange. The numbering updates to match the new order.
4. **Select** — click a card to select it. Hold Shift and click to select a range. Use the toolbar to select all or deselect all.
5. **Remove** — select images and click "Remove selected", or remove them individually.
6. **Download** — click Download to get a ZIP file containing all images renamed with the chosen prefix.
