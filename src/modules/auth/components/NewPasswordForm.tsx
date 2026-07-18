import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { PasswordField } from '@/modules/auth/components/PasswordField'
import { PasswordRequirements } from '@/modules/auth/components/PasswordRequirements'
import { SubmitButton } from '@/modules/auth/components/SubmitButton'
import type {
  IChangeBlockedPasswordForm,
  INewPasswordFormProps,
} from '@/modules/auth/interfaces/auth.interface'
import { newPasswordSchema } from '@/modules/auth/validations/auth.validation'

export function NewPasswordForm({
  hasToken,
  onSave,
  submitText,
  loadingText,
}: INewPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IChangeBlockedPasswordForm>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(async (data) => {
    if (hasToken) {
      await onSave(data.newPassword)
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <PasswordField
        {...register('newPassword')}
        label="Nueva contraseña"
        autoComplete="new-password"
        placeholder="Nueva contraseña"
        error={errors.newPassword?.message}
      />
      <PasswordField
        {...register('confirmPassword')}
        label="Confirmar nueva contraseña"
        autoComplete="new-password"
        placeholder="Repetí la nueva contraseña"
        error={errors.confirmPassword?.message}
      />
      <PasswordRequirements />
      <SubmitButton
        isLoading={isSubmitting}
        loadingText={loadingText}
        disabled={!hasToken}
      >
        {submitText}
        <ArrowRight aria-hidden="true" size={18} />
      </SubmitButton>
    </form>
  )
}
