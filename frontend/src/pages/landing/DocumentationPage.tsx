import { Construction } from "lucide-react";
import { PublicHeader } from "./PublicHeader";
import { PublicFooter } from "./PublicFooter";

export function DocumentationPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PublicHeader />
      <main className="flex-1 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Construction className="h-8 w-8 text-primary" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Documentation</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Technical guides, API notes, and operator manuals are{" "}
            <strong className="text-foreground font-medium">currently being built</strong>.
            Check back soon, or sign in to use the live application modules.
          </p>
          <p className="mt-6 text-sm text-muted-foreground italic">
            Coming soon — thank you for your patience.
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
