/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import projects from "../data/projects.json";
import life from "../data/life.json";
import experiences from "../data/experience.json";

export default function SearchBar({ query, hasItemOpen }) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [tooltip2, setTooltip2] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const urlDisplay = hasItemOpen
    ? `rumoogle.ca${path}?${searchParams.toString()}`
    : "";

  const searches = [
    { search: "rumeza's projects", param: "rumezas-projects" },
    { search: "life", param: "life" },
    // { search: "why hire a rumeza", param: "why-hire-a-rumeza" },
  ];

  const trimmed = inputValue.trim();
  const isExactMatch = searches.some(
    (s) => s.search.toLowerCase() === trimmed.toLowerCase()
  );

  const allItems = useMemo(() => [
    ...projects.map((p) => ({ ...p, category: "rumezas-projects", param: "project" })),
    ...life.map((l) => ({ ...l, category: "life", param: "thing" })),
    ...experiences.map((e) => ({ ...e, category: "experience", param: "item" })),
  ], []);

  const itemResults = useMemo(() => {
    if (trimmed.length < 2) return [];
    const q = trimmed.toLowerCase();
    return allItems.filter((item) =>
      item.headline?.toLowerCase().includes(q) ||
      item.title?.toLowerCase().includes(q) ||
      item.searchDescription?.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [trimmed, allItems]);

  const showUnrecognized = trimmed.length > 0 && !isExactMatch && itemResults.length === 0;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (query) {
      const found = searches.find((s) => s.param === query);
      if (found) setInputValue(found.search);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isFocused) inputRef.current?.focus();
  }, [isFocused]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const handleSubmit = () => {
    const matched = searches.find(
      (s) => s.search.toLowerCase() === trimmed.toLowerCase()
    );
    if (matched) {
      router.push(`/search?q=${encodeURIComponent(matched.param)}`);
      setIsFocused(false);
    } else if (trimmed) {
      router.push(`/wrong-search`);
      setIsFocused(false);
    }
  };

  return (
    <div
      className={`flex ${hasItemOpen ? "flex-row items-center gap-x-3 flex-1 min-w-0" : "flex-col items-center gap-y-6 w-full"} font-ropaSans ${
        path === "/" && "relative"
      }`}
      style={{ zIndex: 80 }}
    >
      {path === "/" && (
        <h2 className="text-white text-6xl lg:text-7xl xl:text-8xl absolute -top-20 lg:-top-28">
          (Rum)oogle
        </h2>
      )}

      {hasItemOpen && (
        <div className="flex items-center gap-x-0.5 flex-shrink-0">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full flex items-center justify-center text-accent-text hover:bg-white hover:bg-opacity-10 transition-colors duration-150"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => router.forward()}
            className="w-8 h-8 rounded-full flex items-center justify-center text-accent-text hover:bg-white hover:bg-opacity-10 transition-colors duration-150"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => router.refresh()}
            className="w-8 h-8 rounded-full flex items-center justify-center text-accent-text hover:bg-white hover:bg-opacity-10 transition-colors duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M23 4v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

      <div
        ref={dropdownRef}
        className={`relative flex flex-col items-center shadow-lg ${
          (path !== "/" && hasItemOpen && "flex-1 min-w-0") ||
          (path !== "/" && !hasItemOpen && "md:absolute w-full top-6 left-48 md:w-1/3 ") ||
          "absolute w-10/12 md:w-1/2 lg:w-1/3"
        } ${isFocused ? "rounded-t-3xl rounded-b-none" : "rounded-full"} py-1 bg-accent-color`}
      >
        <div className="flex items-center w-full px-4">
          {hasItemOpen && !isFocused ? (
            <svg
              className="w-4 h-4 flex-shrink-0 opacity-50 cursor-text"
              viewBox="0 0 24 24"
              fill="none"
              onClick={() => setIsFocused(true)}
            >
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="#ADA6CC" strokeWidth="1.5"/>
              <path d="M8 11V7a4 4 0 018 0v4" stroke="#ADA6CC" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <div
              className="bg-no-repeat w-5 h-5 bg-cover flex-shrink-0 cursor-pointer"
              style={{ backgroundImage: "url(icons/search.svg)" }}
              onClick={() => inputRef.current?.focus()}
            />
          )}

          {hasItemOpen && !isFocused && (
            <div
              className="flex-grow px-3 py-2 text-sm text-accent-text truncate cursor-text"
              onClick={() => setIsFocused(true)}
            >
              {urlDisplay}
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search (Rum)oogle"
            className={`flex-grow px-4 py-2 bg-transparent focus:outline-none text-white placeholder-accent-text ${
              hasItemOpen ? "text-sm" : ""
            } ${hasItemOpen && !isFocused ? "hidden" : ""}`}
          />

          <div className="flex flex-row justify-center items-center gap-x-2">
            {!hasItemOpen && (
              <Link
                href="https://calendly.com/rumeza/one-on-one"
                target="_blank"
                title="Book a call"
                className="cursor-pointer hover:opacity-70 transition-opacity duration-200"
              >
                <div
                  className="bg-no-repeat w-5 h-5 bg-cover"
                  style={{ backgroundImage: "url(icons/calendar.svg)" }}
                />
              </Link>
            )}
            <div
              className="bg-no-repeat w-5 h-5 bg-cover cursor-pointer"
              onMouseEnter={() => setTooltip2(true)}
              onMouseLeave={() => setTooltip2(false)}
              style={{ backgroundImage: "url(icons/microphone.svg)" }}
            />
            {tooltip2 && (
              <div className="bg-[#15131B] hidden md:block text-white absolute p-2 rounded-xl px-4 text-xs text-nowrap border border-accent-text border-opacity-40 top-12">
                this just looks pretty
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isFocused && (
            <motion.div
              className="absolute top-full left-0 right-0 rounded-b-2xl bg-accent-color shadow-xl overflow-hidden z-50"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <div className="border-b border-accent-text border-opacity-30 mx-5 mb-1" />

              {showUnrecognized && (
                <div className="px-5 flex flex-row items-center w-full gap-x-3 text-[#E5DFFF] py-2 rounded-lg">
                  <div
                    className="bg-no-repeat w-4 h-4 bg-cover flex-shrink-0 opacity-50"
                    style={{ backgroundImage: "url(icons/search.svg)" }}
                  />
                  <span className="flex-grow min-w-0 text-sm truncate">{inputValue}</span>
                  <span className="text-accent-text text-xs italic whitespace-nowrap flex-shrink-0">
                    not found on rumoogle
                  </span>
                </div>
              )}

              {itemResults.length > 0 && (
                <>
                  <h2 className="px-5 font-semibold text-xs text-accent-text mt-1 mb-0.5 uppercase tracking-wider">Results</h2>
                  {itemResults.map((item, idx) => (
                    <Link
                      key={idx}
                      className="px-5 flex flex-row items-center w-full gap-x-3 text-[#E5DFFF] py-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition duration-200"
                      href={`/search?q=${encodeURIComponent(item.category)}&${item.param}=${encodeURIComponent(item.alias)}`}
                      onClick={() => setIsFocused(false)}
                    >
                      <div
                        className="bg-no-repeat w-4 h-4 bg-cover flex-shrink-0 opacity-60"
                        style={{ backgroundImage: "url(icons/key.svg)" }}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm truncate">{item.headline}</span>
                        <span className="text-xs text-accent-text opacity-60">{item.title} · {item.timeline}</span>
                      </div>
                    </Link>
                  ))}
                  <div className="border-b border-accent-text border-opacity-20 mx-4 my-1" />
                </>
              )}

              {!trimmed && (
                <h2 className="px-5 font-semibold text-sm text-accent-text mt-1 mb-1">
                  Trending searches
                </h2>
              )}
              {searches.map((item, idx) => (
                <Link
                  className="px-5 flex flex-row items-center w-full gap-x-3 text-[#E5DFFF] py-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition duration-200"
                  href={`/search?q=${encodeURIComponent(item.param)}`}
                  key={idx}
                  onClick={() => {
                    setInputValue(item.search);
                    setIsFocused(false);
                  }}
                >
                  <div
                    className="bg-no-repeat w-6 h-4 bg-cover flex-shrink-0 opacity-60"
                    style={{ backgroundImage: "url(icons/trending.svg)" }}
                  />
                  <span className="flex-grow text-sm font-medium">{item.search}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
