import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { BookMarked, LogOut, LayoutGrid, Search, Gamepad2 } from "lucide-react";
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
      <header className="sticky top-0 z-40 bg-paper/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 lg:px-10 max-w-[1200px] h-16 flex items-center justify-between gap-4">
          <Link to="/dashboard" className="group flex items-center gap-2.5 flex-shrink-0">
            <div className="relative w-8 h-8 inline-flex items-center justify-center bg-gradient-ink rounded-md shadow-soft group-hover:shadow-orange transition-all">
              <BookMarked className="w-4 h-4 text-paper" strokeWidth={2} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange rounded-full" />
            </div>
            <span className="font-display font-semibold text-xl tracking-tight hidden sm:inline">
              Autodidactas
            </span>
          </Link>

          {/* Command palette trigger — central, prominent */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="group flex-1 max-w-md hidden md:flex items-center gap-2.5 px-3.5 py-2 bg-cream/40 border border-border hover:border-ink/30 hover:bg-cream/70 transition-all text-left rounded-md"
          >
            <Search className="w-4 h-4 text-ink/40 group-hover:text-ink/60 transition-colors" strokeWidth={1.75} />
            <span className="flex-1 text-sm text-ink/50 group-hover:text-ink/70 transition-colors">
              Buscar o navegar…
            </span>
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-ink/50 border border-border rounded-sm bg-paper">
              {isMac ? "⌘" : "Ctrl"} K
            </kbd>
          </button>

          <nav className="hidden lg:flex items-center gap-1 text-sm">
            <NavLink to="/dashboard" icon={<LayoutGrid className="w-4 h-4" strokeWidth={1.75} />}>
              Cuadernos
            </NavLink>
            <NavLink
              to="/play"
              icon={<Gamepad2 className="w-4 h-4" strokeWidth={1.75} />}
              active={isOnPlay}
            >
              Jugar
            </NavLink>
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setPaletteOpen(true)}
              className="md:hidden p-2 text-ink/60 hover:text-ink hover:bg-cream/60 transition-all rounded-md"
              title="Buscar"
            >
              <Search className="w-4 h-4" strokeWidth={1.75} />
            </button>

            <div className="hidden sm:flex items-center gap-2.5 pl-2 pr-1 py-1 border border-transparent hover:border-border hover:bg-cream/40 transition-all rounded-md group">
              <div className="flex flex-col items-end leading-tight">
                <span className="text-xs text-ink truncate max-w-[140px]">{user?.email}</span>
                <span className="text-[9px] uppercase tracking-[0.18em] font-mono text-orange-deep">
                  Plan Free
                </span>
              </div>
              <div className="w-7 h-7 inline-flex items-center justify-center bg-gradient-ink text-paper rounded-full text-xs font-medium shadow-soft">
                {initials}
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 text-sm border border-border hover:border-ink hover:bg-cream/60 transition-all rounded-md"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
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
  to: "/dashboard" | "/play";
  icon: ReactNode;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-1.5 transition-colors rounded-md ${
        active
          ? "text-ink font-medium bg-cream"
          : "text-ink/70 hover:text-ink hover:bg-cream/60"
      }`}
      activeProps={{
        className: "flex items-center gap-2 px-3 py-1.5 text-ink font-medium bg-cream rounded-md",
      }}
    >
      {icon}
      {children}
    </Link>
  );
}
