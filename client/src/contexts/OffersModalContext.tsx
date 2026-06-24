import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { OffersModal } from "@/components/site/OffersModal";

type OffersModalContextValue = {
  openOffers: () => void;
};

const OffersModalContext = createContext<OffersModalContextValue | null>(null);

export function OffersModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openOffers = useCallback(() => setOpen(true), []);

  const value = useMemo(() => ({ openOffers }), [openOffers]);

  return (
    <OffersModalContext.Provider value={value}>
      {children}
      <OffersModal open={open} onOpenChange={setOpen} />
    </OffersModalContext.Provider>
  );
}

export function useOffersModal() {
  const ctx = useContext(OffersModalContext);
  if (!ctx) {
    throw new Error("useOffersModal must be used within OffersModalProvider");
  }
  return ctx;
}
