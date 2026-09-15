/**
 * portfolio-tracking-spec.md §3: "device_type — tự detect qua viewport
 * width, không phụ thuộc Mixpanel $os/$browser mặc định."
 * Thresholds from §13's Global Analytics Config / architecture.md §6.
 */
export type DeviceType = "mobile" | "tablet" | "desktop";

export function getDeviceType(): DeviceType {
  if (typeof window === "undefined") {
    // Never called server-side in practice (trackEvent only runs client-
    // side), but fail to a defined value rather than throwing if it ever is.
    return "desktop";
  }

  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}
