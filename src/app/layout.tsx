import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Cotonlity - WebAssembly File Tools",
  description:
    "브라우저에서 직접 파일을 변환하세요. PDF 최적화, 오디오 편집, 이미지 변환 등 다양한 도구를 제공합니다. 모든 처리는 브라우저에서 이루어져 개인정보가 보호됩니다.",
  keywords: [
    "파일 변환",
    "PDF 압축",
    "오디오 합치기",
    "이미지 변환",
    "WebAssembly",
    "브라우저 도구",
  ],
  openGraph: {
    title: "Cotonlity - WebAssembly File Tools",
    description: "브라우저에서 직접 파일을 변환하는 무료 도구",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
