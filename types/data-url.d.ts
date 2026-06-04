/** Parcel / Plasmo inlines these assets as data URLs at build time. */
declare module "data-url:*" {
  const src: string
  export default src
}
