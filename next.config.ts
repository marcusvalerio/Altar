import type { NextConfig } from "next";

// As páginas de leitura continuam pré-geradas (estáticas); só /api/* roda no servidor
// (contas e sincronização). Hospedagem recomendada: Vercel.
const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  serverExternalPackages: ["pg"],
};

export default nextConfig;
