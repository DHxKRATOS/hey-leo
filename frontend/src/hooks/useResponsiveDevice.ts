import { useState, useEffect } from 'react';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface UseResponsiveDeviceReturn {
  device: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useResponsiveDevice(): UseResponsiveDeviceReturn {
  const [device, setDevice] = useState<DeviceType>('desktop');

  useEffect(() => {
    const updateDevice = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        setDevice('mobile');
      } else if (width < 1024) {
        setDevice('tablet');
      } else {
        setDevice('desktop');
      }
    };

    // Set initial device
    updateDevice();

    // Add event listener for window resize
    window.addEventListener('resize', updateDevice);

    // Cleanup
    return () => window.removeEventListener('resize', updateDevice);
  }, []);

  return {
    device,
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
  };
}
