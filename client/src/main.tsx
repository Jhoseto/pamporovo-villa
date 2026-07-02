import "./index.css";

declare global {
  interface Window {
    __pvHideLcpShell?: () => void;
  }
}

if (typeof window !== "undefined") {
  history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  const isMobileHome =
    window.matchMedia("(max-width: 767px)").matches &&
    (window.location.pathname === "/" || window.location.pathname === "");

  if (isMobileHome) {
    void import("./bootstrap/mobileHome").then(m => m.mountMobileHome());
  } else {
    void import("./bootstrap/fullApp").then(m => m.mountFullApp());
  }
}
