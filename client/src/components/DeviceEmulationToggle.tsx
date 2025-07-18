import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useDeviceEmulation } from '@/hooks/useDeviceEmulation';
import { Smartphone, Tablet, Monitor, RotateCcw } from 'lucide-react';

export function DeviceEmulationToggle() {
  const { 
    currentDevice, 
    isLandscape, 
    scale,
    availableDevices,
    selectDevice,
    toggleOrientation,
    exitEmulation,
    getDeviceInfo
  } = useDeviceEmulation();

  const deviceInfo = getDeviceInfo();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {currentDevice ? (
            currentDevice.width > 500 ? <Tablet className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />
          ) : (
            <Monitor className="w-4 h-4" />
          )}
          {currentDevice ? currentDevice.name : 'Desktop'}
          {deviceInfo && (
            <Badge variant="secondary" className="ml-1">
              {Math.round(deviceInfo.scale * 100)}%
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Device Emulation</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Desktop Option */}
        <DropdownMenuItem onClick={exitEmulation}>
          <Monitor className="w-4 h-4 mr-2" />
          Desktop View
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Device Options */}
        {availableDevices.map((device) => (
          <DropdownMenuItem 
            key={device.name}
            onClick={() => selectDevice(device)}
            className={currentDevice?.name === device.name ? 'bg-accent' : ''}
          >
            {device.width > 500 ? (
              <Tablet className="w-4 h-4 mr-2" />
            ) : (
              <Smartphone className="w-4 h-4 mr-2" />
            )}
            <div className="flex flex-col">
              <span>{device.name}</span>
              <span className="text-xs text-muted-foreground">
                {device.width} × {device.height}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        
        {/* Orientation Control */}
        {currentDevice && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleOrientation}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Rotate ({isLandscape ? 'Landscape' : 'Portrait'})
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}