export const TRIAL_DAYS         = 14;
export const MONTHLY_PRICE_PHP  = 150;

// During beta all logged-in users have full access regardless of trial status.
// Flip to false when billing goes live at launch.
export const IS_BETA = true;

export function trialDaysLeft(trialStartedAt: string | null | undefined): number {
  if (!trialStartedAt) return 0;
  const elapsed = (Date.now() - new Date(trialStartedAt).getTime()) / 86_400_000;
  return Math.max(0, Math.ceil(TRIAL_DAYS - elapsed));
}

export function computeStatus(profile: {
  premium_status: string;
  trial_started_at?: string | null;
}): "trial" | "active" | "expired" {
  if (IS_BETA) return "active"; // everyone is active during beta
  if (profile.premium_status === "active") return "active";
  if (profile.premium_status === "trial" || profile.premium_status === "free") {
    return trialDaysLeft(profile.trial_started_at) > 0 ? "trial" : "expired";
  }
  return "expired";
}

export function isSubscriptionActive(profile: {
  premium_status: string;
  trial_started_at?: string | null;
}): boolean {
  if (IS_BETA) return true;
  const s = computeStatus(profile);
  return s === "active" || s === "trial";
}
