import { BookMarked } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-paper/85 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 lg:px-10 max-w-[1200px]">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2.5">
            <BookMarked className="w-5 h-5 text-orange" strokeWidth={1.75} />
            <span className="font-display font-semibold text-xl tracking-tight">
              Autodidactas
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-9 text-sm">
            <a href="#metodo" className="text-ink/70 hover:text-ink transition-colors">
              Método
            </a>
            <a href="#capacidades" className="text-ink/70 hover:text-ink transition-colors">
              Capacidades
            </a>
            <a href="#evidencia" className="text-ink/70 hover:text-ink transition-colors">
              Evidencia
            </a>
            <a href="#planes" className="text-ink/70 hover:text-ink transition-colors">
              Planes
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="/auth"
              className="hidden sm:inline-flex text-sm text-ink/70 hover:text-ink transition-colors"
            >
              Ingresar
            </a>
            <a
              href="/auth"
              className="inline-flex items-center px-4 py-2 text-sm font-medium border border-ink text-ink hover:bg-ink hover:text-paper transition-colors"
            >
              Comenzar
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
