import { Sprout } from "lucide-react";

export function BrandMark() {
  return (
    <div className="inline-flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-2xl bg-accent text-primary">
        <Sprout aria-hidden="true" size={21} strokeWidth={2} />
      </span>
      <span className="text-lg font-extrabold tracking-[-0.04em] text-white">
        growly
      </span>
    </div>
  );
}
