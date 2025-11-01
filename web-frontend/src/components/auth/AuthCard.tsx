import React from 'react';
import { cn } from '@/lib/utils/cn';
import { authContainerStyles, authTextStyles, authIconStyles } from '@/constants/authStyles';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function AuthCard({ children, title, subtitle, icon, className }: AuthCardProps) {
  return (
    <div className={cn(authContainerStyles.card, className)} suppressHydrationWarning>
      {/* Header */}
      <div className={authContainerStyles.header}>
        {icon && (
          <div className="flex justify-center mb-4">
            {icon}
          </div>
        )}
        <h2 className={authTextStyles.title}>{title}</h2>
        {subtitle && <p className={authTextStyles.subtitle}>{subtitle}</p>}
      </div>

      {/* Content */}
      {children}
    </div>
  );
}

interface AuthCardIconProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthCardIcon({ children, className }: AuthCardIconProps) {
  return (
    <div className={cn(
      authIconStyles.gradient,
      className
    )}>
      {children}
    </div>
  );
}
