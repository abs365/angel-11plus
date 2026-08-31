import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";
import ErrorState from "@/components/ErrorState";

/**
 * Sprint 1 (Angel V2.0 Enterprise UI Foundation) — Form Components.
 * Every input's base className below is the exact existing pattern already
 * repeated across /login, /beta-family, /feedback, /report-bug,
 * /feature-request, /testimonial (`border-gray-200 rounded-xl px-4 py-3
 * focus:ring-2 focus:ring-blue-400`, etc.) — consolidated into one real
 * component rather than six independent copies. Validation messages reuse
 * `ErrorState` (AEI-001) unmodified — this file does not reintroduce a
 * second error-presentation pattern.
 */

const FIELD_BASE =
  "w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed";

interface FieldWrapperProps {
  label?: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}

/** The label + control + hint + ErrorState composition shared by every field below — not exported separately, since every exported field component already includes it. */
function FieldWrapper({ label, htmlFor, error, hint, optional, children }: FieldWrapperProps) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          {label} {optional && <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{hint}</p>}
      <ErrorState id={`${htmlFor}-error`} message={error} />
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, optional, id, className, ...rest },
  ref
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <FieldWrapper htmlFor={fieldId} label={label} error={error} hint={hint} optional={optional}>
      <input
        ref={ref}
        id={fieldId}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(FIELD_BASE, className)}
        {...rest}
      />
    </FieldWrapper>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, optional, id, className, ...rest },
  ref
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <FieldWrapper htmlFor={fieldId} label={label} error={error} hint={hint} optional={optional}>
      <textarea
        ref={ref}
        id={fieldId}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(FIELD_BASE, "resize-none", className)}
        {...rest}
      />
    </FieldWrapper>
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  placeholder?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, optional, placeholder, options, id, className, ...rest },
  ref
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <FieldWrapper htmlFor={fieldId} label={label} error={error} hint={hint} optional={optional}>
      <select
        ref={ref}
        id={fieldId}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(FIELD_BASE, "appearance-none", className)}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </FieldWrapper>
  );
});

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, error, id, className, ...rest },
  ref
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div>
      <label htmlFor={fieldId} className="flex items-start gap-3 cursor-pointer">
        <div className="mt-0.5 shrink-0">
          <input
            ref={ref}
            id={fieldId}
            type="checkbox"
            aria-describedby={error ? `${fieldId}-error` : undefined}
            className={cn("w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500", className)}
            {...rest}
          />
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{label}</span>
      </label>
      <ErrorState id={`${fieldId}-error`} message={error} />
    </div>
  );
});

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  name: string;
  legend: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

/** Radio group — real fieldset/legend semantics (screen readers announce the group's purpose once, not per-option), not present anywhere in this codebase before this sprint since every existing form used <select> instead. */
export function RadioGroup({ name, legend, options, value, onChange, error }: RadioGroupProps) {
  const groupId = `${name}-error`;
  return (
    <fieldset aria-describedby={error ? groupId : undefined}>
      <legend className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{legend}</legend>
      <div className="space-y-2">
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="w-4 h-4 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{o.label}</span>
          </label>
        ))}
      </div>
      <ErrorState id={groupId} message={error} />
    </fieldset>
  );
}
