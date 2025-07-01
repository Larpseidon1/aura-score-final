'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'sky' | 'clean';
}

export function LoadingSpinner({ size = 'md', className = '', variant = 'default' }: LoadingSpinnerProps) {
  const [skyImageLoaded, setSkyImageLoaded] = useState(false);
  const [skyMobileLoaded, setSkyMobileLoaded] = useState(false);

  // Preload sky images during loading screen
  useEffect(() => {
    if (variant === 'sky') {
      // Preload desktop sky image
      const skyImg = document.createElement('img');
      skyImg.onload = () => setSkyImageLoaded(true);
      skyImg.src = '/sky-4k.png';

      // Preload mobile sky image
      const skyMobileImg = document.createElement('img');
      skyMobileImg.onload = () => setSkyMobileLoaded(true);
      skyMobileImg.src = '/sky-4k.png';
    }
  }, [variant]);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  // Default spinner (original behavior)
  if (variant === 'default') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className={`animate-spin rounded-full border-2 border-secondary-600 border-t-primary-500 ${sizeClasses[size]}`} />
      </div>
    );
  }

  // Clean white background with custom spinning icon
  if (variant === 'clean') {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4">
            <Image
              src="/head-3-logo.png"
              alt="Loading"
              width={80}
              height={80}
              className="w-20 h-20 animate-spin"
              priority
            />
          </div>
          <div className="text-lg font-medium text-gray-700">Loading...</div>
          <div className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest data</div>
        </div>
      </div>
    );
  }

  // Sky background variant with progressive loading
  if (variant === 'sky') {
    return (
      <div className="fixed inset-0 z-50">
        {/* Enhanced gradient background with texture - loads instantly */}
        <div className="absolute inset-0 sky-gradient-base sky-texture" />
        
                  {/* Mobile Sky Background with fade-in when loaded */}
          <div 
            className={`absolute inset-0 md:hidden transition-opacity duration-1000 ${
              skyMobileLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: 'url(/sky-4k.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        
        {/* Desktop Sky Background with fade-in when loaded */}
        <div 
          className={`hidden md:block absolute inset-0 transition-opacity duration-1000 ${
            skyImageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: 'url(/sky-4k.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Loading Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="glass-container p-8 rounded-xl text-center">
            <div className="relative mb-6">
              <Image
                src="/head-3-logo.png"
                alt="Loading"
                width={100}
                height={100}
                className="w-24 h-24 animate-spin mx-auto"
                priority
              />
            </div>
            <div className="text-xl font-semibold text-gray-800 mb-2">Loading Dashboard</div>
            <div className="text-sm text-gray-600">
              {!skyImageLoaded && !skyMobileLoaded 
                ? 'Loading beautiful backgrounds...' 
                : 'Fetching the latest builder analytics...'
              }
            </div>
            
            {/* Progress indicator for background loading */}
            <div className="mt-4 w-48 mx-auto">
              <div className="bg-white/30 rounded-full h-2 overflow-hidden">
                <div 
                  className={`bg-gradient-to-r from-blue-400 to-cyan-400 h-full rounded-full transition-all duration-1000 ${
                    skyImageLoaded || skyMobileLoaded ? 'w-full' : 'w-1/3'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to default
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-secondary-600 border-t-primary-500 ${sizeClasses[size]}`} />
    </div>
  );
} 