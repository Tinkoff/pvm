
export type UriSlug = string | number

function encodeSlug(uriSlug: UriSlug): string {
  return encodeURIComponent(String(uriSlug))
}

export {
  encodeSlug,
}
