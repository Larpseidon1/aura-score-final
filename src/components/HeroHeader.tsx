'use client';

import Image from 'next/image';

export function HeroHeader() {
  return (
    <div className="w-full py-8 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-start">
          {/* Logo only */}
          <div className="flex items-center">
            <Image
              src="/aura-emblem-glowy.svg"
              alt="Aura Emblem"
              width={48}
              height={48}
              className="mr-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 