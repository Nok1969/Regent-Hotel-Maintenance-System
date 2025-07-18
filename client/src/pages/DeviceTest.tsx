import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDeviceEmulation } from '@/hooks/useDeviceEmulation';
import { useLanguage } from '@/hooks/useLanguage';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  RotateCcw, 
  Wifi, 
  Battery, 
  Signal,
  Settings
} from 'lucide-react';

export default function DeviceTest() {
  const { 
    currentDevice, 
    isLandscape, 
    scale, 
    isMobileViewport, 
    isTabletViewport,
    availableDevices,
    selectDevice,
    toggleOrientation,
    exitEmulation,
    getDeviceInfo
  } = useDeviceEmulation();

  const { t } = useLanguage();

  const deviceInfo = getDeviceInfo();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            {t('deviceTest.title', 'Device Emulation Test')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Device Info */}
            {deviceInfo && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Current Device:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {deviceInfo.name}
                  </div>
                  <div>
                    <span className="font-medium">Size:</span> {deviceInfo.width}×{deviceInfo.height}
                  </div>
                  <div>
                    <span className="font-medium">Scale:</span> {Math.round(deviceInfo.scale * 100)}%
                  </div>
                  <div>
                    <span className="font-medium">Orientation:</span> {deviceInfo.isLandscape ? 'Landscape' : 'Portrait'}
                  </div>
                </div>
              </div>
            )}

            {/* Viewport Detection */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold mb-2">Viewport Detection:</h3>
              <div className="flex gap-2">
                <Badge variant={isMobileViewport ? "default" : "secondary"}>
                  Mobile ({isMobileViewport ? 'Active' : 'Inactive'})
                </Badge>
                <Badge variant={isTabletViewport ? "default" : "secondary"}>
                  Tablet ({isTabletViewport ? 'Active' : 'Inactive'})
                </Badge>
                <Badge variant={!isMobileViewport && !isTabletViewport ? "default" : "secondary"}>
                  Desktop ({!isMobileViewport && !isTabletViewport ? 'Active' : 'Inactive'})
                </Badge>
              </div>
            </div>

            {/* Device Selection */}
            <div>
              <h3 className="font-semibold mb-3">Select Device for Testing:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableDevices.map((device) => (
                  <Button
                    key={device.name}
                    variant={currentDevice?.name === device.name ? "default" : "outline"}
                    className="h-auto p-4 flex flex-col items-start gap-2"
                    onClick={() => selectDevice(device)}
                  >
                    <div className="flex items-center gap-2">
                      {device.width > 500 ? <Tablet className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                      <span className="font-medium">{device.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {device.width} × {device.height}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Controls */}
            {currentDevice && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={toggleOrientation}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Rotate
                </Button>
                <Button variant="outline" onClick={exitEmulation}>
                  <Monitor className="w-4 h-4 mr-2" />
                  Desktop View
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mobile UI Test Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Status Bar Simulation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Mobile Status Bar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-white p-2 rounded text-xs flex justify-between items-center">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-3 h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Touch Targets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Touch Target Sizes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button size="sm" className="w-full">Small Button (32px)</Button>
            <Button className="w-full">Regular Button (40px)</Button>
            <Button size="lg" className="w-full">Large Button (48px)</Button>
          </CardContent>
        </Card>

        {/* Responsive Text */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Typography Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs">Extra Small Text (12px)</p>
            <p className="text-sm">Small Text (14px)</p>
            <p className="text-base">Base Text (16px)</p>
            <p className="text-lg">Large Text (18px)</p>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">Mobile Form Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Text Input" 
                  className="w-full p-3 border rounded"
                />
                <input 
                  type="email" 
                  placeholder="Email Input" 
                  className="w-full p-3 border rounded"
                />
                <select className="w-full p-3 border rounded">
                  <option>Select Option</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              </div>
              <div className="space-y-4">
                <textarea 
                  placeholder="Textarea" 
                  className="w-full p-3 border rounded h-24"
                />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">Cancel</Button>
                  <Button className="flex-1">Submit</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Test */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">Mobile Navigation Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Tab Navigation */}
              <div className="flex border rounded">
                <button className="flex-1 p-3 bg-primary text-primary-foreground">Tab 1</button>
                <button className="flex-1 p-3 border-l">Tab 2</button>
                <button className="flex-1 p-3 border-l">Tab 3</button>
              </div>
              
              {/* Bottom Navigation */}
              <div className="flex justify-around p-4 border-t bg-muted">
                <button className="flex flex-col items-center gap-1">
                  <Settings className="w-5 h-5" />
                  <span className="text-xs">Settings</span>
                </button>
                <button className="flex flex-col items-center gap-1">
                  <Smartphone className="w-5 h-5" />
                  <span className="text-xs">Devices</span>
                </button>
                <button className="flex flex-col items-center gap-1">
                  <Monitor className="w-5 h-5" />
                  <span className="text-xs">Desktop</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Breakpoint Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Current Breakpoint Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Window Width:</span> {window.innerWidth}px
            </div>
            <div>
              <span className="font-medium">Window Height:</span> {window.innerHeight}px
            </div>
            <div>
              <span className="font-medium">Device Pixel Ratio:</span> {window.devicePixelRatio}
            </div>
            <div>
              <span className="font-medium">User Agent:</span> 
              <span className="text-xs break-all">{navigator.userAgent.substring(0, 50)}...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}