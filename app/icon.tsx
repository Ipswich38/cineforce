import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

function logoDataUrl() {
  const logo = readFileSync(join(process.cwd(), "public/brand/cineforce-logo.png"));
  return `data:image/png;base64,${logo.toString("base64")}`;
}

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 512,
        height: 512,
        background: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <img
        src={logoDataUrl()}
        width="768"
        height="512"
        style={{
          width: 768,
          height: 512,
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
    </div>,
    size
  );
}
