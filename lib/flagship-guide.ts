// ─── The flagship free giveaway guide ───
//
// One complete, normally-paid guide given away free (playbook Move 1: "give
// away what others charge for"). Deliberately NOT one of the seven activities
// already in the free 7-day guide, so it's a genuine bonus.
//
// It's attached to both the quiz-result flow and the free-guide flow through a
// single Kit tag, `guide:{guideTag}`, so ONE Kit automation delivers it from
// both places. The Kitchen Math PDF is already on Blob (lib/activity-blob-urls).
//
// Kit setup (Amelie, once): create an automation "when tagged
// `guide:kitchen-math-challenge` -> send the Kitchen Math PDF." Change the
// flagship here and both funnels follow.

import { ACTIVITY_BLOB_URLS } from "@/lib/activity-blob-urls";

export const FLAGSHIP_GUIDE = {
  slug: "kitchen-math-challenge",
  name: "Kitchen Math & Meal Planning",
  // The guide:{tag} Kit tag that triggers the free-delivery automation.
  guideTag: "kitchen-math-challenge",
  priceLabel: "$5.99",
  shopHref: "/shop/kitchen-math-challenge",
  // One warm line describing the bonus, reused wherever it's promoted.
  blurb:
    "Your kid plans a real family meal, prices out the ingredients, scales the recipes, and keeps it all within a grocery budget. It normally sells for $5.99, and it's yours free.",
} as const;

// Direct download for the flagship PDF (on Vercel Blob). Used by the instant
// Resend quiz-plan email so the actual document is one click away.
export const FLAGSHIP_DOWNLOAD_URL = ACTIVITY_BLOB_URLS[FLAGSHIP_GUIDE.slug];
