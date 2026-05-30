import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

function logoDataUrl() {
  const logo = readFileSync(join(process.cwd(), "public/brand/cineforce-logo.png"));
  return `data:image/png;base64,${logo.toString("base64")}`;
}

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        background: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <img
        src={logoDataUrl()}
        width="270"
        height="180"
        style={{
          width: 270,
          height: 180,
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
    </div>,
    size
  );
}
