"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

interface HomeRefreshContextType {
  refreshKey: number;
  refreshHomeData: () => void;
}

const HomeRefreshContext = createContext<HomeRefreshContextType | undefined>(
  undefined,
);

export function HomeRefreshProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshHomeData = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <HomeRefreshContext.Provider value={{ refreshKey, refreshHomeData }}>
      {children}
    </HomeRefreshContext.Provider>
  );
}

export function useHomeRefresh() {
  const context = useContext(HomeRefreshContext);
  if (!context) {
    throw new Error("useHomeRefresh must be used within HomeRefreshProvider");
  }
  return context;
}
