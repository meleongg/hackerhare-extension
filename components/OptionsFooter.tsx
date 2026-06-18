import {
  HACKERHARE_PRIVACY_URL,
  HACKERHARE_SITE_URL,
  HACKERHARE_TERMS_URL
} from "~lib/site-links"

const VERSION = "0.0.1"

type OptionsFooterProps = {
  className?: string
}

export function OptionsFooter({ className = "" }: OptionsFooterProps) {
  const linkClass =
    "text-sm text-text-muted underline decoration-text-muted/50 underline-offset-2 transition hover:text-rocket-orange"

  return (
    <footer
      className={`flex flex-col gap-4 border-t border-card-border pt-6 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <a
          href={HACKERHARE_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}>
          hackerhare.vercel.app
        </a>
        <a
          href={HACKERHARE_PRIVACY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}>
          Privacy policy
        </a>
        <a
          href={HACKERHARE_TERMS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}>
          Terms
        </a>
      </div>
      <p className="font-mono text-xs text-text-muted">HackerHare v{VERSION}</p>
    </footer>
  )
}
