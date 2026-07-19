function SkeletonLine({ className }: { className: string }) {
  return <div className={`rounded-full bg-brand/8 ${className}`} />;
}

export function PortfolioSummarySkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando resumen patrimonial"
      className="mt-8 animate-pulse overflow-hidden rounded-[2rem] border border-outline/6 bg-surface/45 motion-reduce:animate-none"
    >
      <div className="grid lg:grid-cols-[minmax(260px,0.8fr)_1.5fr]">
        <div className="border-outline/6 p-6 sm:p-8 lg:border-r">
          <div className="size-11 rounded-2xl bg-brand/10" />
          <SkeletonLine className="mt-5 h-3 w-36" />
          <SkeletonLine className="mt-4 h-11 w-52" />
          <SkeletonLine className="mt-3 h-3 w-28" />
          <SkeletonLine className="mt-7 h-3 w-40" />
        </div>
        <div className="p-6 sm:p-8">
          <SkeletonLine className="h-4 w-44" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-outline/6 bg-surface/55 p-4"
              >
                <SkeletonLine className="h-3 w-20" />
                <SkeletonLine className="mt-4 h-7 w-32" />
                <SkeletonLine className="mt-3 h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">Cargando...</span>
    </div>
  );
}

export function GoalCardsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando objetivos"
      className="mt-8 grid animate-pulse gap-5 motion-reduce:animate-none md:grid-cols-2 xl:grid-cols-3"
    >
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-72 rounded-[1.75rem] border border-outline/5 bg-surface/55 p-6"
        >
          <div className="flex justify-between">
            <SkeletonLine className="h-6 w-24" />
            <div className="flex gap-2">
              <div className="size-6 rounded-lg bg-brand/8" />
              <div className="size-6 rounded-lg bg-brand/8" />
            </div>
          </div>
          <SkeletonLine className="mt-10 h-8 w-3/5" />
          <SkeletonLine className="mt-4 h-3 w-2/5" />
          <SkeletonLine className="mt-10 h-3 w-1/2" />
          <div className="mt-6 border-t border-outline/6 pt-5">
            <SkeletonLine className="h-3 w-full" />
          </div>
        </div>
      ))}
      <span className="sr-only">Cargando...</span>
    </div>
  );
}

export function GoalDetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando detalle del objetivo"
      className="mx-auto max-w-7xl animate-pulse space-y-6 motion-reduce:animate-none"
    >
      <SkeletonLine className="h-4 w-36" />

      <div className="rounded-[2rem] bg-brand/12 p-7 sm:p-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="flex-1">
            <SkeletonLine className="h-3 w-44" />
            <SkeletonLine className="mt-5 h-12 w-full max-w-md" />
            <div className="mt-6 flex gap-4">
              <SkeletonLine className="h-3 w-36" />
              <SkeletonLine className="h-3 w-32" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-12 w-40 rounded-2xl bg-brand/8" />
            <div className="h-12 w-36 rounded-2xl bg-brand/10" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-36 rounded-[1.5rem] border border-outline/5 bg-surface/55 p-5"
          >
            <SkeletonLine className="h-3 w-28" />
            <SkeletonLine className="mt-6 h-8 w-36" />
            <SkeletonLine className="mt-3 h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="rounded-[1.5rem] border border-outline/5 bg-surface/55 p-6">
        <div className="flex justify-between gap-5">
          <div>
            <SkeletonLine className="h-3 w-28" />
            <SkeletonLine className="mt-3 h-3 w-52" />
          </div>
          <SkeletonLine className="h-10 w-20" />
        </div>
        <SkeletonLine className="mt-6 h-3 w-full" />
      </div>

      <div className="rounded-[1.5rem] border border-outline/5 bg-surface/45 p-6">
        <div className="flex justify-between">
          <div>
            <SkeletonLine className="h-3 w-32" />
            <SkeletonLine className="mt-3 h-8 w-44" />
          </div>
          <div className="size-8 rounded-full bg-brand/8" />
        </div>
        <div className="mt-6 h-36 rounded-2xl border border-outline/5 bg-surface/40" />
      </div>

      <div className="rounded-[2rem] border border-outline/5 bg-surface/45 p-6">
        <div className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-brand/10" />
            <div>
              <SkeletonLine className="h-7 w-32" />
              <SkeletonLine className="mt-2 h-3 w-40" />
            </div>
          </div>
          <div className="h-10 w-40 rounded-2xl bg-brand/8" />
        </div>
        <div className="mt-6 h-40 rounded-2xl border border-outline/5 bg-surface/40" />
      </div>
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
