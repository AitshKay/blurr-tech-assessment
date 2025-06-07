import { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PageContainer } from './page-container';

interface ListPageProps {
  title: string;
  description?: string;
  createHref: string;
  createLabel: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function ListPage({
  title,
  description,
  createHref,
  createLabel,
  children,
  className,
  actions,
}: ListPageProps) {
  return (
    <PageContainer 
      title={title} 
      description={description}
      className={className}
      actions={
        <>
          {actions}
          <Button asChild>
            <Link href={createHref}>
              <Plus className="mr-2 h-4 w-4" />
              {createLabel}
            </Link>
          </Button>
        </>
      }
    >
      {children}
    </PageContainer>
  );
}
