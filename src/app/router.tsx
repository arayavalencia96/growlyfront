import { createBrowserRouter, Navigate } from "react-router-dom";
import { HomePage } from "@/app/pages/HomePage";
import { ApplicationLayout } from "@/common/layouts/ApplicationLayout";
import { RequireSession } from "@/common/components/RequireSession";
import { ChangeBlockedPasswordPage } from "@/modules/auth/pages/ChangeBlockedPasswordPage";
import { ForgotPasswordPage } from "@/modules/auth/pages/ForgotPasswordPage";
import { LoginPage } from "@/modules/auth/pages/LoginPage";
import { RegisterPage } from "@/modules/auth/pages/RegisterPage";
import { ResetPasswordPage } from "@/modules/auth/pages/ResetPasswordPage";
import { VerificationCodePage } from "@/modules/auth/pages/VerificationCodePage";
import { GoalDetailPage } from "@/modules/goals/pages/GoalDetailPage";
import { GoalsPage } from "@/modules/goals/pages/GoalsPage";
import { ProfilePage } from "@/modules/profile/pages/ProfilePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/iniciar-sesion" replace />,
  },
  {
    path: "/iniciar-sesion",
    element: <LoginPage />,
  },
  {
    path: "/registro",
    element: <RegisterPage />,
  },
  {
    path: "/verificar-codigo",
    element: <VerificationCodePage />,
  },
  {
    path: "/recuperar-contrasena",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/restablecer-contrasena",
    element: <ResetPasswordPage />,
  },
  {
    path: "/cambiar-contrasena",
    element: <ChangeBlockedPasswordPage />,
  },
  {
    path: "/change-password",
    element: <ChangeBlockedPasswordPage />,
  },
  {
    element: <RequireSession />,
    children: [
      {
        element: <ApplicationLayout />,
        children: [
          {
            path: "/inicio",
            element: <HomePage />,
          },
          {
            path: "/objetivos",
            element: <GoalsPage />,
          },
          {
            path: "/objetivos/:goalId",
            element: <GoalDetailPage />,
          },
          {
            path: "/mi-perfil",
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/iniciar-sesion" replace />,
  },
]);
