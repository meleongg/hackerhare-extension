import logoSrc from "data-url:~/assets/logo-dark-theme.svg"

type LogoShieldProps = {
  className?: string
  size?: number
}

export function LogoShield({ className, size = 32 }: LogoShieldProps) {
  return (
    <img
      src={logoSrc}
      width={size}
      height={size}
      alt=""
      aria-hidden
      className={`block shrink-0 ${className ?? ""}`}
    />
  )
}
