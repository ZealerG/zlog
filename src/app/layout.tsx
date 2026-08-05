import type { Metadata } from "next"
import { Instrument_Sans, JetBrains_Mono } from "next/font/google"
import { SiteShell } from "@/components/layout/SiteShell"
import { JsonLd } from "@/components/seo/JsonLd"
import { ThemeProvider } from "@/components/theme/ThemeProvider"
import { getSiteConfig } from "@/lib/content/site"
import { getSiteUrl } from "@/lib/content/site-url"
import { absoluteSiteUrl, createWebsiteJsonLd } from "@/lib/seo"
import "./globals.css"

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
})

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
})

const site = getSiteConfig()

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: site.title,
    template: `%s · ${site.title}`,
  },
  description: site.description,
  applicationName: site.title,
  authors: [{ name: site.author, url: "/" }],
  creator: site.author,
  publisher: site.author,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: site.title,
    locale: site.locale.replace("-", "_"),
    title: site.title,
    description: site.description,
    images: [{ url: absoluteSiteUrl(site.avatar), alt: site.title }],
  },
  twitter: {
    card: "summary",
    title: site.title,
    description: site.description,
    images: [absoluteSiteUrl(site.avatar)],
  },
}

const themeInitScript = `
(function(){
  try {
    var key = 'zlog-theme';
    var stored = localStorage.getItem(key);
    var theme = (stored === 'light' || stored === 'dark')
      ? stored
      : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    var root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${instrument.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full overflow-x-hidden bg-[var(--safari-root-background)] text-n-6">
        <JsonLd data={createWebsiteJsonLd()} />
        <ThemeProvider>
          <SiteShell site={site}>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
