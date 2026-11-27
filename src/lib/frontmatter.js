import { load, dump, JSON_SCHEMA } from "js-yaml";

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

// Project updates live in the body after the main write-up, each starting with
// a marker line (an HTML comment, so GitHub's file view hides it):
//
//   <!-- update: 2025-01-10 | won 2nd place -->
//   What happened, in Markdown.
//
// The label after "|" is optional.
const UPDATE_MARKER = /^<!--\s*update:\s*(.*?)\s*-->[ \t]*$/m;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const byDate = (a, b) => String(a.date).localeCompare(String(b.date));

function splitUpdates(text) {
  // split() with a capture group yields [main, header1, body1, header2, body2, ...]
  const parts = text.split(new RegExp(UPDATE_MARKER.source, "m"));
  const updates = [];
  for (let i = 1; i < parts.length; i += 2) {
    const [date, ...label] = parts[i].split("|");
    updates.push({ date: date.trim(), label: label.join("|").trim(), body: (parts[i + 1] || "").trim() });
  }
  return { body: parts[0].trim(), updates: updates.sort(byDate) };
}

// Splits a post file into its YAML frontmatter, Markdown body and updates.
export function parsePost(raw) {
  const match = raw.match(FRONTMATTER);
  // JSON_SCHEMA keeps unquoted dates as strings instead of Date objects.
  const meta = match ? load(match[1], { schema: JSON_SCHEMA }) || {} : {};
  return { meta, ...splitUpdates(match ? match[2] : raw) };
}

// Keeps user-entered updates from producing a marker line that won't parse back.
export function cleanUpdates(updates) {
  return (Array.isArray(updates) ? updates : [])
    .map((u) => ({
      date: String(u?.date || ""),
      label: String(u?.label || "").replace(/-->/g, "").replace(/\s+/g, " ").trim(),
      body: String(u?.body || "").trim(),
    }))
    .filter((u) => DATE.test(u.date) && (u.body || u.label));
}

const FIELD_ORDER = ["title", "type", "headline", "timeline", "searchDescription", "date", "draft", "tech", "links"];

const isEmpty = (v) =>
  v === undefined || v === null || v === "" || v === false || (Array.isArray(v) && v.length === 0);

export function serializePost(meta, body, updates = []) {
  const ordered = {};
  for (const key of [...FIELD_ORDER, ...Object.keys(meta)]) {
    if (key in ordered || isEmpty(meta[key])) continue;
    ordered[key] = meta[key];
  }
  const yaml = dump(ordered, { lineWidth: -1, forceQuotes: true, quotingType: '"' });
  const thread = cleanUpdates(updates)
    .sort(byDate)
    .map((u) => `\n\n<!-- update: ${u.date}${u.label ? ` | ${u.label}` : ""} -->\n${u.body}`)
    .join("");
  return `---\n${yaml}---\n\n${(body || "").trim()}${thread}\n`;
}
