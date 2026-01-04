import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import { Header } from "@/components/layout/Header"; // Có thể bỏ nếu đã dùng trong LayoutWrapper
// import { Footer } from "@/components/layout/Footer"; // Có thể bỏ nếu đã dùng trong LayoutWrapper
import { AuthProvider } from "@/contexts/AuthContext";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BỜ ÚC BÚC - Cửa hàng sách trực tuyến",
  description: "BỜ ÚC BÚC - Mua sắm sách online với giá tốt nhất",
  icons: {
    icon: '/image/logo.png',
    shortcut: '/image/logo.png',
    apple: '/image/logo.png',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}