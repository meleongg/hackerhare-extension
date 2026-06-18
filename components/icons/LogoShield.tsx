import logoSrc from "data-url:~/assets/logo-dark-theme.svg"

type LogoShieldProps = {
  className?: string
  size?: number
  rounded?: boolean
}

export function LogoShield({
  className,
  size = 32,
  rounded = false
}: LogoShieldProps) {
  const image = (
    <img
      src={logoSrc}
      width={size}
      height={size}
      alt=""
      aria-hidden
      className="block h-full w-full"
    />
  )

  if (!rounded) {
    return (
      <span
        className={`block shrink-0 ${className ?? ""}`}
        style={{ width: size, height: size }}>
        {image}
      </span>
    )
  }

  return (
    <span
      className={`block shrink-0 overflow-hidden rounded-xl ${className ?? ""}`}
      style={{ width: size, height: size }}>
      {image}
    </span>
  )
}
