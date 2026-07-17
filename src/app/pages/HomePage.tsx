import { ArrowRight, Sprout } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { sessionService } from '@/common/services/session.service'

export function HomePage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    sessionService.clear()
    navigate('/iniciar-sesion', { replace: true })
  }

  return (
    <main className="grid min-h-screen place-items-center bg-linen px-6 text-ink">
      <section className="w-full max-w-xl rounded-[2rem] border border-forest/10 bg-white p-8 shadow-[0_30px_90px_rgba(20,54,44,0.12)] sm:p-12">
        <div className="mb-8 inline-flex size-12 items-center justify-center rounded-2xl bg-forest text-lime">
          <Sprout aria-hidden="true" size={24} strokeWidth={1.8} />
        </div>
        <p className="mb-3 text-xs font-bold tracking-[0.22em] text-moss uppercase">
          Sesión iniciada
        </p>
        <h1 className="font-display text-4xl leading-tight text-forest sm:text-5xl">
          La base de autenticación está lista.
        </h1>
        <p className="mt-5 max-w-md leading-7 text-ink/65">
          El próximo módulo reemplazará esta pantalla con el panel principal de
          objetivos e inversiones.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-9 inline-flex items-center gap-2 font-semibold text-forest transition-colors hover:text-moss"
        >
          Cerrar sesión
          <ArrowRight aria-hidden="true" size={18} />
        </button>
      </section>
    </main>
  )
}
