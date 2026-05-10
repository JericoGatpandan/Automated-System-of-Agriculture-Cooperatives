import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Share2 } from "lucide-react";

/**
 * Draft contact & social placeholders — replace with approved FACCS details.
 */
const DRAFT_ADDRESS =
  "J. Hernandez Ave., Naga City, Camarines Sur, Philippines (FACCS — draft)";
const DRAFT_EMAIL = "info@faccs.example.org";
const DRAFT_PHONE = "+63 (000) 000-0000";

export function PublicFooter() {
  const year = new Date().getFullYear();

  const footLink =
    "text-sm text-muted-foreground transition-colors hover:text-foreground";

  return (
    <footer className="border-t border-border bg-muted/25">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand / About */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">ASAC</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Accounting System of Agriculture Cooperatives — supporting federation staff,
              cooperative officers, and farmers across Camarines Sur.
            </p>
            <Link to="/about" className={`${footLink} inline-block font-medium text-primary`}>
              About us →
            </Link>
          </div>

          {/* Site map */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Site map</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/" className={footLink}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/#features" className={footLink}>
                  Features
                </Link>
              </li>
              <li>
                <Link to="/#partners" className={footLink}>
                  Partners
                </Link>
              </li>
              <li>
                <Link to="/about" className={footLink}>
                  About us
                </Link>
              </li>
              <li>
                <Link to="/docs" className={footLink}>
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/login" className={footLink}>
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact — draft FACCS */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Contact (draft)</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden />
                <span>{DRAFT_ADDRESS}</span>
              </li>
              <li className="flex gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden />
                <a href={`mailto:${DRAFT_EMAIL}`} className="underline-offset-4 hover:underline">
                  {DRAFT_EMAIL}
                </a>
              </li>
              <li className="flex gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden />
                <span>{DRAFT_PHONE}</span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground/90 italic">
              Official FACCS contact details will replace these placeholders when confirmed.
            </p>
          </div>

          {/* Social — draft */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Follow (draft)</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Social channels will be linked here once handles are finalized.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Social — placeholder"
                title="Coming soon"
              >
                <Share2 className="h-4 w-4" aria-hidden />
              </a>
              <a
                href="#"
                className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="More social links — placeholder"
                title="Coming soon"
              >
                More
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-8 text-center text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>
            © {year} ASAC — Accounting System of Agriculture Cooperatives. Draft public site;
            not legal or contractual notice.
          </p>
          <Link to="/login" className="text-primary underline-offset-4 hover:underline shrink-0">
            Sign in
          </Link>
        </div>
      </div>
    </footer>
  );
}
