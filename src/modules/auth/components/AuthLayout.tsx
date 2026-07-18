import { BrandMark } from '@/modules/auth/components/BrandMark'
import type { IAuthLayoutProps } from '@/modules/auth/interfaces/auth.interface'

const AUTH_STEPS = [
  'Definí un objetivo',
  'Registrá tus transacciones',
  'Medí el progreso real',
] as const

export function AuthLayout({
  children,
  eyebrow,
  title,
  description,
  step,
}: IAuthLayoutProps) {
  return (
    <main className="min-h-screen bg-linen lg:grid lg:grid-cols-[minmax(360px,0.86fr)_1.14fr]">
      <aside className="auth-grid relative overflow-hidden bg-forest px-6 py-7 text-white sm:px-10 lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:px-14 lg:py-12">
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-32 size-80 rounded-full bg-moss/35 blur-3xl"
        />
        <BrandMark />

        <div className="relative mt-16 hidden max-w-lg lg:block">
          <p className="mb-5 text-xs font-bold tracking-[0.24em] text-lime uppercase">
            Patrimonio con propósito
          </p>
          <h2 className="font-display text-5xl leading-[1.02] tracking-[-0.03em] xl:text-6xl">
            Cada inversión empieza con una razón.
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-white/62">
            Ordená tus objetivos, movimientos y posiciones en un solo lugar.
            Sin planillas dispersas ni cálculos repetidos.
          </p>
        </div>

        <ol className="relative mt-10 hidden gap-5 lg:grid">
          {AUTH_STEPS.map((item, index) => (
            <li
              key={item}
              className="flex items-center gap-3 text-sm text-white/68"
            >
              <span className="grid size-6 place-items-center rounded-full border border-lime/35 text-lime">
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </aside>

      <section className="flex min-h-[calc(100vh-88px)] items-center justify-center px-5 py-10 sm:px-8 lg:min-h-screen lg:px-14 lg:py-16">
        <div className="auth-rise w-full max-w-[30rem]">
          <div className="mb-8">
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-xs font-extrabold tracking-[0.2em] text-moss uppercase">
                {eyebrow}
              </p>
              <span className="rounded-full border border-forest/10 bg-white px-3 py-1 text-[0.7rem] font-bold tracking-wide text-forest/55">
                {step}
              </span>
            </div>
            <h1 className="font-display text-[2.65rem] leading-[1.04] tracking-[-0.035em] text-forest sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-ink/58 sm:text-base sm:leading-7">
              {description}
            </p>
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}
