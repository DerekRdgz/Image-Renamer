import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import ImageCard from './ImageCard';
import styles from './ImageGrid.module.css';

export default function ImageGrid({
  images,
  selectedIds,
  onReorder,
  onToggleSelect,
  onRemove,
  viewMode,
  thumbSize,
}) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      onReorder(active.id, over.id);
    }
  }, [onReorder]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const handleRemove = useCallback((id) => {
    onRemove([id]);
  }, [onRemove]);

  const activeImage = activeId ? images.find(img => img.id === activeId) : null;
  const dragCount = activeId && selectedIds.has(activeId) ? selectedIds.size : 1;
  const isGrid = viewMode === 'grid';
  const strategy = isGrid ? rectSortingStrategy : verticalListSortingStrategy;

  return (
    <div className={styles.container}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={images.map(img => img.id)}
          strategy={strategy}
        >
          <div
            className={isGrid ? styles.grid : styles.list}
            style={isGrid ? { '--thumb-size': `${thumbSize}px` } : undefined}
          >
            {images.map((img, index) => (
              <ImageCard
                key={img.id}
                image={img}
                index={index}
                newName={img.newName || img.originalName}
                isSelected={selectedIds.has(img.id)}
                onToggleSelect={onToggleSelect}
                onRemove={handleRemove}
                viewMode={viewMode}
                thumbSize={thumbSize}
                isGhostDrag={activeId !== null && selectedIds.has(activeId) && selectedIds.has(img.id) && img.id !== activeId}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={null}>
          {activeImage ? (
            <div className={styles.dragOverlay}>
              <div className={isGrid ? styles.dragOverlayGrid : styles.dragOverlayList}
                   style={isGrid ? { width: thumbSize, height: thumbSize } : undefined}>
                {activeImage.thumbUrl && (
                  <img src={activeImage.thumbUrl} alt="" className={styles.dragOverlayImg} />
                )}
              </div>
              {dragCount > 1 && (
                <div className={styles.dragBadge}>{dragCount}</div>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
