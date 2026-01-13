# Cotonlity - WebAssembly File Tools

브라우저에서 직접 파일을 변환하는 WebAssembly 기반 도구 모음입니다. 모든 처리는 클라이언트 측에서 이루어져 개인정보가 보호됩니다.

## 주요 기능

- **PDF 최적화**: PDF 파일 크기를 줄여 용량을 최적화합니다 (pdf-lib 사용)
- **오디오 합치기**: 여러 오디오 파일을 하나로 합칩니다 (FFmpeg.wasm 사용)
- **오디오 분리**: 오디오 파일을 원하는 구간으로 분리합니다 (FFmpeg.wasm 사용)
- **이미지 변환**: 이미지를 다양한 포맷으로 변환하고 크기를 최적화합니다
- **비디오 변환**: 비디오를 다양한 포맷으로 변환합니다 (FFmpeg.wasm 사용)

## 기술 스택

- **Next.js 16** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **WebAssembly**:
  - FFmpeg.wasm - 오디오/비디오 처리
  - pdf-lib - PDF 처리
  - browser-image-compression - 이미지 압축

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## Vercel 배포

이 프로젝트는 Vercel에 최적화되어 있습니다. GitHub 저장소를 Vercel에 연결하면 자동으로 배포됩니다.

### 중요 설정

FFmpeg.wasm을 사용하기 위해 다음 HTTP 헤더가 필요합니다:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

이 헤더는 `next.config.ts`와 `vercel.json`에 이미 설정되어 있습니다.

## 지원 파일 형식

### PDF
- 입력: PDF
- 출력: 최적화된 PDF

### 오디오
- 입력: MP3, WAV, OGG, M4A, AAC, FLAC
- 출력: MP3, WAV, OGG, M4A

### 이미지
- 입력: JPG, PNG, GIF, WebP, BMP, SVG
- 출력: JPEG, PNG, WebP

### 비디오
- 입력: MP4, WebM, AVI, MOV, MKV, WMV
- 출력: MP4, WebM, AVI, MOV

## 개인정보 보호

모든 파일 처리는 브라우저에서 직접 이루어집니다. 파일이 서버로 전송되지 않으며, 처리 후 즉시 메모리에서 삭제됩니다.

## 라이선스

MIT License
