# Writing posts

The easiest way is the editor at **/admin/write** on the live site. It saves posts
as the files described below by committing them to GitHub, and Vercel redeploys.
You can also edit the files directly.

Every post is one Markdown file:

- `life/<alias>.md` → shows up under **life**
- `projects/<alias>.md` → shows up under **rumeza's projects**

The filename is the post's alias. It's used in the URL (`/search?q=life&thing=<alias>`)
and for its images, so keep it short, lowercase, and dash-separated.

## New post template

```md
---
title: "Travel"                    # small label above the headline in results
headline: "My post headline"       # the big blue link + page title
timeline: "Jun 16 2024"            # shown as written
searchDescription: "One-line teaser shown in search results"
date: "2024-06-16"                 # YYYY-MM-DD, sorts posts newest first
# optional:
# tech: ["React", "Postgres"]
# links:
#   - name: "github"               # github / video get their own icon
#     link: "https://github.com/..."
---

Write the post here.
```

Keep quotes around frontmatter values, especially when they contain a `:`.

## Project updates

Projects can have an updates thread, shown oldest first under the write-up.
In the editor, use "+ add update". By hand, add marker lines after the write-up:

```md
The main write-up…

<!-- update: 2025-03-01 -->
First prototype done.

<!-- update: 2025-06-02 | v1 shipped -->
Got **100 users** in a week.
```

The text after `|` is an optional label. The marker lines are hidden when GitHub shows the file.

## Images

Each post needs two images in `public/search-img/`:

- `<alias>-icon.png` — the square thumbnail
- `<alias>-banner.png` — the banner at the top of the post

To put an image inside a post, add it to `public/` and reference it: `![caption](/blog-img/photo.jpg)`

## Formatting cheatsheet

| You type                 | You get              |
| ------------------------ | -------------------- |
| `# Big heading`          | largest heading      |
| `## Heading`             | large heading        |
| `### Subheading`         | medium heading       |
| `#### Small heading`     | small heading        |
| `**bold**`               | **bold**             |
| `*italic*`               | *italic*             |
| `[text](https://...)`    | a link               |
| `> quote`                | a pull quote         |
| `- item`                 | bullet list          |
| `1. item`                | numbered list        |
| `---` on its own line    | divider              |
| a blank line             | new paragraph        |
| a single Enter           | line break           |

Run `npm run dev` to preview while you write; the page updates on save.
Commit and push to publish.
