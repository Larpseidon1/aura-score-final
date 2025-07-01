'use client';

import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full py-12 px-8 mt-16" style={{ backgroundColor: '#82AFD9' }}>
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left side - Logo and Description */}
          <div className="space-y-6">
            <div>
              <Image
                src="/logo-full-horizontal.svg"
                alt="Aura Logo"
                width={280}
                height={84}
                className="h-16 w-auto"
              />
            </div>
            
            <p className="text-base leading-relaxed max-w-lg" style={{ color: '#181818' }}>
              Social Trading for Hyperliquid, Memes, Polymarket, Equities, Yield, & More with Apple Pay
            </p>
          </div>

          {/* Right side - Social Links */}
          <div className="flex flex-col justify-start lg:items-end">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-6" style={{ color: '#181818' }}>Connect with Aura</h3>
              <div className="space-y-3">
                <Link 
                  href="https://aura.money/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center hover:opacity-80 transition-opacity"
                  style={{ color: '#181818' }}
                >
                  <Image
                    src="/website-icon.svg"
                    alt="Website"
                    width={20}
                    height={20}
                    className="mr-3"
                  />
                  <span>Website</span>
                </Link>
                <Link 
                  href="https://x.com/auradotmoney" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center hover:opacity-80 transition-opacity"
                  style={{ color: '#181818' }}
                >
                  <Image
                    src="/twitter-x-icon.svg"
                    alt="X (Twitter)"
                    width={20}
                    height={20}
                    className="mr-3"
                  />
                  <span>X (Twitter)</span>
                </Link>
                <Link 
                  href="https://www.tiktok.com/@auradotmoney" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center hover:opacity-80 transition-opacity"
                  style={{ color: '#181818' }}
                >
                  <Image
                    src="/tiktok-icon.svg"
                    alt="TikTok"
                    width={20}
                    height={20}
                    className="mr-3"
                  />
                  <span>TikTok</span>
                </Link>
                <Link 
                  href="https://t.me/auradotmoney" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center hover:opacity-80 transition-opacity"
                  style={{ color: '#181818' }}
                >
                  <Image
                    src="/telegram-icon.svg"
                    alt="Telegram"
                    width={20}
                    height={20}
                    className="mr-3"
                  />
                  <span>Telegram</span>
                </Link>
                
                {/* App Store Links */}
                <div className="border-t pt-3 mt-3" style={{ borderTopColor: '#181818' }}>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center hover:opacity-80 transition-opacity" style={{ color: '#181818' }}>
                      <Image
                        src="/apple-store-coming-soon.svg"
                        alt="Apple Store"
                        width={120}
                        height={40}
                        className="h-10 w-auto"
                      />
                    </div>
                    <div className="flex items-center hover:opacity-80 transition-opacity" style={{ color: '#181818' }}>
                      <Image
                        src="/google-store-coming-soon.svg"
                        alt="Google Store"
                        width={120}
                        height={40}
                        className="h-10 w-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom - Creator Attribution */}
        <div className="border-t pt-6 text-center" style={{ borderTopColor: '#181818' }}>
          <p className="flex items-center justify-center gap-2" style={{ color: '#181818' }}>
            By:{' '}
            <Link 
              href="https://x.com/Larpseidon" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold hover:underline transition-colors flex items-center gap-2"
              style={{ color: '#181818' }}
            >
              <Image
                src="/larpseidon-pfp.png"
                alt="Larpseidon"
                width={24}
                height={24}
                className="w-6 h-6 rounded-full"
              />
              Larpseidon
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
} 