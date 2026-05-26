import styles from './Toolbar.module.css';

export default function Toolbar({
  prefix,
  onPrefixChange,
  imageCount,
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onRemoveSelected,
  onClearAll,
  onDownload,
  viewMode,
  onViewModeChange,
  thumbSize,
  onThumbSizeChange,
}) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.topRow}>
        <div className={styles.prefixGroup}>
          <label className={styles.label}>Prefijo</label>
          <input
            type="text"
            className={styles.prefixInput}
            value={prefix}
            onChange={(e) => onPrefixChange(e.target.value)}
            placeholder="Ej: Casa, Viaje, Proyecto..."
            spellCheck={false}
          />
          {prefix && (
            <span className={styles.preview}>
              → {prefix}_1, {prefix}_2, {prefix}_3...
            </span>
          )}
        </div>

        <div className={styles.viewControls}>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewActive : ''}`}
              onClick={() => onViewModeChange('list')}
              title="Vista lista"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewActive : ''}`}
              onClick={() => onViewModeChange('grid')}
              title="Vista grilla"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="9.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="1.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
            </button>
          </div>

          {viewMode === 'grid' && (
            <div className={styles.sizeSlider}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className={styles.sizeIcon}>
                <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <input
                type="range"
                min="100"
                max="320"
                step="10"
                value={thumbSize}
                onChange={(e) => onThumbSizeChange(Number(e.target.value))}
                className={styles.slider}
              />
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className={styles.sizeIcon}>
                <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <div className={styles.stats}>
          <span className={styles.count}>{imageCount} imagen{imageCount !== 1 ? 'es' : ''}</span>
          {selectedCount > 0 && (
            <span className={styles.selectedCount}>
              {selectedCount} seleccionada{selectedCount !== 1 ? 's' : ''}
              <span className={styles.hint}> · Shift+clic para rango</span>
            </span>
          )}
        </div>

        <div className={styles.buttons}>
          {selectedCount > 0 ? (
            <>
              <button className={styles.btn} onClick={onDeselectAll}>
                Deseleccionar
              </button>
              <button className={`${styles.btn} ${styles.danger}`} onClick={onRemoveSelected}>
                Eliminar ({selectedCount})
              </button>
            </>
          ) : (
            <>
              <button className={styles.btn} onClick={onSelectAll} disabled={imageCount === 0}>
                Seleccionar todo
              </button>
              <button
                className={`${styles.btn} ${styles.danger}`}
                onClick={onClearAll}
                disabled={imageCount === 0}
              >
                Limpiar todo
              </button>
            </>
          )}
          <button
            className={`${styles.btn} ${styles.primary}`}
            onClick={onDownload}
            disabled={imageCount === 0 || !prefix.trim()}
            title={!prefix.trim() ? 'Escribe un prefijo primero' : ''}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v8M3 7l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Descargar ZIP
          </button>
        </div>
      </div>
    </div>
  );
}
