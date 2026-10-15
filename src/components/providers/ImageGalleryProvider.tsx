import * as React from 'react';
import { ImageGalleryProvider as ContextProvider } from '../../contexts/ImageGalleryContext';
import { useImageGallery } from '../../contexts/ImageGalleryContext';
import ImageModal from '../atoms/ImageModal';
import { ImageGallery } from '../../types/gallery';

interface Props {
  children: React.ReactNode;
  galleries: ImageGallery[];
}

function ModalRenderer() {
  const {
    isOpen,
    currentGallery,
    currentImageIndex,
    viewMode,
    closeGallery,
    nextImage,
    prevImage,
    setImageIndex,
    setViewMode
  } = useImageGallery();

  return (
    <ImageModal
      isOpen={isOpen}
      gallery={currentGallery}
      currentIndex={currentImageIndex}
      viewMode={viewMode}
      onClose={closeGallery}
      onNext={nextImage}
      onPrev={prevImage}
      onImageClick={setImageIndex}
      onViewModeChange={setViewMode}
    />
  );
}

export default function ImageGalleryProvider({ children, galleries = [] }: Props) {
  return (
    <ContextProvider galleries={galleries}>
      {children}
      <ModalRenderer />
    </ContextProvider>
  );
}
