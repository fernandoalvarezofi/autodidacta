import { BookMarked, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 border-b-2 ${
        scrolled ? "bg-paper/95 backdrop-blur-xl border-ink" : "bg-paper border-ink/10"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-10 max-w-[1200px]">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="relative w-7 h-7 inline-flex items-center justify-center bg-ink">
              <BookMarked className="w-3.5 h-3.5 text-paper" strokeWidth={2.25} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange" />
            </div>
            <span className="font-display font-semibold text-[16px] tracking-tight">Autodidactas</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[12px] font-mono uppercase tracking-[0.18em]">
            <a href="/#metodo" className="text-ink/60 hover:text-ink transition-colors">Método</a>
            <a href="/#capacidades" className="text-ink/60 hover:text-ink transition-colors">Capacidades</a>
            <a href="/#evidencia" className="text-ink/60 hover:text-ink transition-colors">Evidencia</a>
            <a href="/#planes" className="text-ink/60 hover:text-ink transition-colors">Planes</a>
            <Link to="/iq" className="text-orange hover:text-orange-deep transition-colors">Test de IQ</Link>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-mono uppercase tracking-[0.2em] bg-ink text-paper hover:bg-orange transition-colors"
              >
                Mi biblioteca
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.25} />
              </Link>
            ) : (
              <>
                <Link to="/auth" className="hidden sm:inline-flex px-3 py-2 text-[11px] font-mono uppercase tracking-[0.2em] text-ink/70 hover:text-ink transition-colors">
                  Ingresar
                </Link>
                <Link
                  to="/auth"
                  className="group inline-flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-mono uppercase tracking-[0.2em] bg-ink text-paper hover:bg-orange transition-colors"
                >
                  Comenzar
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.25} />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
