export const loader = async () => {
  const domain = process.env.VITE_DOMAIN_URL || "https://resumate.com";

  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${domain}/sitemap.xml
`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
