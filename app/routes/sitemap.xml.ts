export const loader = async () => {
  // Use environment variable for domain, or fallback to placeholder
  const domain = process.env.VITE_DOMAIN_URL || "https://resumate.com";

  // List of public static routes
  const routes = [
    "",
    "/auth",
    "/upload",
    "/build",
    "/help",
    "/privacy",
    "/terms",
    "/refund",
    "/contact",
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes
    .map(
      (route) => `
  <url>
    <loc>${domain}${route}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === "" ? "1.0" : "0.8"}</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
