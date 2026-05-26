import { useState, useCallback, useRef } from 'react';
import { generateId, getExtension, sortAlphabetically, createThumbnail, buildNewName } from '../utils/imageUtils';

export function useImageStore() {
  const [images, setImages] = useState([]);
  const [prefix, setPrefix] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const lastClickedRef = useRef(null);
  const processingRef = useRef(false);

  const addFiles = useCallback(async (fileList) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setIsLoading(true);

    const validFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    const batchSize = 10;
    const newImages = [];

    for (let i = 0; i < validFiles.length; i += batchSize) {
      const batch = validFiles.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (file) => {
          const { thumbUrl, fullUrl, width, height } = await createThumbnail(file);
          return {
            id: generateId(),
            file,
            originalName: file.name,
            extension: getExtension(file.name),
            thumbUrl,
            fullUrl,
            width,
            height,
            size: file.size,
          };
        })
      );
      newImages.push(...results);
    }

    setImages(prev => sortAlphabetically([...prev, ...newImages]));
    setIsLoading(false);
    processingRef.current = false;
  }, []);

  const removeImages = useCallback((idsToRemove) => {
    const removeSet = new Set(idsToRemove);
    setImages(prev => {
      prev.forEach(img => {
        if (removeSet.has(img.id) && img.fullUrl) URL.revokeObjectURL(img.fullUrl);
      });
      return prev.filter(img => !removeSet.has(img.id));
    });
    setSelectedIds(prev => {
      const next = new Set(prev);
      idsToRemove.forEach(id => next.delete(id));
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setImages(prev => {
      prev.forEach(img => { if (img.fullUrl) URL.revokeObjectURL(img.fullUrl); });
      return [];
    });
    setSelectedIds(new Set());
  }, []);

  // Multi-drag aware reorder: if dragged item is selected, move ALL selected as a group
  const reorderImages = useCallback((activeId, overId) => {
    setImages(prev => {
      const isActiveSelected = selectedIds.has(activeId);

      if (isActiveSelected && selectedIds.size > 1) {
        // Multi-drag: move all selected items to the drop position
        const selected = [];
        const rest = [];
        prev.forEach(img => {
          if (selectedIds.has(img.id)) selected.push(img);
          else rest.push(img);
        });
        // Find where overId sits in the "rest" array
        let insertIdx = rest.findIndex(img => img.id === overId);
        if (insertIdx === -1) insertIdx = rest.length;
        // If dropping after original position, insert after
        const oldFirstIdx = prev.findIndex(img => img.id === activeId);
        const overIdx = prev.findIndex(img => img.id === overId);
        if (overIdx > oldFirstIdx) insertIdx++;

        rest.splice(insertIdx, 0, ...selected);
        return rest;
      } else {
        // Single drag
        const oldIndex = prev.findIndex(img => img.id === activeId);
        const newIndex = prev.findIndex(img => img.id === overId);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const next = [...prev];
        const [moved] = next.splice(oldIndex, 1);
        next.splice(newIndex, 0, moved);
        return next;
      }
    });
  }, [selectedIds]);

  // Shift+click range select, normal click toggle
  const toggleSelect = useCallback((id, shiftKey = false) => {
    setSelectedIds(prev => {
      if (shiftKey && lastClickedRef.current) {
        // Range select
        const currentImages = images;
        const lastIdx = currentImages.findIndex(img => img.id === lastClickedRef.current);
        const thisIdx = currentImages.findIndex(img => img.id === id);
        if (lastIdx !== -1 && thisIdx !== -1) {
          const start = Math.min(lastIdx, thisIdx);
          const end = Math.max(lastIdx, thisIdx);
          const next = new Set(prev);
          for (let i = start; i <= end; i++) {
            next.add(currentImages[i].id);
          }
          lastClickedRef.current = id;
          return next;
        }
      }
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      lastClickedRef.current = id;
      return next;
    });
  }, [images]);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(images.map(img => img.id)));
  }, [images]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const getPreviewNames = useCallback(() => {
    if (!prefix.trim()) return images.map(img => ({ ...img, newName: img.originalName }));
    const padLen = String(images.length).length;
    return images.map((img, i) => ({
      ...img,
      newName: buildNewName(prefix.trim(), i, img.extension, padLen),
    }));
  }, [images, prefix]);

  return {
    images,
    prefix,
    setPrefix,
    isLoading,
    selectedIds,
    addFiles,
    removeImages,
    clearAll,
    reorderImages,
    toggleSelect,
    selectAll,
    deselectAll,
    getPreviewNames,
  };
}
