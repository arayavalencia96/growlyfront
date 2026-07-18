import { CalendarDays, Code2, Sprout } from "lucide-react";
import { applicationConfig } from "@/common/config/application.config";

export function ApplicationInfo() {
  return (
    <section className="relative mt-6 overflow-hidden rounded-[1.75rem] bg-forest text-white">
      <div className="absolute -top-20 -right-14 size-56 rounded-full border-[42px] border-lime/8" />
      <div className="relative grid gap-7 p-6 sm:p-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-10">
        <div className="flex items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-lime text-forest">
            <Sprout size={22} />
          </span>
          <div>
            <h2 className="font-display text-4xl">{applicationConfig.name}</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-white/55">
              {applicationConfig.description}
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center md:min-w-72 md:border-t-0 md:border-l md:pt-0 md:pl-8 md:text-left">
          <p className="text-[10px] font-bold tracking-[0.12em] text-lime uppercase">
            Versión
          </p>

          <p className="mt-1 font-display text-2xl">
            v{applicationConfig.version}
          </p>

          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/55 md:justify-start">
            <Code2 size={15} className="shrink-0 text-lime" />
            Desarrollado por {applicationConfig.author}.
          </p>

          <p className="mt-2 flex items-center justify-center gap-2 text-xs text-white/55 md:justify-start">
            <CalendarDays size={15} className="shrink-0 text-lime" />©{" "}
            {applicationConfig.year} Growly. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </section>
  );
}
