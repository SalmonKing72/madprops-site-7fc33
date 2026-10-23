import * as React from 'react';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import Image from 'next/image';
import { ImageGallery, ImageGalleryItem } from '../../../types/gallery';

interface ImageModalProps {
  isOpen: boolean;
  gallery: ImageGallery | null;
  currentIndex: number;
  viewMode: 'grid' | 'single';
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onImageClick: (index: number) => void;
  onViewModeChange: (mode: 'grid' | 'single') => void;
}

export default function ImageModal({
  isOpen,
  gallery,
  currentIndex,
  viewMode,
  onClose,
  onNext,
  onPrev,
  onImageClick,
  onViewModeChange
}: ImageModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleArrows = (e: KeyboardEvent) => {
      if (viewMode === 'single') {
        if (e.key === 'ArrowRight') onNext();
        if (e.key === 'ArrowLeft') onPrev();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleArrows);
    }
    return () => window.removeEventListener('keydown', handleArrows);
  }, [isOpen, viewMode, onNext, onPrev]);

  if (!isOpen || !gallery) return null;

  const currentImage = gallery.images[currentIndex];

  // Get adjacent images for preloading
  const prevImage = currentIndex > 0 ? gallery.images[currentIndex - 1] : null;
  const nextImage = currentIndex < gallery.images.length - 1 ? gallery.images[currentIndex + 1] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full max-w-7xl mx-auto p-4 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 text-white">
          <div>
            {gallery.title && (
              <h2 className="text-2xl sm:text-3xl font-bold">{gallery.title}</h2>
            )}
            {viewMode === 'single' && (
              <p className="text-sm sm:text-base text-gray-300 mt-1">
                {currentIndex + 1} / {gallery.images.length}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {viewMode === 'single' && (
              <button
                onClick={() => onViewModeChange('grid')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm sm:text-base"
                aria-label="Back to grid view"
              >
                Grid View
              </button>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close gallery"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="h-[calc(100%-5rem)] overflow-auto">
          {viewMode === 'grid' ? (
            <GridView images={gallery.images} onImageClick={onImageClick} />
          ) : (
            <SingleView
              image={currentImage}
              onNext={onNext}
              onPrev={onPrev}
              hasNext={currentIndex < gallery.images.length - 1}
              hasPrev={currentIndex > 0}
            />
          )}
        </div>

        {/* Preload adjacent images in single view */}
        {viewMode === 'single' && (
          <>
            {prevImage && !prevImage.isVideo && (
              <link rel="preload" as="image" href={prevImage.url} />
            )}
            {nextImage && !nextImage.isVideo && (
              <link rel="preload" as="image" href={nextImage.url} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function GridView({ images, onImageClick }: { images: ImageGalleryItem[]; onImageClick: (index: number) => void }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image, index) => {
        const isPriority = index < 6; // Prioritize first 6 images
        const imageUrl = image.thumbnailUrl || image.url;

        return (
          <div
            key={index}
            className="relative aspect-[4/3] bg-gray-800 rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => onImageClick(index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {image.isVideo ? (
              <video
                src={image.url}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                muted
                loop
                playsInline
              />
            ) : (
              <Image
                src={imageUrl}
                alt={image.altText}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                quality={75}
                priority={isPriority}
                loading={isPriority ? 'eager' : 'lazy'}
                placeholder={image.blurDataURL ? 'blur' : 'empty'}
                blurDataURL={image.blurDataURL}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {image.caption && (
                  <p className="text-white text-sm font-medium">{image.caption}</p>
                )}
              </div>
            </div>

            {/* Preload full-res image on hover */}
            {hoveredIndex === index && !image.isVideo && (
              <link rel="preload" as="image" href={image.url} />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface SingleViewProps {
  image: ImageGalleryItem;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

function SingleView({ image, onNext, onPrev, hasNext, hasPrev }: SingleViewProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative h-full flex flex-col items-center justify-center">
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Previous image"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Next image"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <div className="max-w-full max-h-full flex items-center justify-center relative">
        {image.isVideo ? (
          <video
            src={image.url}
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
            controls
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <>
            {isLoading && image.blurDataURL && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse text-white">Loading...</div>
              </div>
            )}
            <Image
              src={image.url}
              alt={image.altText}
              width={image.width || 1200}
              height={image.height || 800}
              className="max-w-full max-h-[70vh] object-contain rounded-lg w-auto h-auto"
              quality={90}
              priority
              placeholder={image.blurDataURL ? 'blur' : 'empty'}
              blurDataURL={image.blurDataURL}
              onLoadingComplete={() => setIsLoading(false)}
            />
          </>
        )}
      </div>

      {image.caption && (
        <div className="mt-6 text-center">
          <p className="text-white text-lg">{image.caption}</p>
        </div>
      )}
    </div>
  );
}
