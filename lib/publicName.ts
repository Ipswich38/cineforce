export function publicCrewName(name: string | null | undefined) {
  const clean = name?.trim().replace(/\s+/g, " ") ?? "";
  if (!clean) return "Crew member";

  const alias = clean.match(/^([^("|/]+)/)?.[1]?.trim() ?? clean;
  return alias.split(" ")[0] || "Crew member";
}

export function publicCrewInitials(name: string | null | undefined) {
  return publicCrewName(name).slice(0, 2).toUpperCase();
}
