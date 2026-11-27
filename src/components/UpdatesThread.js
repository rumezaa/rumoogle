import Markdown from "./Markdown";

// "2025-01-10" -> "Jan 10, 2025", parsed as a local date so it never shifts a day.
export function formatDate(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// A project's updates, shown oldest first as a thread joined by a line.
export default function UpdatesThread({ updates, resolveSrc }) {
  if (!updates?.length) return null;
  const sorted = [...updates].sort((a, b) => String(a.date).localeCompare(String(b.date)));

  return (
    <section className="mt-10">
      <h2 className="text-xl text-[#1D1B28] mb-5">
        Updates <span className="text-[#6B6485] text-base">· {sorted.length}</span>
      </h2>
      <ol>
        {sorted.map((u, i) => (
          <li key={`${u.date}-${i}`} className="relative flex gap-x-4 pb-8 last:pb-0">
            {i < sorted.length - 1 && (
              <span className="absolute left-[18px] top-11 bottom-1 w-px bg-[#1D1B28] opacity-15" aria-hidden />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/head-shot.png" alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0 bg-[#EFEBE4]" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold text-[#1D1B28]">rumeza</span>
                <time dateTime={u.date} className="text-sm text-[#6B6485]">{formatDate(u.date)}</time>
                {u.label && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#ADA6CC] bg-opacity-25 text-[#4D456E]">
                    {u.label}
                  </span>
                )}
              </div>
              <div className="mt-1 [&>div>*:first-child]:mt-0 [&>div>*:last-child]:mb-0">
                <Markdown resolveSrc={resolveSrc}>{u.body}</Markdown>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
