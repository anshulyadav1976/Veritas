import { lookup as dnsLookup } from "node:dns/promises";
import { isIP } from "node:net";

type Resolver = (hostname: string) => Promise<Array<{ address: string }>>;

function nonPublicIp(address: string): boolean {
  const normalized = address.replace(/^\[|\]$/g, "").toLowerCase();
  if (isIP(normalized) === 4) {
    const [first, second] = normalized.split(".").map(Number);
    return first === 0 || first === 10 || first === 127 || first >= 224 ||
      (first === 100 && second >= 64 && second <= 127) || (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) || (first === 192 && (second === 0 || second === 168)) ||
      (first === 198 && (second === 18 || second === 19)) || (first === 203 && second === 0);
  }
  if (isIP(normalized) === 6) {
    const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
    return normalized === "::" || normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") ||
      /^fe[89ab]/.test(normalized) || normalized.startsWith("ff") || normalized.startsWith("2001:db8") || Boolean(mapped && nonPublicIp(mapped));
  }
  return true;
}

export async function safePublicHttpsUrl(value: string, resolver: Resolver = (hostname) => dnsLookup(hostname, { all: true, verbatim: true })) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) throw new Error("URL must use public HTTPS without credentials");
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(hostname) ? [{ address: hostname }] : await resolver(hostname);
  if (addresses.length === 0 || addresses.some(({ address }) => nonPublicIp(address))) throw new Error("URL must resolve only to public addresses");
  return url.toString();
}

export async function safeProviderBaseUrl(value: string, resolver?: Resolver) {
  try { return await safePublicHttpsUrl(value, resolver); }
  catch (error) { throw new Error(`Custom provider ${error instanceof Error ? error.message : "URL was rejected"}`); }
}
