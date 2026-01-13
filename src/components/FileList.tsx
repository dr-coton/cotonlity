"use client";

interface FileItem {
  file: File;
  id: string;
}

interface FileListProps {
  files: FileItem[];
  onRemove: (id: string) => void;
  onReorder?: (files: FileItem[]) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getFileIcon(type: string): string {
  if (type.startsWith("audio/")) return "🎵";
  if (type.startsWith("video/")) return "🎬";
  if (type.startsWith("image/")) return "🖼️";
  if (type === "application/pdf") return "📄";
  return "📁";
}

export default function FileList({ files, onRemove }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="w-full space-y-2">
      <h3 className="text-sm font-medium text-secondary">
        선택된 파일 ({files.length}개)
      </h3>
      <ul className="space-y-2">
        {files.map((item, index) => (
          <li
            key={item.id}
            className="flex items-center justify-between p-3 bg-card border border-card-border rounded-lg"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl flex-shrink-0">
                {getFileIcon(item.file.type)}
              </span>
              <span className="text-sm text-secondary flex-shrink-0">
                {index + 1}.
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.file.name}
                </p>
                <p className="text-xs text-secondary">
                  {formatFileSize(item.file.size)}
                </p>
              </div>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="p-1 text-secondary hover:text-error rounded-lg hover:bg-error/10 transition-colors flex-shrink-0"
              aria-label="파일 제거"
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
          </li>
        ))}
      </ul>
    </div>
  );
}
