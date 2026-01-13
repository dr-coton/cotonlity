"use client";

import { useState, useCallback } from "react";
import imageCompression from "browser-image-compression";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import DownloadButton from "@/components/DownloadButton";

type OutputFormat = "jpeg" | "png" | "webp";

interface ConversionResult {
  originalSize: number;
  convertedSize: number;
  blob: Blob;
  previewUrl: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("webp");
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile);
      setResult(null);
      setError(null);

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);

  const convertImage = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setStatus("이미지 로딩 중...");
    setError(null);

    try {
      setProgress(20);
      setStatus("이미지 변환 중...");

      // 압축 옵션 설정
      const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: maxWidth,
        useWebWorker: true,
        fileType: `image/${outputFormat}` as const,
        initialQuality: quality / 100,
        onProgress: (p: number) => {
          setProgress(20 + p * 0.6);
        },
      };

      // 이미지 압축 및 변환
      const compressedFile = await imageCompression(file, options);

      setProgress(90);
      setStatus("결과 생성 중...");

      // Blob으로 변환
      const blob = new Blob([await compressedFile.arrayBuffer()], {
        type: `image/${outputFormat}`,
      });

      // 미리보기 URL 생성
      const previewUrl = URL.createObjectURL(blob);

      setProgress(100);
      setStatus("완료!");

      setResult({
        originalSize: file.size,
        convertedSize: blob.size,
        blob,
        previewUrl,
      });
    } catch (err) {
      console.error("Image conversion error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "이미지 변환 중 오류가 발생했습니다."
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4">
            <span className="text-3xl">🖼️</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            이미지 변환
          </h1>
          <p className="text-secondary">
            이미지를 다양한 포맷으로 변환하고 크기를 최적화합니다.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* File Upload */}
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">1. 이미지 파일 선택</h2>
            <FileDropZone
              accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg"
              onFilesSelected={handleFilesSelected}
              title="이미지 파일을 드래그하거나 클릭"
              description="JPG, PNG, GIF, WebP, BMP, SVG 지원"
              maxSize={50}
            />
            {preview && (
              <div className="mt-4">
                <div className="relative aspect-video bg-background rounded-lg overflow-hidden border border-card-border">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-secondary">
                    {file?.name} ({formatFileSize(file?.size || 0)})
                  </p>
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                      setResult(null);
                    }}
                    className="text-sm text-error hover:underline"
                  >
                    제거
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Conversion Settings */}
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">2. 변환 설정</h2>

            {/* Output Format */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary mb-2">
                출력 형식
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["jpeg", "png", "webp"] as OutputFormat[]).map((format) => (
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
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-secondary">
                  품질
                </label>
                <span className="text-sm font-medium text-foreground">
                  {quality}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-2 bg-card-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-secondary mt-1">
                <span>낮음 (작은 파일)</span>
                <span>높음 (좋은 품질)</span>
              </div>
            </div>

            {/* Max Width */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                최대 너비 (px)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[640, 1280, 1920, 3840].map((width) => (
                  <button
                    key={width}
                    onClick={() => setMaxWidth(width)}
                    className={`p-2 rounded-lg border text-sm transition-all ${
                      maxWidth === width
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-card-border hover:border-primary/50 text-foreground"
                    }`}
                  >
                    {width}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Process Button */}
          <button
            onClick={convertImage}
            disabled={!file || isProcessing}
            className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? "처리 중..." : "이미지 변환하기"}
          </button>

          {/* Progress */}
          {isProcessing && (
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
              <h2 className="text-lg font-semibold mb-4">변환 결과</h2>

              {/* Preview */}
              <div className="relative aspect-video bg-background rounded-lg overflow-hidden border border-card-border mb-4">
                <img
                  src={result.previewUrl}
                  alt="Converted"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Stats */}
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
                <DownloadButton data={result.blob} filename={getOutputFilename()}>
                  변환된 이미지 다운로드
                </DownloadButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
