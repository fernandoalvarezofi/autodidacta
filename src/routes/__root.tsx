import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-orange font-mono mb-4">Error 404</p>
        <h1 className="text-5xl font-display font-semibold text-ink">Página no encontrada</h1>
        <p className="mt-4 text-sm text-ink/60">
          La página que buscás no existe o fue movida.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium border border-ink text-ink hover:bg-ink hover:text-paper transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "Autodidactas — Convertí cualquier cosa en conocimiento",
      },
      {
        name: "description",
        content:
          "PDF, audio, video, manuscrito — en segundos tenés tu resumen, flashcards y quiz listos para estudiar como nunca antes.",
      },
      { name: "author", content: "Autodidactas" },
      { name: "theme-color", content: "#1a1230" },
      {
        property: "og:title",
        content: "Autodidactas — Estudiá como nunca antes",
      },
      {
        property: "og:description",
        content:
          "Plataforma de estudio activo con IA: convertí cualquier formato en herramientas de estudio. Resúmenes, flashcards SM-2, quiz competitivo y más.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Autodidacta" },
      {
        name: "twitter:description",
        content: "Convertí cualquier cosa en conocimiento.",
      },
      { title: "Autodidacta" },
      { property: "og:title", content: "Autodidacta" },
      { name: "description", content: "Autodidactas: AI-powered SaaS for active, visual, and gamified learning." },
      { property: "og:description", content: "Autodidactas: AI-powered SaaS for active, visual, and gamified learning." },
      { name: "twitter:description", content: "Autodidactas: AI-powered SaaS for active, visual, and gamified learning." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5c9aedf6-c017-4704-8781-59ff6f575dda/id-preview-4ea26a1f--5797afb1-73b0-4d29-a3d5-60378a437249.lovable.app-1776680338803.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5c9aedf6-c017-4704-8781-59ff6f575dda/id-preview-4ea26a1f--5797afb1-73b0-4d29-a3d5-60378a437249.lovable.app-1776680338803.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
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
  return (
    <AuthProvider>
      <PaymentTestModeBanner />
      <Outlet />
      <Toaster position="bottom-right" />
    </AuthProvider>
  );
}
