import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { storageMode, listDir, readText, commitFiles } from "@/lib/repo";
import { parsePost, serializePost } from "@/lib/frontmatter";

const COLLECTIONS = ["life", "projects"];
const ALIAS = /^[a-z0-9][a-z0-9-]{0,63}$/;
const postPath = (collection, alias) => `src/content/${collection}/${alias}.md`;

function guard(request) {
  if (!isAdmin(request)) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  if (!storageMode()) {
    return NextResponse.json(
      { error: "publishing isn't set up: add GITHUB_TOKEN to the Vercel project's environment variables" },
      { status: 503 }
    );
  }
  return null;
}

function validate(collection, alias) {
  if (!COLLECTIONS.includes(collection)) return "unknown collection";
  if (!ALIAS.test(alias || "")) return "alias must be lowercase letters, numbers and dashes";
  return null;
}

// Reads posts from the repo (not the deployed bundle) so the editor always shows
// the latest version, even before Vercel has finished redeploying.
export async function GET(request) {
  const denied = guard(request);
  if (denied) return denied;

  const posts = {};
  for (const collection of COLLECTIONS) {
    const names = (await listDir(`src/content/${collection}`)).filter((n) => n.endsWith(".md"));
    posts[collection] = (
      await Promise.all(
        names.map(async (name) => {
          const alias = name.replace(/\.md$/, "");
          const raw = await readText(postPath(collection, alias));
          return raw === null ? null : { alias, ...parsePost(raw) };
        })
      )
    )
      .filter(Boolean)
      .sort((a, b) => String(b.meta.date || "").localeCompare(String(a.meta.date || "")));
  }
  return NextResponse.json({ mode: storageMode(), posts });
}

export async function PUT(request) {
  const denied = guard(request);
  if (denied) return denied;

  const { collection, alias, meta, body, updates, isNew } = await request.json();
  const invalid = validate(collection, alias);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
  if (!meta?.headline) return NextResponse.json({ error: "a headline is required" }, { status: 400 });

  const filePath = postPath(collection, alias);
  if (isNew && (await readText(filePath)) !== null) {
    return NextResponse.json({ error: `a post called "${alias}" already exists` }, { status: 409 });
  }

  const verb = isNew ? "add" : "update";
  const result = await commitFiles(
    [{ path: filePath, content: serializePost(meta, body, collection === "projects" ? updates : []) }],
    `content(${collection}): ${verb} ${alias}${meta.draft ? " (draft)" : ""}`
  );
  return NextResponse.json({ ok: true, mode: storageMode(), ...result });
}

export async function DELETE(request) {
  const denied = guard(request);
  if (denied) return denied;

  const { collection, alias } = await request.json();
  const invalid = validate(collection, alias);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  const filePath = postPath(collection, alias);
  if ((await readText(filePath)) === null) {
    return NextResponse.json({ error: "post not found" }, { status: 404 });
  }
  const result = await commitFiles([{ path: filePath, content: null }], `content(${collection}): delete ${alias}`);
  return NextResponse.json({ ok: true, ...result });
}
