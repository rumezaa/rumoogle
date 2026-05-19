"use client";
import { createContext, useContext, useState, useEffect } from "react";

const MadContext = createContext();

export function MadProvider({ children }) {
  const [isMad, setIsMadState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rumoogle-mad") === "true";
    }
    return false;
  });

  const setIsMad = (val) => {
    setIsMadState(val);
    localStorage.setItem("rumoogle-mad", val ? "true" : "false");
  };

  return (
    <MadContext.Provider value={{ isMad, setIsMad }}>
      {children}
    </MadContext.Provider>
  );
}

export function useMad() {
  return useContext(MadContext);
}
