import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { AuthProvider } from "@/lib/auth";
import { useCdInvalidator } from "@/lib/cd-store";

function NotFoundComponent() {
  return (
    <div className="bg-bone text-ink min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        <div className="md:col-span-4">
          <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-vermil">§ 404 · Off the catalog</div>
          <div className="fr-score-card text-[140px] md:text-[200px] leading-none text-ink mt-4">404</div>
        </div>
        <div className="md:col-span-8 space-y-6 border-t border-rule pt-6">
          <h1 className="fr-display text-[56px] md:text-[88px] text-ink">Not in the <span className="serif-it">stacks.</span></h1>
          <p className="fr-dek text-[20px] text-ink-2 max-w-[55ch]">
            That record isn't on file. The page you asked for has been moved, mis-shelved, or was never pressed.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/" className="font-mono text-[11px] tracking-[0.25em] uppercase bg-vermil text-night px-5 py-3 btn-pop">→ Home</Link>
            <Link to="/reviews" className="font-mono text-[11px] tracking-[0.25em] uppercase border border-rule px-5 py-3 hover:bg-bone-2">Reviews</Link>
            <Link to="/archive" className="font-mono text-[11px] tracking-[0.25em] uppercase border border-rule px-5 py-3 hover:bg-bone-2">Archive</Link>
            <Link to="/contact" className="font-mono text-[11px] tracking-[0.25em] uppercase border border-rule px-5 py-3 hover:bg-bone-2">Report a broken link</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "cdreviews." },
      { name: "description", content: "Independent music criticism since 1995." },
      { name: "author", content: "cdreviews" },
      { name: "theme-color", content: "#0f0e0c" },
      { property: "og:title", content: "cdreviews." },
      { property: "og:description", content: "Independent music criticism since 1995." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "cdreviews." },
      { name: "twitter:description", content: "Independent music criticism since 1995." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;700&display=swap" },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <InvalidatorMount />
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function InvalidatorMount() {
  useCdInvalidator();
  return null;
}
