export default function Footer() {
  return (
    <footer className="bg-card border-t border-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Cotonlity
            </h3>
            <p className="mt-2 text-sm text-secondary">
              WebAssembly 기반 브라우저 파일 변환 도구. 모든 처리는 로컬에서
              이루어져 개인정보가 보호됩니다.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">도구</h4>
            <ul className="mt-2 space-y-2 text-sm text-secondary">
              <li>
                <a href="/pdf-optimizer" className="hover:text-primary">
                  PDF 최적화
                </a>
              </li>
              <li>
                <a href="/audio-merge" className="hover:text-primary">
                  오디오 합치기
                </a>
              </li>
              <li>
                <a href="/audio-split" className="hover:text-primary">
                  오디오 분리
                </a>
              </li>
              <li>
                <a href="/image-converter" className="hover:text-primary">
                  이미지 변환
                </a>
              </li>
              <li>
                <a href="/video-converter" className="hover:text-primary">
                  비디오 변환
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground">개인정보 보호</h4>
            <p className="mt-2 text-sm text-secondary">
              모든 파일 처리는 브라우저에서 직접 이루어집니다. 서버로 파일이
              전송되지 않으며, 처리 후 즉시 삭제됩니다.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-card-border text-center text-sm text-secondary">
          <p>&copy; 2025 Cotonlity. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
