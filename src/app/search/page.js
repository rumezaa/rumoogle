/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import projects from "../../data/projects.json";
import experiences from "../../data/experience.json";
import life from "../../data/life.json";
import Image from "next/image";
import { useTabs } from "@/context/TabContext";

export default function Search() {
  const [isHover, setIsHover] = useState({});
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q");
  const project = searchParams.get("p");
  const displayQuery = query ? query : "";
  const displayData =
    (displayQuery == "rumezas-projects" && [...projects]?.reverse()) ||
    (displayQuery == "experience" && experiences) ||
    (displayQuery == "life" && [...life]?.reverse());

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
    <div className="font-ropaSans flex flex-row gap-x-2" style={{ zIndex: 10 }}>
      <div className="w-4/5">
        <div className="flex flex-row items-center gap-x-4">
          <div className="bg-dark-purple-300 rounded-full w-8 h-8 flex items-center justify-center">
            <div className="bg-no-repeat bg-cover w-5 h-5" style={{ backgroundImage: `url(icons/key.svg)` }} />
          </div>
          <div className="font-light leading-tight">
            <h2>{data.title}</h2>
            <h2 className="opacity-75 text-sm">{data.timeline}</h2>
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
        className="rounded-md w-24 h-24"
      />
    </div>
  );

  const ItemDetail = ({ data }) => (
    <div className="flex flex-col w-full px-4 md:px-16 py-6 gap-y-5">
      <div className="relative w-full h-56 md:h-80 rounded-lg overflow-hidden bg-dark-purple-300">
        <Image
          src={`/search-img/${data.alias}-banner.png`}
          alt={`${data.alias} banner`}
          layout="fill"
          objectFit="contain"
          priority
        />
      </div>
      <div className="flex flex-col gap-y-3 max-w-3xl">
        <h2 className="text-2xl">{data.title}</h2>
        {data.links?.length > 0 && (
          <div className="flex flex-row gap-x-2 flex-wrap gap-y-2">
            {data.links.map((link, idx) => (
              <Link
                key={idx}
                className={`flex flex-row py-1.5 px-3 text-sm font-medium items-center gap-x-2 rounded border border-stone-700 transform transition-all duration-300 ${
                  link.name === "github"
                    ? "bg-dark-purple-300 hover:bg-[#4D456E] border-dark-purple-300 flex-row-reverse"
                    : "bg-white text-dark-purple-100 hover:bg-stone-200 hover:text-dark-purple-300"
                }`}
                href={link.link}
                target="_blank"
                onMouseEnter={() => setIsHover((h) => ({ ...h, [idx]: true }))}
                onMouseLeave={() => setIsHover((h) => ({ ...h, [idx]: false }))}
              >
                <h2>{link.name}</h2>
                <div
                  className={`bg-no-repeat bg-cover ${link.name === "video" ? "w-6 h-6" : "w-4 h-4"}`}
                  style={{ backgroundImage: `url(icons/${isHover[idx] ? link.urlHover : link.url})` }}
                />
              </Link>
            ))}
          </div>
        )}
        <p className="font-thin text-white opacity-80 leading-relaxed whitespace-pre-line">{data.longDescription}</p>
        {data.tech?.length > 0 && (
          <div className="flex flex-row flex-wrap gap-2 mt-1">
            {data.tech.map((stack, idx) => (
              <div key={idx} className="bg-white bg-opacity-10 text-accent-text text-sm p-1 rounded">
                {stack}
              </div>
            ))}
          </div>
        )}
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
                      : "https://github-readme-stats.vercel.app/api/top-langs/?username=rumezaa&layout=compact&theme=nightowl&hide_border=true&exclude_repo=the-www-blog,clean-water-foundation&langs_count=6"
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
