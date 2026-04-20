import { Link, useNavigate } from "@tanstack/react-router";
import { BookMarked, LogOut, LayoutGrid } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { ReactNode } from "react";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 lg:px-10 max-w-[1200px] h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <BookMarked className="w-5 h-5 text-orange" strokeWidth={1.75} />
            <span className="font-display font-semibold text-xl tracking-tight">Autodidactas</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-ink/70 hover:text-ink transition-colors"
              activeProps={{ className: "flex items-center gap-2 text-ink font-medium" }}
            >
              <LayoutGrid className="w-4 h-4" strokeWidth={1.75} />
              Cuadernos
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm text-ink truncate max-w-[180px]">{user?.email}</span>
              <span className="text-xs uppercase tracking-wider font-mono text-ink/50">Plan Free</span>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border hover:border-ink transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
