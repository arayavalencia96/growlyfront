import type { IFormFieldProps } from "@/modules/auth/interfaces/auth.interface";

export function FormField({
  label,
  error,
  hint,
  icon,
  className = "",
  id,
  ref,
  ...inputProps
}: Readonly<IFormFieldProps>) {
  const fieldId = id || inputProps.name;
  const hintDescriptionId = hint ? fieldId + "-hint" : undefined;
  const descriptionId = error ? fieldId + "-error" : hintDescriptionId;

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="mb-2 block text-sm font-bold text-primary"
      >
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-secondary">
            {icon}
          </span>
        ) : null}
        <input
          {...inputProps}
          ref={ref}
          id={fieldId}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
          className={
            "auth-field " +
            (icon ? "pl-11 " : "") +
            (error
              ? "border-ember/60 focus:border-ember focus:ring-ember/10 "
              : "") +
            className
          }
        />
      </div>
      {error && (
        <p id={descriptionId} className="mt-1.5 text-xs font-medium text-ember">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={descriptionId} className="mt-1.5 text-xs text-body/48">
          {hint}
        </p>
      )}
    </div>
  );
}
