import "./index.css";
import { mountFullApp } from "./bootstrap/fullApp";

declare global {
  interface Window {
    __pvHideLcpShell?: () => void;
  }
}

if (typeof window !== "undefined") {
  history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  mountFullApp();
}
