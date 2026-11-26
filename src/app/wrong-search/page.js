"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const suggestions = [
  { label: "rumeza's projects", href: "/search?q=rumezas-projects" },
  { label: "life", href: "/search?q=life" },
];

// "No results" page, laid out like a search results page.
export default function WrongSearch() {
  const query = useSearchParams().get("q");

  return (
    <div className="flex flex-col w-full font-ropaSans text-white">
      <div className="px-4 md:pl-48 border-b border-white border-opacity-10">
        <span className="inline-block px-3 py-2.5 text-sm border-b-2 -mb-px border-[#ADA6CC]">All</span>
      </div>

      <div className="px-4 md:pl-48 py-8 max-w-3xl flex flex-col gap-y-6 text-[15px] leading-relaxed">
        <p className="text-accent-text text-sm">About 0 results (0.18 seconds)</p>

        <p className="text-lg">
          Your search
          {query ? (
            <>
              {" "}- <span className="font-bold text-white">{query}</span> -{" "}
            </>
          ) : " "}
          did not match any documents.
        </p>

        <div className="flex flex-col gap-y-1 text-[#E5DFFF]">
          <p>Suggestions:</p>
          <ul className="list-disc pl-10 flex flex-col gap-y-0.5">
            <li>Make sure all words are spelled correctly.</li>
            <li>Try different keywords.</li>
            <li>Try more general keywords.</li>
            <li>Try searching for something about rumeza.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-y-3 pt-2">
          <p className="text-accent-text text-sm">Try searching for</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="flex items-center gap-x-2 pl-3 pr-4 py-2 rounded-full bg-accent-color border border-white border-opacity-10 hover:bg-white hover:bg-opacity-10 transition-colors duration-150 text-sm text-[#E5DFFF]"
              >
                <div
                  className="bg-no-repeat bg-cover w-4 h-4 opacity-60"
                  style={{ backgroundImage: "url(icons/search.svg)" }}
                />
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
