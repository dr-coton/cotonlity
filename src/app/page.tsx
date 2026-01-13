import Link from "next/link";

const tools = [
  {
    name: "PDF 최적화",
    description: "PDF 파일 크기를 줄여 용량을 최적화합니다.",
    href: "/pdf-optimizer",
    icon: "📄",
    color: "from-red-500 to-orange-500",
  },
  {
    name: "오디오 합치기",
    description: "여러 오디오 파일을 하나로 합칩니다.",
    href: "/audio-merge",
    icon: "🎵",
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "오디오 분리",
    description: "오디오 파일을 원하는 구간으로 분리합니다.",
    href: "/audio-split",
    icon: "✂️",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "이미지 변환",
    description: "이미지를 다양한 포맷으로 변환합니다.",
    href: "/image-converter",
    icon: "🖼️",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "비디오 변환",
    description: "비디오를 다양한 포맷으로 변환합니다.",
    href: "/video-converter",
    icon: "🎬",
    color: "from-amber-500 to-yellow-500",
  },
];

const features = [
  {
    icon: "🔒",
    title: "완전한 개인정보 보호",
    description:
      "모든 파일 처리가 브라우저에서 직접 이루어집니다. 서버로 전송되지 않습니다.",
  },
  {
    icon: "⚡",
    title: "빠른 처리 속도",
    description:
      "WebAssembly 기술을 활용하여 네이티브에 가까운 처리 속도를 제공합니다.",
  },
  {
    icon: "💯",
    title: "무료 사용",
    description: "모든 기능을 무료로 제한 없이 사용할 수 있습니다.",
  },
  {
    icon: "🌐",
    title: "설치 불필요",
    description: "별도의 프로그램 설치 없이 브라우저에서 바로 사용 가능합니다.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              브라우저에서 직접
            </span>
            <br />
            파일을 변환하세요
          </h1>
          <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-8">
            WebAssembly 기술을 활용하여 PDF 최적화, 오디오 편집, 이미지 변환 등
            다양한 파일 작업을 안전하고 빠르게 처리할 수 있습니다.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="#tools"
              className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              도구 살펴보기
            </Link>
            <a
              href="#features"
              className="px-8 py-3 border border-card-border text-foreground font-medium rounded-xl hover:bg-card transition-colors"
            >
              자세히 알아보기
            </a>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-16 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            파일 변환 도구
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="tool-card block p-6 bg-card border border-card-border rounded-2xl hover:border-primary/50"
              >
                <div
                  className={`w-14 h-14 flex items-center justify-center text-3xl bg-gradient-to-br ${tool.color} rounded-xl mb-4`}
                >
                  {tool.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {tool.name}
                </h3>
                <p className="text-secondary">{tool.description}</p>
                <div className="mt-4 flex items-center text-primary font-medium">
                  사용하기
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            왜 Cotonlity를 선택해야 할까요?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex gap-4 p-6 bg-card border border-card-border rounded-2xl"
              >
                <div className="text-4xl flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-secondary">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
          <p className="text-lg text-secondary mb-8">
            회원가입이나 설치 없이 바로 사용할 수 있습니다.
          </p>
          <Link
            href="/pdf-optimizer"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            PDF 최적화 시작하기
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
