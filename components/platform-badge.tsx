import { PLATFORMS } from "@/lib/scrapers/platforms"
import type { Platform } from "@/lib/scrapers/types"
import { PLATFORM_STYLES } from "@/lib/format"
import { cn } from "@/lib/utils"

export function PlatformDot({ platform, className }: { platform: Platform; className?: string }) {
  return <span className={cn("inline-block size-2.5 rounded-full", PLATFORM_STYLES[platform].dot, className)} />
}

export function PlatformBadge({
  platform,
  className,
  showDot = true,
}: {
  platform: Platform
  className?: string
  showDot?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        PLATFORM_STYLES[platform].chip,
        className,
      )}
    >
      {showDot && <span className="inline-block size-2 rounded-full bg-current/70" />}
      {PLATFORMS[platform].label}
    </span>
  )
}
