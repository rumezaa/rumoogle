"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import UpdatesThread from "@/components/UpdatesThread";

const COLLECTIONS = [
  { id: "life", label: "life", urlParam: "thing", q: "life" },
  { id: "projects", label: "projects", urlParam: "project", q: "rumezas-projects" },
];

const today = () => new Date().toLocaleDateString("en-CA"); // local YYYY-MM-DD
const slugify = (s) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 64);

const emptyForm = () => ({
  alias: "", title: "", type: "", headline: "", timeline: "", searchDescription: "",
  date: today(), draft: false, tech: "", links: [], body: "", updates: [],
});

const toForm = (post) => ({
  alias: post.alias,
  title: post.meta.title || "",
  type: post.meta.type || "",
  headline: post.meta.headline || "",
  timeline: post.meta.timeline || "",
  searchDescription: post.meta.searchDescription || "",
  date: post.meta.date || "",
  draft: Boolean(post.meta.draft),
  tech: (post.meta.tech || []).join(", "),
  links: (post.meta.links || []).map((l) => ({ name: l.name || "", link: l.link || "" })),
  body: post.body || "",
  updates: (post.updates || []).map((u) => ({ date: u.date, label: u.label || "", body: u.body || "" })),
});

const toMeta = (f) => ({
  title: f.title.trim(),
  type: f.type.trim(),
  headline: f.headline.trim(),
  timeline: f.timeline.trim(),
  searchDescription: f.searchDescription.trim(),
  date: f.date,
  draft: f.draft,
  tech: f.tech.split(",").map((t) => t.trim()).filter(Boolean),
  links: f.links.filter((l) => l.link.trim()).map((l) => ({ name: l.name.trim() || "link", link: l.link.trim() })),
});

const input =
  "w-full bg-dark-purple-300 border border-white border-opacity-10 rounded-lg px-3 py-2 text-sm text-white placeholder-accent-text placeholder-opacity-50 focus:outline-none focus:border-[#ADA6CC] focus:border-opacity-60";
const label = "text-xs uppercase tracking-wider text-accent-text";
const btn =
  "px-3 py-1.5 rounded-lg text-sm border border-white border-opacity-10 hover:bg-white hover:bg-opacity-10 transition-colors disabled:opacity-40";

export default function Write() {
  const [session, setSession] = useState(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [posts, setPosts] = useState(null);
  const [collection, setCollection] = useState("life");
  const [selected, setSelected] = useState(null); // alias, "new", or null
  const [form, setForm] = useState(emptyForm());
  const [savedForm, setSavedForm] = useState(null);
  const [aliasTouched, setAliasTouched] = useState(false);
  const [status, setStatus] = useState(null); // { kind: "ok" | "error" | "busy", text }
  const [localImages, setLocalImages] = useState({}); // public path -> object URL, for preview before deploy
  const [view, setView] = useState("write"); // mobile: write | preview

  const textareaRef = useRef(null);
  const updateRefs = useRef([]);
  // which textarea the toolbar acts on: the main body or one of the updates
  const activeField = useRef({ kind: "body" });
  const inlineImageRef = useRef(null);
  const isNew = selected === "new";
  const dirty = savedForm !== null && JSON.stringify(form) !== JSON.stringify(savedForm);
  const coll = COLLECTIONS.find((c) => c.id === collection);

  useEffect(() => {
    fetch("/api/admin/session").then((r) => r.json()).then(setSession);
  }, []);

  const loadPosts = useCallback(async () => {
    const res = await fetch("/api/admin/posts");
    const data = await res.json();
    if (!res.ok) return setStatus({ kind: "error", text: data.error });
    setPosts(data.posts);
  }, []);

  useEffect(() => {
    if (session?.authed) loadPosts();
  }, [session?.authed, loadPosts]);

  useEffect(() => {
    const warn = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const login = async (e) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) return setLoginError("wrong password");
    setPassword("");
    setSession((s) => ({ ...s, authed: true }));
  };

  const logout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    setSession((s) => ({ ...s, authed: false }));
    setPosts(null);
  };

  const confirmDiscard = () => !dirty || window.confirm("You have unsaved changes. Discard them?");

  const open = (alias) => {
    if (!confirmDiscard()) return;
    const next = alias === "new" ? emptyForm() : toForm(posts[collection].find((p) => p.alias === alias));
    setSelected(alias);
    setForm(next);
    setSavedForm(next);
    setAliasTouched(alias !== "new");
    setStatus(null);
    setView("write");
  };

  const switchCollection = (id) => {
    if (!confirmDiscard()) return;
    setCollection(id);
    setSelected(null);
    setSavedForm(null);
    setStatus(null);
  };

  const set = (key, value) =>
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "headline" && isNew && !aliasTouched) next.alias = slugify(value);
      return next;
    });

  // ---- toolbar ----------------------------------------------------------

  const edit = (fn) => {
    const target = activeField.current;
    const ta = target.kind === "update" ? updateRefs.current[target.index] : textareaRef.current;
    if (!ta) return;
    const { selectionStart: start, selectionEnd: end, value } = ta;
    const { text, selStart, selEnd } = fn(value, start, end);
    setForm((f) =>
      target.kind === "update"
        ? { ...f, updates: f.updates.map((u, i) => (i === target.index ? { ...u, body: text } : u)) }
        : { ...f, body: text }
    );
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(selStart, selEnd);
    });
  };

  const wrap = (before, after = before, placeholder = "text") =>
    edit((v, s, e) => {
      const sel = v.slice(s, e) || placeholder;
      return {
        text: v.slice(0, s) + before + sel + after + v.slice(e),
        selStart: s + before.length,
        selEnd: s + before.length + sel.length,
      };
    });

  // Applies a prefix ("## ", "> ", "- ") to every selected line, replacing any heading/quote/list prefix.
  const prefixLines = (prefix) =>
    edit((v, s, e) => {
      const lineStart = v.lastIndexOf("\n", s - 1) + 1;
      const lineEndIdx = v.indexOf("\n", e);
      const lineEnd = lineEndIdx === -1 ? v.length : lineEndIdx;
      const lines = v.slice(lineStart, lineEnd).split("\n");
      const stripped = lines.map((l) => l.replace(/^(#{1,6}\s|>\s?|[-*]\s|\d+\.\s)/, ""));
      const alreadyApplied = lines.every((l) => l.startsWith(prefix));
      const out = (alreadyApplied ? stripped : stripped.map((l, i) => (prefix === "1. " ? `${i + 1}. ` : prefix) + l)).join("\n");
      const caret = lineStart + out.length;
      return { text: v.slice(0, lineStart) + out + v.slice(lineEnd), selStart: caret, selEnd: caret };
    });

  const insert = (snippet) =>
    edit((v, s, e) => ({ text: v.slice(0, s) + snippet + v.slice(e), selStart: s + snippet.length, selEnd: s + snippet.length }));

  const insertLink = () => {
    const url = window.prompt("Link URL", "https://");
    if (url) wrap("[", `](${url})`, "link text");
  };

  const onKeyDown = (e) => {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;
    if (e.key === "b") { e.preventDefault(); wrap("**"); }
    if (e.key === "i") { e.preventDefault(); wrap("*"); }
    if (e.key === "k") { e.preventDefault(); insertLink(); }
    if (e.key === "s") { e.preventDefault(); save(); }
  };

  // ---- updates (projects only) ----------------------------------------

  const setUpdate = (index, key, value) =>
    setForm((f) => ({ ...f, updates: f.updates.map((u, i) => (i === index ? { ...u, [key]: value } : u)) }));

  const addUpdate = () => {
    const index = form.updates.length;
    setForm((f) => ({ ...f, updates: [...f.updates, { date: today(), label: "", body: "" }] }));
    activeField.current = { kind: "update", index };
    requestAnimationFrame(() => updateRefs.current[index]?.focus());
  };

  const removeUpdate = (index) => {
    if (!window.confirm("Remove this update?")) return;
    activeField.current = { kind: "body" };
    setForm((f) => ({ ...f, updates: f.updates.filter((_, i) => i !== index) }));
  };

  const pasteImage = (e) => {
    const file = [...e.clipboardData.files].find((f) => f.type.startsWith("image/"));
    if (file) { e.preventDefault(); uploadInline(file); }
  };

  // ---- uploads ----------------------------------------------------------

  const upload = async (file, kind) => {
    if (!form.alias) {
      setStatus({ kind: "error", text: "give the post a headline / alias before adding images" });
      return null;
    }
    setStatus({ kind: "busy", text: `uploading ${kind} image…` });
    const body = new FormData();
    body.append("file", file);
    body.append("alias", form.alias);
    body.append("kind", kind);
    const res = await fetch("/api/admin/images", { method: "POST", body });
    const data = await res.json();
    if (!res.ok) {
      setStatus({ kind: "error", text: data.error });
      return null;
    }
    setLocalImages((m) => ({ ...m, [data.path]: URL.createObjectURL(file) }));
    setStatus({ kind: "ok", text: `${kind} image uploaded` });
    return data.path;
  };

  const uploadInline = async (file) => {
    const path = await upload(file, "inline");
    if (path) insert(`\n![${file.name.replace(/\.[^.]+$/, "")}](${path})\n`);
  };

  // ---- save / delete ----------------------------------------------------

  const save = async () => {
    if (!form.headline.trim()) return setStatus({ kind: "error", text: "add a headline first" });
    setStatus({ kind: "busy", text: form.draft ? "saving draft…" : "publishing…" });
    const res = await fetch("/api/admin/posts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collection, alias: form.alias, meta: toMeta(form), body: form.body, updates: form.updates, isNew }),
    });
    const data = await res.json();
    if (!res.ok) return setStatus({ kind: "error", text: data.error });

    setSavedForm(form);
    setSelected(form.alias);
    setAliasTouched(true);
    await loadPosts();
    setStatus({
      kind: "ok",
      text:
        data.mode === "github"
          ? form.draft
            ? "draft saved (hidden from the site)"
            : "published! live in about a minute, once Vercel finishes deploying"
          : `saved to src/content/${collection}/${form.alias}.md (commit & push to publish)`,
    });
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${form.headline || form.alias}"? This removes the post from the site.`)) return;
    setStatus({ kind: "busy", text: "deleting…" });
    const res = await fetch("/api/admin/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collection, alias: form.alias }),
    });
    const data = await res.json();
    if (!res.ok) return setStatus({ kind: "error", text: data.error });
    setSelected(null);
    setSavedForm(null);
    await loadPosts();
    setStatus({ kind: "ok", text: "deleted" });
  };

  const resolveSrc = (src) => localImages[src] || src;

  // ---- render -----------------------------------------------------------

  if (!session) return <div className="p-10 text-accent-text font-ropaSans">loading…</div>;

  if (!session.authed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-ropaSans text-white px-6">
        <form onSubmit={login} className="w-full max-w-sm flex flex-col gap-y-3">
          <h1 className="text-3xl">write</h1>
          {!session.configured ? (
            <p className="text-sm text-accent-text">
              Set an <code className="text-white">ADMIN_PASSWORD</code> environment variable to enable the editor.
            </p>
          ) : (
            <>
              <input
                type="password"
                autoFocus
                placeholder="admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={input}
              />
              {loginError && <p className="text-sm text-red-300">{loginError}</p>}
              <button className={`${btn} bg-[#ADA6CC] bg-opacity-20`}>sign in</button>
            </>
          )}
        </form>
      </div>
    );
  }

  const list = posts?.[collection] || [];
  const iconSrc = localImages[`/search-img/${form.alias}-icon.png`] || `/search-img/${form.alias}-icon.png`;
  const bannerSrc = localImages[`/search-img/${form.alias}-banner.png`] || `/search-img/${form.alias}-banner.png`;

  return (
    <div className="font-ropaSans text-white px-4 md:px-8 py-6 flex flex-col gap-y-4">
      {/* top bar */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl mr-2">write</h1>
        {COLLECTIONS.map((c) => (
          <button
            key={c.id}
            onClick={() => switchCollection(c.id)}
            className={`${btn} ${collection === c.id ? "bg-white bg-opacity-10 border-opacity-30" : ""}`}
          >
            {c.label}
          </button>
        ))}
        <div className="flex-1" />
        {session.mode === "local" && (
          <span className="text-xs text-accent-text">local mode: saves to your files</span>
        )}
        {!session.mode && (
          <span className="text-xs text-red-300">publishing not set up: add GITHUB_TOKEN on Vercel</span>
        )}
        <Link href="/admin" className="text-xs text-accent-text hover:text-white">images</Link>
        <button onClick={logout} className="text-xs text-accent-text hover:text-white">sign out</button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* post list */}
        <aside className="lg:w-64 flex-shrink-0 flex flex-col gap-y-1">
          <button onClick={() => open("new")} className={`${btn} text-left mb-2 ${isNew ? "bg-white bg-opacity-10" : ""}`}>
            + new {collection === "life" ? "post" : "project"}
          </button>
          {!posts && <p className="text-sm text-accent-text">loading posts…</p>}
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {list.map((p) => (
              <button
                key={p.alias}
                onClick={() => open(p.alias)}
                className={`text-left px-3 py-2 rounded-lg text-sm flex-shrink-0 lg:flex-shrink transition-colors ${
                  selected === p.alias ? "bg-white bg-opacity-10" : "hover:bg-white hover:bg-opacity-5"
                }`}
              >
                <span className="block truncate max-w-[14rem]">{p.meta.headline || p.alias}</span>
                <span className="text-xs text-accent-text">
                  {p.meta.date}
                  {p.meta.draft && <span className="ml-2 text-yellow-200">draft</span>}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* editor */}
        {selected ? (
          <section className="flex-1 min-w-0 flex flex-col gap-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="md:col-span-2 flex flex-col gap-y-1">
                <span className={label}>headline</span>
                <input className={`${input} text-lg`} value={form.headline} onChange={(e) => set("headline", e.target.value)} placeholder="Flying solo for the first time" />
              </label>
              <label className="md:col-span-2 flex flex-col gap-y-1">
                <span className={label}>search teaser</span>
                <input className={input} value={form.searchDescription} onChange={(e) => set("searchDescription", e.target.value)} placeholder="one line shown under the headline in results" />
              </label>
              <label className="flex flex-col gap-y-1">
                <span className={label}>label</span>
                <input className={input} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder={collection === "life" ? "Travel" : "Project name"} />
              </label>
              <label className="flex flex-col gap-y-1">
                <span className={label}>timeline (shown as written)</span>
                <input className={input} value={form.timeline} onChange={(e) => set("timeline", e.target.value)} placeholder="Jun 16 2024" />
              </label>
              <label className="flex flex-col gap-y-1">
                <span className={label}>date (sorts newest first)</span>
                <input type="date" className={input} value={form.date} onChange={(e) => set("date", e.target.value)} />
              </label>
              <label className="flex flex-col gap-y-1">
                <span className={label}>alias (url){!isNew && " · fixed after publishing"}</span>
                <input
                  className={`${input} ${!isNew ? "opacity-50" : ""}`}
                  value={form.alias}
                  disabled={!isNew}
                  onChange={(e) => { setAliasTouched(true); set("alias", slugify(e.target.value)); }}
                  placeholder="my-post"
                />
              </label>
              {collection === "projects" && (
                <>
                  <label className="flex flex-col gap-y-1">
                    <span className={label}>type</span>
                    <input className={input} value={form.type} onChange={(e) => set("type", e.target.value)} placeholder="project / hackathon / startup" />
                  </label>
                  <label className="flex flex-col gap-y-1">
                    <span className={label}>tech (comma separated)</span>
                    <input className={input} value={form.tech} onChange={(e) => set("tech", e.target.value)} placeholder="React, Postgres" />
                  </label>
                </>
              )}
            </div>

            {/* links */}
            <div className="flex flex-col gap-y-2">
              <span className={label}>links</span>
              {form.links.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <input className={`${input} w-32 flex-shrink-0`} value={l.name} placeholder="github" onChange={(e) => set("links", form.links.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                  <input className={input} value={l.link} placeholder="https://" onChange={(e) => set("links", form.links.map((x, j) => (j === i ? { ...x, link: e.target.value } : x)))} />
                  <button className={btn} onClick={() => set("links", form.links.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
              <button className={`${btn} self-start`} onClick={() => set("links", [...form.links, { name: "", link: "" }])}>+ link</button>
            </div>

            {/* icon + banner */}
            <div className="flex flex-wrap gap-4">
              {[["icon", iconSrc, "w-20 h-20"], ["banner", bannerSrc, "w-64 h-20"]].map(([kind, src, size]) => (
                <label key={kind} className="flex flex-col gap-y-1 cursor-pointer">
                  <span className={label}>{kind} image</span>
                  <div className={`${size} rounded-lg overflow-hidden bg-dark-purple-300 border border-dashed border-white border-opacity-20 flex items-center justify-center text-xs text-accent-text relative`}>
                    <span className="absolute">click to upload</span>
                    {form.alias && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt="" className="relative w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} onLoad={(e) => (e.currentTarget.style.display = "")} />
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && upload(e.target.files[0], kind)} />
                </label>
              ))}
            </div>

            {/* toolbar */}
            <div
              className="flex flex-wrap items-center gap-1 sticky top-0 z-10 bg-dark-purple-100 py-2"
              // keep focus (and the cursor) in the textarea when clicking toolbar buttons
              onMouseDown={(e) => e.target.closest("button") && e.preventDefault()}
            >
              <button className={btn} title="Big heading" onClick={() => prefixLines("# ")}>H1</button>
              <button className={btn} title="Heading" onClick={() => prefixLines("## ")}>H2</button>
              <button className={btn} title="Subheading" onClick={() => prefixLines("### ")}>H3</button>
              <button className={btn} title="Small heading" onClick={() => prefixLines("#### ")}>H4</button>
              <span className="w-px h-5 bg-white bg-opacity-10 mx-1" />
              <button className={`${btn} font-bold`} title="Bold (⌘B)" onClick={() => wrap("**")}>B</button>
              <button className={`${btn} italic`} title="Italic (⌘I)" onClick={() => wrap("*")}>I</button>
              <button className={btn} title="Link (⌘K)" onClick={insertLink}>link</button>
              <span className="w-px h-5 bg-white bg-opacity-10 mx-1" />
              <button className={btn} title="Quote" onClick={() => prefixLines("> ")}>“ ”</button>
              <button className={btn} title="Bullet list" onClick={() => prefixLines("- ")}>• list</button>
              <button className={btn} title="Numbered list" onClick={() => prefixLines("1. ")}>1. list</button>
              <button className={btn} title="Divider" onClick={() => insert("\n\n---\n\n")}>—</button>
              <button className={btn} title="Insert image" onClick={() => inlineImageRef.current?.click()}>image</button>
              <input ref={inlineImageRef} type="file" accept="image/*" className="hidden" onChange={(e) => { e.target.files[0] && uploadInline(e.target.files[0]); e.target.value = ""; }} />
              <div className="flex-1" />
              <div className="flex lg:hidden gap-1">
                <button className={`${btn} ${view === "write" ? "bg-white bg-opacity-10" : ""}`} onClick={() => setView("write")}>write</button>
                <button className={`${btn} ${view === "preview" ? "bg-white bg-opacity-10" : ""}`} onClick={() => setView("preview")}>preview</button>
              </div>
            </div>

            {/* body + preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className={`flex flex-col gap-y-4 ${view === "preview" ? "hidden lg:flex" : ""}`}>
                <textarea
                  ref={textareaRef}
                  value={form.body}
                  onChange={(e) => set("body", e.target.value)}
                  onFocus={() => (activeField.current = { kind: "body" })}
                  onKeyDown={onKeyDown}
                  onPaste={pasteImage}
                  placeholder="start writing… (paste an image to add it)"
                  className={`${input} min-h-[60vh] font-mono text-[15px] leading-relaxed resize-y`}
                />

                {collection === "projects" && (
                  <div className="flex flex-col gap-y-3">
                    <div className="flex items-center justify-between">
                      <span className={label}>updates thread · oldest first</span>
                      <button className={btn} onClick={addUpdate}>+ add update</button>
                    </div>
                    {form.updates.length === 0 && (
                      <p className="text-sm text-accent-text opacity-60">
                        Post progress here as the project grows: launches, milestones, wins.
                      </p>
                    )}
                    {form.updates.map((u, i) => (
                      <div key={i} className="flex flex-col gap-y-2 rounded-lg border border-white border-opacity-10 p-3">
                        <div className="flex gap-2">
                          <input type="date" className={`${input} !w-40 flex-shrink-0`} value={u.date} onChange={(e) => setUpdate(i, "date", e.target.value)} />
                          <input className={`${input} min-w-0`} value={u.label} placeholder="label (optional): v1 shipped…" onChange={(e) => setUpdate(i, "label", e.target.value)} />
                          <button className={`${btn} flex-shrink-0`} title="Remove update" onClick={() => removeUpdate(i)}>✕</button>
                        </div>
                        <textarea
                          ref={(el) => (updateRefs.current[i] = el)}
                          value={u.body}
                          onChange={(e) => setUpdate(i, "body", e.target.value)}
                          onFocus={() => (activeField.current = { kind: "update", index: i })}
                          onKeyDown={onKeyDown}
                          onPaste={pasteImage}
                          placeholder="what happened? (the toolbar works here too)"
                          className={`${input} min-h-[8rem] font-mono text-[15px] leading-relaxed resize-y`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className={`bg-[#FAF8F5] rounded-lg px-6 py-5 min-h-[60vh] overflow-auto ${view === "write" ? "hidden lg:block" : ""}`}>
                <h1 className="text-3xl text-[#1D1B28]">{form.headline || <span className="opacity-30">headline</span>}</h1>
                <p className="text-sm text-[#6B6485] mt-1 mb-5">{[form.title, form.timeline].filter(Boolean).join(" · ")}</p>
                <Markdown resolveSrc={resolveSrc}>{form.body}</Markdown>
                {collection === "projects" && (
                  <UpdatesThread updates={form.updates.filter((u) => u.body || u.label)} resolveSrc={resolveSrc} />
                )}
              </div>
            </div>

            {/* actions */}
            <div className="flex flex-wrap items-center gap-3 sticky bottom-0 bg-dark-purple-100 py-3 border-t border-white border-opacity-10">
              <label className="flex items-center gap-2 text-sm text-accent-text cursor-pointer">
                <input type="checkbox" checked={form.draft} onChange={(e) => set("draft", e.target.checked)} />
                draft (hidden from site)
              </label>
              <button
                onClick={save}
                disabled={status?.kind === "busy" || (!dirty && !isNew)}
                className="px-5 py-2 rounded-xl bg-[#ADA6CC] text-dark-purple-300 font-medium text-sm hover:opacity-90 disabled:opacity-40"
              >
                {form.draft ? "save draft" : isNew ? "publish" : "update"}
              </button>
              {!isNew && !form.draft && (
                <Link href={`/search?q=${coll.q}&${coll.urlParam}=${form.alias}`} target="_blank" className="text-sm text-accent-text hover:text-white">
                  view on site ↗
                </Link>
              )}
              {status && (
                <span className={`text-sm ${status.kind === "error" ? "text-red-300" : status.kind === "ok" ? "text-green-300" : "text-accent-text"}`}>
                  {status.text}
                </span>
              )}
              <div className="flex-1" />
              {dirty && <span className="text-xs text-accent-text">unsaved changes</span>}
              {!isNew && <button onClick={remove} className="text-sm text-red-300 hover:text-red-200">delete</button>}
            </div>
          </section>
        ) : (
          <div className="flex-1 flex items-center justify-center text-accent-text text-sm min-h-[40vh]">
            {status ? <span className={status.kind === "error" ? "text-red-300" : ""}>{status.text}</span> : "pick a post or start a new one"}
          </div>
        )}
      </div>
    </div>
  );
}
