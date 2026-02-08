import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-slate-600 text-slate-200': variant === 'default',
          'bg-green-500/20 text-green-400': variant === 'success',
          'bg-amber-500/20 text-amber-400': variant === 'warning',
          'bg-red-500/20 text-red-400': variant === 'danger',
          'bg-blue-500/20 text-blue-400': variant === 'info',
        },
        className
      )}
    >
      {children}
    </span>
  );
}

export function TierBadge({ tier }: { tier: string }) {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    lite: 'default',
    starter: 'info',
    business: 'warning',
    pro: 'success',
    enterprise: 'danger',
  };

  return (
    <Badge variant={variants[tier.toLowerCase()] || 'default'}>
      {tier}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    active: 'success',
    inactive: 'default',
    suspended: 'danger',
    pending: 'warning',
  };

  return (
    <Badge variant={variants[status.toLowerCase()] || 'default'}>
      {status}
    </Badge>
  );
}
