import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", wrapperClassName = "", type = "text", ...props }, ref) => {
    const errorBorder = error 
      ? "border-rose-500 focus:ring-rose-500 focus:border-rose-500 dark:border-rose-500" 
      : "border-[var(--border-light)] focus:ring-accent focus:border-accent dark:border-slate-800";

    return (
      <div className={`flex flex-col gap-1.5 w-full ${wrapperClassName}`}>
        {label && (
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`px-3 py-2 text-sm bg-white dark:bg-slate-900 border rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed ${errorBorder} ${className}`}
          {...props}
        />
        {error && (
          <span className="text-[11px] font-medium text-rose-500 animate-slide-in">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
