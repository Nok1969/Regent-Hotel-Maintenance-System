// Utility to preload background image
export function preloadBackgroundImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      console.log('Background image loaded successfully:', src);
      resolve(true);
    };
    img.onerror = () => {
      console.error('Failed to load background image:', src);
      resolve(false);
    };
    img.src = src;
  });
}