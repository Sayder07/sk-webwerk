/** @type {import('next').NextConfig} */
const nextConfig = {
  // Datenbank-Treiber nicht bündeln (PGlite bringt WASM mit, postgres nutzt Node-Sockets)
  serverExternalPackages: ['@electric-sql/pglite', 'postgres'],
  poweredByHeader: false,
};
export default nextConfig;
