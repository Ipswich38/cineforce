export default function BrandMark({
  size = 24,
}: {
  size?: number;
}) {
  return (
    <span style={{
      width: Math.round(size * 1.5),
      height: size,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      overflow: "hidden",
      borderRadius: Math.max(4, Math.round(size * 0.18)),
      background: "#1a1a1a",
    }}>
      <img
        src="/brand/cineforce-logo.png"
        alt=""
        width={Math.round(size * 1.5)}
        height={size}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
        }}
      />
    </span>
  );
}
