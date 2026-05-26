let idCounter = 0;

export function generateId() {
  return `img_${Date.now()}_${idCounter++}`;
}

export function getExtension(filename) {
  const idx = filename.lastIndexOf('.');
  return idx !== -1 ? filename.substring(idx) : '';
}

export function sortAlphabetically(files) {
  return [...files].sort((a, b) =>
    a.originalName.localeCompare(b.originalName, undefined, { numeric: true, sensitivity: 'base' })
  );
}

export function buildNewName(prefix, index, extension, padLength) {
  const num = String(index + 1).padStart(padLength, '0');
  return `${prefix}_${num}${extension}`;
}

export function createThumbnail(file, maxSize = 200) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > height) {
        if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
      } else {
        if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const thumbUrl = canvas.toDataURL('image/jpeg', 0.7);
      URL.revokeObjectURL(url);
      resolve({ thumbUrl, fullUrl: URL.createObjectURL(file), width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ thumbUrl: null, fullUrl: null, width: 0, height: 0 });
    };
    img.src = url;
  });
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}
