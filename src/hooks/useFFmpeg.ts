"use client";

import { useState, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    if (isLoaded || isLoading) return ffmpegRef.current;

    setIsLoading(true);
    setStatus("FFmpeg 로딩 중...");

    try {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      ffmpeg.on("progress", ({ progress: p }) => {
        setProgress(Math.round(p * 100));
      });

      ffmpeg.on("log", ({ message }) => {
        console.log("[FFmpeg]", message);
      });

      // CDN에서 FFmpeg core 로드
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      setIsLoaded(true);
      setStatus("FFmpeg 준비 완료");
      return ffmpeg;
    } catch (error) {
      console.error("FFmpeg load error:", error);
      setStatus("FFmpeg 로딩 실패");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isLoading]);

  const writeFile = useCallback(
    async (name: string, file: File) => {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) throw new Error("FFmpeg not loaded");

      const data = await fetchFile(file);
      await ffmpeg.writeFile(name, data);
    },
    []
  );

  const readFile = useCallback(async (name: string) => {
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg) throw new Error("FFmpeg not loaded");

    const data = await ffmpeg.readFile(name);
    return data;
  }, []);

  const exec = useCallback(
    async (args: string[]) => {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg) throw new Error("FFmpeg not loaded");

      setProgress(0);
      await ffmpeg.exec(args);
    },
    []
  );

  const deleteFile = useCallback(async (name: string) => {
    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg) return;

    try {
      await ffmpeg.deleteFile(name);
    } catch {
      // Ignore errors
    }
  }, []);

  return {
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
  };
}
