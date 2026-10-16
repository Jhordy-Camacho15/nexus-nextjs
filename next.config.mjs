/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Portadas de libros servidas por Open Library (la API simulada devuelve estas URLs)
    remotePatterns: [{ protocol: 'https', hostname: 'covers.openlibrary.org', pathname: '/b/**' }],
  },
  turbopack: {
    rules: {
      "*.css": {
        // Los CSS Modules (*.module.css) quedan fuera: si pasan por esta regla se tratarían como CSS global
        condition: { not: { path: /\.module\.css$/ } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
