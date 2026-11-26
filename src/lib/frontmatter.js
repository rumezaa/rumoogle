import { load, dump, JSON_SCHEMA } from "js-yaml";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

// Splits a post file into its YAML frontmatter and Markdown body.
export function parsePost(raw) {
  const match = raw.match(FRONTMATTER);
  // JSON_SCHEMA keeps unquoted dates as strings instead of Date objects.
  const meta = match ? load(match[1], { schema: JSON_SCHEMA }) || {} : {};
  const body = (match ? match[2] : raw).trim();
  return { meta, body };
}

const FIELD_ORDER = ["title", "type", "headline", "timeline", "searchDescription", "date", "draft", "tech", "links"];

const isEmpty = (v) =>
  v === undefined || v === null || v === "" || v === false || (Array.isArray(v) && v.length === 0);

export function serializePost(meta, body) {
  const ordered = {};
  for (const key of [...FIELD_ORDER, ...Object.keys(meta)]) {
    if (key in ordered || isEmpty(meta[key])) continue;
    ordered[key] = meta[key];
  }
  const yaml = dump(ordered, { lineWidth: -1, forceQuotes: true, quotingType: '"' });
  return `---\n${yaml}---\n\n${(body || "").trim()}\n`;
}
