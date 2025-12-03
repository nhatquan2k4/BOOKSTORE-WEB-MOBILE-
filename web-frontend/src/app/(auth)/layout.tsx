import React from "react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex bg-slate-50 text-slate-900"
      suppressHydrationWarning
    >
      {/* Left side - Branding/Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 p-12 items-center justify-center overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-200 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Logo */}
        <div className="absolute top-8 left-8">
          <div className="relative w-40 h-12">
            {" "}
            {/* Chỉnh độ rộng w-40 cho logo dài */}
            <Image
              src="/image/logo.png"
              alt="Bookstore Logo"
              fill
              className="object-contain object-left" // Căn logo sang trái
            />
          </div>
        </div>

        {/* --- KHU VỰC SÁCH --- */}
        <div className="relative z-10 w-full h-full max-w-md flex items-center justify-center">
          <div className="relative w-96 h-96">
            {/* CUỐN 1: Ở sau - Bên trái */}
            <div className="absolute top-8 -left-4 w-[250px] h-[358px] rounded-2xl transform -rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer group animate-float shadow-2xl shadow-blue-900/20">
              <div className="w-full h-full rounded-2xl overflow-hidden relative border border-slate-200">
                <Image
                  src="/image/anhbia1.jpg"
                  alt="Book Cover Back"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
              </div>
            </div>

            {/* CUỐN 2: Ở trước - Bên phải */}
            <div className="absolute top-16 -right-4 w-[250px] h-[358px] rounded-2xl transform rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-500 cursor-pointer group animate-float-delayed shadow-2xl shadow-blue-900/25">
              <div className="w-full h-full rounded-2xl overflow-hidden relative border border-slate-200">
                <Image
                  src="/image/anhbia2.jpg"
                  alt="Book Cover Front"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/20 opacity-50 pointer-events-none"></div>
              </div>
            </div>

            {/* Bóng đổ giả dưới chân sách */}
            <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-56 h-12 bg-black/20 blur-xl rounded-full -z-10"></div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-8 left-8 w-32 h-40 opacity-30 mix-blend-multiply">
          <svg viewBox="0 0 100 150" fill="none">
            <path
              d="M50 150 Q30 100 50 50 T50 0"
              stroke="#0f766e"
              strokeWidth="4"
              fill="none"
            />
            <ellipse
              cx="30"
              cy="70"
              rx="18"
              ry="28"
              fill="#14b8a6"
              opacity="0.7"
            />
            <ellipse
              cx="70"
              cy="90"
              rx="18"
              ry="28"
              fill="#14b8a6"
              opacity="0.7"
            />
          </svg>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
