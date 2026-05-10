import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import logoImg from "../../assets/logo.png";
import { HOME_FEATURES, HOME_PARTNERS } from "./hashLinks";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3 rounded-md outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
          <img src={logoImg} alt="" className="h-9 w-9 rounded-md" width={36} height={36} />
          <div className="leading-tight text-left">
            <span className="text-base font-semibold tracking-tight">ASAC</span>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Agriculture Cooperatives
            </p>
          </div>
        </Link>

        <nav className="flex flex-1 flex-wrap items-center justify-end gap-x-4 gap-y-2 sm:gap-x-6">
          <Link
            to={HOME_FEATURES}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            to={HOME_PARTNERS}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Partners
          </Link>
          <Link
            to="/about"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            About
          </Link>
          <Link
            to="/docs"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Docs
          </Link>
          <Button size="sm" className="shrink-0" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
