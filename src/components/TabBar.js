"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTabs } from "@/context/TabContext";

export default function TabBar() {
  const path = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tabs, activeTabId, setActiveTabId, closeTab } = useTabs();

  if (path !== "/search" || tabs.length === 0) return null;

  const q = searchParams.get("q");
  const itemParamName =
    q === "rumezas-projects" ? "project" :
    q === "life" ? "thing" : "item";

  const handleTabClick = (tab) => {
    if (tab.id === activeTabId) return;
    setActiveTabId(tab.id);
    const params = new URLSearchParams(searchParams);
    if (tab.id === "search") {
      params.delete(itemParamName);
    } else {
      params.set(itemParamName, tab.id.replace("item-", ""));
    }
    router.replace(`/search?${params.toString()}`);
  };

  const handleClose = (e, tab) => {
    e.stopPropagation();
    if (activeTabId === tab.id) {
      const params = new URLSearchParams(searchParams);
      params.delete(itemParamName);
      router.replace(`/search?${params.toString()}`);
    }
    closeTab(tab.id);
  };

  return (
    <div
      className="flex flex-row items-end bg-dark-purple-200 px-2 pt-2 overflow-x-auto gap-x-1.5"
      style={{ scrollbarWidth: "none" }}
    >
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        return (
          <div
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`flex items-center gap-x-2 px-3 py-2 rounded-t-lg cursor-pointer w-44 flex-shrink-0 min-w-0 select-none transition-colors duration-150 ${
              isActive
                ? "bg-dark-purple-100 text-white"
                : "bg-dark-purple-300 text-accent-text hover:bg-dark-purple-100 hover:text-white"
            }`}
          >
            <div
              className="bg-no-repeat bg-cover w-3 h-3 flex-shrink-0 opacity-50"
              style={{ backgroundImage: "url(icons/key.svg)" }}
            />
            <span className="truncate flex-1 text-xs">{tab.title}</span>
            {tab.id !== "search" && (
              <span
                onClick={(e) => handleClose(e, tab)}
                className="opacity-40 hover:opacity-100 text-xs flex-shrink-0 w-4 h-4 flex items-center justify-center rounded hover:bg-white hover:bg-opacity-20"
              >
                ✕
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
