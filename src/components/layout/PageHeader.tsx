'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description: React.ReactNode;
  icon?: React.ReactNode | React.ElementType<{ className?: string }>;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, icon, actions, className }: PageHeaderProps) {
  const iconNode = React.isValidElement(icon)
    ? icon
    : icon
      ? React.createElement(icon as React.ElementType<{ className?: string }>, {
          className: 'h-6 w-6',
        })
      : null;

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-[1.75rem] border border-border/70 bg-card/70 p-5 shadow-sm backdrop-blur md:flex-row md:items-start md:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex items-start gap-3">
          {iconNode ? (
            <div
              data-testid="page-header-icon"
              className="rounded-2xl border bg-background/80 p-3 text-primary shadow-sm"
            >
              {iconNode}
            </div>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <div className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              {description}
            </div>
          </div>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 md:pt-1">{actions}</div> : null}
    </div>
  );
}
