import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Mail, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { AuthAlert } from '@/modules/auth/components/AuthAlert'
import { AuthLayout } from '@/modules/auth/components/AuthLayout'
import { FormField } from '@/modules/auth/components/FormField'
import { PasswordField } from '@/modules/auth/components/PasswordField'
import { PasswordRequirements } from '@/modules/auth/components/PasswordRequirements'
import { SubmitButton } from '@/modules/auth/components/SubmitButton'
import type { IRegisterForm } from '@/modules/auth/interfaces/auth.interface'
import { authService } from '@/modules/auth/services/auth.service'
import { getAuthErrorMessage } from '@/modules/auth/utils/auth-error.utils'
import { registerSchema } from '@/modules/auth/validations/auth.validation'

export function RegisterPage() {
  const navigate = useNavigate()
  const [requestError, setRequestError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IRegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    setRequestError('')

    try {
      const email = data.email.trim().toLowerCase()
      await authService.register({
        name: data.name.trim(),
        email,
        password: data.password,
      })
      const params = new URLSearchParams({
        email,
        purpose: 'registration',
      })
      navigate('/verificar-codigo?' + params.toString(), {
        replace: true,
        state: {
          message:
            'Te enviamos un código de seis dígitos. Revisa tu correo para continuar.',
        },
      })
    } catch (error: unknown) {
      setRequestError(getAuthErrorMessage(error))
    }
  })

  return (
    <AuthLayout
      eyebrow="Crea tu espacio"
      title="Dale un destino a tu dinero."
      description="Empieza con una cuenta y después convierte cada ahorro o inversión en progreso visible."
      step="Paso 1 de 2"
    >
      {requestError ? <AuthAlert message={requestError} /> : null}

      <form onSubmit={onSubmit} noValidate className="grid gap-5">
        <FormField
          {...register('name')}
          label="Nombre"
          autoComplete="name"
          placeholder="¿Cómo te llamas?"
          icon={<UserRound aria-hidden="true" size={18} />}
          error={errors.name?.message}
        />
        <FormField
          {...register('email')}
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="nombre@correo.com"
          icon={<Mail aria-hidden="true" size={18} />}
          error={errors.email?.message}
        />
        <PasswordField
          {...register('password')}
          label="Contraseña"
          autoComplete="new-password"
          placeholder="Crea una contraseña segura"
          error={errors.password?.message}
        />
        <PasswordField
          {...register('confirmPassword')}
          label="Confirmar contraseña"
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
          error={errors.confirmPassword?.message}
        />
        <PasswordRequirements />
        <SubmitButton
          isLoading={isSubmitting}
          loadingText="Creando cuenta..."
        >
          Crear mi cuenta
          <ArrowRight aria-hidden="true" size={18} />
        </SubmitButton>
      </form>

      <p className="mt-7 text-center text-sm text-ink/55">
        ¿Ya tienes cuenta?{' '}
        <Link
          to="/iniciar-sesion"
          className="font-extrabold text-forest underline decoration-lime decoration-4 underline-offset-4"
        >
          Ingresar
        </Link>
      </p>
    </AuthLayout>
  )
}
