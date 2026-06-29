import { AlertCircle } from 'lucide-react';
import { tokens, btn } from '../../lib/design-tokens';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <AlertCircle className={`w-10 h-10 ${tokens.danger}`} />
      <p className={`text-sm font-medium ${tokens.danger}`}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className={btn.secondary + ' text-sm mt-1'}>
          Retry
        </button>
      )}
    </div>
  );
}
