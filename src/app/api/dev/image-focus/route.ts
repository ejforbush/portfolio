import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "src/data/imageFocus.json");

function blockedInProduction() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "The image editor is a local dev tool only." },
      { status: 403 },
    );
  }
  return null;
}

async function readFocusFile(): Promise<Record<string, unknown>> {
  const raw = await fs.readFile(FILE, "utf-8").catch(() => "{}");
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function GET() {
  const blocked = blockedInProduction();
  if (blocked) return blocked;
  return NextResponse.json(await readFocusFile());
}

export async function POST(request: Request) {
  const blocked = blockedInProduction();
  if (blocked) return blocked;

  const body = await request.json();
  const { slug, x, y, zoom } = body ?? {};
  if (typeof slug !== "string" || !slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const current = await readFocusFile();
  current[slug] = { x, y, zoom };
  await fs.writeFile(FILE, JSON.stringify(current, null, 2) + "\n", "utf-8");

  return NextResponse.json({ ok: true });
}
