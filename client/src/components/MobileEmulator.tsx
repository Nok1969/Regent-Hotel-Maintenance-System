import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Tablet, Monitor, RotateCcw } from 'lucide-react';

interface DeviceConfig {
  name: string;
  width: number;
  height: number;
  userAgent: string;
  icon: React.ComponentType<any>;
}

const devices: DeviceConfig[] = [
  {
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    icon: Smartphone
  },
  {
    name: 'Samsung Galaxy S23',
    width: 360,
    height: 780,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36',
    icon: Smartphone
  },
  {
    name: 'iPad Air',
    width: 820,
    height: 1180,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    icon: Tablet
  },
  {
    name: 'iPad Mini',
    width: 744,
    height: 1133,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    icon: Tablet
  }
];

interface MobileEmulatorProps {
  children: React.ReactNode;
}

export function MobileEmulator({ children }: MobileEmulatorProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceConfig | null>(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (selectedDevice) {
      // Set user agent for more realistic emulation
      Object.defineProperty(navigator, 'userAgent', {
        get: function () { return selectedDevice.userAgent; },
        configurable: true
      });
    }
  }, [selectedDevice]);

  useEffect(() => {
    // Calculate scale to fit the device in the viewport
    if (selectedDevice) {
      const maxWidth = window.innerWidth - 100;
      const maxHeight = window.innerHeight - 200;
      const deviceWidth = isLandscape ? selectedDevice.height : selectedDevice.width;
      const deviceHeight = isLandscape ? selectedDevice.width : selectedDevice.height;
      
      const scaleX = maxWidth / deviceWidth;
      const scaleY = maxHeight / deviceHeight;
      const newScale = Math.min(scaleX, scaleY, 1);
      
      setScale(newScale);
    }
  }, [selectedDevice, isLandscape]);

  const resetToDesktop = () => {
    setSelectedDevice(null);
    setIsLandscape(false);
    setScale(1);
  };

  const getDeviceStyle = () => {
    if (!selectedDevice) return {};

    const width = isLandscape ? selectedDevice.height : selectedDevice.width;
    const height = isLandscape ? selectedDevice.width : selectedDevice.height;

    return {
      width: `${width}px`,
      height: `${height}px`,
      transform: `scale(${scale})`,
      transformOrigin: 'top center',
      margin: '0 auto',
      border: '8px solid #1f2937',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 0 30px rgba(0, 0, 0, 0.3)',
      backgroundColor: '#000'
    };
  };

  if (!selectedDevice) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Mobile Device Emulator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {devices.map((device) => {
                  const IconComponent = device.icon;
                  return (
                    <Button
                      key={device.name}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      onClick={() => setSelectedDevice(device)}
                    >
                      <IconComponent className="w-8 h-8" />
                      <div className="text-center">
                        <div className="font-semibold">{device.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {device.width} × {device.height}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  เลือกอุปกรณ์เพื่อทดสอบการแสดงผลของระบบบนหน้าจอขนาดต่างๆ 
                  หรือใช้งานในโหมด Desktop ปกติ
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Desktop view */}
        <div className="container mx-auto">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Emulator Controls */}
      <div className="bg-background border-b p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-2">
              <selectedDevice.icon className="w-4 h-4" />
              {selectedDevice.name}
            </Badge>
            <Badge variant="outline">
              {isLandscape ? selectedDevice.height : selectedDevice.width} × {isLandscape ? selectedDevice.width : selectedDevice.height}
            </Badge>
            <Badge variant="outline">
              Scale: {Math.round(scale * 100)}%
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLandscape(!isLandscape)}
              title="Rotate Device"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDesktop}
            >
              <Monitor className="w-4 h-4 mr-2" />
              Desktop
            </Button>
          </div>
        </div>
      </div>

      {/* Device Frame */}
      <div className="p-8 flex justify-center">
        <div style={getDeviceStyle()}>
          <div className="w-full h-full overflow-auto bg-background">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileEmulator;