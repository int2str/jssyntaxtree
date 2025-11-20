// jsSyntaxTree - A syntax tree graph generator
// State encoding and decoding for states embedded in the URL
// Enrique Lopez, Nov 20th, 2025


// Encode a string into an opaque but URL-safe state value
export function encodeState(str) {
  const utf8 = new TextEncoder().encode(str);
  const base64 = btoa(String.fromCharCode(...utf8));
  return encodeURIComponent(base64);
}

// Decode a URL state back into your syntax tree input
export function decodeState(encoded) {
  const base64 = decodeURIComponent(encoded);
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

