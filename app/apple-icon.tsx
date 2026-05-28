import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const size        = { width: 180, height: 180 };
export const contentType = "image/png";

function loadPlayfair(): ArrayBuffer | null {
  try {
    const buf = readFileSync(join(process.cwd(), "node_modules/@fontsource/raleway/files/raleway-latin-700-normal.woff"));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  } catch {
    return null;
  }
}

export default function AppleIcon() {
  const font = loadPlayfair();

  return new ImageResponse(
    <div
      style={{
        width: 180, height: 180,
        background: "#000000",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {/* Gold gradient border layer */}
      <div
        style={{
          width: 163, height: 163,
          borderRadius: 32,
          background: "linear-gradient(145deg, #EDD45A 0%, #C9A023 25%, #8B6910 55%, #B89020 80%, #DFC040 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {/* Dark inner face */}
        <div
          style={{
            width: 153, height: 153,
            borderRadius: 26,
            background: "linear-gradient(160deg, #181818 0%, #0f0f0f 60%, #111111 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {/* CV text */}
          <span
            style={{
              fontSize: 70,
              fontWeight: 700,
              color: "#C9A227",
              fontFamily: font ? "Raleway" : "sans-serif",
              letterSpacing: "-2px",
              lineHeight: 1,
              paddingBottom: 3,
            }}
          >
            CV
          </span>
        </div>
      </div>
    </div>,
    {
      ...size,
      ...(font ? { fonts: [{ name: "Raleway", data: font, weight: 700 as const }] } : {}),
    }
  );
}
