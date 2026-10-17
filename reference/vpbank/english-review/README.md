# VPBank English screenshots — mapping and review (STEP 4B.4C)

Asset preparation only. No website code or image references were changed.

## Original → English mapping
| Original (unchanged) | English asset | Displayed in | Screens translated |
|---|---|---|---|
| `public/images/case-studies/vpbank/hero-final.png` (1188×860) | `public/images/case-studies/vpbank/en/hero-final-en.png` | Hero | 2 (H-L, H-R) |
| `…/06-solution-01.png` (2006×784) | `…/en/06-solution-01-en.png` | Solution Phase 1; Experiment Phase 1 preview (crop of phone 3) | 5 (S1-1 pilot-approved + S1-2…S1-5) |
| `…/06-solution-02.png` (2006×784) | `…/en/06-solution-02-en.png` | Solution Phase 2; Experiment Phase 2 preview (crop of phone 3) | 5 (S2-1…S2-5) |

Total: **12 screens in 3 files**. `04-insight-01.png` is already English; other PNGs are not displayed.

Wire-up later: point `heroImage.src` and `SOLUTION_IMAGES.*.src` at the `en/` files. Dimensions match, so all crop boxes stay valid. (`hero-final-en.png` is RGB; the original is RGBA with alpha 255 everywhere.)

## Comparison files (this folder)
- `solution-01-original-vs-english-2x.png`, `solution-02-original-vs-english-2x.png`, `hero-original-vs-english-2x.png` — original row above English row, 2× (hero 1.6×)
- `actual-display-size-check.png` — both solution sets at 168 px phone width
- Earlier single-phone pilot comparisons: `../english-pilot/`

## Conventions used
Numbers `1.500.000đ` → `1,500,000đ`; dates → `May 19, 2026` form (`Sep 5`, `Sep 12, 2024`); glossary per `vpbank-english-screenshot-spec.md`. Amounts, percentages, loan IDs (#VTC2034…), progress bars, icons and the name "Nguyễn Văn A" are unchanged. Large figures: only the thousands separator was changed (dot→comma by adding a comma tail to the existing dot).
