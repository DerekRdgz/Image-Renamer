import { useState, useCallback, useRef } from 'react';
import styles from './DropZone.module.css';

export default function DropZone({ onFilesAdded, hasImages }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      onFilesAdded(e.dataTransfer.files);
    }
  }, [onFilesAdded]);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e) => {
    if (e.target.files?.length) {
      onFilesAdded(e.target.files);
      e.target.value = '';
    }
  };

  if (hasImages) {
    return (
      <button className={styles.addMoreBtn} onClick={handleClick}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Agregar más
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </button>
    );
  }

  return (
    <div
      className={`${styles.dropZone} ${isDragging ? styles.active : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <div className={styles.content}>
        <div className={styles.icon}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
            <path d="M6 32l10-10 8 8 6-6 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="16" cy="20" r="3" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <p className={styles.title}>Arrastra imágenes aquí</p>
        <p className={styles.subtitle}>o haz clic para seleccionar archivos</p>
        <span className={styles.hint}>JPG, PNG, GIF, WebP, SVG</span>
      </div>
    </div>
  );
}
