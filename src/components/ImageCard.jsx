import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './ImageCard.module.css';
import { formatFileSize } from '../utils/imageUtils';

function ImageCard({ image, index, newName, isSelected, onToggleSelect, onRemove, viewMode, isGhostDrag }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : isGhostDrag ? 0.3 : 1,
    zIndex: isDragging ? 100 : 'auto',
  };

  const handleClick = (e) => {
    if (e.target.closest(`.${styles.removeBtn}`)) return;
    onToggleSelect(image.id, e.shiftKey);
  };

  if (viewMode === 'grid') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`${styles.gridCard} ${isSelected ? styles.selected : ''} ${isDragging ? styles.dragging : ''} ${isGhostDrag ? styles.ghost : ''}`}
        onClick={handleClick}
        {...attributes}
        {...listeners}
      >
        <div className={styles.gridThumb} style={{ aspectRatio: '1' }}>
          {image.thumbUrl ? (
            <img src={image.thumbUrl} alt={image.originalName} loading="lazy" />
          ) : (
            <div className={styles.noThumb}>?</div>
          )}
          <div className={styles.gridIndex}>{index + 1}</div>
          <button
            className={styles.gridRemoveBtn}
            onClick={(e) => { e.stopPropagation(); onRemove(image.id); }}
            title="Eliminar"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          {isSelected && (
            <div className={styles.gridCheck}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
        <div className={styles.gridInfo}>
          <span className={styles.gridName} title={newName !== image.originalName ? newName : image.originalName}>
            {newName !== image.originalName ? newName : image.originalName}
          </span>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isSelected ? styles.selected : ''} ${isDragging ? styles.dragging : ''} ${isGhostDrag ? styles.ghost : ''}`}
      onClick={handleClick}
    >
      <div className={styles.dragHandle} {...attributes} {...listeners}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <circle cx="3" cy="2" r="1.2"/><circle cx="9" cy="2" r="1.2"/>
          <circle cx="3" cy="6" r="1.2"/><circle cx="9" cy="6" r="1.2"/>
          <circle cx="3" cy="10" r="1.2"/><circle cx="9" cy="10" r="1.2"/>
        </svg>
      </div>

      <div className={styles.indexBadge}>{index + 1}</div>

      <div className={styles.thumb}>
        {image.thumbUrl ? (
          <img src={image.thumbUrl} alt={image.originalName} loading="lazy" />
        ) : (
          <div className={styles.noThumb}>?</div>
        )}
      </div>

      <div className={styles.info}>
        <span className={styles.originalName} title={image.originalName}>
          {image.originalName}
        </span>
        {newName !== image.originalName && (
          <span className={styles.newName} title={newName}>
            → {newName}
          </span>
        )}
        <span className={styles.meta}>
          {image.width}×{image.height} · {formatFileSize(image.size)}
        </span>
      </div>

      <button
        className={styles.removeBtn}
        onClick={(e) => { e.stopPropagation(); onRemove(image.id); }}
        title="Eliminar"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {isSelected && (
        <div className={styles.checkmark}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  );
}

export default memo(ImageCard);
