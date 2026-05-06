import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/FinalCTA";
import { POSTS, CATEGORIES, type BlogCategory } from "@/data/blog-posts";
import { useState } from "react";

const SITE = "https://autodidactas.app";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog de Autodidactas — Estudio, memoria, IQ e IA para estudiantes" },
      {
        name: "description",
        content:
          "Artículos sobre técnicas de estudio basadas en evidencia, memoria, productividad académica, test de IQ e inteligencia artificial para estudiantes en Argentina y LatAm.",
      },
      { name: "keywords", content: "blog estudio, técnicas de estudio, memoria, iq, ia educación, productividad académica, argentina" },
      { property: "og:title", content: "Blog de Autodidactas" },
      { property: "og:description", content: "30+ artículos sobre estudio, memoria, IQ e IA basados en evidencia." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "es_AR" },
      { name: "twitter:card", content: "summary_large_image" },
      { rel: "canonical", href: `${SITE}/blog` } as never,
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Blog de Autodidactas",
          url: `${SITE}/blog`,
          inLanguage: "es-AR",
          publisher: { "@type": "Organization", name: "Autodidactas" },
          blogPost: POSTS.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: `${SITE}/blog/${p.slug}`,
            datePublished: p.date,
            image: `${SITE}${p.cover}`,
          })),
        }),
      },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const [filter, setFilter] = useState<BlogCategory | "todos">("todos");
  const filtered = filter === "todos" ? POSTS : POSTS.filter((p) => p.category === filter);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />
      <header className="border-b-2 border-ink">
        <div className="container mx-auto px-6 lg:px-10 max-w-[1200px] py-16 lg:py-24">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-orange mb-4">Blog · 30 artículos</p>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.02] max-w-4xl">
            Estudiá mejor con <span className="italic text-orange font-normal">evidencia</span>, no con mitos.
          </h1>
          <p className="mt-6 text-lg text-ink/70 max-w-2xl leading-relaxed">
            Técnicas de estudio, memoria, productividad académica, test de IQ e inteligencia artificial. Pensado para estudiantes en Argentina y Latinoamérica.
          </p>
        </div>
      </header>

      {/* Filtros */}
      <div className="border-b border-ink/10 sticky top-14 bg-paper/95 backdrop-blur-xl z-30">
        <div className="container mx-auto px-6 lg:px-10 max-w-[1200px] py-4 flex gap-2 overflow-x-auto">
          {(["todos", ...Object.keys(CATEGORIES)] as const).map((k) => {
            const active = filter === k;
            const label = k === "todos" ? "Todos" : CATEGORIES[k as BlogCategory].label;
            return (
              <button
                key={k}
                onClick={() => setFilter(k as never)}
                className={`px-3.5 py-1.5 text-[11px] font-mono uppercase tracking-[0.18em] border-2 transition-colors whitespace-nowrap ${
                  active ? "bg-ink text-paper border-ink" : "border-ink/20 text-ink/70 hover:border-ink"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <main className="container mx-auto px-6 lg:px-10 max-w-[1200px] py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((p) => (
            <Link
              key={p.slug}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group border-2 border-ink bg-paper hover:shadow-[6px_6px_0_0_var(--color-ink)] transition-all"
            >
              <div className="aspect-[16/9] overflow-hidden border-b-2 border-ink bg-cream">
                <img
                  src={p.cover}
                  alt={p.title}
                  loading="lazy"
                  width={1280}
                  height={704}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-orange mb-3">
                  <span>{CATEGORIES[p.category].label}</span>
                  <span className="text-ink/30">·</span>
                  <span className="text-ink/55">{p.readMinutes} min</span>
                </div>
                <h2 className="font-display text-xl font-semibold leading-tight tracking-tight group-hover:text-orange-deep transition-colors">
                  {p.title}
                </h2>
                <p className="mt-3 text-sm text-ink/65 line-clamp-3 leading-relaxed">{p.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
