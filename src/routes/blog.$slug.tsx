import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/FinalCTA";
import { CATEGORIES, getPostBySlug, getRelatedPosts } from "@/data/blog-posts";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

const SITE = "https://autodidactas.app";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPostBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.post) return { meta: [{ title: "Artículo no encontrado" }] };
    const p = loaderData.post;
    const url = `${SITE}/blog/${p.slug}`;
    const img = `${SITE}${p.cover}`;
    return {
      meta: [
        { title: `${p.title} — Autodidactas` },
        { name: "description", content: p.description },
        { name: "keywords", content: p.keywords.join(", ") },
        { name: "author", content: "Autodidactas" },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.description },
        { property: "og:type", content: "article" },
        { property: "og:image", content: img },
        { property: "og:locale", content: "es_AR" },
        { property: "article:published_time", content: p.date },
        { property: "article:section", content: CATEGORIES[p.category].label },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: p.title },
        { name: "twitter:description", content: p.description },
        { name: "twitter:image", content: img },
        { rel: "canonical", href: url } as never,
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: p.title,
            description: p.description,
            image: img,
            datePublished: p.date,
            dateModified: p.date,
            author: { "@type": "Organization", name: "Autodidactas" },
            publisher: {
              "@type": "Organization",
              name: "Autodidactas",
              logo: { "@type": "ImageObject", url: `${SITE}/favicon.ico` },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            inLanguage: "es-AR",
            keywords: p.keywords.join(", "),
            articleSection: CATEGORIES[p.category].label,
            wordCount: p.content.split(/\s+/).length,
          }),
        },
        ...(p.faq.length
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: p.faq.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                  })),
                }),
              },
            ]
          : []),
      ],
    };
  },
  component: BlogPost,
  notFoundComponent: () => (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center">
        <p className="font-mono text-orange uppercase tracking-[0.3em] text-xs mb-3">404</p>
        <h1 className="font-display text-4xl mb-4">Artículo no encontrado</h1>
        <Link to="/blog" className="underline">Volver al blog</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6">
      <p className="font-mono text-sm">{error.message}</p>
    </div>
  ),
});

function BlogPost() {
  const { post } = Route.useLoaderData();
  const related = getRelatedPosts(post.slug);
  const cat = CATEGORIES[post.category];

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />

      <article>
        {/* Hero */}
        <header className="border-b-2 border-ink">
          <div className="container mx-auto px-6 lg:px-10 max-w-[820px] py-12 lg:py-16">
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-ink/55 hover:text-orange transition-colors mb-8">
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al blog
            </Link>
            <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.2em] mb-5">
              <span className="text-orange">{cat.label}</span>
              <span className="text-ink/30">·</span>
              <time className="text-ink/55" dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
              </time>
              <span className="text-ink/30">·</span>
              <span className="text-ink/55">{post.readMinutes} min de lectura</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
              {post.title}
            </h1>
            <p className="mt-6 text-lg text-ink/70 leading-relaxed">{post.description}</p>
          </div>
          <div className="container mx-auto px-6 lg:px-10 max-w-[1100px] pb-12">
            <div className="aspect-[16/9] overflow-hidden border-2 border-ink">
              <img src={post.cover} alt={post.title} width={1280} height={704} className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto px-6 lg:px-10 max-w-[720px] py-16">
          <div className="prose prose-lg prose-neutral max-w-none
            prose-headings:font-display prose-headings:tracking-tight prose-headings:text-ink
            prose-h2:text-3xl prose-h2:mt-14 prose-h2:mb-5 prose-h2:font-semibold prose-h2:border-b-2 prose-h2:border-ink prose-h2:pb-2
            prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-3 prose-h3:font-semibold
            prose-p:text-ink/85 prose-p:leading-[1.75]
            prose-strong:text-ink prose-strong:font-semibold
            prose-a:text-orange-deep prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-4 prose-blockquote:border-orange prose-blockquote:bg-cream/40 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:not-italic prose-blockquote:text-ink/80
            prose-code:bg-cream prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:rounded prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-ink prose-pre:text-paper prose-pre:border-2 prose-pre:border-ink
            prose-table:border-2 prose-table:border-ink prose-th:bg-cream prose-th:border prose-th:border-ink prose-th:p-2 prose-td:border prose-td:border-ink/30 prose-td:p-2
            prose-li:text-ink/85
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>

          {/* FAQ */}
          {post.faq.length > 0 && (
            <section className="mt-20 pt-12 border-t-2 border-ink">
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-orange mb-3">Preguntas frecuentes</p>
              <h2 className="font-display text-3xl font-semibold mb-8">Preguntas frecuentes</h2>
              <div className="space-y-6">
                {post.faq.map((f, i) => (
                  <details key={i} className="border-2 border-ink p-5 group">
                    <summary className="font-display text-lg font-semibold cursor-pointer list-none flex items-center justify-between">
                      <span>{f.q}</span>
                      <span className="text-orange ml-4 group-open:rotate-45 transition-transform text-2xl leading-none">+</span>
                    </summary>
                    <p className="mt-4 text-ink/75 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <aside className="mt-20 border-2 border-ink bg-cream/40 p-8 lg:p-10">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-orange mb-3">Llevá la teoría a la práctica</p>
            <h3 className="font-display text-2xl lg:text-3xl font-semibold mb-3 leading-tight">
              Subí tus PDFs y estudiá con repaso espaciado e IA.
            </h3>
            <p className="text-ink/70 mb-6">Autodidactas convierte tu material en flashcards, resúmenes y quizzes. Gratis para empezar.</p>
            <Link to="/auth" className="inline-flex items-center gap-1.5 px-5 py-3 bg-ink text-paper text-sm font-medium hover:bg-orange transition-colors">
              Probar gratis <ArrowUpRight className="w-4 h-4" strokeWidth={2.25} />
            </Link>
          </aside>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="border-t-2 border-ink bg-cream/30 py-16">
            <div className="container mx-auto px-6 lg:px-10 max-w-[1100px]">
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-orange mb-3">Seguir leyendo</p>
              <h2 className="font-display text-3xl font-semibold mb-10">Más sobre {cat.label.toLowerCase()}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {related.map((r) => (
                  <Link key={r.slug} to="/blog/$slug" params={{ slug: r.slug }} className="group border-2 border-ink bg-paper p-5 hover:shadow-[4px_4px_0_0_var(--color-ink)] transition-all">
                    <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-orange mb-2">{r.readMinutes} min</p>
                    <h3 className="font-display text-lg font-semibold leading-tight group-hover:text-orange-deep transition-colors">{r.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
      <Footer />
    </div>
  );
}
