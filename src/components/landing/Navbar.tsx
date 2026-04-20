export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="container mx-auto px-6 max-w-7xl">
        <div
          className="mt-4 flex items-center justify-between rounded-2xl px-4 py-2.5 backdrop-blur-xl border border-border"
          style={{ background: "oklch(12% 0.02 264 / 0.7)" }}
        >
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand shadow-glow-brand" />
            <span className="font-display font-bold text-lg">Autodidactas</span>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#demo" className="hover:text-foreground transition-colors">
              Cómo funciona
            </a>
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Precios
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="/auth"
              className="hidden sm:inline-flex px-3 py-1.5 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Ingresar
            </a>
            <a
              href="/auth"
              className="inline-flex px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-brand text-primary-foreground shadow-glow-brand hover:scale-[1.03] active:scale-[0.97] transition-transform"
            >
              Empezar gratis
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
