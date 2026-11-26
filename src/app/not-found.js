"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Shown for any URL that doesn't exist.
export default function NotFound() {
  const path = usePathname();

  return (
    <div className="flex w-full min-h-[60vh] items-center font-ropaSans text-white px-6 md:pl-48 py-16">
      <div className="flex flex-col md:flex-row md:items-center gap-10 max-w-4xl w-full">
        <div className="flex flex-col gap-y-4 flex-1">
          <Link href="/" className="text-3xl">(Rum)oogle</Link>
          <p className="text-lg">
            <span className="font-bold">404.</span>{" "}
            <span className="text-accent-text">That&apos;s an error.</span>
          </p>
          <p className="text-[15px] leading-relaxed text-[#E5DFFF]">
            The requested URL <code className="text-white break-all">{path}</code> was not found on this server.{" "}
            <span className="text-accent-text">That&apos;s all we know.</span>
          </p>
          <Link href="/" className="text-search-blue hover:underline text-[15px] self-start">
            Back to (Rum)oogle
          </Link>
        </div>
        <p className="text-[9rem] leading-none text-accent-text opacity-30 select-none">=/</p>
      </div>
    </div>
  );
}
