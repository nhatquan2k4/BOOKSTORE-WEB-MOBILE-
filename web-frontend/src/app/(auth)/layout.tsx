import React from 'react';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#F1EEE3]" suppressHydrationWarning>
      {/* Left side - Branding/Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#8B4513] via-[#A0522D] to-[#D2691E] p-12 items-center justify-center">
        <div className="relative z-10 text-white max-w-lg">
          <h1 className="text-5xl font-bold mb-4">BookStore</h1>
          <p className="text-xl mb-8 opacity-90">
            Khám phá thế giới tri thức với hàng ngàn đầu sách chất lượng
          </p>
          <div className="space-y-4 text-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">✓</div>
              <span>Hàng ngàn đầu sách đa dạng</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">✓</div>
              <span>Giao hàng nhanh chóng toàn quốc</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">✓</div>
              <span>Ưu đãi đặc biệt cho thành viên</span>
            </div>
          </div>
        </div>
        
        {/* Decorative book illustration */}
        <div className="absolute bottom-0 right-0 w-64 h-64 opacity-20">
          <svg viewBox="0 0 200 200" fill="currentColor">
            <path d="M40 40 L160 40 L160 160 L40 160 Z" opacity="0.3"/>
            <path d="M50 50 L150 50 L150 150 L50 150 Z" opacity="0.5"/>
            <path d="M60 60 L140 60 L140 140 L60 140 Z"/>
          </svg>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
