"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const suggestions = [
  { label: "rumeza's projects", href: "/search?q=rumezas-projects" },
  { label: "life", href: "/search?q=life" },
];

export default function WrongSearch() {
  const router = useRouter();

  return (
    <div className="flex flex-col w-full min-h-full justify-center items-center font-ropaSans text-white px-6 gap-y-10">

      {/* Main message */}
      <div className="flex flex-col items-center gap-y-3 text-center">
        <p className="text-8xl select-none">=/
        </p>
        <h1 className="text-4xl md:text-5xl font-medium">hi - are you okay?</h1>
        <p className="text-accent-text text-lg max-w-sm leading-relaxed">
          why did you search something that&apos;s not me?
        </p>
      </div>

      {/* Suggestions */}
      <div className="flex flex-col w-full max-w-sm gap-y-2">
        {suggestions.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex items-center gap-x-3 px-4 py-3 rounded-xl bg-accent-color border border-white border-opacity-5 hover:bg-white hover:bg-opacity-5 transition duration-200 group"
          >
            <div
              className="bg-no-repeat bg-cover w-4 h-4 flex-shrink-0 opacity-50 group-hover:opacity-80 transition-opacity"
              style={{ backgroundImage: "url(icons/trending.svg)" }}
            />
            <span className="text-sm text-[#E5DFFF]">{s.label}</span>
            <svg className="ml-auto opacity-30 group-hover:opacity-70 transition-opacity" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        ))}
      </div>

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="text-sm text-accent-text hover:text-white transition-colors duration-200 underline underline-offset-4"
      >
        ← go back
      </button>

    </div>
  );
}
