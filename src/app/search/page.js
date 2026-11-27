/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import experiences from "../../data/experience.json";
import { projects, life, linkIcon } from "@/lib/content";
import Markdown from "@/components/Markdown";
import UpdatesThread from "@/components/UpdatesThread";
import Image from "next/image";
import { useTabs } from "@/context/TabContext";

export default function Search() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q");
  const project = searchParams.get("p");
  const displayQuery = query ? query : "";
  const displayData =
    (displayQuery == "rumezas-projects" && projects) ||
    (displayQuery == "experience" && experiences) ||
    (displayQuery == "life" && life);

  const view = searchParams.get("view") || "all";
  const [lifeImages, setLifeImages] = useState([]);

  useEffect(() => {
    if (view === "images" && displayQuery === "life") {
      fetch("/api/upload").then((r) => r.json()).then(setLifeImages);
    }
  }, [view, displayQuery]);

  const { tabs, activeTabId, setActiveTabId, initTabs, addTab } = useTabs();
  const itemParamName =
    displayQuery === "rumezas-projects" ? "project" :
    displayQuery === "life" ? "thing" : "item";
  const item = searchParams.get(itemParamName);

  const languages = [
    "Python", "Java", "C++", "JavaScript", "Typescript",
    "HTML", "CSS", "SQL", "Sqlite", "Solidity", "Ruby", "XML", "GraphQL",
  ];
  const technologies = [
    "React JS", "React Native", "Nodejs", "Next JS", "Flask", "Django",
    "Tailwind CSS", "Postgres", "Ruby on Rails", "Docker", "AWS", "Nginx",
    "Svelte", "pandas", "NumPy", "Matplotlib", "NLTK", "Kivy",
  ];

  // Init the base search tab when the query changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const queryTitle =
      displayQuery === "rumezas-projects" ? "rumeza's projects" :
      displayQuery === "life" ? "life" :
      "search";
    initTabs({ id: "search", title: queryTitle, type: "search" });
  }, [query]);

  // Sync active tab with the ?item= URL param
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!item) {
      setActiveTabId("search");
      return;
    }
    const allData = [...projects, ...life, ...experiences];
    const data = allData.find((d) => d.alias === item);
    if (data) {
      addTab({ id: `item-${data.alias}`, title: data.headline, type: "item", data });
    }
  }, [item]);

  // Migrate legacy ?p= deep links
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (project) {
      const params = new URLSearchParams(searchParams);
      params.delete("p");
      params.set(itemParamName, project);
      router.replace(`?${params.toString()}`);
    }
  }, [project]);

  // Clicking a search result pushes the item param into the URL
  const handleSelect = (data) => {
    const params = new URLSearchParams(searchParams);
    params.set(itemParamName, data.alias);
    router.push(`?${params.toString()}`);
  };

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const SearchItem = ({ data }) => (
    <div className="font-ropaSans flex flex-row gap-x-3 w-full" style={{ zIndex: 10 }}>
      <div className="flex-1 min-w-0">
        <div className="flex flex-row items-center gap-x-4">
          <div className="bg-dark-purple-300 rounded-full w-8 h-8 flex items-center justify-center">
            <div className="bg-no-repeat bg-cover w-5 h-5" style={{ backgroundImage: `url(icons/key.svg)` }} />
          </div>
          <div className="font-light leading-tight">
            <h2>{data.title}</h2>
            <h2 className="opacity-75 text-sm">
              {data.timeline}
              {data.updates?.length > 0 && ` · ${data.updates.length} update${data.updates.length > 1 ? "s" : ""}`}
            </h2>
          </div>
        </div>
        <h2
          className="text-search-blue text-xl hover:underline cursor-pointer"
          onClick={() => handleSelect(data)}
        >
          {data.headline}
        </h2>
        <h2 className="text-white opacity-50">{data.searchDescription}</h2>
      </div>
      <Image
        src={`/search-img/${data.alias}-icon.png`}
        alt={`${data.alias} icon`}
        width={96}
        height={90}
        className="rounded-md w-16 h-16 md:w-24 md:h-24 flex-shrink-0 object-cover self-start"
      />
    </div>
  );

  const ItemDetail = ({ data }) => (
    <div className="w-full min-h-full bg-[#FAF8F5] text-[#2B273C]">
      <div className="flex flex-col w-full px-4 md:px-16 py-6 gap-y-5">
        <div className="relative w-full h-56 md:h-80 rounded-lg overflow-hidden bg-[#EFEBE4]">
          <Image
            src={`/search-img/${data.alias}-banner.png`}
            alt={`${data.alias} banner`}
            fill
            className="object-contain"
            priority
            // posts without a banner image just skip the banner
            onError={(e) => (e.currentTarget.parentElement.style.display = "none")}
          />
        </div>
        <article className="flex flex-col gap-y-3 max-w-3xl">
          <div>
            <h1 className="text-3xl md:text-4xl text-[#1D1B28]">{data.headline}</h1>
            <p className="text-sm text-[#6B6485] mt-1">{[data.title, data.timeline].filter(Boolean).join(" · ")}</p>
          </div>
          {data.links?.length > 0 && (
            <div className="flex flex-row gap-x-2 flex-wrap gap-y-2">
              {data.links.map((link, idx) => (
                <Link
                  key={idx}
                  className={`flex flex-row py-1.5 px-3 text-sm font-medium items-center gap-x-2 rounded border transition-all duration-300 ${
                    link.name === "github"
                      ? "bg-dark-purple-300 text-white hover:bg-[#4D456E] border-dark-purple-300 flex-row-reverse"
                      : "bg-white text-dark-purple-100 border-[#D9D3E8] hover:bg-stone-100"
                  }`}
                  href={link.link}
                  target="_blank"
                >
                  <span>{link.name}</span>
                  <div
                    className={`bg-no-repeat bg-cover ${link.name === "video" ? "w-6 h-6" : "w-4 h-4"}`}
                    style={{ backgroundImage: `url(icons/${linkIcon(link)})` }}
                  />
                </Link>
              ))}
            </div>
          )}
          <div className="mt-2">
            <Markdown>{data.longDescription}</Markdown>
          </div>
          {data.tech?.length > 0 && (
            <div className="flex flex-row flex-wrap gap-2 mt-1">
              {data.tech.map((stack, idx) => (
                <div key={idx} className="bg-[#2B273C] bg-opacity-5 text-[#4D456E] text-sm p-1 rounded">
                  {stack}
                </div>
              ))}
            </div>
          )}
          <UpdatesThread updates={data.updates} />
        </article>
      </div>
    </div>
  );

  const navTabs = [
    { label: "All", view: "all" },
    ...(displayQuery === "life" ? [{ label: "Images", view: "images" }] : []),
  ];

  return (
    <div className="flex flex-col w-full h-full text-white font-ropaSans">
      {!item && (
        <div className="flex flex-row items-end gap-x-1 px-4 md:pl-48 border-b border-white border-opacity-10">
          {navTabs.map((tab) => (
            <Link
              key={tab.view}
              href={`/search?q=${displayQuery}&view=${tab.view}`}
              className={`px-3 py-2.5 text-sm transition-colors duration-150 border-b-2 -mb-px ${
                view === tab.view
                  ? "border-[#ADA6CC] text-white"
                  : "border-transparent text-accent-text hover:text-white hover:border-white hover:border-opacity-30"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      )}

      {activeTab?.type === "item" ? (
        <ItemDetail data={activeTab.data} />
      ) : view === "images" ? (
        <div className="px-4 md:pl-48 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {lifeImages.map((img, idx) => (
              <div key={idx} className="flex flex-col gap-y-1.5">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-dark-purple-300">
                  <Image src={`/life-img/${img.filename}`} alt={img.caption || ""} fill className="object-cover" />
                </div>
                {img.caption && (
                  <p className="text-xs text-accent-text px-0.5">{img.caption}</p>
                )}
              </div>
            ))}
            {lifeImages.length === 0 && (
              <p className="text-accent-text text-sm col-span-full opacity-50">no images uploaded yet</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full relative">
          <div className="w-full flex flex-row gap-x-20 py-10">
            <div className="flex flex-col gap-y-4 px-4 md:w-1/2 lg:pl-48">
              {displayData?.map((data, idx) => (
                <div key={idx}>
                  <SearchItem data={data} />
                </div>
              ))}
            </div>

            <div className="hidden w-1/3 p-2 h-[40rem] border-[0.05rem] border-white border-opacity-30 shadow-xl rounded-lg md:flex flex-col gap-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    displayQuery == "life"
                      ? "search-img/life.jpeg"
                      : "/api/github-stats"
                  }
                  alt="rumezaa"
                  className="w-full h-[17rem] rounded-t-lg"
                />

                {(displayQuery == "rumezas-projects" && (
                  <div className="flex flex-col gap-y-3">
                    <h2 className="opacity-70 text-lg">
                      I love building impact-driven, full-stack projects.
                    </h2>
                    <h2 className="opacity-70 text-lg">
                      Currently, I&apos;m working on specializing my technical skills in ML
                    </h2>
                    <div className="flex flex-col">
                      <h2 className="uppercase tracking-wider text-sm">languages</h2>
                      <div className="flex flex-row flex-wrap gap-2">
                        {languages.map((stack, idx) => (
                          <div key={idx} className="inline-flex bg-white bg-opacity-10 text-accent-text text-sm p-1 rounded">
                            {stack}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <h2 className="uppercase tracking-wider text-sm">Frameworks & Libraries</h2>
                      <div className="flex flex-row flex-wrap gap-2">
                        {technologies.map((stack, idx) => (
                          <div key={idx} className="inline-flex bg-white bg-opacity-10 text-accent-text text-sm p-1 rounded">
                            {stack}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="flex flex-col gap-y-3 p-2">
                    <h2 className="text-xl">&ldquo;Lead a life worth telling&rdquo;</h2>
                    <h2 className="opacity-70 text-lg">
                      This is one of my favourite quotes of all times as it
                      continually motivates me to seek out unqiue, spontaneous
                      experiences to increase my wordly exposure.
                    </h2>
                    <h2 className="opacity-70 text-lg">
                      The following is an archive of memorable experiences where I
                      leave my comfort zone to experience something new.
                    </h2>
                    <h2 className="opacity-70 text-lg">Warning: I over-romantacize my life a lot.</h2>
                    <h2 className="opacity-70 text-sm">(but its more fun that way)</h2>
                  </div>
                )}
              </div>
            </div>
          </div>
      )}
    </div>
  );
}
