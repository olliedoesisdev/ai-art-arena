const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://olliedoesis.dev";
// Guarantee protocol is present — prevents bare "olliedoesis.dev" canonical URLs
export const SITE_URL = raw.startsWith("http") ? raw : `https://${raw}`;
