type AnalyticsEvent =
  | "landing_view"
  | "create_cv_click"
  | "builder_opened"
  | "pdf_export_clicked";

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function trackEvent(eventName: AnalyticsEvent, params: AnalyticsParams = {}) {
  const payload = {
    app: "cv_builder",
    ...params,
  };

  console.info("[analytics]", eventName, payload);

  if (typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
  }
}