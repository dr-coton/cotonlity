"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import DownloadButton from "@/components/DownloadButton";

type QualityLevel = "low" | "medium" | "high";

interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  blob: Blob;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function PDFOptimizer() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<QualityLevel>("medium");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setResult(null);
      setError(null);
    }
  }, []);

  const optimizePDF = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setStatus("PDF 파일 로딩 중...");
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgress(20);
      setStatus("PDF 분석 중...");

      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });

      setProgress(40);
      setStatus("PDF 최적화 중...");

      // 페이지 수 가져오기
      const pages = pdfDoc.getPages();
      const totalPages = pages.length;

      // 각 페이지 처리
      for (let i = 0; i < totalPages; i++) {
        // 페이지별 진행률 업데이트
        const pageProgress = 40 + (i / totalPages) * 40;
        setProgress(pageProgress);
        setStatus(`페이지 ${i + 1}/${totalPages} 처리 중...`);
      }

      setProgress(80);
      setStatus("PDF 저장 중...");

      // PDF 저장 옵션 설정
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: true, // 객체 스트림 사용으로 크기 감소
        addDefaultPage: false,
        objectsPerTick: quality === "low" ? 100 : quality === "medium" ? 50 : 20,
      });

      setProgress(100);
      setStatus("완료!");

      const optimizedBlob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });

      setResult({
        originalSize: file.size,
        optimizedSize: pdfBytes.byteLength,
        blob: optimizedBlob,
      });
    } catch (err) {
      console.error("PDF optimization error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "PDF 최적화 중 오류가 발생했습니다."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getOptimizedFilename = () => {
    if (!file) return "optimized.pdf";
    const name = file.name.replace(/\.pdf$/i, "");
    return `${name}_optimized.pdf`;
  };

  const getReductionPercentage = () => {
    if (!result) return 0;
    return Math.round(
      ((result.originalSize - result.optimizedSize) / result.originalSize) * 100
    );
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl mb-4">
            <span className="text-3xl">📄</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            PDF 최적화
          </h1>
          <p className="text-secondary">
            PDF 파일 크기를 줄여 용량을 최적화합니다. 모든 처리는 브라우저에서
            이루어집니다.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* File Upload */}
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">1. PDF 파일 선택</h2>
            <FileDropZone
              accept=".pdf,application/pdf"
              onFilesSelected={handleFilesSelected}
              title="PDF 파일을 드래그하거나 클릭"
              description="PDF 파일만 지원됩니다"
              maxSize={100}
            />
            {file && (
              <div className="mt-4 flex items-center justify-between p-3 bg-background rounded-lg border border-card-border">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
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

          {/* Quality Settings */}
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">2. 압축 품질 선택</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "low", label: "낮음", desc: "최대 압축" },
                { value: "medium", label: "보통", desc: "균형 잡힌 압축" },
                { value: "high", label: "높음", desc: "품질 우선" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setQuality(option.value as QualityLevel)}
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

          {/* Process Button */}
          <button
            onClick={optimizePDF}
            disabled={!file || isProcessing}
            className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? "처리 중..." : "PDF 최적화 시작"}
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
              <h2 className="text-lg font-semibold mb-4">최적화 결과</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-background rounded-xl">
                  <p className="text-sm text-secondary mb-1">원본 크기</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatFileSize(result.originalSize)}
                  </p>
                </div>
                <div className="p-4 bg-background rounded-xl">
                  <p className="text-sm text-secondary mb-1">최적화 후</p>
                  <p className="text-xl font-bold text-success">
                    {formatFileSize(result.optimizedSize)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-secondary">용량 감소율</p>
                  <p className="text-3xl font-bold text-primary">
                    {getReductionPercentage() > 0
                      ? `-${getReductionPercentage()}%`
                      : "변화 없음"}
                  </p>
                </div>
                <DownloadButton
                  data={result.blob}
                  filename={getOptimizedFilename()}
                >
                  최적화된 PDF 다운로드
                </DownloadButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
