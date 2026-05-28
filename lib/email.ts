const RESEND_API_KEY  = process.env.RESEND_API_KEY;
const ADMIN_EMAIL     = process.env.ADMIN_EMAIL ?? "kreativloops@gmail.com";
const APP_URL         = process.env.NEXT_PUBLIC_APP_URL ?? "https://cineverseph.vercel.app";

async function send(payload: object) {
  if (!RESEND_API_KEY) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

type PremiumRequestProfile = {
  display_name: string;
  role: string;
  city: string;
  slug: string;
};

export async function sendPremiumRequestEmail(profile: PremiumRequestProfile) {
  const profileUrl = `${APP_URL}/crew/${profile.slug}`;
  const adminUrl   = `${APP_URL}/admin`;

  await send({
    from: "CineVerse <onboarding@resend.dev>",
    to: [ADMIN_EMAIL],
    subject: `Premium Request — ${profile.display_name} (${profile.role}, ${profile.city})`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#111;color:#f7f7f2;border-radius:12px;">
        <h2 style="margin:0 0 20px;font-size:20px;color:#FFCC00;">New Premium Activation Request</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr><td style="padding:8px 0;color:#8E8E93;font-size:14px;width:100px;">Name</td><td style="padding:8px 0;font-size:14px;">${profile.display_name}</td></tr>
          <tr><td style="padding:8px 0;color:#8E8E93;font-size:14px;">Role</td><td style="padding:8px 0;font-size:14px;">${profile.role}</td></tr>
          <tr><td style="padding:8px 0;color:#8E8E93;font-size:14px;">City</td><td style="padding:8px 0;font-size:14px;">${profile.city}</td></tr>
        </table>
        <a href="${profileUrl}" style="display:inline-block;margin-bottom:12px;padding:10px 20px;background:#1a1a1a;color:#2CC0C8;border:1px solid rgba(255,255,255,0.1);border-radius:8px;text-decoration:none;font-size:14px;">View Profile →</a>
        <p style="font-size:13px;color:#8E8E93;margin:0 0 8px;">Reply to this email (or message them directly) with your GCash payment details.</p>
        <p style="font-size:13px;color:#8E8E93;margin:0;">Once payment is confirmed, activate at: <a href="${adminUrl}" style="color:#FFCC00;">${adminUrl}</a></p>
      </div>
    `,
  });
}

type ConnectionNotificationInfo = {
  crewName: string;
  crewEmail: string;
  clientEmail: string;
  projectTitle: string;
  message: string | null;
};

export async function sendConnectionRequestEmail(info: ConnectionNotificationInfo) {
  const dashboardUrl = `${APP_URL}/dashboard`;

  await send({
    from: "CineVerse <onboarding@resend.dev>",
    to: [info.crewEmail],
    subject: `New request: "${info.projectTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#111;color:#f7f7f2;border-radius:12px;">
        <p style="font-size:12px;color:#8E8E93;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 20px;">CineVerse</p>
        <h2 style="margin:0 0 8px;font-size:22px;color:#f7f7f2;letter-spacing:-0.02em;">New project request</h2>
        <p style="font-size:15px;color:#8E8E93;margin:0 0 28px;">Someone wants to work with you.</p>
        <table style="width:100%;border-collapse:collapse;background:#1a1a1e;border-radius:10px;overflow:hidden;margin-bottom:24px;">
          <tr><td style="padding:12px 16px;color:#8E8E93;font-size:13px;width:90px;border-bottom:1px solid rgba(255,255,255,0.06);">Project</td><td style="padding:12px 16px;font-size:14px;font-weight:600;color:#f7f7f2;border-bottom:1px solid rgba(255,255,255,0.06);">${info.projectTitle}</td></tr>
          <tr><td style="padding:12px 16px;color:#8E8E93;font-size:13px;border-bottom:${info.message ? "1px solid rgba(255,255,255,0.06)" : "none"};">From</td><td style="padding:12px 16px;font-size:14px;color:#f7f7f2;border-bottom:${info.message ? "1px solid rgba(255,255,255,0.06)" : "none"};">${info.clientEmail}</td></tr>
          ${info.message ? `<tr><td style="padding:12px 16px;color:#8E8E93;font-size:13px;vertical-align:top;">Message</td><td style="padding:12px 16px;font-size:14px;color:#f7f7f2;line-height:1.6;">${info.message}</td></tr>` : ""}
        </table>
        <a href="${dashboardUrl}" style="display:block;text-align:center;padding:14px 24px;background:#FFCC00;color:#000;border-radius:999px;text-decoration:none;font-size:15px;font-weight:700;margin-bottom:20px;">View &amp; Respond in Dashboard</a>
        <p style="font-size:12px;color:rgba(255,255,255,0.2);text-align:center;margin:0;">You can accept or decline from your dashboard.</p>
      </div>
    `,
  });
}
