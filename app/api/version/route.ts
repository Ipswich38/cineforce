import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
  return NextResponse.json({ version: pkg.version });
}
