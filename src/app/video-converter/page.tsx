"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import DownloadButton from "@/components/DownloadButton";
import { useFFmpeg } from "@/hooks/useFFmpeg";

type OutputFormat = "mp4" | "webm" | "avi" | "mov";
type Quality = "low" | "medium" | "high";

interface ConversionResult {
  originalSize: number;
  convertedSize: number;
  blob: Blob;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function VideoConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("mp4");
  const [quality, setQuality] = useState<Quality>("medium");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    isLoaded,
    isLoading,
    progress,
    status,
    load,
    writeFile,
    readFile,
    exec,
    deleteFile,
    setStatus,
    setProgress,
  } = useFFmpeg();

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResult(null);
      setError(null);
    }
  }, []);

  const convertVideo = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      setStatus("FFmpeg 로딩 중...");
      await load();

      setStatus("파일 준비 중...");
      const inputName = `input.${file.name.split(".").pop()}`;
      await writeFile(inputName, file);
      setProgress(20);

      setStatus("비디오 변환 중...");
      const outputName = `output.${outputFormat}`;

      // 품질에 따른 비트레이트 설정
      const qualitySettings: Record<Quality, string[]> = {
        low: ["-crf", "28", "-preset", "faster"],
        medium: ["-crf", "23", "-preset", "medium"],
        high: ["-crf", "18", "-preset", "slow"],
      };

      // 포맷별 코덱 설정
      let codecArgs: string[] = [];
      if (outputFormat === "mp4") {
        codecArgs = ["-c:v", "libx264", "-c:a", "aac"];
      } else if (outputFormat === "webm") {
        codecArgs = ["-c:v", "libvpx", "-c:a", "libvorbis"];
      } else if (outputFormat === "avi") {
        codecArgs = ["-c:v", "mpeg4", "-c:a", "mp3"];
      } else if (outputFormat === "mov") {
        codecArgs = ["-c:v", "libx264", "-c:a", "aac"];
      }

      await exec([
        "-i",
        inputName,
        ...codecArgs,
        ...qualitySettings[quality],
        outputName,
      ]);

      setProgress(90);
      setStatus("결과 파일 생성 중...");

      const data = await readFile(outputName);
      const mimeTypes: Record<OutputFormat, string> = {
        mp4: "video/mp4",
        webm: "video/webm",
        avi: "video/x-msvideo",
        mov: "video/quicktime",
      };
      const uint8Array = new Uint8Array(data as Uint8Array);
      const blob = new Blob([uint8Array], { type: mimeTypes[outputFormat] });

      await deleteFile(inputName);
      await deleteFile(outputName);

      setProgress(100);
      setStatus("완료!");

      setResult({
        originalSize: file.size,
        convertedSize: blob.size,
        blob,
      });
    } catch (err) {
      console.error("Video conversion error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "비디오 변환 중 오류가 발생했습니다."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getOutputFilename = () => {
    if (!file) return `converted.${outputFormat}`;
    const name = file.name.replace(/\.[^/.]+$/, "");
    return `${name}_converted.${outputFormat}`;
  };

  const getReductionPercentage = () => {
    if (!result) return 0;
    return Math.round(
      ((result.originalSize - result.convertedSize) / result.originalSize) * 100
    );
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl mb-4">
            <span className="text-3xl">🎬</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            비디오 변환
          </h1>
          <p className="text-secondary">
            비디오를 다양한 포맷으로 변환합니다.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* File Upload */}
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">1. 비디오 파일 선택</h2>
            <FileDropZone
              accept="video/*,.mp4,.webm,.avi,.mov,.mkv,.wmv"
              onFilesSelected={handleFilesSelected}
              title="비디오 파일을 드래그하거나 클릭"
              description="MP4, WebM, AVI, MOV, MKV, WMV 지원"
              maxSize={500}
            />
            {file && (
              <div className="mt-4 flex items-center justify-between p-3 bg-background rounded-lg border border-card-border">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎬</span>
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-secondary">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                  }}
                  className="p-2 text-secondary hover:text-error rounded-lg hover:bg-error/10"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Output Format */}
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">2. 출력 형식 선택</h2>
            <div className="grid grid-cols-4 gap-3">
              {(["mp4", "webm", "avi", "mov"] as OutputFormat[]).map(
                (format) => (
                  <button
                    key={format}
                    onClick={() => setOutputFormat(format)}
                    className={`p-3 rounded-xl border-2 transition-all uppercase font-medium ${
                      outputFormat === format
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-card-border hover:border-primary/50 text-foreground"
                    }`}
                  >
                    {format}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Quality */}
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">3. 품질 선택</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "low", label: "낮음", desc: "빠른 변환, 작은 용량" },
                { value: "medium", label: "보통", desc: "균형 잡힌 품질" },
                { value: "high", label: "높음", desc: "최고 품질" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setQuality(option.value as Quality)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    quality === option.value
                      ? "border-primary bg-primary/10"
                      : "border-card-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium text-foreground">{option.label}</p>
                  <p className="text-sm text-secondary">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl">
            <p className="text-warning text-sm">
              <strong>참고:</strong> 비디오 변환은 파일 크기와 길이에 따라
              시간이 오래 걸릴 수 있습니다. 처음 실행 시 FFmpeg 라이브러리
              다운로드로 추가 시간이 소요됩니다.
            </p>
          </div>

          {/* Process Button */}
          <button
            onClick={convertVideo}
            disabled={!file || isProcessing}
            className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing
              ? "처리 중..."
              : isLoading
                ? "FFmpeg 로딩 중..."
                : "비디오 변환하기"}
          </button>

          {/* Progress */}
          {(isProcessing || isLoading) && (
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <ProgressBar progress={progress} status={status} />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-xl">
              <p className="text-error">{error}</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">변환 완료!</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-background rounded-xl">
                  <p className="text-sm text-secondary mb-1">원본 크기</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatFileSize(result.originalSize)}
                  </p>
                </div>
                <div className="p-4 bg-background rounded-xl">
                  <p className="text-sm text-secondary mb-1">변환 후</p>
                  <p className="text-xl font-bold text-success">
                    {formatFileSize(result.convertedSize)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary">용량 변화</p>
                  <p
                    className={`text-3xl font-bold ${getReductionPercentage() > 0 ? "text-success" : "text-warning"}`}
                  >
                    {getReductionPercentage() > 0
                      ? `-${getReductionPercentage()}%`
                      : getReductionPercentage() < 0
                        ? `+${Math.abs(getReductionPercentage())}%`
                        : "변화 없음"}
                  </p>
                </div>
                <DownloadButton
                  data={result.blob}
                  filename={getOutputFilename()}
                >
                  변환된 비디오 다운로드
                </DownloadButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
