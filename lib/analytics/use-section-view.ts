import { useEffect, type RefObject } from "react";
import {
  SECTION_VIEW_MIN_DWELL_MS,
  SECTION_VIEW_VISIBILITY_RATIO,
} from "@/lib/analytics/constants";

/**
 * portfolio-tracking-spec.md §5 / docs/architecture.md §6 "Section view
 * rule (D4)". A section qualifies when EITHER:
 *   1. at least 50% of the section itself is visible, OR
 *   2. the visible portion fills at least 50% of the viewport height
 * — continuously for SECTION_VIEW_MIN_DWELL_MS. Condition 2 exists so a
 * section taller than 2x the viewport can still qualify.
 */
function computeQualifies(
  visibleHeight: number,
  sectionHeight: number,
  viewportHeight: number,
): boolean {
  if (sectionHeight <= 0 || viewportHeight <= 0) return false;
  const ratioOfSection = visibleHeight / sectionHeight;
  const ratioOfViewport = visibleHeight / viewportHeight;
  return (
    ratioOfSection >= SECTION_VIEW_VISIBILITY_RATIO ||
    ratioOfViewport >= SECTION_VIEW_VISIBILITY_RATIO
  );
}

// Fine-grained thresholds (0, 0.05, 0.1, ..., 1) so the IntersectionObserver
// itself fires often as the ratio changes, per the spec's "implementation
// bắt buộc: IntersectionObserver" with fine-grained thresholds.
const INTERSECTION_THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

type UseSectionViewTrackingOptions = {
  /** False disables the hook entirely — no observer is ever attached. */
  enabled: boolean;
  /** Called at most once, when the section has qualified for 2s straight. */
  onQualify: () => void;
};

/**
 * One instance per rendered section (components/case-study/case-section.tsx
 * only — the Case Hero is never wrapped by this hook, matching the spec's
 * "Case Hero isn't observed at all").
 */
export function useSectionViewTracking(
  ref: RefObject<HTMLElement | null>,
  { enabled, onQualify }: UseSectionViewTrackingOptions,
): void {
  useEffect(() => {
    if (!enabled) return;
    const maybeEl = ref.current;
    if (!maybeEl) return;
    // Explicit non-null type (rather than relying on control-flow narrowing
    // of `const el = ref.current`) so the hoisted `function` declarations
    // below — which TS can't otherwise prove run after this guard — see a
    // non-nullable HTMLElement.
    const el: HTMLElement = maybeEl;

    let timerId: number | null = null;
    let rafId: number | null = null;
    let fired = false;
    let qualifying = false;
    let listening = false;

    function clearTimer() {
      if (timerId !== null) {
        window.clearTimeout(timerId);
        timerId = null;
      }
    }

    function startTimer() {
      if (timerId !== null || fired) return;
      timerId = window.setTimeout(() => {
        timerId = null;
        fired = true;
        onQualify();
      }, SECTION_VIEW_MIN_DWELL_MS);
    }

    function applyQualifies(qualifies: boolean) {
      if (fired) return;
      if (qualifies && !qualifying) {
        qualifying = true;
        startTimer();
      } else if (!qualifies && qualifying) {
        // Not continuously visible for the full 2s — spec: "Không còn đạt
        // điều kiện visible trước 2 giây → Hủy timer".
        qualifying = false;
        clearTimer();
      }
    }

    function recomputeFromRect() {
      if (fired || document.hidden) return;
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const visibleTop = Math.max(rect.top, 0);
      const visibleBottom = Math.min(rect.bottom, viewportHeight);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      applyQualifies(
        computeQualifies(visibleHeight, rect.height, viewportHeight),
      );
    }

    function scheduleRecompute() {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        recomputeFromRect();
      });
    }

    // Scroll/resize listeners only run "while a section is intersecting"
    // (architecture.md §6), not for the whole page lifetime.
    function startListening() {
      if (listening) return;
      listening = true;
      window.addEventListener("scroll", scheduleRecompute, { passive: true });
      window.addEventListener("resize", scheduleRecompute);
    }

    function stopListening() {
      if (!listening) return;
      listening = false;
      window.removeEventListener("scroll", scheduleRecompute);
      window.removeEventListener("resize", scheduleRecompute);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          startListening();
          const viewportHeight = entry.rootBounds?.height ?? window.innerHeight;
          applyQualifies(
            computeQualifies(
              entry.intersectionRect.height,
              entry.boundingClientRect.height,
              viewportHeight,
            ),
          );
        } else {
          stopListening();
          applyQualifies(false);
        }
      },
      { threshold: INTERSECTION_THRESHOLDS },
    );
    observer.observe(el);

    // Page Visibility API — spec: "User chuyển sang tab khác → Hủy hoặc
    // pause timer" (pause) / "User quay lại tab → Start lại nếu section
    // vẫn đạt điều kiện visible và chưa qualify" (restart from 0).
    function handleVisibilityChange() {
      if (fired) return;
      if (document.hidden) {
        clearTimer();
      } else {
        recomputeFromRect();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimer();
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      stopListening();
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, onQualify, ref]);
}
