"use client";
import Link from "next/link";
import Image from "next/image";

const Arrow = () => <span className="text-accent-text mr-2 select-none">↳</span>;

const Co = ({ icon, href, children }) => (
  <Link
    href={href}
    target="_blank"
    className="inline-flex items-center gap-x-1 font-bold underline underline-offset-2 decoration-[#ADA6CC] hover:opacity-70 transition-opacity align-middle leading-none text-[#DED7FC] opacity-100"
    style={{ verticalAlign: "middle" }}
  >
    <Image src={`/icons/company-icons/${icon}`} alt="" width={16} height={16} className="rounded-sm object-contain flex-shrink-0" />
    <span>{children}</span>
  </Link>
);

const Ul = ({ href, target, children }) => (
  <Link
    href={href}
    target={target}
    className="underline underline-offset-2 decoration-[#ADA6CC] hover:opacity-70 transition-opacity text-[#DED7FC]"
  >
    {children}
  </Link>
);

export default function About() {
  return (
    <div className="flex flex-col w-full md:flex-row-reverse h-full items-center gap-x-10 gap-y-10 justify-center pb-10 md:pb-0">
      <div className="flex flex-col font-ropaSans w-4/5 md:w-2/5 lg:w-1/3 text-md text-white/70 gap-y-5">
        <h2 className="text-accent-text opacity-70 text-sm tracking-widest">RUMEZA FATIMA</h2>

        <p className="text-lg font-bold">i love creating things :)</p>

        <div className="flex flex-col gap-y-1.5">
          <p className="italic font-bold text-white">recent side quests:</p>
          <div className="flex flex-col gap-y-1 font-normal">
            <p><Arrow />moved to boston to do engineering at <Co icon="hubspot.png" href="https://www.hubspot.com/">HubSpot</Co></p>
            <p><Arrow />trained a custom ML model for <Ul href="https://github.com/rumezaa/audibly" target="_blank">real-time ASL-to-text translation</Ul> — works in any video call via virtual camera</p>
            <p><Arrow />i put all my internship $$ into running the <Ul href="/search?q=life&thing=ta">world&apos;s first lore-building grant</Ul> — 120K+ views, 100+ applications, $6K distributed, 8 participants funded.</p>
            <p><Arrow />tinkering with <strong>hardware</strong> — would love any tips!</p>
            <p>
              <Arrow />more projects (donation matching pipeline, decks for CIBC + Amazon Alexa){" "}
              <Ul href="/search?q=rumezas-projects">found here</Ul>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-y-1.5">
          <p className="italic font-bold text-white">previously:</p>
          <div className="flex flex-col gap-y-1 font-normal">
            <p><Arrow />Engineering <Co icon="tenstorrent.png" href="https://tenstorrent.com/">Tenstorrent</Co> — shipped QuietBox Blackhole 2 & built a new global software product</p>
            <p><Arrow />Engineering <Co icon="symai.png" href="https://www.symbioticai.ca/">Symbiotic AI</Co> — medical AI interfaces for cardiologists</p>
            <p><Arrow />Engineering <Co icon="arcurve.png" href="https://www.arcurve.com/">Arcurve</Co></p>
            <p><Arrow />Engineering <Co icon="pixeltree.png" href="https://pixeltree.ca/">Pixeltree</Co> — my first internship at 15 years old!</p>
          </div>
        </div>

        <p className=" font-normal">I love chasing unique experiences and jumping off (imaginary) cliffs to test my skills.</p>

        <Link
          href="/search?q=rumezas-projects"
          className="border border-[#DED7FC] flex flex-row w-full items-center justify-center rounded-md p-4 hover:bg-[#DED7FC] hover:text-dark-purple-100 transform transition-all duration-300 text-sm"
        >
          discover my projects
        </Link>
      </div>

      <div className="flex md:flex-col-reverse items-center justify-start">
        <div
          className="bg-no-repeat bg-cover w-48 h-12 md:w-72 md:h-24 bg-left"
          style={{ backgroundImage: `url("signature.png")` }}
        />
        <div
          className="bg-no-repeat bg-cover w-32 h-32 md:w-48 md:h-48"
          style={{ backgroundImage: `url("head-shot.png")` }}
        />
      </div>
    </div>
  );
}
