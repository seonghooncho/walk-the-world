const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ?? "";
const isBrowser = typeof window !== "undefined";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const isAnalyticsEnabled = () => isBrowser && GA_MEASUREMENT_ID.startsWith("G-");

const gtag = (...args: unknown[]) => {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(args);
};

export const initAnalytics = () => {
  if (!isAnalyticsEnabled() || window.gtag) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);

  window.gtag = gtag;
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
};

export const trackPageView = (path: string, title = document.title) => {
  if (!isAnalyticsEnabled()) return;
  initAnalytics();
  window.gtag?.("event", "page_view", {
    page_location: window.location.origin + path,
    page_path: path,
    page_title: title,
  });
};

export const trackEvent = (eventName: string, params?: Record<string, string | number | boolean | null | undefined>) => {
  if (!isAnalyticsEnabled()) return;
  initAnalytics();
  window.gtag?.("event", eventName, params ?? {});
};
