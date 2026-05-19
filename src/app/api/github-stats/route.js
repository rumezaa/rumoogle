export async function GET() {
  const res = await fetch(
    "https://raw.githubusercontent.com/rumezaa/gstats/generated/overview.svg",
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    return new Response("Failed to fetch stats", { status: 502 });
  }

  let svg = await res.text();

  // Background and border
  svg = svg.replace(/fill: white/g, "fill: #1E1B2E");
  svg = svg.replace(/stroke: rgb\(225, 228, 232\)/g, "stroke: #3D3659");
  svg = svg.replace(/fill: #0d1117/g, "fill: #1E1B2E");

  // Heading (th) — GitHub blue → purple accent
  svg = svg.replace(/color: rgb\(3, 102, 214\)/g, "color: #ADA6CC");
  svg = svg.replace(/color: #58a6ff/g, "color: #ADA6CC");

  // Body text (td) — gray → light lavender
  svg = svg.replace(/color: rgb\(88, 96, 105\)/g, "color: #C5BFED");
  svg = svg.replace(/color: #c9d1d9/g, "color: #DED7FC");

  // Icons (octicon fill)
  svg = svg.replace(/fill: rgb\(88, 96, 105\)/g, "fill: #ADA6CC");
  svg = svg.replace(/fill: #8b949e/g, "fill: #ADA6CC");

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
