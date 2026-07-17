import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { sessionService } from '@/common/services/session.service'

export function RequireSession() {
  const location = useLocation()

  if (!sessionService.hasSession()) {
    return (
      <Navigate
        to="/iniciar-sesion"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}
