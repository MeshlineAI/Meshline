import { Nav } from "@/components/nav/Nav";
import { Footer } from "@/components/nav/Footer";
import { ScanlineOverlay } from "@/components/ui/ScanlineOverlay";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScanlineOverlay />
      <Nav />
      <main className="relative z-10 pt-28">{children}</main>
      <Footer />
    </>
  );
}

/** Standard page hero header for inner pages. */
export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div className="container-mesh">
      <div className="eyebrow">{eyebrow}</div>
      <h1 className="mt-4 max-w-3xl font-display text-balance text-4xl font-semibold leading-[1.0] tracking-[-0.035em] text-white sm:text-6xl">
        {title}
      </h1>
      {description && (
        <p className="mt-5 max-w-xl text-balance text-[15px] leading-relaxed text-muted sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
