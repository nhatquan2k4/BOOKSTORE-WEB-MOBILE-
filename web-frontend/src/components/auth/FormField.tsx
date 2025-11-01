import React from 'react';
import { cn } from '@/lib/utils/cn';
import { authTextStyles, authIconStyles } from '@/constants/authStyles';

interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

export function FormField({ children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)} suppressHydrationWarning>
      {children}
    </div>
  );
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

export function FormLabel({ required, children, className, ...props }: FormLabelProps) {
  return (
    <label 
      className={cn(authTextStyles.label, className)} 
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

interface FormErrorProps {
  children: React.ReactNode;
  className?: string;
}

export function FormError({ children, className }: FormErrorProps) {
  return (
    <p className={cn(authTextStyles.error, 'flex items-center gap-1', className)}>
      <svg className={cn(authIconStyles.small, 'flex-shrink-0')} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {children}
    </p>
  );
}

interface FormHelperTextProps {
  children: React.ReactNode;
  className?: string;
}

export function FormHelperText({ children, className }: FormHelperTextProps) {
  return (
    <p className={cn(authTextStyles.helper, className)}>
      {children}
    </p>
  );
}
