import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Image, Eye, Download, X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  repairId?: number;
  className?: string;
}

interface ImageViewerProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

function ImageViewer({ images, initialIndex = 0, open, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  if (!images.length) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const downloadImage = () => {
    const imageUrl = images[currentIndex];
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `repair-image-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              รูปภาพแนบ ({currentIndex + 1} จาก {images.length})
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadImage}
                className="flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                ดาวน์โหลด
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="relative flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="absolute left-4 z-10 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
                onClick={prevImage}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-4 z-10 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
                onClick={nextImage}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
          
          {/* Main image */}
          <img
            src={images[currentIndex]}
            alt={`รูปภาพแนบ ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement?.insertAdjacentHTML('beforeend', 
                '<div class="flex items-center justify-center p-8 text-gray-500 dark:text-gray-400">ไม่สามารถโหลดรูปภาพได้</div>'
              );
            }}
          />
        </div>
        
        {/* Thumbnail navigation */}
        {images.length > 1 && (
          <div className="p-4 border-t">
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                    index === currentIndex 
                      ? 'border-orange-500 ring-2 ring-orange-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`ย่อ ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement?.insertAdjacentHTML('beforeend', 
                        '<div class="flex items-center justify-center w-full h-full bg-gray-100 text-xs text-gray-400">Error</div>'
                      );
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ImageGallery({ images, repairId, className }: ImageGalleryProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 dark:text-gray-400 ${className}`}>
        <Image className="w-4 h-4" />
        <span className="text-sm">ไม่มีรูปภาพแนบ</span>
      </div>
    );
  }

  const openViewer = (index: number = 0) => {
    setSelectedImageIndex(index);
    setViewerOpen(true);
  };

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          <Image className="w-4 h-4 text-orange-600" />
          <Badge variant="secondary" className="text-xs">
            {images.length} รูป
          </Badge>
        </div>
        
        {/* Preview thumbnails */}
        <div className="flex gap-1 overflow-hidden">
          {images.slice(0, 3).map((image, index) => (
            <button
              key={index}
              onClick={() => openViewer(index)}
              className="flex-shrink-0 w-8 h-8 rounded border border-gray-200 overflow-hidden hover:ring-2 hover:ring-orange-200 transition-all"
            >
              <img
                src={image}
                alt={`ภาพ ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement?.classList.add('bg-gray-100');
                  target.parentElement?.insertAdjacentHTML('beforeend', 
                    '<div class="flex items-center justify-center w-full h-full"><Image class="w-3 h-3 text-gray-400" /></div>'
                  );
                }}
              />
            </button>
          ))}
          
          {images.length > 3 && (
            <button
              onClick={() => openViewer(3)}
              className="flex-shrink-0 w-8 h-8 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 transition-all"
            >
              +{images.length - 3}
            </button>
          )}
        </div>
        
        {/* View all button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openViewer(0)}
          className="h-6 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
        >
          <Eye className="w-3 h-3 mr-1" />
          ดูทั้งหมด
        </Button>
      </div>

      <ImageViewer
        images={images}
        initialIndex={selectedImageIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
}

export function ImageGalleryCard({ images, title = "รูปภาพแนบ" }: { images: string[]; title?: string }) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Image className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">ไม่มีรูปภาพแนบ</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const openViewer = (index: number = 0) => {
    setSelectedImageIndex(index);
    setViewerOpen(true);
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium flex items-center gap-2">
              <Image className="w-4 h-4 text-orange-600" />
              {title}
            </h3>
            <Badge variant="outline">{images.length} รูป</Badge>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => openViewer(index)}
                className="aspect-square rounded border border-gray-200 overflow-hidden hover:ring-2 hover:ring-orange-200 transition-all group"
              >
                <div className="relative w-full h-full">
                  <img
                    src={image}
                    alt={`ภาพ ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement?.classList.add('bg-gray-100', 'flex', 'items-center', 'justify-center');
                      target.parentElement?.insertAdjacentHTML('beforeend', 
                        '<div class="text-gray-400"><Image class="w-6 h-6" /></div>'
                      );
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <ImageViewer
        images={images}
        initialIndex={selectedImageIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </>
  );
}