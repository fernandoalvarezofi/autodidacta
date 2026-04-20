import { Link, useNavigate } from "@tanstack/react-router";
import { BookMarked, LogOut, LayoutGrid } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { FloatingChat } from "@/components/chat/FloatingChat";
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
      <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 lg:px-10 max-w-[1200px] h-16 flex items-center justify-between">
          <Link to="/dashboard" className="group flex items-center gap-2.5">
            <div className="relative w-8 h-8 inline-flex items-center justify-center bg-gradient-ink rounded-md shadow-soft group-hover:shadow-orange transition-all">
              <BookMarked className="w-4 h-4 text-paper" strokeWidth={2} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange rounded-full" />
            </div>
            <span className="font-display font-semibold text-xl tracking-tight">
              Autodidactas
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 text-ink/70 hover:text-ink hover:bg-cream/60 transition-colors rounded-sm"
              activeProps={{
                className:
                  "flex items-center gap-2 px-3 py-1.5 text-ink font-medium bg-cream rounded-sm",
              }}
            >
              <LayoutGrid className="w-4 h-4" strokeWidth={1.75} />
              Cuadernos
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm text-ink truncate max-w-[180px]">{user?.email}</span>
              <span className="text-[10px] uppercase tracking-[0.15em] font-mono text-orange-deep">
                Plan Free
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-border hover:border-ink hover:bg-cream/60 transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <FloatingChat />
    </div>
  );
}
