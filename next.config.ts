import type { NextConfig } from "next";

// Exportação estática: o ALTAR é só leitura, sem backend.
// O resultado (pasta out/) pode ser hospedado em qualquer servidor estático.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
