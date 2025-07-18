import { useState, useEffect } from 'react';

export interface DeviceType {
  name: string;
  width: number;
  height: number;
  userAgent: string;
  pixelRatio?: number;
}

export const DEVICE_PRESETS: DeviceType[] = [
  {
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    pixelRatio: 3
  },
  {
    name: 'iPhone SE',
    width: 375,
    height: 667,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    pixelRatio: 2
  },
  {
    name: 'Samsung Galaxy S23',
    width: 360,
    height: 780,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    pixelRatio: 3
  },
  {
    name: 'Google Pixel 7',
    width: 412,
    height: 915,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    pixelRatio: 2.6
  },
  {
    name: 'iPad Air',
    width: 820,
    height: 1180,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    pixelRatio: 2
  },
  {
    name: 'iPad Mini',
    width: 744,
    height: 1133,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    pixelRatio: 2
  }
];

export function useDeviceEmulation() {
  const [currentDevice, setCurrentDevice] = useState<DeviceType | null>(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const [scale, setScale] = useState(1);

  // Detect if we're in mobile/tablet based on viewport
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isTabletViewport, setIsTabletViewport] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      setIsMobileViewport(width < 768);
      setIsTabletViewport(width >= 768 && width < 1024);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  useEffect(() => {
    if (currentDevice) {
      // Calculate optimal scale
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const deviceWidth = isLandscape ? currentDevice.height : currentDevice.width;
      const deviceHeight = isLandscape ? currentDevice.width : currentDevice.height;
      
      // Leave some margin for controls
      const maxWidth = viewportWidth - 100;
      const maxHeight = viewportHeight - 150;
      
      const scaleX = maxWidth / deviceWidth;
      const scaleY = maxHeight / deviceHeight;
      const optimalScale = Math.min(scaleX, scaleY, 1);
      
      setScale(optimalScale);
    }
  }, [currentDevice, isLandscape]);

  const selectDevice = (device: DeviceType) => {
    setCurrentDevice(device);
    setIsLandscape(false);
  };

  const toggleOrientation = () => {
    setIsLandscape(!isLandscape);
  };

  const exitEmulation = () => {
    setCurrentDevice(null);
    setIsLandscape(false);
    setScale(1);
  };

  const getDeviceInfo = () => {
    if (!currentDevice) return null;

    const width = isLandscape ? currentDevice.height : currentDevice.width;
    const height = isLandscape ? currentDevice.width : currentDevice.height;

    return {
      name: currentDevice.name,
      width,
      height,
      userAgent: currentDevice.userAgent,
      pixelRatio: currentDevice.pixelRatio || 1,
      isLandscape,
      scale
    };
  };

  const getViewportClass = () => {
    if (currentDevice) return 'device-emulation';
    if (isMobileViewport) return 'mobile-viewport';
    if (isTabletViewport) return 'tablet-viewport';
    return 'desktop-viewport';
  };

  return {
    currentDevice,
    isLandscape,
    scale,
    isMobileViewport,
    isTabletViewport,
    selectDevice,
    toggleOrientation,
    exitEmulation,
    getDeviceInfo,
    getViewportClass,
    availableDevices: DEVICE_PRESETS
  };
}