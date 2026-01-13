"use client";

import Link from "next/link";
import { useState } from "react";

const tools = [
  { name: "PDF 최적화", href: "/pdf-optimizer", icon: "📄" },
  { name: "오디오 합치기", href: "/audio-merge", icon: "🎵" },
  { name: "오디오 분리", href: "/audio-split", icon: "✂️" },
  { name: "이미지 변환", href: "/image-converter", icon: "🖼️" },
  { name: "비디오 변환", href: "/video-converter", icon: "🎬" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Cotonlity
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-1">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-secondary hover:text-foreground hover:bg-card-border/50 transition-colors"
              >
                <span className="mr-1">{tool.icon}</span>
                {tool.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-secondary hover:text-foreground hover:bg-card-border/50"
              aria-label="메뉴 열기"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-b border-card-border">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="block px-3 py-2 rounded-lg text-base font-medium text-secondary hover:text-foreground hover:bg-card-border/50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-2">{tool.icon}</span>
                {tool.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
