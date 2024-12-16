import { ReactNode } from 'react';
import { FieldError } from 'react-hook-form';

interface FormFieldProps {
  name: string;
  label: string;
  error?: FieldError;
  children: ReactNode;
}

export function FormField({ name, label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-sm font-medium text-destructive">{error.message}</p>
      )}
    </div>
  );
}
