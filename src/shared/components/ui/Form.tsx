import React from 'react';
import { UseFormReturn, FieldPath, FieldValues, Controller } from 'react-hook-form';
import { Label } from './Label';

interface FormProps {
  children: React.ReactNode;
}

export const Form: React.FC<FormProps> = ({ children }) => {
  return <div className="space-y-4">{children}</div>;
};

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: UseFormReturn<TFieldValues>['control'];
  name: TName;
  render: ({ field }: { field: any }) => React.ReactElement;
}

export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  render
}: FormFieldProps<TFieldValues, TName>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={render}
    />
  );
};

interface FormItemProps {
  children: React.ReactNode;
  className?: string;
}

export const FormItem: React.FC<FormItemProps> = ({ children, className = '' }) => {
  return <div className={`space-y-2 ${className}`}>{children}</div>;
};

interface FormLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export const FormLabel: React.FC<FormLabelProps> = ({ children, htmlFor, className = '' }) => {
  return (
    <Label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
      {children}
    </Label>
  );
};

interface FormControlProps {
  children: React.ReactNode;
  className?: string;
}

export const FormControl: React.FC<FormControlProps> = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};

interface FormMessageProps {
  children?: React.ReactNode;
  className?: string;
}

export const FormMessage: React.FC<FormMessageProps> = ({ children, className = '' }) => {
  if (!children) return null;
  
  return (
    <p className={`text-sm font-medium text-red-500 ${className}`}>
      {children}
    </p>
  );
};