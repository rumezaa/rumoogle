import { parsePost } from "./frontmatter";

// Each post is a Markdown file in src/content/<collection>/<alias>.md
// (see src/content/README.md). Posts are written in the files directly or
// through the editor at /admin/write.
//
// The filename (minus .md) becomes the alias used in URLs and image names.
// .md files are bundled as raw strings via the asset/source rule in next.config.mjs.

function loadCollection(ctx, { withUpdates = false } = {}) {
  return ctx
    .keys()
    .filter((key) => key.startsWith("./"))
    .map((key) => {
      const mod = ctx(key);
      const { meta, body, updates } = parsePost(typeof mod === "string" ? mod : mod.default);
      return {
        ...meta,
        alias: key.replace(/^\.\//, "").replace(/\.md$/, ""),
        longDescription: body,
        updates: withUpdates ? updates : [],
      };
    })
    .filter((post) => !post.draft)
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
}

export const life = loadCollection(require.context("../content/life", false, /\.md$/));
// Only projects have update threads.
export const projects = loadCollection(require.context("../content/projects", false, /\.md$/), { withUpdates: true });

const LINK_ICONS = { github: "github-outline.svg", video: "video-outline.svg" };
export const linkIcon = (link) => link.icon || LINK_ICONS[link.name] || "link-outline.svg";
