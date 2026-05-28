import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const size        = { width: 512, height: 512 };
export const contentType = "image/png";

function loadPlayfair(): ArrayBuffer | null {
  try {
    const buf = readFileSync(join(process.cwd(), "node_modules/@fontsource/raleway/files/raleway-latin-700-normal.woff"));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  } catch {
    return null;
  }
}

export default function Icon() {
  const font = loadPlayfair();

  return new ImageResponse(
    <div
      style={{
        width: 512, height: 512,
        background: "#000000",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {/* Gold gradient border layer */}
      <div
        style={{
          width: 464, height: 464,
          borderRadius: 92,
          background: "linear-gradient(145deg, #EDD45A 0%, #C9A023 25%, #8B6910 55%, #B89020 80%, #DFC040 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {/* Dark inner face */}
        <div
          style={{
            width: 436, height: 436,
            borderRadius: 78,
            background: "linear-gradient(160deg, #181818 0%, #0f0f0f 60%, #111111 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {/* CV text */}
          <span
            style={{
              fontSize: 200,
              fontWeight: 700,
              color: "#C9A227",
              fontFamily: font ? "Raleway" : "sans-serif",
              letterSpacing: "-6px",
              lineHeight: 1,
              paddingBottom: 8,
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
