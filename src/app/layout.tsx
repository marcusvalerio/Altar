import type { Metadata, Viewport } from "next";
import { Faculty_Glyphic, Geist } from "next/font/google";
import { AppRuntime, DevContentBanner } from "@/components/app-runtime";
import { BottomNav } from "@/components/bottom-nav";
import { Splash } from "@/components/splash";
import { Welcome } from "@/components/welcome";
import "./globals.css";

const faculty = Faculty_Glyphic({ weight: "400", subsets: ["latin", "latin-ext"], variable: "--font-faculty", display: "swap" });
const geist = Geist({ subsets: ["latin", "latin-ext"], variable: "--font-geist", display: "swap" });

export const metadata: Metadata = {
  title: { default: "ALTAR · Devocional Espírita", template: "%s · ALTAR" },
  description: "Um espaço digital para alguns minutos de leitura, reflexão e interiorização.",
  applicationName: "ALTAR",
  appleWebApp: { capable: true, title: "ALTAR", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }, { url: "/icons/icon-192.png", sizes: "192x192" }],
    apple: "/icons/apple-touch-icon.png",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ebebdf" },
    { media: "(prefers-color-scheme: dark)", color: "#141312" },
  ],
};

// Aplica tema, tamanho do texto e estado da abertura antes da primeira pintura.
const bootScript = `(function(){try{var r=document.documentElement;var p=JSON.parse(localStorage.getItem('altar:prefs')||'{}');if(p.theme==='light'||p.theme==='dark')r.setAttribute('data-theme',p.theme);r.setAttribute('data-text',p.textSize||'md');if(sessionStorage.getItem('altar:splash'))r.setAttribute('data-splash','skip');if(location.pathname!=='/'||localStorage.getItem('altar:entered'))r.setAttribute('data-welcome','skip');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-text="md" className={`${faculty.variable} ${geist.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <Splash />
        <Welcome />
        <DevContentBanner />
        <div className="relative z-[1]">{children}</div>
        <BottomNav />
        <AppRuntime />
      </body>
    </html>
  );
}
