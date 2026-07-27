interface ProgressTrackerProps {
  progresso: number;
  height?: number;
}

export function ProgressTracker({ progresso, height = 3 }: ProgressTrackerProps) {
  return (
    <div className="va-progress-tracker" style={{ height }} role="progressbar" aria-valuenow={progresso} aria-valuemin={0} aria-valuemax={100} aria-label={'Progresso: ' + progresso + '%'}>
      <div className="va-progress-tracker__fill" style={{ width: progresso + '%' }} />
    </div>
  );
}
