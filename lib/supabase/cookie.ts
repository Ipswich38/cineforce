// VissionLink single sign-on: share the Supabase auth session cookie across the
// *.vissionlink.com subdomains so a sign-in on one app (cineforce.vissionlink.com)
// is recognized on the siblings (lakbay/bigani.vissionlink.com). We only widen the
// cookie Domain on vissionlink.com hosts — on localhost and *.vercel.app a
// `.vissionlink.com` domain cookie would be rejected by the browser and break login,
// so those fall back to a host-only cookie (undefined domain).
export function sessionCookieDomain(host: string | null | undefined): string | undefined {
  const h = (host ?? "").split(":")[0].toLowerCase();
  return h === "vissionlink.com" || h.endsWith(".vissionlink.com") ? ".vissionlink.com" : undefined;
}
