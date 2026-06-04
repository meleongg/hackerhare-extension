import rabbitSrc from "data-url:~/assets/rabbit-head.svg"

const RABBIT_ASPECT = 347 / 460

type RabbitHeadProps = {
  className?: string
  height?: number
}

export function RabbitHead({ className, height = 96 }: RabbitHeadProps) {
  const width = Math.round(height * RABBIT_ASPECT)

  return (
    <img
      src={rabbitSrc}
      width={width}
      height={height}
      alt=""
      aria-hidden
      className={`block shrink-0 object-contain ${className ?? ""}`}
    />
  )
}
