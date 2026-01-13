"use client";

import { useCallback, useState, useRef } from "react";

interface FileDropZoneProps {
  accept: string;
  multiple?: boolean;
  maxSize?: number; // MB 단위
  onFilesSelected: (files: File[]) => void;
  title?: string;
  description?: string;
}

export default function FileDropZone({
  accept,
  multiple = false,
  maxSize = 100,
  onFilesSelected,
  title = "파일을 드래그하거나 클릭하여 업로드",
  description = "파일을 선택하세요",
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (files: FileList | File[]): File[] => {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      const maxSizeBytes = maxSize * 1024 * 1024;

      for (const file of fileArray) {
        if (file.size > maxSizeBytes) {
          setError(`${file.name}: 파일 크기가 ${maxSize}MB를 초과합니다.`);
          continue;
        }
        validFiles.push(file);
      }

      return validFiles;
    },
    [maxSize]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setError(null);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const validFiles = validateFiles(files);
        if (validFiles.length > 0) {
          onFilesSelected(multiple ? validFiles : [validFiles[0]]);
        }
      }
    },
    [multiple, onFilesSelected, validateFiles]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const files = e.target.files;
      if (files && files.length > 0) {
        const validFiles = validateFiles(files);
        if (validFiles.length > 0) {
          onFilesSelected(multiple ? validFiles : [validFiles[0]]);
        }
      }
    },
    [multiple, onFilesSelected, validateFiles]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`drop-zone relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
          isDragging
            ? "dragging border-primary bg-primary/5"
            : "border-card-border hover:border-primary/50 hover:bg-card"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            className={`w-12 h-12 mb-4 ${isDragging ? "text-primary" : "text-secondary"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="mb-2 text-lg font-semibold text-foreground">{title}</p>
          <p className="text-sm text-secondary">{description}</p>
          <p className="mt-2 text-xs text-secondary">최대 {maxSize}MB</p>
        </div>
      </div>
      {error && (
        <div className="mt-2 p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}
    </div>
  );
}
