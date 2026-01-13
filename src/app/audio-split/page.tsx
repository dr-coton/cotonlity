"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import FileDropZone from "@/components/FileDropZone";
import ProgressBar from "@/components/ProgressBar";
import DownloadButton from "@/components/DownloadButton";
import { useFFmpeg } from "@/hooks/useFFmpeg";

interface SplitSegment {
  id: string;
  startTime: string; // "MM:SS" format
  endTime: string;
  blob?: Blob;
}

type OutputFormat = "mp3" | "wav" | "ogg" | "m4a";

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function timeStringToSeconds(time: string): number {
  const parts = time.split(":").map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function AudioSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [segments, setSegments] = useState<SplitSegment[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("mp3");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      const selectedFile = files[0];
      setFile(selectedFile);
      setSegments([]);
      setError(null);

      // 오디오 길이 가져오기
      const audio = new Audio();
      audio.src = URL.createObjectURL(selectedFile);
      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration);
        audioRef.current = audio;
        // 기본 세그먼트 추가
        setSegments([
          {
            id: generateId(),
            startTime: "00:00",
            endTime: formatDuration(audio.duration),
          },
        ]);
      };
    }
  }, []);

  const addSegment = () => {
    setSegments((prev) => [
      ...prev,
      {
        id: generateId(),
        startTime: "00:00",
        endTime: formatDuration(audioDuration),
      },
    ]);
  };

  const removeSegment = (id: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSegment = (
    id: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const splitAudio = async () => {
    if (!file || segments.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      setStatus("FFmpeg 로딩 중...");
      await load();

      setStatus("파일 준비 중...");
      const inputName = `input.${file.name.split(".").pop()}`;
      await writeFile(inputName, file);
      setProgress(20);

      const results: SplitSegment[] = [];
      const totalSegments = segments.length;

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        setStatus(`세그먼트 ${i + 1}/${totalSegments} 처리 중...`);

        const startSeconds = timeStringToSeconds(segment.startTime);
        const endSeconds = timeStringToSeconds(segment.endTime);
        const duration = endSeconds - startSeconds;

        if (duration <= 0) {
          results.push({ ...segment });
          continue;
        }

        const outputName = `output_${i}.${outputFormat}`;

        const codecArgs: string[] = [];
        if (outputFormat === "mp3") {
          codecArgs.push("-c:a", "libmp3lame", "-q:a", "2");
        } else if (outputFormat === "ogg") {
          codecArgs.push("-c:a", "libvorbis", "-q:a", "5");
        } else if (outputFormat === "m4a") {
          codecArgs.push("-c:a", "aac", "-b:a", "192k");
        }

        await exec([
          "-i",
          inputName,
          "-ss",
          startSeconds.toString(),
          "-t",
          duration.toString(),
          ...codecArgs,
          outputName,
        ]);

        const data = await readFile(outputName);
        const mimeTypes: Record<OutputFormat, string> = {
          mp3: "audio/mpeg",
          wav: "audio/wav",
          ogg: "audio/ogg",
          m4a: "audio/mp4",
        };
        const uint8Array = new Uint8Array(data as Uint8Array);
        const blob = new Blob([uint8Array], { type: mimeTypes[outputFormat] });

        results.push({ ...segment, blob });
        await deleteFile(outputName);

        setProgress(20 + ((i + 1) / totalSegments) * 70);
      }

      await deleteFile(inputName);

      setProgress(100);
      setStatus("완료!");
      setSegments(results);
    } catch (err) {
      console.error("Audio split error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "오디오 분리 중 오류가 발생했습니다."
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
            <span className="text-3xl">✂️</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            오디오 분리
          </h1>
          <p className="text-secondary">
            오디오 파일을 원하는 구간으로 분리합니다.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* File Upload */}
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">1. 오디오 파일 선택</h2>
            <FileDropZone
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
              onFilesSelected={handleFilesSelected}
              title="오디오 파일을 드래그하거나 클릭"
              description="MP3, WAV, OGG, M4A, AAC, FLAC 지원"
              maxSize={200}
            />
            {file && (
              <div className="mt-4 flex items-center justify-between p-3 bg-background rounded-lg border border-card-border">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎵</span>
                  <div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-secondary">
                      전체 길이: {formatDuration(audioDuration)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setSegments([]);
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

          {/* Segments */}
          {file && (
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">2. 분리 구간 설정</h2>
                <button
                  onClick={addSegment}
                  className="px-4 py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  + 구간 추가
                </button>
              </div>
              <div className="space-y-3">
                {segments.map((segment, index) => (
                  <div
                    key={segment.id}
                    className="flex items-center gap-3 p-3 bg-background rounded-lg border border-card-border"
                  >
                    <span className="text-sm font-medium text-secondary w-8">
                      #{index + 1}
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-sm text-secondary">시작:</label>
                      <input
                        type="text"
                        value={segment.startTime}
                        onChange={(e) =>
                          updateSegment(segment.id, "startTime", e.target.value)
                        }
                        placeholder="00:00"
                        className="w-20 px-2 py-1 text-sm bg-card border border-card-border rounded text-foreground"
                      />
                      <label className="text-sm text-secondary">종료:</label>
                      <input
                        type="text"
                        value={segment.endTime}
                        onChange={(e) =>
                          updateSegment(segment.id, "endTime", e.target.value)
                        }
                        placeholder="00:00"
                        className="w-20 px-2 py-1 text-sm bg-card border border-card-border rounded text-foreground"
                      />
                    </div>
                    {segment.blob && (
                      <DownloadButton
                        data={segment.blob}
                        filename={`segment_${index + 1}.${outputFormat}`}
                      >
                        다운로드
                      </DownloadButton>
                    )}
                    {segments.length > 1 && (
                      <button
                        onClick={() => removeSegment(segment.id)}
                        className="p-1 text-secondary hover:text-error rounded hover:bg-error/10"
                      >
                        <svg
                          className="w-4 h-4"
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
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-secondary">
                시간 형식: MM:SS (예: 01:30 = 1분 30초)
              </p>
            </div>
          )}

          {/* Output Format */}
          {file && (
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">3. 출력 형식 선택</h2>
              <div className="grid grid-cols-4 gap-3">
                {(["mp3", "wav", "ogg", "m4a"] as OutputFormat[]).map(
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
          )}

          {/* Process Button */}
          {file && (
            <button
              onClick={splitAudio}
              disabled={segments.length === 0 || isProcessing}
              className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isProcessing
                ? "처리 중..."
                : isLoading
                  ? "FFmpeg 로딩 중..."
                  : `${segments.length}개 구간 분리하기`}
            </button>
          )}

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
        </div>
      </div>
    </div>
  );
}
