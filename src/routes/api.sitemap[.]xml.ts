import { createFileRoute } from "@tanstack/react-router";
import { POSTS } from "@/data/blog-posts";

const SITE = "https://autodidactas.app";

export const Route = createFileRoute("/api/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticUrls = ["/", "/blog", "/iq", "/auth", "/terms", "/privacy", "/refund-policy"];
        const urls = [
          ...staticUrls.map((u) => `<url><loc>${SITE}${u}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
          ...POSTS.map(
            (p) =>
              `<url><loc>${SITE}/blog/${p.slug}</loc><lastmod>${p.date}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
          ),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});
