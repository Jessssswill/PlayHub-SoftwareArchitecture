import { Loader2 } from 'lucide-react';
import { tokens } from '../../lib/design-tokens';

interface Props {
  message?: string;
}

export function LoadingState({ message = 'Loading…' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className={`w-8 h-8 ${tokens.textMuted} animate-spin`} />
      <p className={`text-sm ${tokens.textMuted}`}>{message}</p>
    </div>
  );
}
