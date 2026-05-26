type AnalyticsEvent =
  | "landing_view"
  | "create_cv_click"
  | "builder_opened"
  | "pdf_export_clicked"
  | "contact_form_submitted"
  | "contact_form_error";

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js",
      eventNameOrId: string | Date,
      params?: AnalyticsParams
    ) => void;
  }
}

export function trackEvent(eventName: AnalyticsEvent, params: AnalyticsParams = {}) {
  const payload = {
    app: "factory_resume",
    ...params,
  };

  console.info("[analytics]", eventName, payload);

  if (typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
  }
}