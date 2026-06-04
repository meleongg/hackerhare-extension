import sharp from "sharp"

const sizes = [16, 32, 48, 64, 128]
const source = "assets/logo-dark-theme.svg"

await sharp(source, { density: 300 })
  .resize(512, 512)
  .png()
  .toFile("assets/icon.png")

await Promise.all(
  sizes.map((size) =>
    sharp(source, { density: 300 })
      .resize(size, size)
      .png()
      .toFile(`assets/icon-${size}.png`)
  )
)

console.log("Generated assets/icon.png and icon-{16,32,48,64,128}.png")
