# WCAG 2.2 ratios, not APCA, for contrast

dotaf measures contrast with WCAG 2.2 ratios: text at least 4.5:1, large text and non-text UI (borders, icons, focus rings) at least 3:1. Both the generated colors (`readableOn` in `packages/core/src/config/generate-css.ts`) and the component browser tests (`packages/registry/test/browser/contrast.ts`) use this formula. We chose WCAG 2.2 because laws such as the EU Accessibility Act and Section 508 refer to it, and it is stable. APCA is not adopted, although Vercel, Radix and Harmonizer use it and it models perception better. It was dropped from the WCAG 3 drafts in 2023, WCAG 3's formula is still undecided as of April 2026, and APCA's author now points to BridgePCA.

## Consequences

WCAG 2 overrates light text on dark backgrounds: `#888` on black passes at 5.92:1 but scores only APCA Lc 39. Check dark-mode secondary text (`--dotaf-color-muted-fg`) by eye as well as by test.
