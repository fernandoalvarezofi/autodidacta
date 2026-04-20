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
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-paper/70 backdrop-blur-xl border-b border-border"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-10 max-w-[1200px]">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="group flex items-center gap-2.5">
            <div className="relative w-7 h-7 inline-flex items-center justify-center bg-ink rounded-md">
              <BookMarked className="w-3.5 h-3.5 text-paper" strokeWidth={2.25} />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-orange rounded-full shadow-[0_0_8px_var(--orange)]" />
            </div>
            <span className="font-display font-semibold text-[15px] tracking-tight">
              Autodidactas
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-[13px]">
            <a href="#metodo" className="text-ink/60 hover:text-ink transition-colors">
              Método
            </a>
            <a href="#capacidades" className="text-ink/60 hover:text-ink transition-colors">
              Capacidades
            </a>
            <a href="#evidencia" className="text-ink/60 hover:text-ink transition-colors">
              Evidencia
            </a>
            <a href="#planes" className="text-ink/60 hover:text-ink transition-colors">
              Planes
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium bg-ink text-paper hover:bg-orange hover:text-paper transition-colors rounded-md"
              >
                Mi biblioteca
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.25} />
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="hidden sm:inline-flex px-3 py-1.5 text-[13px] text-ink/70 hover:text-ink transition-colors rounded-md"
                >
                  Ingresar
                </Link>
                <Link
                  to="/auth"
                  className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium bg-ink text-paper hover:bg-orange transition-colors rounded-md"
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
