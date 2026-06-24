import { createContext, useContext } from "react";

const SiteReadyContext = createContext(false);

export function SiteReadyProvider({
  ready,
  children,
}: {
  ready: boolean;
  children: React.ReactNode;
}) {
  return (
    <SiteReadyContext.Provider value={ready}>{children}</SiteReadyContext.Provider>
  );
}

export function useSiteReady() {
  return useContext(SiteReadyContext);
}
