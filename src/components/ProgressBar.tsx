interface ProgressBarProps {
  progress: number;
  status?: string;
  showPercentage?: boolean;
}

export default function ProgressBar({
  progress,
  status,
  showPercentage = true,
}: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        {status && <span className="text-sm text-secondary">{status}</span>}
        {showPercentage && (
          <span className="text-sm font-medium text-foreground">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full h-3 bg-card-border rounded-full overflow-hidden">
        <div
          className="progress-bar h-full bg-gradient-to-r from-primary to-accent rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
