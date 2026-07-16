import type { SiteConfig } from "@/lib/content/types"
import { AmbientCanvas } from "@/components/effects/AmbientCanvas"
import { getNavPreviewData } from "@/lib/content/nav-preview"
import { SiteFooter } from "./SiteFooter"
import { SiteHeader } from "./SiteHeader"

export function SiteShell({
  site,
  children,
}: {
  site: SiteConfig
  children: React.ReactNode
}) {
  const previewData = getNavPreviewData()

  return (
    <div className="site-shell-surface relative flex min-h-full flex-col text-n-6">
      <AmbientCanvas />
      <div className="site-film-grain" aria-hidden />
      <SiteHeader site={site} previewData={previewData} />
      <div className="site-layout-content relative z-10 flex-1">
        {children}
      </div>
      <SiteFooter site={site} />
    </div>
  )
}
