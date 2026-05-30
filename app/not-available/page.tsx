export const metadata = { title: "Not Available in Your Region — CineForce" };

const FD = '"Jost", sans-serif';
const FT = '"Montserrat", sans-serif';

export default function NotAvailablePage() {
  return (
    <main style={{
      minHeight: "100dvh",
      background: "#000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: "rgba(255,204,0,0.08)",
          border: "1px solid rgba(255,204,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 28px",
          fontSize: 32,
        }}>
          🎬
        </div>

        <h1 style={{
          fontFamily: FD, fontWeight: 800, fontSize: "clamp(1.6rem,4vw,2.2rem)",
          color: "#F7F7F2", letterSpacing: "-0.03em", marginBottom: 14,
        }}>
          Not available in your region yet
        </h1>

        <p style={{
          fontFamily: FT, fontSize: 16, color: "#8E8E93",
          lineHeight: 1.7, marginBottom: 10,
        }}>
          CineForce is currently available in <strong style={{ color: "#F7F7F2" }}>the Philippines</strong> only.
          We&apos;re expanding to more countries soon — sign up to be notified when we launch in your region.
        </p>

        <p style={{
          fontFamily: FT, fontSize: 13, color: "rgba(255,255,255,0.28)",
          marginBottom: 36,
        }}>
          Error 451 — Unavailable for legal reasons (regional restriction)
        </p>

        <a
          href="mailto:hello@cineforce.vercel.app?subject=Notify me when CineForce launches in my region"
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: "13px 28px", borderRadius: 999,
            background: "#FFCC00", color: "#000",
            fontFamily: FT, fontSize: 15, fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Notify me when it&apos;s available
        </a>
      </div>
    </main>
  );
}
