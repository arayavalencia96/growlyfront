import { createBrowserRouter, Navigate } from 'react-router-dom'
import { HomePage } from '@/app/pages/HomePage'
import { RequireSession } from '@/common/components/RequireSession'
import { ChangeBlockedPasswordPage } from '@/modules/auth/pages/ChangeBlockedPasswordPage'
import { ForgotPasswordPage } from '@/modules/auth/pages/ForgotPasswordPage'
import { LoginPage } from '@/modules/auth/pages/LoginPage'
import { RegisterPage } from '@/modules/auth/pages/RegisterPage'
import { ResetPasswordPage } from '@/modules/auth/pages/ResetPasswordPage'
import { VerificationCodePage } from '@/modules/auth/pages/VerificationCodePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/iniciar-sesion" replace />,
  },
  {
    path: '/iniciar-sesion',
    element: <LoginPage />,
  },
  {
    path: '/registro',
    element: <RegisterPage />,
  },
  {
    path: '/verificar-codigo',
    element: <VerificationCodePage />,
  },
  {
    path: '/recuperar-contrasena',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/restablecer-contrasena',
    element: <ResetPasswordPage />,
  },
  {
    path: '/cambiar-contrasena',
    element: <ChangeBlockedPasswordPage />,
  },
  {
    path: '/change-password',
    element: <ChangeBlockedPasswordPage />,
  },
  {
    element: <RequireSession />,
    children: [
      {
        path: '/inicio',
        element: <HomePage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/iniciar-sesion" replace />,
  },
])
