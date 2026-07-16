import type { Metadata } from "next"
import { Instrument_Sans, JetBrains_Mono } from "next/font/google"
import { SiteShell } from "@/components/layout/SiteShell"
import { ThemeProvider } from "@/components/theme/ThemeProvider"
import { getSiteConfig } from "@/lib/content/site"
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
  title: {
    default: site.title,
    template: `%s · ${site.title}`,
  },
  description: site.description,
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
        <ThemeProvider>
          <SiteShell site={site}>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
