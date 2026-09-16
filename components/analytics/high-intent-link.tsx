"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import {
  EVENT_NAMES,
  type HighIntentAction,
  type HighIntentLocation,
} from "@/lib/analytics/constants";
import { attemptTrackedEvent } from "@/lib/analytics/service";

type HighIntentLinkProps = {
  action: HighIntentAction;
  location: HighIntentLocation;
  /** Omitted entirely (never null/""/undefined-as-a-value) outside a case. */
  caseId?: string;
  trackingAllowed: boolean;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

/**
 * The only place in the app that fires high_intent_action — every existing
 * Download CV / Email / LinkedIn link renders through this wrapper instead
 * of a plain <a>. Not deduplicated (portfolio-tracking-spec.md §2): every
 * click fires its own event, independently of any other tracker.
 */
export function HighIntentLink({
  action,
  location,
  caseId,
  trackingAllowed,
  onClick,
  ...anchorProps
}: HighIntentLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    attemptTrackedEvent(trackingAllowed, EVENT_NAMES.HIGH_INTENT_ACTION, {
      action,
      location,
      ...(caseId ? { case_id: caseId } : {}),
    });
    onClick?.(event);
  }

  return <a {...anchorProps} onClick={handleClick} />;
}
