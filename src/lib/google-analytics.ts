import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

declare global {
  interface Window { dataLayer: unknown[]; gtag?: (...args: unknown[]) => void }
}

// Google Analytics 4 measurement ID (G-XXXXXXX). The old Lovable connector name still works.
const MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID ?? import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY) as string | undefined;
const isPrivatePath = (p: string) => p.startsWith("/admin") || p.startsWith("/auth");

function init() {
  if (!MEASUREMENT_ID || window.gtag) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params -- gtag.js needs the Arguments object
    window.dataLayer.push(arguments);
  };
  window.gtag("set", "developer_id.dZjgwMW", true);
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, { send_page_view: false });
}

/** Sends a Google Analytics page view on every public page navigation (admin/sign-in skipped). */
export function useGoogleAnalytics() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  useEffect(() => {
    if (!MEASUREMENT_ID || isPrivatePath(pathname)) return;
    init();
    window.gtag?.("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);
}
