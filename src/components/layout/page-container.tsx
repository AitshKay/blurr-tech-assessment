import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageContainer({
  title,
  description,
  children,
  actions,
  className,
}: PageContainerProps) {
  return (
    <div className={cn('container mx-auto p-4 md:p-6 lg:p-8 space-y-6', className)}>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        {children}
      </div>
    </div>
  );
}
