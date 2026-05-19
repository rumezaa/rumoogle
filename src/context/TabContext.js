"use client";
import { createContext, useContext, useState } from "react";

const TabContext = createContext(null);

export function TabProvider({ children }) {
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);

  const initTabs = (tab) => {
    setTabs([tab]);
    setActiveTabId(tab.id);
  };

  const addTab = (tab) => {
    setTabs((prev) => {
      if (prev.find((t) => t.id === tab.id)) return prev;
      return [...prev, tab];
    });
    setActiveTabId(tab.id);
  };

  const closeTab = (tabId) => {
    const idx = tabs.findIndex((t) => t.id === tabId);
    const newTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[Math.max(0, idx - 1)]?.id || newTabs[0]?.id || null);
    }
  };

  const clearTabs = () => {
    setTabs([]);
    setActiveTabId(null);
  };

  return (
    <TabContext.Provider value={{ tabs, activeTabId, setActiveTabId, initTabs, addTab, closeTab, clearTabs }}>
      {children}
    </TabContext.Provider>
  );
}

export function useTabs() {
  return useContext(TabContext);
}
