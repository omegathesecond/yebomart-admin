import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface ErrorStateProps {
  /** The error message surfaced from the API/network layer. */
  message: string;
  /** Optional retry handler — renders a "Try again" button when provided. */
  onRetry?: () => void;
  className?: string;
}

/**
 * Explicit, loud failure state. Used wherever a page previously fell back to
 * fabricated demo data — an API/network failure must be visible, never masked
 * with mock rows.
 */
export default function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div className={`p-8 text-center ${className ?? ''}`}>
      <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <p className="text-white font-medium">Couldn't load data</p>
      <p className="text-slate-400 text-sm mt-1">{message}</p>
      {onRetry && (
        <div className="mt-4 flex justify-center">
          <Button size="sm" variant="secondary" onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
