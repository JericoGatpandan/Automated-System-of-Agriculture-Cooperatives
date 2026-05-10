import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Building2,
  ClipboardList,
  Leaf,
  Sprout,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { cn } from "@/lib/utils";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";

function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

const PLACEHOLDER_PARTNERS = [
  { label: "Partner A", abbr: "A" },
  { label: "Partner B", abbr: "B" },
  { label: "Partner C", abbr: "C" },
  { label: "Partner D", abbr: "D" },
  { label: "Partner E", abbr: "E" },
  { label: "Partner F", abbr: "F" },
];

export function LandingPage() {
  const location = useLocation();

  // Scroll to #features / #partners when navigating from another route or clicking nav on home.
  useEffect(() => {
    const raw = location.hash.replace(/^#/, "");
    if (!raw) return;
    const id = decodeURIComponent(raw);
    const el = document.getElementById(id);
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [location.pathname, location.hash]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                <Leaf className="h-3.5 w-3.5 text-primary" aria-hidden />
                Built for FACCS and primary cooperatives in Camarines Sur
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                From buyer orders to farmer ledgers—one transparent system
              </h1>
              <p className="mt-5 text-base text-muted-foreground sm:text-lg md:text-xl">
                ASAC connects federation admins, cooperative officers, and farmers:
                manage referrals, deliveries, and FarmLedger accounting with records you can audit
                and share at cooperative meetings.
              </p>
              <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Button size="lg" className="gap-2" asChild>
                  <Link to="/login">
                    Sign in
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#features">View features</a>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="scroll-mt-[72px] px-4 py-16 sm:px-6 sm:py-20"
        >
          <div className="mx-auto max-w-6xl">
            <Reveal className="mb-10 text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Three core modules
              </h2>
              <p className="mt-2 max-w-2xl mx-auto text-sm text-muted-foreground sm:text-base">
                Registry, orders, and accounting work together so nothing falls through informal
                channels.
              </p>
            </Reveal>

            <div className="grid gap-6 md:grid-cols-3">
              <Reveal delayMs={0}>
                <Card className="h-full border-border/80 shadow-sm transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <CardTitle className="text-lg">Cooperative &amp; farmer registry</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Register primary cooperatives and farmer-members with clear membership and farm
                      profiles—ready for assignments and ledger accounts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Officers maintain accurate rosters; federation sees the network at a glance.
                  </CardContent>
                </Card>
              </Reveal>

              <Reveal delayMs={80}>
                <Card className="h-full border-border/80 shadow-sm transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <ClipboardList className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <CardTitle className="text-lg">Order &amp; transaction management</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Log buyer requests, assign cooperatives, match farmers to quantities, and confirm
                      deliveries—status stays visible end to end.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Reduces lost referrals and keeps referral workflows out of group chats alone.
                  </CardContent>
                </Card>
              </Reveal>

              <Reveal delayMs={160}>
                <Card className="h-full border-border/80 shadow-sm transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" aria-hidden />
                    </div>
                    <CardTitle className="text-lg">FarmLedger accounting</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Sales, federation and coop fees, share-capital lines, loans, and printable farmer
                      balance sheets—driven by completed deliveries.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Farmers get view-only clarity; officers stay accountable with persisted figures.
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Partners strip */}
        <section
          id="partners"
          className="scroll-mt-[72px] border-y border-border bg-muted/30 py-10"
        >
          <Reveal className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <div className="mb-2 flex items-center justify-center gap-2 text-muted-foreground">
              <Sprout className="h-4 w-4" aria-hidden />
              <span className="text-xs font-medium uppercase tracking-wider">
                Partner placeholders (draft)
              </span>
            </div>
            <p className="mb-6 text-xs text-muted-foreground">
              Illustrative strip until official partner logos are provided—no endorsement implied.
            </p>
          </Reveal>

          <div className="relative overflow-hidden py-2">
            <div className="landing-marquee-track flex gap-10 py-2">
              {[...PLACEHOLDER_PARTNERS, ...PLACEHOLDER_PARTNERS].map((p, i) => (
                <div
                  key={`${p.label}-${i}`}
                  className="flex shrink-0 items-center gap-3 rounded-full border border-border bg-card px-5 py-2 shadow-sm"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                    {p.abbr}
                  </span>
                  <span className="text-sm font-medium text-foreground">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
