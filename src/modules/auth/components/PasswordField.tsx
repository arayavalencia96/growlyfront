import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import type { IPasswordFieldProps } from '@/modules/auth/interfaces/auth.interface'

export function PasswordField({
  label,
  error,
  hint,
  className = '',
  id,
  ref,
  ...inputProps
}: IPasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)
  const fieldId = id || inputProps.name
  const descriptionId = error
    ? fieldId + '-error'
    : hint
      ? fieldId + '-hint'
      : undefined

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="mb-2 block text-sm font-bold text-forest"
      >
        {label}
      </label>
      <div className="relative">
        <LockKeyhole
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-moss"
          size={18}
        />
        <input
          {...inputProps}
          ref={ref}
          id={fieldId}
          type={isVisible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={descriptionId}
          className={
            'auth-field pr-12 pl-11 ' +
            (error
              ? 'border-ember/60 focus:border-ember focus:ring-ember/10 '
              : '') +
            className
          }
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          className="absolute top-1/2 right-4 -translate-y-1/2 rounded-md p-1 text-ink/45 transition hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          aria-label={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {isVisible ? (
            <EyeOff aria-hidden="true" size={18} />
          ) : (
            <Eye aria-hidden="true" size={18} />
          )}
        </button>
      </div>
      {error ? (
        <p id={descriptionId} className="mt-1.5 text-xs font-medium text-ember">
          {error}
        </p>
      ) : hint ? (
        <p id={descriptionId} className="mt-1.5 text-xs text-ink/48">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
