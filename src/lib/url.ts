const trackingParameters = new Set(["fbclid", "gclid", "mc_cid", "mc_eid", "ref", "referrer", "utm_campaign", "utm_content", "utm_medium", "utm_source", "utm_term"]);

export function canonicalizeUrl(input: string) {
  const url = new URL(input);
  url.hash = "";
  url.hostname = url.hostname.toLowerCase();
  url.protocol = url.protocol.toLowerCase();
  for (const key of [...url.searchParams.keys()]) {
    if (trackingParameters.has(key.toLowerCase()) || key.toLowerCase().startsWith("utm_")) url.searchParams.delete(key);
  }
  const parameters = [...url.searchParams.entries()].sort(([a, av], [b, bv]) => a.localeCompare(b) || av.localeCompare(bv));
  url.search = "";
  for (const [key, value] of parameters) url.searchParams.append(key, value);
  if (url.pathname.endsWith("/") && url.pathname !== "/") url.pathname = url.pathname.slice(0, -1);
  return url.toString();
}
