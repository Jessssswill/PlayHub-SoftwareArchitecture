import { LucideIcon } from 'lucide-react';
import { tokens } from '../../lib/design-tokens';

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  cta?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, cta }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <Icon className={`w-12 h-12 ${tokens.textMuted}`} strokeWidth={1.5} />
      <p className={`text-base font-medium ${tokens.text}`}>{title}</p>
      {description && <p className={`text-sm ${tokens.textMuted} max-w-xs`}>{description}</p>}
      {cta && <div className="mt-2">{cta}</div>}
    </div>
  );
}
