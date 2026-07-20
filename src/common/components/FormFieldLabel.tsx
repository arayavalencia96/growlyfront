import { CircleHelp } from "lucide-react";
import {
  type CSSProperties,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

interface IFormFieldLabelProps {
  htmlFor: string;
  label: string;
  help?: string;
  compact?: boolean;
}

export function FormFieldLabel({
  htmlFor,
  label,
  help,
  compact = false,
}: IFormFieldLabelProps) {
  const tooltipId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<CSSProperties | null>(null);

  const closeTooltip = () => {
    setIsOpen(false);
    setPosition(null);
  };

  useLayoutEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const button = buttonRef.current;
      const tooltip = tooltipRef.current;
      if (!button || !tooltip) return;

      const trigger = button.getBoundingClientRect();
      const width = tooltip.offsetWidth;
      const height = tooltip.offsetHeight;
      const gap = 10;
      const margin = 12;
      const availableRight = window.innerWidth - trigger.right;
      const availableLeft = trigger.left;
      const availableTop = trigger.top;

      let left: number;
      let top: number;

      if (availableRight >= width + gap) {
        left = trigger.right + gap;
        top = trigger.top + trigger.height / 2 - height / 2;
      } else if (availableLeft >= width + gap) {
        left = trigger.left - width - gap;
        top = trigger.top + trigger.height / 2 - height / 2;
      } else if (availableTop >= height + gap) {
        left = trigger.left + trigger.width / 2 - width / 2;
        top = trigger.top - height - gap;
      } else {
        left = trigger.left + trigger.width / 2 - width / 2;
        top = trigger.bottom + gap;
      }

      setPosition({
        left: Math.min(
          Math.max(left, margin),
          window.innerWidth - width - margin,
        ),
        top: Math.min(
          Math.max(top, margin),
          window.innerHeight - height - margin,
        ),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  return (
    <div
      className={"flex items-center gap-1.5 " + (compact ? "mb-1.5" : "mb-2")}
    >
      <label
        htmlFor={htmlFor}
        className={
          compact
            ? "text-[10px] font-bold tracking-[0.12em] text-primary/65 uppercase"
            : "text-xs font-bold tracking-[0.08em] text-primary uppercase"
        }
      >
        {label}
      </label>
      {help ? (
        <>
          <button
            ref={buttonRef}
            type="button"
            aria-label={`Ayuda sobre ${label}`}
            aria-describedby={isOpen ? tooltipId : undefined}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={closeTooltip}
            onFocus={() => setIsOpen(true)}
            onBlur={closeTooltip}
            className="shrink-0 text-secondary/65 transition hover:text-primary focus:text-primary focus:outline-none"
          >
            <CircleHelp size={compact ? 13 : 14} />
          </button>
          {isOpen
            ? createPortal(
                <span
                  ref={tooltipRef}
                  id={tooltipId}
                  role="tooltip"
                  style={position || { left: 0, top: 0 }}
                  className={
                    "pointer-events-none fixed z-[70] w-64 rounded-xl bg-brand px-3 py-2 text-left text-[11px] leading-4 font-medium tracking-normal text-white normal-case shadow-xl transition-opacity " +
                    (position ? "opacity-100" : "opacity-0")
                  }
                >
                  {help}
                </span>,
                document.body,
              )
            : null}
        </>
      ) : null}
    </div>
  );
}
