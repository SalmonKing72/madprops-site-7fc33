import * as React from 'react';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ImageGallery, GalleryContextValue } from '../types/gallery';

const ImageGalleryContext = createContext<GalleryContextValue | null>(null);

interface ImageGalleryProviderProps {
  children: ReactNode;
  galleries: ImageGallery[];
}

export function ImageGalleryProvider({ children, galleries }: ImageGalleryProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentGallery, setCurrentGallery] = useState<ImageGallery | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid');

  const openGallery = useCallback((galleryId: string) => {
    const gallery = galleries.find(g => g.id === galleryId);
    if (gallery) {
      setCurrentGallery(gallery);
      setCurrentImageIndex(0);
      setViewMode('grid');
      setIsOpen(true);
    }
  }, [galleries]);

  const closeGallery = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setCurrentGallery(null);
      setCurrentImageIndex(0);
      setViewMode('grid');
    }, 300);
  }, []);

  const nextImage = useCallback(() => {
    if (currentGallery && currentImageIndex < currentGallery.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  }, [currentGallery, currentImageIndex]);

  const prevImage = useCallback(() => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  }, [currentImageIndex]);

  const setImageIndex = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setViewMode('single');
  }, []);

  const value: GalleryContextValue = {
    isOpen,
    currentGallery,
    currentImageIndex,
    viewMode,
    openGallery,
    closeGallery,
    nextImage,
    prevImage,
    setImageIndex,
    setViewMode
  };

  return (
    <ImageGalleryContext.Provider value={value}>
      {children}
    </ImageGalleryContext.Provider>
  );
}

export function useImageGallery() {
  const context = useContext(ImageGalleryContext);
  if (!context) {
    throw new Error('useImageGallery must be used within ImageGalleryProvider');
  }
  return context;
}
