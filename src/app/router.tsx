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
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/verify-code",
    element: <VerificationCodePage />,
  },
  {
    path: "/recover-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
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
            path: "/home",
            element: <HomePage />,
          },
          {
            path: "/objectives",
            element: <GoalsPage />,
          },
          {
            path: "/objectives/:goalId",
            element: <GoalDetailPage />,
          },
          {
            path: "/profile",
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
