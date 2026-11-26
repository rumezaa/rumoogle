import { readFile, writeFile, readdir, mkdir, unlink } from "fs/promises";
import path from "path";

// Where admin edits are saved:
// - "github": GITHUB_TOKEN is set. Each save is a commit to the repo, and Vercel
//   redeploys the site from it. This is how publishing works on the live site,
//   whose filesystem is read-only.
// - "local":  `npm run dev` without a token. Files are written straight into the
//   working tree; commit and push them yourself.

const REPO = process.env.GITHUB_REPO || "rumezaa/rumoogle";
const BRANCH = process.env.GITHUB_BRANCH || "main";

export function storageMode() {
  if (process.env.GITHUB_TOKEN) return "github";
  if (process.env.NODE_ENV === "development") return "local";
  return null;
}

async function gh(apiPath, { method = "GET", body, accept } = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: accept || "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (res.status === 404 && method === "GET") return null;
  if (!res.ok) throw new Error(`GitHub ${method} ${apiPath} failed (${res.status}): ${await res.text()}`);
  return res;
}

const local = (p) => path.join(process.cwd(), p);

export async function listDir(dir) {
  if (storageMode() === "github") {
    const res = await gh(`/contents/${dir}?ref=${BRANCH}`);
    if (!res) return [];
    return (await res.json()).filter((e) => e.type === "file").map((e) => e.name);
  }
  return readdir(local(dir)).catch(() => []);
}

export async function readText(filePath) {
  if (storageMode() === "github") {
    const res = await gh(`/contents/${filePath}?ref=${BRANCH}`, { accept: "application/vnd.github.raw+json" });
    return res ? res.text() : null;
  }
  return readFile(local(filePath), "utf-8").catch(() => null);
}

// files: [{ path, content: string | Buffer }] to write, or [{ path, content: null }] to delete.
// On GitHub, all changes land in a single commit.
export async function commitFiles(files, message) {
  if (storageMode() === "github") {
    const ref = await (await gh(`/git/ref/heads/${BRANCH}`)).json();
    const parent = await (await gh(`/git/commits/${ref.object.sha}`)).json();

    const tree = await Promise.all(
      files.map(async ({ path: p, content }) => {
        if (content === null) return { path: p, mode: "100644", type: "blob", sha: null };
        const blob = await (
          await gh(`/git/blobs`, {
            method: "POST",
            body: { content: Buffer.from(content).toString("base64"), encoding: "base64" },
          })
        ).json();
        return { path: p, mode: "100644", type: "blob", sha: blob.sha };
      })
    );

    const newTree = await (await gh(`/git/trees`, { method: "POST", body: { base_tree: parent.tree.sha, tree } })).json();
    const commit = await (
      await gh(`/git/commits`, { method: "POST", body: { message, tree: newTree.sha, parents: [ref.object.sha] } })
    ).json();
    await gh(`/git/refs/heads/${BRANCH}`, { method: "PATCH", body: { sha: commit.sha } });
    return { commit: commit.sha };
  }

  for (const { path: p, content } of files) {
    if (content === null) {
      await unlink(local(p)).catch(() => {});
    } else {
      await mkdir(path.dirname(local(p)), { recursive: true });
      await writeFile(local(p), content);
    }
  }
  return {};
}
