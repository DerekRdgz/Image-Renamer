import { useEffect, useCallback, useRef } from 'react';
import { formatFileSize } from '../utils/imageUtils';
import styles from './PreviewPanel.module.css';

// Pure display component — focus state is owned by App.jsx.
// onFocusChange(id) is called whenever the user navigates (filmstrip click / arrow key).
export default function PreviewPanel({ selectedImages, focusedId, onFocusChange }) {
  const stripRef = useRef(null);

  // ── Derive activeId during render — no state sync needed ─────────────────
  const activeId =
    selectedImages.length === 0
      ? null
      : selectedImages.some(img => img.id === focusedId)
        ? focusedId
        : selectedImages[0].id;

  const count = selectedImages.length;
  const activeIndex = selectedImages.findIndex(img => img.id === activeId);
  const activeImage = activeIndex >= 0 ? selectedImages[activeIndex] : null;

  // DOM side-effect only: scroll active thumbnail into view
  useEffect(() => {
    if (!stripRef.current || !activeId) return;
    const thumb = stripRef.current.querySelector(`[data-id="${activeId}"]`);
    thumb?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeId]);

  const go = useCallback((dir) => {
    if (count < 2) return;
    const next = (activeIndex + dir + count) % count;
    onFocusChange(selectedImages[next].id);
  }, [activeIndex, count, selectedImages, onFocusChange]);

  // Arrow key navigation — onFocusChange is called from the event handler
  // callback, which is NOT the effect body itself.
  useEffect(() => {
    const handler = (e) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [go]);

  // ── Empty state ───────────────────────────────────────────────────────────
  if (count === 0) {
    return (
      <div className={styles.panel}>
        <div className={styles.empty}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className={styles.emptyIcon}>
            <rect x="8" y="16" width="48" height="32" rx="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3"/>
            <circle cx="32" cy="32" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="32" cy="32" r="4" fill="currentColor" opacity="0.35"/>
            <line x1="32" y1="6" x2="32" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className={styles.emptyTitle}>Sin previsualización</span>
          <span className={styles.emptyHint}>Selecciona una imagen a la izquierda para verla aquí</span>
        </div>
      </div>
    );
  }

  // ── Preview ───────────────────────────────────────────────────────────────
  const isRenamed = activeImage && activeImage.newName !== activeImage.originalName;

  return (
    <div className={styles.panel}>
      {/* Hero ─────────────────────────────────────────────── */}
      <div className={styles.hero}>
        {/* Count badge */}
        {count > 1 && (
          <div className={styles.countBadge}>
            <span className={styles.countCurrent}>{activeIndex + 1}</span>
            <span className={styles.countSep}>/</span>
            <span className={styles.countTotal}>{count}</span>
          </div>
        )}

        {/* Arrow navigation */}
        {count > 1 && (
          <>
            <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={() => go(-1)} aria-label="Anterior">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M13 4l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={() => go(1)} aria-label="Siguiente">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}

        {/* Main image — key change triggers CSS pop-in animation each swap */}
        {activeImage && (
          <img
            key={activeImage.id}
            src={activeImage.fullUrl || activeImage.thumbUrl}
            alt={activeImage.newName || activeImage.originalName}
            className={styles.heroImg}
          />
        )}

        {/* Info overlay (fades in on hero hover) */}
        {activeImage && (
          <div className={styles.infoOverlay}>
            <span className={`${styles.infoName} ${isRenamed ? styles.infoNameRenamed : ''}`}>
              {isRenamed ? activeImage.newName : activeImage.originalName}
            </span>
            {isRenamed && (
              <span className={styles.infoOrig}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="M2 5h6M6 3l2 2-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {activeImage.originalName}
              </span>
            )}
            <span className={styles.infoMeta}>
              {activeImage.width}×{activeImage.height}
              <span className={styles.infoMetaDot}>·</span>
              {formatFileSize(activeImage.size)}
            </span>
          </div>
        )}
      </div>

      {/* Filmstrip ─────────────────────────────────────────── */}
      {count > 1 && (
        <div className={styles.filmstrip} ref={stripRef}>
          {selectedImages.map((img, i) => {
            const isActive = img.id === activeId;
            return (
              <button
                key={img.id}
                data-id={img.id}
                className={`${styles.filmThumb} ${isActive ? styles.filmActive : ''}`}
                onClick={() => onFocusChange(img.id)}
                title={img.newName || img.originalName}
              >
                {img.thumbUrl ? (
                  <img src={img.thumbUrl} alt="" />
                ) : (
                  <span className={styles.filmPlaceholder}>{i + 1}</span>
                )}
                {isActive && <div className={styles.filmActiveLine} />}
              </button>
            );
          })}
          {/* Keyboard shortcut hint */}
          <div className={styles.filmHint}>
            <kbd>←</kbd><kbd>→</kbd>
          </div>
        </div>
      )}
    </div>
  );
}
