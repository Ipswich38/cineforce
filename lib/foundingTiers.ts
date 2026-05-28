export const TIERS = [
  {
    id:       "founding" as const,
    label:    "Founding Member",
    slots:    100,
    color:    "#FFCC00",
    benefits: "1 year free · rate locked forever",
  },
  {
    id:       "pioneer" as const,
    label:    "Pioneer Member",
    slots:    100,
    color:    "#2CC0C8",
    benefits: "6 months free · rate locked 3 years",
  },
  {
    id:       "early" as const,
    label:    "Early Member",
    slots:    200,
    color:    "#AF52DE",
    benefits: "3 months free · rate locked 1 year",
  },
] as const;

export type TierId = "founding" | "pioneer" | "early";

const OFFSETS: Record<TierId, number> = { founding: 0, pioneer: 100, early: 200 };

export function getTierForCount(activatedCount: number): TierId | null {
  if (activatedCount < 100) return "founding";
  if (activatedCount < 200) return "pioneer";
  if (activatedCount < 400) return "early";
  return null;
}

export function getTierInfo(activatedCount: number) {
  const id = getTierForCount(activatedCount);
  if (!id) return null;
  const tier = TIERS.find((t) => t.id === id)!;
  const filled    = activatedCount - OFFSETS[id];
  const spotsLeft = tier.slots - filled;
  const position  = activatedCount + 1;
  return { ...tier, filled, spotsLeft, position };
}

export function getTierById(id: string | null | undefined) {
  return TIERS.find((t) => t.id === id) ?? null;
}
