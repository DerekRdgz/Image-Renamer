import { useState, useCallback, useRef } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useImageStore } from './hooks/useImageStore';
import DropZone from './components/DropZone';
import Toolbar from './components/Toolbar';
import ImageGrid from './components/ImageGrid';
import PreviewPanel from './components/PreviewPanel';
import { buildNewName } from './utils/imageUtils';
import styles from './App.module.css';

export default function App() {
  const store = useImageStore();
  const previewImages = store.getPreviewNames();
  const [viewMode, setViewMode] = useState('grid');
  const [thumbSize, setThumbSize] = useState(180);
  const [splitView, setSplitView] = useState(false);
  // focusedPreviewId: the image currently shown in the preview panel.
  // Updated both by clicking a card in the grid AND by filmstrip/arrow navigation.
  const [focusedPreviewId, setFocusedPreviewId] = useState(null);

  // Split pane sizing (percentage of total width for the left/grid pane)
  const [splitPos, setSplitPos] = useState(40);
  const splitBodyRef = useRef(null);

  // ── Split pane drag ─────────────────────────────────────────────────────
  const handleSplitterMouseDown = useCallback((e) => {
    e.preventDefault();
    const body = splitBodyRef.current;
    if (!body) return;

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (mv) => {
      const rect = body.getBoundingClientRect();
      const pct = ((mv.clientX - rect.left) / rect.width) * 100;
      setSplitPos(Math.max(20, Math.min(75, pct)));
    };

    const onUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  // ── Selection + focus ───────────────────────────────────────────────────
  const handleToggleSelect = useCallback((id, shiftKey) => {
    store.toggleSelect(id, shiftKey);
    setFocusedPreviewId(id);
  }, [store]);

  // Called by PreviewPanel when the user navigates via filmstrip or arrows
  const handleFocusChange = useCallback((id) => {
    setFocusedPreviewId(id);
  }, []);

  const selectedImages = previewImages.filter(img => store.selectedIds.has(img.id));

  // ── Download ─────────────────────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    if (!store.prefix.trim() || store.images.length === 0) return;

    const zip = new JSZip();
    const padLen = String(store.images.length).length;

    store.images.forEach((img, i) => {
      const newName = buildNewName(store.prefix.trim(), i, img.extension, padLen);
      zip.file(newName, img.file);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${store.prefix.trim()}_images.zip`);
  }, [store.prefix, store.images]);

  const handleRemoveSelected = useCallback(() => {
    store.removeImages([...store.selectedIds]);
  }, [store]);

  const hasImages = store.images.length > 0;

  const imageGrid = (
    <ImageGrid
      images={previewImages}
      selectedIds={store.selectedIds}
      onReorder={store.reorderImages}
      onToggleSelect={handleToggleSelect}
      onRemove={store.removeImages}
      viewMode={viewMode}
      thumbSize={thumbSize}
    />
  );

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="1" y="3" width="20" height="16" rx="3" stroke="var(--accent)" strokeWidth="1.5"/>
            <path d="M1 15l6-6 4 4 3-3 7 7" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="7" cy="9" r="2" stroke="var(--accent)" strokeWidth="1.5"/>
          </svg>
          <h1 className={styles.title}>Image Renamer</h1>
        </div>
        {hasImages && (
          <DropZone onFilesAdded={store.addFiles} hasImages={true} />
        )}
      </header>

      {!hasImages ? (
        <div className={styles.emptyState}>
          <DropZone onFilesAdded={store.addFiles} hasImages={false} />
        </div>
      ) : (
        <div className={styles.workspace}>
          <Toolbar
            prefix={store.prefix}
            onPrefixChange={store.setPrefix}
            imageCount={store.images.length}
            selectedCount={store.selectedIds.size}
            onSelectAll={store.selectAll}
            onDeselectAll={store.deselectAll}
            onRemoveSelected={handleRemoveSelected}
            onClearAll={store.clearAll}
            onDownload={handleDownload}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            thumbSize={thumbSize}
            onThumbSizeChange={setThumbSize}
            splitView={splitView}
            onSplitViewChange={setSplitView}
          />
          {splitView ? (
            <div className={styles.splitBody} ref={splitBodyRef}>
              <div className={styles.gridPane} style={{ flex: `0 0 ${splitPos}%` }}>
                {imageGrid}
              </div>
              <div
                className={styles.splitter}
                onMouseDown={handleSplitterMouseDown}
              />
              <div className={styles.previewPane}>
                <PreviewPanel
                  selectedImages={selectedImages}
                  focusedId={focusedPreviewId}
                  onFocusChange={handleFocusChange}
                />
              </div>
            </div>
          ) : (
            imageGrid
          )}
        </div>
      )}

      {store.isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
          <span>Procesando imágenes...</span>
        </div>
      )}
    </div>
  );
}
