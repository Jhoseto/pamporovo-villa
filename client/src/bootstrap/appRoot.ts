import { createRoot, type Root } from "react-dom/client";

let root: Root | null = null;

export function getAppRoot(): Root | null {
  const el = document.getElementById("root");
  if (!el) return null;
  root ??= createRoot(el);
  return root;
}
