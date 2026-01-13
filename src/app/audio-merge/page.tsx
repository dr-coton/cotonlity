"use client";

import { useState, useCallback } from "react";
import FileDropZone from "@/components/FileDropZone";
import FileList from "@/components/FileList";
import ProgressBar from "@/components/ProgressBar";
import DownloadButton from "@/components/DownloadButton";
import { useFFmpeg } from "@/hooks/useFFmpeg";

interface FileItem {
  file: File;
  id: string;
}

type OutputFormat = "mp3" | "wav" | "ogg" | "m4a";

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export default function AudioMerge() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("mp3");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
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

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    const fileItems = newFiles.map((file) => ({
      file,
      id: generateId(),
    }));
    setFiles((prev) => [...prev, ...fileItems]);
    setResult(null);
    setError(null);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const mergeAudio = async () => {
    if (files.length < 2) {
      setError("최소 2개 이상의 파일을 선택해주세요.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      // FFmpeg 로드
      setStatus("FFmpeg 로딩 중...");
      await load();

      // 파일 쓰기
      setStatus("파일 준비 중...");
      const inputFiles: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const inputName = `input${i}.${files[i].file.name.split(".").pop()}`;
        await writeFile(inputName, files[i].file);
        inputFiles.push(inputName);
        setProgress((i / files.length) * 30);
      }

      // concat 목록 생성
      setStatus("파일 목록 생성 중...");
      const concatList = inputFiles.map((f) => `file '${f}'`).join("\n");
      const encoder = new TextEncoder();
      const concatData = encoder.encode(concatList);

      const ffmpeg = await load();
      if (ffmpeg) {
        await ffmpeg.writeFile("concat.txt", concatData);
      }

      setProgress(40);
      setStatus("오디오 합치는 중...");

      // 출력 파일명
      const outputName = `output.${outputFormat}`;

      // FFmpeg 명령 실행
      const codecArgs: string[] = [];
      if (outputFormat === "mp3") {
        codecArgs.push("-c:a", "libmp3lame", "-q:a", "2");
      } else if (outputFormat === "ogg") {
        codecArgs.push("-c:a", "libvorbis", "-q:a", "5");
      } else if (outputFormat === "m4a") {
        codecArgs.push("-c:a", "aac", "-b:a", "192k");
      }

      await exec([
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        "concat.txt",
        ...codecArgs,
        outputName,
      ]);

      setProgress(90);
      setStatus("결과 파일 생성 중...");

      // 결과 읽기
      const data = await readFile(outputName);
      const mimeTypes: Record<OutputFormat, string> = {
        mp3: "audio/mpeg",
        wav: "audio/wav",
        ogg: "audio/ogg",
        m4a: "audio/mp4",
      };
      const uint8Array = new Uint8Array(data as Uint8Array);
      const blob = new Blob([uint8Array], { type: mimeTypes[outputFormat] });

      // 정리
      for (const f of inputFiles) {
        await deleteFile(f);
      }
      await deleteFile("concat.txt");
      await deleteFile(outputName);

      setProgress(100);
      setStatus("완료!");
      setResult(blob);
    } catch (err) {
      console.error("Audio merge error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "오디오 합치기 중 오류가 발생했습니다."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-4">
            <span className="text-3xl">🎵</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            오디오 합치기
          </h1>
          <p className="text-secondary">
            여러 오디오 파일을 하나로 합칩니다. 순서대로 연결됩니다.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* File Upload */}
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">1. 오디오 파일 선택</h2>
            <FileDropZone
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
              multiple
              onFilesSelected={handleFilesSelected}
              title="오디오 파일들을 드래그하거나 클릭"
              description="MP3, WAV, OGG, M4A, AAC, FLAC 지원"
              maxSize={200}
            />
            {files.length > 0 && (
              <div className="mt-4">
                <FileList files={files} onRemove={handleRemoveFile} />
              </div>
            )}
          </div>

          {/* Output Format */}
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">2. 출력 형식 선택</h2>
            <div className="grid grid-cols-4 gap-3">
              {(["mp3", "wav", "ogg", "m4a"] as OutputFormat[]).map((format) => (
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

          {/* FFmpeg Status */}
          {!isLoaded && !isLoading && (
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl">
              <p className="text-warning text-sm">
                처음 실행 시 FFmpeg 라이브러리를 다운로드합니다. 잠시 시간이
                소요될 수 있습니다.
              </p>
            </div>
          )}

          {/* Process Button */}
          <button
            onClick={mergeAudio}
            disabled={files.length < 2 || isProcessing}
            className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing
              ? "처리 중..."
              : isLoading
                ? "FFmpeg 로딩 중..."
                : `${files.length}개 파일 합치기`}
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
              <h2 className="text-lg font-semibold mb-4">합치기 완료!</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary">출력 형식</p>
                  <p className="text-xl font-bold text-foreground uppercase">
                    {outputFormat}
                  </p>
                </div>
                <DownloadButton
                  data={result}
                  filename={`merged_audio.${outputFormat}`}
                >
                  합쳐진 오디오 다운로드
                </DownloadButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
