import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { AppToaster } from "@/common/components/AppToaster";

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <AppToaster />
    </>
  );
}
