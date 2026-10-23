export interface ImageGalleryItem {
  url: string;
  altText: string;
  caption?: string;
  thumbnailUrl?: string;
  blurDataURL?: string;
  width?: number;
  height?: number;
  isVideo?: boolean;
}

export interface ImageGallery {
  id: string;
  title?: string;
  images: ImageGalleryItem[];
}

export interface GalleryContextValue {
  isOpen: boolean;
  currentGallery: ImageGallery | null;
  currentImageIndex: number;
  viewMode: 'grid' | 'single';
  openGallery: (galleryId: string) => void;
  closeGallery: () => void;
  nextImage: () => void;
  prevImage: () => void;
  setImageIndex: (index: number) => void;
  setViewMode: (mode: 'grid' | 'single') => void;
}

export interface GalleriesData {
  galleries: ImageGallery[];
}
