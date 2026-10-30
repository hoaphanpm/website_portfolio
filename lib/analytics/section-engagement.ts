/**
 * Pure state machine behind case_section_engaged. No DOM, timers or imports,
 * so it is unit-tested directly (section-engagement.test.mjs). The browser
 * wiring lives in components/analytics/section-engagement-tracker.tsx.
 *
 * Rules:
 *  - Only ONE section accrues time at a time: the eligible section with the
 *    largest visible height (ties go to the lower index), so overlapping
 *    sections never double count.
 *  - Time accrues only while the page is visible and only up to `idleMs`
 *    after the last user interaction.
 *  - Time accumulates across revisits; sent time is subtracted, so each
 *    event carries the seconds accrued since that section's previous event
 *    (sum the property for a section's total).
 *  - Nothing below `minSendMs` is ever emitted.
 */
export type EngagementPayload = {
  section_id: string;
  section_index: number;
  engagement_seconds: number;
};

type SectionState = { index: number; pendingMs: number };

type Options = {
  idleMs: number;
  minSendMs: number;
  sections: readonly { id: string; index: number }[];
  now: number;
};

export class SectionEngagement {
  private readonly idleMs: number;
  private readonly minSendMs: number;
  private readonly sections = new Map<string, SectionState>();
  private readonly visibleHeights = new Map<string, number>();
  private active: string | null = null;
  private pageVisible = true;
  private lastTick: number;
  private lastInteraction: number;

  constructor(options: Options) {
    this.idleMs = options.idleMs;
    this.minSendMs = options.minSendMs;
    this.lastTick = options.now;
    this.lastInteraction = options.now;
    for (const s of options.sections) {
      this.sections.set(s.id, { index: s.index, pendingMs: 0 });
    }
  }

  /** Credit elapsed time to the active section, bounded by visibility/idle. */
  private tick(now: number): void {
    const from = this.lastTick;
    this.lastTick = Math.max(now, from);
    if (!this.active || !this.pageVisible) return;
    const end = Math.min(now, this.lastInteraction + this.idleMs);
    const credit = end - from;
    if (credit <= 0) return;
    const state = this.sections.get(this.active);
    if (state) state.pendingMs += credit;
  }

  /**
   * Report how much of a section is currently visible. `eligible` is the
   * caller's visibility rule (same as section views); an ineligible or
   * zero-height section never becomes active.
   */
  setVisibility(
    id: string,
    visibleHeight: number,
    eligible: boolean,
    now: number,
  ): EngagementPayload[] {
    if (!this.sections.has(id)) return [];
    this.tick(now);
    if (eligible && visibleHeight > 0) this.visibleHeights.set(id, visibleHeight);
    else this.visibleHeights.delete(id);
    return this.reselect();
  }

  /** Any user activity (scroll, key, pointer, touch). */
  interaction(now: number): void {
    this.tick(now); // credit up to the OLD idle limit first
    this.lastInteraction = Math.max(this.lastInteraction, now);
  }

  setPageVisible(visible: boolean, now: number): EngagementPayload[] {
    this.tick(now);
    if (visible === this.pageVisible) return [];
    this.pageVisible = visible;
    if (visible) this.lastInteraction = Math.max(this.lastInteraction, now);
    return visible ? [] : this.flushAll(now);
  }

  /** Send everything pending (page hidden / pagehide / unmount). */
  flushAll(now: number): EngagementPayload[] {
    this.tick(now);
    const out: EngagementPayload[] = [];
    for (const id of this.sections.keys()) this.take(id, out);
    return out;
  }

  private reselect(): EngagementPayload[] {
    let best: string | null = null;
    let bestHeight = 0;
    let bestIndex = Infinity;
    for (const [id, height] of this.visibleHeights) {
      const index = this.sections.get(id)!.index;
      if (height > bestHeight || (height === bestHeight && index < bestIndex)) {
        best = id;
        bestHeight = height;
        bestIndex = index;
      }
    }
    if (best === this.active) return [];
    const left = this.active;
    this.active = best;
    const out: EngagementPayload[] = [];
    if (left) this.take(left, out); // leaving a section sends its time
    return out;
  }

  private take(id: string, out: EngagementPayload[]): void {
    const state = this.sections.get(id);
    if (!state || state.pendingMs < this.minSendMs) return;
    const seconds = Math.floor(state.pendingMs / 100) / 10;
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    state.pendingMs = Math.max(0, state.pendingMs - seconds * 1000);
    out.push({
      section_id: id,
      section_index: state.index,
      engagement_seconds: seconds,
    });
  }
}
