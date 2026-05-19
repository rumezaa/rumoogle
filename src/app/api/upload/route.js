import { writeFile, mkdir, readFile, unlink } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

const uploadDir = join(process.cwd(), "public", "life-img");
const manifestPath = join(process.cwd(), "src", "data", "life-images.json");

async function readManifest() {
  try {
    return JSON.parse(await readFile(manifestPath, "utf-8"));
  } catch {
    return [];
  }
}

async function writeManifest(data) {
  await writeFile(manifestPath, JSON.stringify(data, null, 2));
}

export async function GET() {
  return NextResponse.json(await readManifest());
}

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const caption = formData.get("caption") || "";
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop().toLowerCase();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  const manifest = await readManifest();
  manifest.push({ filename, caption });
  await writeManifest(manifest);

  return NextResponse.json({ success: true, filename, caption });
}

export async function PATCH(request) {
  const { filename, caption } = await request.json();
  if (!filename) return NextResponse.json({ error: "No filename" }, { status: 400 });

  const manifest = await readManifest();
  const entry = manifest.find((e) => e.filename === filename);
  if (entry) entry.caption = caption;
  await writeManifest(manifest);

  return NextResponse.json({ success: true });
}

export async function DELETE(request) {
  const { filename } = await request.json();
  if (!filename) return NextResponse.json({ error: "No filename" }, { status: 400 });

  await unlink(join(uploadDir, filename)).catch(() => {});

  const manifest = await readManifest();
  await writeManifest(manifest.filter((e) => e.filename !== filename));

  return NextResponse.json({ success: true });
}
