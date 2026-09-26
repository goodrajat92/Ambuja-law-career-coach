---
title: "Analyze a Cap Table Before a Series B"
subTab: analysis
difficulty: hard
timeMinutes: 35
skills: ["deal-analysis", "cap-table-math", "vc-deal-terms"]
relatedLearn: [reading-a-cap-table, anti-dilution-protection, ccps-explained]
rubric:
  - "Correctly computed each existing shareholder's fully diluted percentage before the new round."
  - "Correctly identified that the unallocated ESOP pool counts in the fully diluted base even though it's unissued."
  - "Correctly identified that the Series A investor's anti-dilution protection would be triggered by this round's price, and explained why."
  - "Estimated the approximate impact of the anti-dilution adjustment on founder dilution, even if only directionally (not necessarily exact)."
  - "Flagged the ESOP pool top-up question as something the Series B term sheet will likely raise, connecting it back to who bears that cost."
modelAnswer:
  - "Fully diluted base before the round: Founders 10,000,000 + Series A (as-converted) 3,000,000 + unallocated ESOP pool 1,500,000 (already reserved, even though ungranted) + granted options 500,000 = 15,000,000 fully diluted shares. Founders: 10,000,000 / 15,000,000 = 66.7%. Series A investor (as-converted): 3,000,000 / 15,000,000 = 20%. ESOP pool (allocated + unallocated): 2,000,000 / 15,000,000 = 13.3%."
  - "The unallocated pool matters: even though 1,500,000 of the ESOP shares haven't been granted to anyone, they're already counted in the fully diluted base — which is exactly why 'unallocated' doesn't mean 'doesn't dilute you yet.' Anyone reading only the as-issued cap table (ignoring the reserved-but-ungranted pool) would understate the founders' true dilution."
  - "Anti-dilution trigger: the Series A CCPS converted at a price implying a per-share value of roughly Rs 40; if this new Series B prices shares at roughly Rs 25, that's a down round relative to the Series A price, which should trigger the Series A investor's broad-based weighted average anti-dilution protection (see Anti-Dilution Protection) — meaning the Series A investor's *conversion ratio* increases, so they convert into more shares than their original 3,000,000, at the new round's expense of everyone else's percentage, not just the new investor's."
  - "Directional impact: because broad-based weighted average protection spreads the adjustment across the full fully diluted base (rather than resetting fully to the new price, as full ratchet would), the founders' dilution from this mechanism alone is real but more moderate than it would be under a harsher formula — worth flagging to the client as 'expect some further dilution beyond the headline new-money percentage, not a full reset.'"
  - "The ESOP top-up question: if the Series B investor also requires a pool top-up (common when the existing pool is judged too small for the next growth phase), that top-up will very likely be structured pre-money again — meaning it comes out of the existing shareholders' side (founders and the Series A investor together) rather than the new Series B investor's side. This is worth flagging as a second, separate dilution question from the anti-dilution mechanic above, not the same thing."
---

## Brief

A founder client is heading into Series B negotiations and has sent you the current cap table:

- Founders: 10,000,000 shares (common)
- Series A investor: 3,000,000 CCPS (as-converted), originally priced implying roughly Rs 40 per share, with broad-based weighted average anti-dilution protection
- ESOP pool: 500,000 shares granted, 1,500,000 shares reserved but unallocated
- Proposed Series B: new money priced at approximately Rs 25 per share

## Instructions

Write up an analysis covering:

1. Each existing holder's **fully diluted percentage** before the new round (show your arithmetic, and don't forget the unallocated pool).
2. Whether the Series A investor's **anti-dilution protection** would be triggered by this round, and why.
3. The **directional impact** of that trigger on founder dilution (exact isn't required, but explain which way it moves and roughly how much, relative to no anti-dilution adjustment at all).
4. Any **other dilution question** you'd flag to the client before the term sheet is finalised.
