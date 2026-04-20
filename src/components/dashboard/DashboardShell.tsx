import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { BookMarked, LogOut, LayoutGrid, Search, Gamepad2, Home } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { FloatingChat } from "@/components/chat/FloatingChat";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { useEffect, useState, type ReactNode } from "react";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const initials = (user?.email ?? "U").slice(0, 1).toUpperCase();
  const isMac = typeof navigator !== "undefined" && /Mac/i.test(navigator.platform);
  const isOnPlay = location.pathname.startsWith("/play");

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-40 bg-paper/75 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-5 lg:px-8 max-w-[1240px] h-14 flex items-center justify-between gap-4">
          <Link to="/" className="group flex items-center gap-2 flex-shrink-0" title="Ir a la página principal">
            <div className="relative w-7 h-7 inline-flex items-center justify-center bg-ink rounded-md">
              <BookMarked className="w-3.5 h-3.5 text-paper" strokeWidth={2.25} />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange rounded-full shadow-[0_0_8px_var(--orange)]" />
            </div>
            <span className="font-display font-semibold text-[14px] tracking-tight hidden sm:inline">
              Autodidactas
            </span>
          </Link>

          {/* Separator vertical */}
          <span className="hidden md:block w-px h-5 bg-border" />

          {/* Nav links compactos */}
          <nav className="hidden md:flex items-center gap-0.5 text-[13px]">
            <NavLink to="/" icon={<Home className="w-3.5 h-3.5" strokeWidth={2} />}>
              Inicio
            </NavLink>
            <NavLink to="/dashboard" icon={<LayoutGrid className="w-3.5 h-3.5" strokeWidth={2} />}>
              Cuadernos
            </NavLink>
            <NavLink
              to="/play"
              icon={<Gamepad2 className="w-3.5 h-3.5" strokeWidth={2} />}
              active={isOnPlay}
            >
              Jugar
            </NavLink>
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Searchbar central */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="group hidden md:flex items-center gap-2 px-3 h-8 bg-cream/60 border border-border hover:border-ink/30 hover:bg-cream transition-all text-left rounded-md min-w-[260px]"
          >
            <Search className="w-3.5 h-3.5 text-ink/40 group-hover:text-ink/70 transition-colors" strokeWidth={2} />
            <span className="flex-1 text-[12.5px] text-ink/45 group-hover:text-ink/70 transition-colors">
              Buscar…
            </span>
            <kbd className="inline-flex items-center gap-0.5 px-1.5 h-[18px] text-[10px] font-mono text-ink/50 border border-border rounded bg-paper/80">
              {isMac ? "⌘" : "Ctrl"}K
            </kbd>
          </button>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setPaletteOpen(true)}
              className="md:hidden inline-flex items-center justify-center w-8 h-8 text-ink/60 hover:text-ink hover:bg-cream transition-all rounded-md"
              title="Buscar"
            >
              <Search className="w-3.5 h-3.5" strokeWidth={2} />
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-1.5 pr-1 py-1 hover:bg-cream/60 transition-all rounded-md">
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-orange/90 px-1.5 py-0.5 bg-orange/10 rounded">
                Free
              </span>
              <div className="w-7 h-7 inline-flex items-center justify-center bg-gradient-orange text-paper rounded-full text-[11px] font-semibold">
                {initials}
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center justify-center w-8 h-8 text-ink/50 hover:text-ink hover:bg-cream transition-all rounded-md"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      <main>{children}</main>
      <FloatingChat />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}

function NavLink({
  to,
  icon,
  children,
  active,
}: {
  to: "/" | "/dashboard" | "/play";
  icon: ReactNode;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-2.5 h-8 transition-colors rounded-md ${
        active
          ? "text-ink font-medium bg-cream"
          : "text-ink/60 hover:text-ink hover:bg-cream/60"
      }`}
      activeProps={{
        className: "flex items-center gap-1.5 px-2.5 h-8 text-ink font-medium bg-cream rounded-md",
      }}
    >
      {icon}
      {children}
    </Link>
  );
}
