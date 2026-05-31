const FD = '"Jost", sans-serif';
const FT = '"Montserrat", sans-serif';
const TEXT = "#F7F7F2";
const MUTED = "#8E8E93";

export default function BrandLockup({
  size = 17,
  color = TEXT,
  align = "left",
}: {
  size?: number;
  color?: string;
  align?: "left" | "center";
}) {
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1, textAlign: align }}>
      <span style={{ fontFamily: FD, fontWeight: 400, fontSize: size, color, letterSpacing: 0 }}>
        CineForce
      </span>
      <span style={{
        fontFamily: FT,
        fontWeight: 400,
        fontSize: Math.max(6, Math.round(size * 0.34)),
        color: MUTED,
        letterSpacing: "0.02em",
        marginTop: 3,
      }}>
        powered by Vissionlink
      </span>
    </span>
  );
}
