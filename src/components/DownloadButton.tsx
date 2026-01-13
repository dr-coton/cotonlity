"use client";

interface DownloadButtonProps {
  data: Blob | null;
  filename: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export default function DownloadButton({
  data,
  filename,
  disabled = false,
  children = "다운로드",
}: DownloadButtonProps) {
  const handleDownload = () => {
    if (!data) return;

    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled || !data}
      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-success to-emerald-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      {children}
    </button>
  );
}
