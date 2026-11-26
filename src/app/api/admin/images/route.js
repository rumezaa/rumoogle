import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { storageMode, commitFiles } from "@/lib/repo";

const ALIAS = /^[a-z0-9][a-z0-9-]{0,63}$/;
const TYPES = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };
const MAX_BYTES = 4 * 1024 * 1024; // Vercel caps request bodies at 4.5 MB

// kind = "icon" | "banner": the post's thumbnail / header image, saved as
//        public/search-img/<alias>-<kind>.png (the name the site looks for).
// kind = "inline": an image inside the post body, saved under public/blog-img/.
export async function POST(request) {
  if (!isAdmin(request)) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  if (!storageMode()) return NextResponse.json({ error: "publishing isn't set up" }, { status: 503 });

  const form = await request.formData();
  const file = form.get("file");
  const alias = form.get("alias");
  const kind = form.get("kind");

  if (!ALIAS.test(alias || "")) return NextResponse.json({ error: "set a valid alias first" }, { status: 400 });
  if (!["icon", "banner", "inline"].includes(kind)) return NextResponse.json({ error: "bad kind" }, { status: 400 });
  if (!file || !TYPES[file.type]) return NextResponse.json({ error: "upload a png, jpg, webp or gif" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "images must be under 4 MB" }, { status: 400 });

  const publicPath =
    kind === "inline"
      ? `/blog-img/${alias}-${Date.now()}.${TYPES[file.type]}`
      : `/search-img/${alias}-${kind}.png`;

  const result = await commitFiles(
    [{ path: `public${publicPath}`, content: Buffer.from(await file.arrayBuffer()) }],
    `content: upload ${kind} image for ${alias}`
  );
  return NextResponse.json({ ok: true, path: publicPath, ...result });
}
