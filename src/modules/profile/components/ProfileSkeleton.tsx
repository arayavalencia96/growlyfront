function SkeletonLine({ className }: { className: string }) {
  return <div className={`rounded-full bg-brand/8 ${className}`} />;
}

function FieldSkeleton({ width = "w-24" }: { width?: string }) {
  return (
    <div>
      <SkeletonLine className={`mb-2 h-3 ${width}`} />
      <div className="h-13 rounded-2xl border border-outline/5 bg-surface/55" />
    </div>
  );
}

function SectionHeadingSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="size-10 rounded-xl bg-brand/10" />
      <div>
        <SkeletonLine className="h-7 w-44" />
        <SkeletonLine className="mt-2 h-3 w-36" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando perfil"
      className="mx-auto max-w-6xl animate-pulse space-y-6 motion-reduce:animate-none"
    >
      <div className="overflow-hidden rounded-[2rem] bg-brand/12 p-7 sm:p-9">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="size-20 shrink-0 rounded-[1.75rem] bg-brand/12" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <SkeletonLine className="h-11 w-64 max-w-full" />
              <SkeletonLine className="h-7 w-24" />
            </div>
            <SkeletonLine className="mt-4 h-3 w-52 max-w-full" />
          </div>
          <div className="border-outline/8 pt-5 sm:min-w-48 sm:border-l sm:pt-0 sm:pl-8">
            <SkeletonLine className="h-3 w-24" />
            <SkeletonLine className="mt-3 h-4 w-32" />
          </div>
        </div>
      </div>

      <section className="rounded-[1.75rem] border border-outline/5 bg-surface/45 p-6 sm:p-7">
        <SectionHeadingSkeleton />
        <div className="mt-7 space-y-5">
          <FieldSkeleton width="w-16" />
          <FieldSkeleton width="w-32" />
          <div className="h-12 w-40 rounded-2xl bg-brand/10" />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-outline/5 bg-surface/45 p-6 sm:p-7">
        <SectionHeadingSkeleton />
        <div className="mt-7 space-y-5">
          <FieldSkeleton width="w-28" />
          <FieldSkeleton width="w-28" />
          <FieldSkeleton width="w-44" />
          <div className="grid gap-3 rounded-2xl border border-outline/5 bg-surface/35 p-4 sm:grid-cols-2">
            {[1, 2, 3].map((item) => (
              <SkeletonLine key={item} className="h-3 w-48 max-w-full" />
            ))}
          </div>
          <div className="h-12 w-48 rounded-2xl bg-brand/10" />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-outline/5 bg-surface/45 p-6 sm:p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SkeletonLine className="h-3 w-28" />
            <SkeletonLine className="mt-3 h-8 w-52" />
            <SkeletonLine className="mt-4 h-3 w-full max-w-lg" />
            <SkeletonLine className="mt-2 h-3 w-3/5 max-w-sm" />
          </div>
          <div className="h-12 w-40 shrink-0 rounded-2xl bg-brand/8" />
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] bg-brand/12 p-6 sm:p-7">
        <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="flex items-start gap-4">
            <div className="size-11 shrink-0 rounded-2xl bg-brand/12" />
            <div className="flex-1">
              <SkeletonLine className="h-9 w-32" />
              <SkeletonLine className="mt-3 h-3 w-full max-w-md" />
              <SkeletonLine className="mt-2 h-3 w-3/4 max-w-sm" />
            </div>
          </div>
          <div className="border-outline/8 pt-6 md:min-w-72 md:border-l md:pt-0 md:pl-8">
            <SkeletonLine className="h-3 w-16" />
            <SkeletonLine className="mt-3 h-7 w-20" />
            <SkeletonLine className="mt-5 h-3 w-48" />
            <SkeletonLine className="mt-3 h-3 w-56" />
          </div>
        </div>
      </section>
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
