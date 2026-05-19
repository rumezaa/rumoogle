"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import SearchBar from "./SearchBar";
import bookmarks from "../data/bookmarks.json";

export default function Header({ setShowMailer }) {
  const path = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const [linkMenu, setLinkMenu] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [bookmarkOpen, setBookmarkOpen] = useState(false);
  const [openFolders, setOpenFolders] = useState({});
  const [textCopy, setIsCopy] = useState(false);
  const menuRef = useRef(null);
  const linkRef = useRef(null);
  const profileRef = useRef(null);
  const bookmarkRef = useRef(null);
  const bookmarkMenuRef = useRef(null);

  const toggleFolder = (folder) =>
    setOpenFolders((prev) => ({ ...prev, [folder]: !prev[folder] }));

  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const displayQuery = query ? query : "";
  const hasItemOpen = !!(
    searchParams.get("project") ||
    searchParams.get("thing") ||
    searchParams.get("item")
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("rumeza06@gmail.com");
      setIsCopy(true);
      setTimeout(() => setIsCopy(false), 4000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const externalLinks = [
    { text: "code :3", icon: "github.svg", url: "https://github.com/rumezaa" },
    { text: "stalk", icon: "x.svg", url: "https://x.com/rumezaft" },
    { text: "connect", icon: "linkedin.svg", url: "https://www.linkedin.com/in/ftrumeza/" },
    { text: "designs", icon: "figma.svg", url: "https://www.figma.com/design/t9MDds1XizvuS3fBXsGPGo/Rumeza's-Design-Portfolio?node-id=0-1&t=y3LDldLAr8SO7UF4-1" },
    { text: "articles", icon: "articles.svg", url: "https://rumezasrace.substack.com/" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showMenu &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        (!linkRef.current || !linkRef.current.contains(event.target)) &&
        (!profileRef.current || !profileRef.current.contains(event.target))
      ) {
        setShowMenu(false);
        setLinkMenu(false);
        setProfileMenu(false);
      }
      if (
        bookmarkOpen &&
        bookmarkMenuRef.current &&
        !bookmarkMenuRef.current.contains(event.target) &&
        (!bookmarkRef.current || !bookmarkRef.current.contains(event.target))
      ) {
        setBookmarkOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showMenu, bookmarkOpen]);

  return (
    <div
      className={`flex ${
        path !== "/" && !hasItemOpen ? "flex-col-reverse" : "flex-row"
      } gap-y-2 gap-x-4 w-full md:flex-row justify-between items-center font-ropaSans text-accent-text p-4 ${
        path === "/" ? "pl-10" : !hasItemOpen ? "pt-8 md:pl-16" : "md:pl-6"
      } relative`}
    >
      <div
        style={{ zIndex: 40 }}
        className={`flex ${
          path !== "/" && !hasItemOpen ? "flex-col" : "flex-row"
        } ${hasItemOpen ? "flex-1 min-w-0" : "w-full"} md:flex-row ${hasItemOpen ? "gap-x-0" : "gap-x-5"} items-center`}
      >
        {(path === "/" && (
          <Link href="/about" className="cursor-pointer hover:opacity-70 transform transition-all duration-300">
            About
          </Link>
        )) || (path !== "/" && !hasItemOpen && (
          <Link href="/" className="text-white text-2xl hidden md:block">
            (Rum)oogle
          </Link>
        ))}

        {path !== "/" && <SearchBar query={displayQuery} hasItemOpen={hasItemOpen} />}
      </div>

      <div className="flex flex-row items-center justify-center gap-x-3">
        {path !== "/" && !hasItemOpen && (
          <Link href="/" className="text-white text-2xl block md:hidden">
            (Rum)oogle
          </Link>
        )}


        {hasItemOpen && (
          <Link
            href="https://calendly.com/rumeza/one-on-one"
            target="_blank"
            title="Book a call"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-10 transition-colors duration-200 cursor-pointer"
          >
            <div
              className="bg-no-repeat w-6 h-6 bg-cover"
              style={{ backgroundImage: "url(icons/calendar.svg)" }}
            />
          </Link>
        )}

        {/* Regular pages: Gmail + dot menu + profile */}
        {hasItemOpen && (
          <div className="relative">
            <button
              ref={bookmarkRef}
              onClick={() => setBookmarkOpen((o) => !o)}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 cursor-pointer ${bookmarkOpen ? "bg-white bg-opacity-20" : "hover:bg-white hover:bg-opacity-10"}`}
              title="Bookmarks"
            >
              <div
                className="bg-no-repeat bg-cover w-5 h-5"
                style={{ backgroundImage: `url(icons/${bookmarkOpen ? "bookmark-filled.svg" : "bookmark.svg"})` }}
              />
            </button>

            {bookmarkOpen && (
              <div
                ref={bookmarkMenuRef}
                className="absolute right-0 top-10 w-64 bg-dark-purple-200 border border-accent-color rounded-2xl p-3 shadow-xl z-50 flex flex-col gap-y-1"
              >
                <h2 className="text-xs text-accent-text uppercase tracking-wider px-2 pb-1">Bookmarks</h2>
                {bookmarks.map((folder) => (
                  <div key={folder.folder}>
                    <button
                      onClick={() => toggleFolder(folder.folder)}
                      className="w-full flex items-center gap-x-2 px-2 py-1.5 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors duration-150 text-left"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={`text-accent-text flex-shrink-0 transition-transform duration-150 ${openFolders[folder.folder] ? "rotate-90" : ""}`}>
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-accent-text flex-shrink-0">
                        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-sm text-white">{folder.folder}</span>
                      <span className="ml-auto text-xs text-accent-text opacity-50">{folder.items.length}</span>
                    </button>
                    {openFolders[folder.folder] && (
                      <div className="pl-8 flex flex-col gap-y-0.5">
                        {folder.items.length === 0 ? (
                          <p className="text-xs text-accent-text opacity-40 px-2 py-1">empty</p>
                        ) : (
                          folder.items.map((item, i) => (
                            <Link
                              key={i}
                              href={item.url}
                              target="_blank"
                              className="text-sm text-[#E5DFFF] px-2 py-1 rounded hover:bg-white hover:bg-opacity-5 truncate"
                            >
                              {item.title}
                            </Link>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {hasItemOpen && (
          <div
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-10 transition-colors duration-200 cursor-pointer"
            onClick={() => setShowMailer(true)}
            title="Gmail"
          >
            <div
              className="bg-no-repeat w-6 h-6 bg-cover"
              style={{ backgroundImage: "url(icons/gmail.svg)" }}
            />
          </div>
        )}

        {!hasItemOpen && (
          <div
            className="cursor-pointer hover:opacity-70 transition-opacity duration-200 text-accent-text"
            onClick={() => setShowMailer(true)}
          >
            Gmail
          </div>
        )}

        <div
            onClick={() => {
              setLinkMenu(!linkMenu);
              profileMenu ? setShowMenu(true) : setShowMenu(!showMenu);
              setProfileMenu(false);
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-full ${
              linkMenu ? "bg-white bg-opacity-20" : "hover:bg-white hover:bg-opacity-10"
            } transform transition-all duration-300 cursor-pointer`}
            ref={linkRef}
          >
            <div
              className="bg-no-repeat w-5 h-5 bg-cover"
              style={{ backgroundImage: "url(icons/menu.svg)" }}
            />
          </div>

        <div
            style={{ backgroundImage: `url(head-shot.png)` }}
            onClick={() => {
              setProfileMenu(!profileMenu);
              linkMenu ? setShowMenu(true) : setShowMenu(!showMenu);
              setLinkMenu(false);
            }}
            ref={profileRef}
            className="rounded-full bg-no-repeat bg-cover w-8 h-8 cursor-pointer"
          />

        {showMenu && (
          <div
            ref={menuRef}
            style={{ zIndex: 90 }}
            className={`absolute ${
              (linkMenu &&
                `grid grid-cols-3 right-5 ${
                  path !== "/"
                    ? "-bottom-[12rem] md:-bottom-[16.5rem]"
                    : "-bottom-[16.5rem]"
                }`) ||
              (profileMenu &&
                `flex flex-col right-5 ${
                  path !== "/"
                    ? "-bottom-[20.5rem] md:-bottom-[24.5rem]"
                    : "-bottom-[24.5rem]"
                }`)
            } bg-dark-purple-200 border border-[0.5rem] border-accent-color rounded-[1.5rem] p-6 gap-6`}
          >
            {linkMenu && externalLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.url}
                target="_blank"
                className="flex flex-col items-center hover:bg-white hover:bg-opacity-5 px-4 py-2 rounded-lg transform transition ease-out duration-200"
              >
                <div
                  className="bg-no-repeat bg-cover w-12 h-12"
                  style={{ backgroundImage: `url(icons/${link.icon})` }}
                />
                <h2>{link.text}</h2>
              </Link>
            ))}

            {profileMenu && (
              <div className="flex flex-col w-full">
                <div className="flex flex-row w-full gap-x-10 justify-end">
                  <div className="flex flex-row">
                    <h2>rumeza06@gmail.com</h2>
                    <div
                      className="bg-no-repeat bg-cover w-5 h-5 cursor-pointer"
                      onClick={handleCopy}
                      style={{
                        backgroundImage: textCopy
                          ? "url(icons/copy-filled.svg)"
                          : "url(icons/copy.svg)",
                      }}
                    />
                  </div>
                  <div
                    className="bg-no-repeat bg-cover w-5 h-5 cursor-pointer"
                    onClick={() => {
                      setProfileMenu(false);
                      setShowMenu(false);
                      setLinkMenu(false);
                    }}
                    style={{ backgroundImage: "url(icons/exit.svg)" }}
                  />
                </div>
                <div className="flex flex-row w-full">
                  <h2 className={`${textCopy ? "visible" : "invisible"} text-xs text-center w-full text-white mb-4`}>
                    email copied successfully!
                  </h2>
                </div>

                <div className="flex flex-col justify-center items-center">
                  <div
                    style={{ backgroundImage: `url(head-shot.png)` }}
                    className="rounded-full bg-no-repeat bg-cover w-24 h-24 cursor-pointer"
                  />
                  <h2 className="text-xl">Hi, I&apos;m Rumeza</h2>
                </div>
                <div className="flex flex-col font-ropaSans-light text-md gap-y-5">
                  <h2 className="text-center">Welcome to my personal site. 💜</h2>
                  <div className="flex flex-col">
                    <h2 className="text-sm text-white">HOW TO USE</h2>
                    <h2>Explore my projects and journey using <span className="italic text-white">Search</span></h2>
                    <h2>Send me a message using <span className="italic text-white">Gmail</span></h2>
                    <h2>View more of my work using the <span className="italic text-white">Dot-Menu</span></h2>
                    <h2 className="flex flex-row gap-x-1 items-center">
                      Book a call using{" "}
                      <span className="italic text-white flex inline-flex self-center">
                        <div
                          className="bg-no-repeat w-5 h-5 bg-cover"
                          style={{ backgroundImage: "url(icons/calendar.svg)" }}
                        />
                      </span>
                    </h2>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
