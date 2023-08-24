/**
 * Get word URI for the given word name. Since certain words create
 * trouble if they're part of a (SvelteKit specifically) URL, we must
 * use custom encoding for them.
 */
export function wordURI(name: string) {
  name = name === "." ? "__fetch__" : name;
  return `/docs/${encodeURIComponent(name)}`;
}

/**
 * Inverse of `wordURI`.
 */
export function decodeWordName(name: string) {
  return name === "__fetch__" ? "." : name;
}
