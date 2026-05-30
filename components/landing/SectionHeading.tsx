import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      blur
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      <div
        className={cn(
          "mb-4 flex items-center gap-2.5 text-[10.5px] font-medium uppercase tracking-[0.2em]",
          align === "center" && "justify-center",
        )}
      >
        {index && (
          <>
            <span className="font-serif-display text-sm normal-case tracking-normal text-accent">
              {index}
            </span>
            <span aria-hidden className="h-px w-6 bg-white/15" />
          </>
        )}
        <span className="text-muted">{eyebrow}</span>
      </div>
      <h2 className="font-display text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.035em] text-white sm:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-balance text-[15px] leading-relaxed text-muted sm:text-base">
          {description}
        </p>
      )}
    </Reveal>
  );
}
