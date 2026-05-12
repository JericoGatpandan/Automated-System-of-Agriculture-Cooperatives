import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PublicHeader />
      <main className="flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <article className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            About ASAC
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Draft content — refine with FACCS communications before publication.
          </p>

          <section className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              The <strong className="text-foreground font-medium">Automated System of Agriculture Cooperatives (ASAC)</strong>{" "}
              is a web-based platform developed for the{" "}
              <strong className="text-foreground font-medium">
                Federation of Agriculture Cooperatives in Camarines Sur (FACCS)
              </strong>
              , a secondary cooperative federation headquartered in Naga City. It supports federation
              administrators, primary cooperative officers, and farmer-members with structured workflows
              for registry data, buyer referrals through delivery, and FarmLedger accounting.
            </p>
            <p>
              ASAC follows an <strong className="text-foreground font-medium">officer-operated model</strong>:
              authorized FACCS and cooperative staff enter data on behalf of members, while farmers can
              access view-only ledger information where enabled.
            </p>
            <p>
              This page is a <strong className="text-foreground font-medium">draft</strong> for the public
              marketing site. Mission wording, statistics, and partner lists should be approved by FACCS
              before going live.
            </p>
          </section>
        </article>
      </main>
      <PublicFooter />
    </div>
  );
}
