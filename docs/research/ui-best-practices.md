# UI best practices: research notes

Gathered 2026-11-07 for dotaf. This is the gathering step only: what the best designers, design engineers and agent-skill authors say makes UI good. How dotaf uses any of it is decided later.

**How it was made.** Four research agents read primary sources in parallel (the authors' own posts, repos, docs and specs), one strand each. Sections 1–5 are the synthesis across the strands. Sections A–D keep each strand's full notes, with the URL, date and numbers behind every claim. In A–D, **(NEW)** marks a point that none of the installed agent skills covers. The star counts and the `frontend-design` version gap in section 1 were re-checked against GitHub on the same day.

1. [What you already have](#1-what-you-already-have)
2. [The points, by theme](#2-the-points-by-theme)
3. [Agentic practices](#3-agentic-practices)
4. [Tensions to decide](#4-tensions-to-decide)
5. [Open questions for the implementation talk](#5-open-questions-for-the-implementation-talk)
6. Strand notes: [A. Interaction and detail craft](#a-strand-notes-interaction-and-detail-craft) · [B. Visual design fundamentals and UX](#b-strand-notes-visual-design-fundamentals-and-ux) · [C. Agent skills and workflows](#c-strand-notes-agent-skills-and-workflows) · [D. Design-system foundations](#d-strand-notes-design-system-foundations)

## 1. What you already have

| Installed skills                                                                                                                                                                                                                                             | Source                                                                                                 | Covers                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `emil-design-eng`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `animation-vocabulary`, `apple-design`, `pick-ui-library`, `break-ui`, `choreograph`, `animate`, `animation-performance`, `remove-animations`, `mobile-native` | Emil Kowalski, [emilkowalski/skills](https://github.com/emilkowalski/skills) (54k★)                    | Motion decisions, easing, springs, choreography, motion performance, removing motion, component feel, gestures, Apple-style fluid UI, mobile web feel, worst-case data, library picks |
| `web-design-guidelines`                                                                                                                                                                                                                                      | Vercel, [web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines)            | Interface checklist; fetches the short `command.md`                                                                                                                                   |
| `frontend-design`                                                                                                                                                                                                                                            | Anthropic, [anthropics/skills](https://github.com/anthropics/skills)                                   | Aesthetic direction, avoiding generic defaults                                                                                                                                        |
| `ux-laws`                                                                                                                                                                                                                                                    | Laws of UX (Jon Yablonski)                                                                             | The 19 UX laws                                                                                                                                                                        |
| `design`, `ideas`, `componentize`, `make-responsive`, `add-dark-mode`, `dark-mode-image`, `canonicalize-tailwind`                                                                                                                                            | [ui.sh](https://ui.sh) (the site names no author; secondary reviews say Adam Wathan and Steve Schoger) | Tailwind-oriented design guidelines and workflows                                                                                                                                     |

**Updated later on 2026-11-07:**

- **`frontend-design` is now the current version** (Anthropic's 2026-09-03 rewrite, 1,516 words, up from 562). The rewrite adds a two-pass plan (plan, review the plan against the brief, then code) and a calibration list of the five looks AI design currently lands in. The skills CLI now tracks it, so `npx skills update` keeps it fresh.
- **Emil's skills are current:** `emil-design-eng`, `improve-animations` and `review-animations` were updated, and six were added (`break-ui`, `choreograph`, `animate`, `animation-performance`, `remove-animations`, `mobile-native`). Not installed: `ask-sonner` (Sonner only), `animate-expo` (React Native), `write-swift` (Swift). The repo's `ui-cheatsheet.md` and `performance-cheatsheet.md` are reference files, not skills.

Still out of date or missing:

- **ui.sh lists two skills you don't have:** brand kit and markup-from-image.
- **Vercel's full guidelines page holds more than `command.md`:** hit areas, loading-state timing, optimistic updates, layered shadows, APCA ([vercel.com/design/guidelines](https://vercel.com/design/guidelines)). Vercel also ships a new `writing-guidelines` skill for UI copy.
- **Nothing installed covers:** visual hierarchy and layout rules (Refactoring UI, Erik Kennedy, Practical UI), forms, empty and error states, UX writing, Nielsen's heuristics, deriving tokens from brand inputs, or deterministic "AI slop" detection.

## 2. The points, by theme

Sources are named in brackets; their URLs and dates are in sections A–D.

### Hierarchy and emphasis

- **Build hierarchy with color and weight, not size alone.** 2–3 text colors (dark grey, grey, lighter grey) and two weights (400–500 for body, 600–700 for emphasis). Don't go under 400; de-emphasize with color or size instead. [Refactoring UI; Practical UI]
- **Keep a hierarchy budget:** at most 3 type sizes, 2 large elements, 2 primary and 2 secondary colors, 3 contrast levels. "If everything is contrasted, then nothing stands out." [NN/g]
- **Mix up-pop with down-pop.** Only the page title gets every kind of emphasis. Elsewhere, combine styles that raise and lower visibility, e.g. a large number in a light weight and low contrast over a small bold uppercase label. [Erik Kennedy]
- **One primary action per screen.** Secondary actions are outlined or low contrast, tertiary ones look like links. A destructive action gets big red styling only when it is the primary action, as in a confirm dialog. [Refactoring UI; Practical UI; NN/g]
- **Squint test:** blur a screenshot 5–10px to see the hierarchy you intended; 20px shows accidental hot spots. [NN/g]
- **Brand color goes on interactive elements only** (links, buttons), so color teaches what is clickable. [Adham Dannaway]
- **Don't compete for attention you haven't earned.** Dim secondary chrome (Linear's sidebar sits "a few notches" below the content), use fewer and smaller icons, drop colored icon backgrounds. [Linear, 2026]

### Layout, spacing and grouping

- **Group with the weakest cue that works.** From strongest to weakest: a shared container, proximity, similar appearance, a shared alignment line. Containers add clutter, so try the others first. [Practical UI]
- **Separate with space before borders.** Before adding a border, try a shadow, a background shift or more space. "Structure should be felt, not seen." [Refactoring UI; Linear]
- **Every gap comes from the spacing scale** (8pt; 4pt for dense UI), with steps that grow as values grow. A 9 or a 20 in an 8/12/16/24 scale is a mistake. [Practical UI; Raphael Salaja]
- **Spacing belongs to the relationship between siblings** (`.stack > * + *`), not to the elements themselves. [Every Layout]
- **Laws of locality:** put a control where it takes effect; a control that affects an area sits above it; the farther a control is from what it affects, the more it must stand out. [Erik Kennedy]
- **Align optically.** Hang bullets, punctuation and icons outside the alignment line. An icon+text button needs less padding on the icon side. Fix lopsided icons inside the SVG, not with margins. [Erik Kennedy; Jakub Krehel]
- **Tables:** right-align numbers, left-align text, headers follow their column's alignment, never center. Tabular figures, units once per column, few light horizontal rules, monochrome; mark highlights with symbols, not fills. [Matt Ström-Awn]
- **Density is value delivered divided by the time and space the UI takes,** judged by audience. "Double your whitespace" suits consumer pages; sparseness that costs a pro user time is a loss. [Matt Ström-Awn; Erik Kennedy]

### Typography

- **Body size:** 15–25px on the web [Butterick]. For interaction-heavy UI, 16–18px on mobile and 14–20px on desktop; start mobile body at 17px; inputs at least 16px [Erik Kennedy].
- **Line-height** 120–145% [Butterick], about 140% [iA; Inter's site uses 1.4×], at least 1.5 [Practical UI]. It falls as size rises: Tailwind goes from 1.5 at 16px to 1.0 at 48px and up.
- **Line length:** 45–90 characters [Butterick], at most 60ch [Every Layout], 65–75ch [Impeccable], 40–80 [Practical UI].
- **Headings:** at most 3 levels ("two is better"), only slightly bigger than body, set off by space, bold not italic; no all caps, underline, centering or title case. [Butterick]
- **Tracking follows size.** Inter's formula: −0.0223 + 0.185·e^(−0.1745·px) em, so 12px ≈ 0, 16px ≈ −0.011em, 24px ≈ −0.020em, 32px+ ≈ −0.022em. Inter 4 moves this into its `opsz` axis. Never tighter than −0.04em; −0.02 to −0.03em reads best on display text. [Rasmus Andersson; Impeccable]
- **All caps:** under one line, with 5–12% letterspacing (0.05–0.12em), set slightly smaller because caps look heavier. [Butterick; Erik Kennedy; Emil Kowalski]
- **No pure black text.** Use dark grey, or a light grey background. [Refactoring UI; Practical UI; iA]
- **Font weight never changes on hover or selection;** it shifts the layout. [Rauno Freiberg]
- **Metric-matched fallback fonts** (same x-height and weight) avoid layout shift. Underline only links. Bold, not italic, for UI emphasis. `…`, not `...`. [Emil Kowalski, "Agents with Taste"]
- **`tabular-nums` for numbers that update or line up,** then check the result: some fonts, such as Inter, change the numerals' shape. [Jakub Krehel; Matt Ström-Awn; Emil Kowalski]
- **Text on images:** a ~35% black overlay, a floor fade (0% at the middle to ~20% black at the bottom), a scrim, a box, or blur. [Erik Kennedy]

### Color usage

- **Design in greyscale first,** then add color with purpose: one accent, then shades of one hue. [Erik Kennedy]
- **No grey text on colored backgrounds.** Use white at reduced opacity, or a color with the background's hue. Tint borders, shadows and text toward that hue too. [Refactoring UI; Vercel; Impeccable flags `gray-on-color`]
- **Derive states from one base.** Darker = less brightness and more saturation; lighter = more brightness and less saturation (HSB). In OKLCH, hover is L ± 0.1 via relative color syntax. [Erik Kennedy; Evil Martians]
- **Hover and press as a translucent state layer,** not extra palette colors. [Practical UI's design system]
- **Never color alone:** errors use red plus an icon plus a bold border. [NN/g; Practical UI]
- **Contrast floors:** text 4.5:1 (large text 3:1); field borders, icons and states 3:1; two same-style buttons 3:1 apart; a secondary button fill under 3:1 needs a border of at least 3:1. Light grey buttons read as disabled. [WCAG 2.2; Practical UI]

### Depth: borders, shadows, surfaces

- **Light comes from above.** Offset shadows downward instead of using big blur or spread. Inset for wells (inputs, slider tracks, unchecked controls), outset for raised things (buttons, cards, popups). A pressed button is darker overall. [Refactoring UI; Erik Kennedy]
- **Layered shadows:** y-offset is 2× x-offset; higher elevation means more offset and blur, less opacity; e.g. five layers doubling 1 → 16px. Tint shadows with the background's hue (lower saturation and lightness) rather than black. `drop-shadow` for non-rectangular shapes. Don't animate layered shadows. [Josh W. Comeau; Tobias Ahlin]
- **Shadow as border:** light `0 0 0 1px rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06), 0 2px 4px rgba(0,0,0,.04)`; dark `0 0 0 1px rgba(255,255,255,.08)`. Raise the alphas on hover and transition only `box-shadow`. [Jakub Krehel]
- **Declare elevation once, with a border or a shadow.** "A 1px border under a wide soft shadow is the ghost card." [Impeccable]
- **Shadows stay translucent;** opaque ones leave a grey halo. Draw each alpha border once, because overlaps show darker joins. [Vercel Geist]
- **Concentric radius:** inner = outer − padding (− border), clamped at 0. A child's radius never exceeds its parent's. [Jakub Krehel; Vercel]
- **In dark mode, higher surfaces get lighter.** Material's dark surface tones run 4 → 6 → 10 → 12 → 17 → 22 → 24. Atlassian keeps shadows on raised and overlay surfaces as well. [Material; Atlassian; Practical UI]

### Interaction and feedback

- **Hit areas:** at least 24×24px [WCAG 2.5.8 AA], 44px on touch [Vercel; WCAG AAA]; Practical UI uses 48 with at least 8px between targets. Make hit areas as big as the space allows, keep them siblings rather than nested, and pad list items instead of gapping them, so there are no dead zones. [WCAG; Vercel; Practical UI; Rauno Freiberg; Devouring Details]
- **Show feedback where the trigger is.** A copy button turns into a checkmark instead of firing a toast; on a form error, highlight the wrong fields. [Rauno Freiberg; Vercel]
- **Press semantics:** fire on release over the target; dragging off cancels and dragging back restarts; scrolling cancels; ignore key repeat from a held key; buttons answer Enter and Space, links only Enter. [React Aria team; their hooks implement this]
- **Menus open on `mousedown`.** Submenus need a safe triangle: 15° tolerance, close after 2 consecutive bad moves, an idle timeout (longer for motor impairments), checks throttled to 16ms, pen and touch ignored. A CSS-only fallback is a 300ms close delay. [Rauno Freiberg; React Aria; Josh W. Comeau]
- **Hover:** gate it by real pointer type, because `@media (hover: hover)` fails on hybrid devices; React Aria ignores emulated mouseenter for 50ms after a touch. Hover in 125ms, out 450ms. Fix "doom flicker" by keeping the hover target still and animating a child. NN/g (2025) adds a 150–200ms delay on button hover against accidental triggers. [React Aria; Josh W. Comeau; NN/g]
- **Focus:** show rings only for keyboard and assistive tech (track input modality). Switch the ring style by background: a white inset ring on a red badge, an outset brand ring elsewhere. WCAG 2.4.13 asks for at least a 2px perimeter and a 3:1 change. Safari doesn't focus buttons on mousedown, so focus them by hand to restore focus when an overlay closes. [React Aria; Devouring Details; WCAG]
- **Toggles apply immediately,** with no confirm step. **Disabled buttons get no tooltip:** they aren't focusable, so keyboard users never hear why. [Rauno Freiberg]
- **Never block typing.** Accept the keystroke, then show validation. ⌘/Ctrl+Enter submits a textarea. Don't disable submit ahead of time; disable it only while the request is in flight, and send an idempotency key. [Vercel]
- **Theme switches don't animate:** inject `* { transition: none !important }`, switch, force a reflow, remove it. [Paco Coursey]
- **Components survive spamming.** During development, map each state to a key and click until nothing breaks. Don't play state transitions on first render. [Devouring Details]

### Loading and perceived performance

- **Time thresholds:** under 100ms feels instant, and animation makes it feel slower; 0.1–1s, bridge with a transition; 1–10s, an indeterminate loader; 10s–1min, a determinate progress bar; over 1min, let the user leave and notify them. [Matt Ström-Awn]
- **Loading states wait 150–300ms before showing and stay at least 300–500ms,** to avoid flicker. Loading buttons keep their label and add an indicator (NN/g: spinner on the left). Skeletons match the final layout exactly. [Vercel; NN/g]
- **Optimistic updates when success is likely;** on failure, roll back or offer Undo. Mutations (POST, PATCH, DELETE) finish under 500ms. [Vercel]
- **Skip an animation when updates outpace it** (another update within 150ms). [Devouring Details]

### Motion beyond the Emil skill

- **The more often something is used, the less it moves.** Keyboard-triggered and right-click UI shouldn't animate in. 200 menu opens a day × 300ms is 6+ hours a year. Rarely used features can carry more delight (Benji Taylor's Delight-Impact curve). [Rauno Freiberg; Jakub Krehel; Raphael Salaja; Benji Taylor]
- **Duration by frequency:** hover ~100ms, menu 150–200ms, toast ~240ms, dialog or sheet ~300ms, page 300–400ms, onboarding 600ms. Floor ~100ms, ceiling ~500ms. Exits take a bit more than half the entrance. [Raphael Salaja] Rauno caps interaction motion at 200ms; dialogs start from scale ~0.8, presses go to ~0.96. [Rauno Freiberg]
- **Springs for things with weight** (sheet: bounce ~0.15 at ~400ms; toggle ~0.2). Menus and popovers use ease-out 150–200ms. Never put a spring on opacity or color. [Raphael Salaja]
- **Drawer:** `transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)`, the iOS sheet curve. Drag-to-close only when the content is scrolled to the top, plus a 100ms lockout. Resize from `visualViewport` so it sits above the mobile keyboard. [Emil Kowalski, Vaul]
- **CSS `linear()` springs:** ~25 points are enough, with an `@supports` fallback. But an interrupted CSS transition replays badly, where JS springs handle reversal. If over ~20% of transitions use one-off curves, the motion tokens need work. [Josh W. Comeau]
- **Continuity:** never duplicate a persistent element across steps; move it. Point to where the result lives (the spinner travels into the tab that holds the pending item). Give each tray in a sequence a different height so the step change shows. [Benji Taylor]
- **Quiet exits:** a drawer leaves to −70% with opacity 0 and `blur(4px)` instead of sliding fully off. Icon swaps animate opacity, scale and blur together. [Jakub Krehel]

### Forms

- **Single column;** short related fields (city, state, ZIP) may share a row. Top labels are fastest for familiar data; left-aligned labels suit unfamiliar data where users should slow down. [NN/g; Luke Wroblewski]
- **Placeholders are not labels.** Labels and hints stay outside the field and stay visible. [NN/g]
- **Field width matches the expected input.** Radios beat a dropdown for 2–3 options. At most 1–2 optional fields, marked "optional". State format rules up front. No Reset or Clear. Cancel much quieter than Submit. [NN/g]
- **Validate inline after the user leaves a field,** never while typing or before input. In Luke Wroblewski's study (22 users), inline validation raised success 22%, cut errors 22% and cut completion time 42%. Use it on hard fields and keep the message beside the field. [Luke Wroblewski]

### Empty states, errors and UX writing

- **Errors:** beside the source, with redundant cues; inline or toast for minor ones, a modal only for severe ones; never early (not on blur of an empty field); plain language, no codes, no "invalid", "illegal" or "incorrect", no humor; keep the user's input and suggest the fix. [NN/g]
- **Empty states:** say why it's empty; never show "No records" while loading; teach in context ("Star your favorites to list them here"); give a direct action and a second path such as demo data. Every screen offers a next step. [NN/g; Vercel]
- **Command labels:** 2–4 words, verb first, no articles; name the resulting state; avoid "OK" in confirmations ("Discard"); an ellipsis when more input follows; the same label everywhere. Keep one verb through a flow ("Publish" → "Published"); errors don't apologize. [NN/g; Anthropic frontend-design]
- **Icons get visible text labels.** Only home, print and search are near-universal. If picking an icon takes more than 5 seconds, it won't communicate. [NN/g]
- **Make a meaningful step change visible in the label** (morph through shared letters: Continue → Confirm). Empty states change only the words that differ. [Benji Taylor]
- **Absolute dates after a week;** `Intl.PluralRules` so you never print "1 members". [Emil Kowalski, ui-cheatsheet]

### Robustness

- **Design every state:** empty, sparse, dense, error, loading. Test with plausible worst-case data: 40+ character names, a 66-character email, CJK and RTL names, ZWJ emoji (where `.charAt(0)` breaks), counts of 0, 1, 1284 and 1M, long German compounds, French ~30% longer than English. Change the data, not the component, and report before fixing. [Emil Kowalski, `break-ui`; Raphael Salaja; Vercel; Impeccable `harden`]

### Design-system foundations

- **Each scale step has a job.** Radix (12 steps): 1–2 app and subtle backgrounds; 3–5 component background at rest, hover and pressed; 6–8 subtle, interactive and strong borders (8 also for focus rings); 9–10 solid fill and its hover; 11–12 low- and high-contrast text. Geist does the same in 10 steps. Radix guarantees step 11 reaches APCA Lc 60 and step 12 Lc 90 on step 2.
- **Work in a perceptual color space.** OKLCH (Evil Martians, Tailwind v4), LCH (Linear), CIELAB (Stripe), HCT (Material) and OKHsl (Matt Ström-Awn) all appear; every source rejects HSL. OKLCH keeps blues from drifting purple, which LCH does at hue 270–330.
- **Give every hue the same lightness curve so contrast is predictable.** Stripe: steps ≥5 levels apart pass 4.5:1, ≥4 apart pass 3:1. Material: 40 tones apart guarantees 3:1, 50 apart 4.5:1. Ström-Awn solves lightness from a target contrast, r = e^(3.04·n), so steps half the scale apart pass AA.
- **Few inputs.** Linear went from 98 theme variables to 3: base color, accent color, contrast. Material uses one source color plus a contrast level (−1, 0, 0.5, 1). Adobe Leonardo takes contrast ratios as its inputs; Evil Martians' Harmonizer takes a contrast target per level.
- **A failing brand color:** Material moves its tone until the ratio is met and keeps the hue; Stripe rebuilt its scale, keeping hue and saturation where possible; Radix keeps a brand as a separate scale; Linear limits how much brand chroma reaches the chrome.
- **Neutrals take a hint of the brand.** Radix pairs the gray whose hue is nearest the accent; Material tints neutrals with chroma 4–8 of the source hue; Linear moved to a warmer, less saturated gray in 2026.
- **Every surface token has a foreground partner** (shadcn `primary` / `primary-foreground`). Text on a solid step depends on the hue: Radix's yellow, lime, amber, sky and mint take dark text.
- **Dark mode re-points the same names to separate tones,** not an inversion. Material: primary tone 40 → 80, surface 98 → 6. Brand colors get lighter and less saturated. Borders become alpha white (shadcn 10–15%).
- **Wide gamut:** write an sRGB value, then override with higher chroma inside `@media (color-gamut: p3)`; OKLCH chroma stays below 0.37. [Evil Martians]
- **Contrast standard:** WCAG 2.2 is the stable baseline (4.5:1, 3:1, 7:1; non-text 3:1; targets 24px; focus 2px and 3:1). APCA is finer (Lc 90/75/60/45/30/15 by size and weight) but is not in WCAG 3; as of April 2026 the WCAG 3 algorithm is undecided, and APCA's author now points to BridgePCA.
- **Type scale:** fixed (Tailwind 12/14/16/18/20/24/30/36/48) or fluid (Utopia: two scales, e.g. 18px × 1.2 at 360px and 20px × 1.25 at 1240px, interpolated with `clamp()`). Butterick rejects modular scales for headings.
- **Space:** base 4 (Tailwind's 0.25rem) or 8 (Carbon, Atlassian `space.100`), with 2, 6 and 12 near zero. Atlassian's ranges: 0–8px inside components, 12–24px between them, 32–80px for layout. Utopia ties space to body size (×0.25 … ×6). Carbon steps spacing down 1–2 tokens at small breakpoints instead of making tokens responsive.
- **Radius:** one input with multipliers (shadcn: one `--radius` of 0.625rem; sm ×0.6, md ×0.8, lg ×1, xl ×1.4 …). Impeccable: card radii 12–16px, pills only for small controls.
- **Density:** Material sets height = default + 4px × (0 … −3). Carbon pairs component heights 24/32/40/48 with 14px or 16px body text. Atlassian treats density as a theme (cozy, comfortable, compact) behind the same token names. Targets never drop under 24px.
- **Token format and naming:** the DTCG Format Module 2025.10 is stable (a Final Community Group Report, not a W3C standard). It stores oklch and display-p3 colors and uses `$value`, `$type`, `$description`, `$extensions` and `{group.token}` aliases. Tiers go base → functional → component (Primer). Pick tokens by meaning, "never because the value looks right" (Atlassian). Theme and mode are separate axes (Nathan Curtis).

## 3. Agentic practices

### Techniques that recur across agent skills

1. **Name the generic defaults and ban them, and pair each ban with a positive move,** or the model reaches for the nearest substitute. [Anthropic; taste-skill; Impeccable]
2. **Plan before code, then review the plan against the brief.** [Anthropic's two-pass plan; Impeccable's PRODUCT.md; taste-skill writes the copy first]
3. **A specific reference, not adjectives.** "Adjectives describe a region. A specific reference describes a point." [Google DESIGN.md]
4. **Classify the surface first:** Persuade, Operate, Read or Experience. Tools and docs get precision and restraint, not flourish. [Impeccable]
5. **Spend boldness in one place.** [Anthropic; Impeccable; taste-skill]
6. **Deterministic linters wired as hooks or gates,** so they always run: Impeccable's 62-rule detector, including drift from the project's own DESIGN.md tokens; taste-skill's Stop-hook finish gate; the DESIGN.md linter. "Without the hook, the detector only runs when someone remembers to run it." [Impeccable]
7. **Screenshot checks at fixed widths** (1440 / 768 / 375 or 390, plus an overflow walk at 320). Figma's flow treats the design screenshot as the source of truth. [Impeccable; taste-skill; OneRedOak; Figma]
8. **Review before reading the linter's output,** because detector output "anchors judgment". Impeccable runs the design critique and the detector as two isolated sub-agents and scores with Nielsen's 10 heuristics (0–4 each; most real interfaces score 20–32 of 40).
9. **Variants, then pick; randomize against mode collapse.** [Impeccable `concept-seed`; taste-skill `deal`; ui.sh `ideas`]
10. **Query live context, not memory:** shadcn runs `npx shadcn info --json` and `docs <component>`; Storybook's instruction is "Never hallucinate component properties!"; Figma calls `get_design_context` first.
11. **Rules as Incorrect/Correct pairs, and evals shipped with the skill.** [shadcn, 8 evals]
12. **Turn each taste decision into its reason, then into a strict rule or flowchart,** so "the agent doesn't have to guess". [Emil Kowalski, "Agents with Taste"]
13. **Worst-case data before calling it done.** [Emil `break-ui`; Impeccable `harden`; OneRedOak]

### AI slop tells

- **Type:** Inter, Roboto or system fonts as the default; the "second wave" of default faces (Space Grotesk, Fraunces, Playfair, IBM Plex, DM Sans, Plus Jakarta Sans, Outfit, Instrument Sans…).
- **Color:** purple or violet gradients on white; cyan on dark; warm cream (#F4F1EA) with a serif and terracotta (#D97757); near-black with one neon accent and glow edges; grey text on color.
- **Layout and components:** a tracked all-caps eyebrow above headings; numbered 01/02/03 sections that aren't a sequence; identical icon-tile cards; nested cards; a thick colored left border on cards; a hairline border plus a wide soft shadow on every card; hero-metric stat strips; decorative grid or stripe backgrounds; emoji as icons.
- **Effects and motion:** gradient text; fade-and-slide-up on every section; hover effects on every card; bounce or elastic easing; pulsing dots; marquees.
- **Copy:** delve, seamless, unlock, empower; "Not X. It's Y."; em dashes everywhere; invented specifics.

Two warnings from the sources: the lists churn (Anthropic's own 2025 prompt _recommended_ fonts that Impeccable now flags), and some tells are classic designer advice (Refactoring UI suggests accent borders and icons in colored shapes).

### What makes a design system usable by agents

- **A machine-readable source** (tokens or a schema) plus **prose intent per token**: "Vermilion… only inside diagrams… never on typography." [Google DESIGN.md]
- **Contracts, not descriptions:** "A description informs. A contract arbitrates." Prefer specs generated from the source over hand-written ones; give examples as data. [Nathan Curtis]
- **Per component:** when _not_ to use it ("For navigation, use Link instead"), one concept per story, a JSDoc that says why rather than what. [Storybook]
- **A short, deliberate do's-and-don'ts list;** "a long rambling list is often a sign the description was too vague". [Google DESIGN.md]
- **Semantic tokens only, context injected from the CLI, evals shipped.** [shadcn]
- **A verification loop:** lint, tests or a screenshot diff. [all of the above]

### Skills worth knowing (not installed)

| Skill                                                                                                     | Author                     | Size          | Why it matters                                                                                                                         |
| --------------------------------------------------------------------------------------------------------- | -------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [Impeccable](https://github.com/pbakaus/impeccable)                                                       | Paul Bakaus                | 105k★         | The deepest source: 24 commands, a 62-rule slop and quality detector (CLI, editor hook, CI), DESIGN.md drift checks, isolated critique |
| [taste-skill](https://github.com/Leonxlnx/taste-skill)                                                    | Leon Lin                   | 111k★         | Marketing sites: randomized "deals", a copy-tells list, a Stop-hook finish gate                                                        |
| [frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design), current version | Anthropic                  | 1.1M installs | Two-pass plan and a calibration list; your installed copy is outdated                                                                  |
| [emilkowalski/skills](https://github.com/emilkowalski/skills) extras                                      | Emil Kowalski              | 54k★          | `break-ui`, `choreograph`, `remove-animations`, `animation-performance`, two cheatsheets                                               |
| [ui-skills](https://github.com/ibelick/ui-skills)                                                         | Julien Thibeault (ibelick) | 10.8k★        | `baseline-ui` MUST/NEVER rules, `fixing-accessibility`, `fixing-motion-performance`, `create-design-md`                                |
| [shadcn skill + MCP](https://github.com/shadcn-ui/ui/tree/main/skills/shadcn)                             | shadcn                     | 140k installs | Live context from the CLI, Incorrect/Correct rules, 8 evals, a registry MCP                                                            |
| [DESIGN.md](https://github.com/google-labs-code/design.md)                                                | Google Labs (Stitch)       | 28.8k★        | A tokens-plus-prose format with a linter (contrast, broken references, orphaned tokens)                                                |
| [Figma MCP server guide](https://github.com/figma/mcp-server-guide)                                       | Figma                      | 2.2k★         | implement-design flow with the screenshot as source of truth; a design-system rules file                                               |
| [Storybook MCP](https://storybook.js.org/docs/ai)                                                         | Storybook                  | —             | Component manifests; docs, test and review tools                                                                                       |
| writing-guidelines                                                                                        | Vercel                     | 120k installs | UI copy review with `file:line` output                                                                                                 |
| [design-review](https://github.com/OneRedOak/claude-code-workflows/tree/main/design-review)               | Patrick Ellis (OneRedOak)  | 3.9k★         | A Playwright 7-phase live review; unchanged since 2025-08, and its example principles recommend Inter                                  |
| [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)                                  | Next Level Builder         | 146k★         | A large lookup database; popular but thin, with no external citations or evals                                                         |

## 4. Tensions to decide

- **Contrast standard:** WCAG 2.2 ratios (the legal baseline) or APCA Lc (finer; used by Radix and Harmonizer; not in WCAG 3). **Decided: WCAG 2.2**, see [ADR 0001](../adr/0001-wcag-contrast-standard.md).
- **Color model:** OKLCH, HCT, LCH or OKHsl; hand-tuned or computed scales; steps solved from contrast or set by lightness.
- **Scales:** fixed or fluid type and space; a modular scale or Butterick's "smallest increment necessary".
- **How long interactions take:** ≤200ms (Rauno, ibelick), under 300ms (the Emil skill), or a ladder from 100 to 600ms by frequency (Raphael Salaja); Emil's own Vaul drawer runs 500ms.
- **Springs on menus:** ease-out, not a spring (Raphael Salaja), or springs used freely (Emil skill, Jakub Krehel). CSS `linear()` springs reverse badly when interrupted (Josh W. Comeau).
- **Hover and focus gating:** CSS `(hover: hover)` and `:focus-visible` (Emil skill, Rauno, Vercel), or JS pointer-type and input-modality tracking (React Aria).
- **Exit timing:** dismissals exit faster (Emil skill, Raphael Salaja); hover-out is slower, with a close delay (Josh W. Comeau).
- **Placeholders:** never as labels (NN/g); placeholder plus `aria-label` on checkout forms (ui.sh); placeholders end with "…" (Vercel).
- **Casing:** Title Case for headings and buttons (Vercel) or sentence case (Butterick, Practical UI).
- **Icons:** always labeled (NN/g) or icon-only with `aria-label` (ui.sh, Vercel); icons in colored shapes recommended (Refactoring UI, Kennedy) or flagged as slop (ui.sh, Impeccable).
- **Borders:** shadow as border (Jakub Krehel), border plus shadow (Vercel), fewer separators (Linear), border _or_ shadow, never both (Impeccable).
- **Shadow color:** tinted with the background hue (Comeau) or black and grey alpha (Ahlin, Tailwind, Geist).
- **Letter-spacing:** never modify it (ibelick `baseline-ui`) or tighten display text (Impeccable, Emil, Inter's formula).
- **Prose line-height and measure:** ≥1.75 and 60–90ch (ui.sh), 1.2–1.45 and 45–90 (Butterick), ≥1.5 and 40–80 (Practical UI), a 60ch cap (Every Layout).
- **Uppercase:** banned in eyebrows and table headers (ui.sh, Impeccable, Anthropic) or allowed under one line with tracking (Butterick) and as a small label (Kennedy).
- **Density:** double the whitespace (Kennedy, consumer examples) or density as value per time and space (Ström-Awn, pro tools).

## 5. Open questions for the implementation talk

- Which points become **data** (tokens generated from `dotaf.json`), which become **rules** served by `get_design_system`, which become **lint** (`lint_ui`), and which stay in agent **skills**?
- Which color model should the generator use? (Contrast standard: WCAG 2.2, [ADR 0001](../adr/0001-wcag-contrast-standard.md).)
- Does dotaf adopt a published format (DTCG 2025.10 for tokens, DESIGN.md for intent), or keep `dotaf.json` only?
- Which external skills should you install or learn from (Impeccable's detector, Emil's `break-ui`, the current `frontend-design`), and where do they overlap with what dotaf should own?
- Should the agent flow include a visual check, such as playground screenshots at fixed widths?

## A. Strand notes: interaction and detail craft

Research date: 2026-11-07. Every bullet comes from a page I read in this session. **(NEW)** means none of the installed skills covers it. The installed `web-design-guidelines` skill fetches the short `command.md`. Items that appear only on the longer vercel.com page are marked **(NEW vs command.md)**.

### Sources

#### Rauno Freiberg — Web Interface Guidelines repo — https://github.com/raunofreiberg/interfaces (README, living doc, undated)

- **Dropdown menus open on `mousedown`, not `click`.** They then open the moment the button is pressed. **(NEW)**
- **Nested menus use a "prediction cone"** so the pointer can cross other items without closing the submenu. **(NEW)**
- **Show feedback where the trigger is.** A copy action gets a temporary inline checkmark, not a toast. On a form error, highlight the inputs that are wrong. **(NEW)**
- **Toggles take effect immediately,** with no confirmation step. **(NEW)**
- **Font weight never changes on hover or selected state,** because it shifts layout. **(NEW)**
- **Switching themes must not trigger transitions** (see Paco below). **(NEW)**
- **Disabled buttons get no tooltip.** Disabled buttons are not in the tab order, so keyboard users never hear why the button is disabled. **(NEW)**
- **Motion scales with the size of its trigger.** Dialogs start at scale ~0.8 (not 0). Button press goes to ~0.96 or ~0.9, never 0.8. Interaction animations stay at 200ms or less. _Stricter than the Emil skill's <300ms._

#### Rauno Freiberg — "Invisible Details of Interaction Design" — https://rauno.me/craft/interaction-design — July 2023

- **When a gesture fires depends on what it does.** Lightweight actions, like showing an overlay, fire _during_ the swipe once they pass a distance. Destructive actions, like dismissing an app, fire only on release, whatever the distance. **(NEW)**
- **Apply the gesture's delta right away, then animate past a threshold.** A pinch that does nothing until a threshold gives no sign the element can be pinched.
- **The macOS context menu has no enter animation but fades out,** and the chosen item blinks the accent color first to confirm the choice. **(NEW: blink-on-select)**
- **Keep the drag alive when the finger leaves a small control.** Sliders hidden under a thumb shouldn't cancel the drag when the pointer slides off the track. **(NEW)**

#### Rauno Freiberg — Devouring Details (public chapters: "Next.js Dev Tools" prototype, "Behind scenes") — https://devouringdetails.com — 2025

- **Focus rings switch style by state.** A white _inset_ ring sits on the red error badge, and the blue _outset_ brand ring is used in the default state, so each has contrast against its own background. **(NEW)**
- **Make hit areas concentric and as large as the space allows.** Buttons are siblings, never nested, and CSS enlarges their targets. **(NEW)**
- **Don't play state transitions on first render.** If the component mounts already in its error state, it must not animate its width from the default state. Use the measured width when there is one, otherwise `auto`. Wait for async content to settle before measuring. **(NEW)**
- **Animate state changes to pull peripheral attention, but only for useful information.** Cosmetic changes shouldn't move in the user's peripheral vision. **(NEW)**
- **Skip animations when updates outpace them.** If a count updates again within 150ms of the last update, the animation is skipped. **(NEW)**
- **Components must survive spamming.** Map each state to a keyboard shortcut during development and "sand" the edge cases by clicking around until nothing breaks. **(NEW)**
- **Fade content where it scrolls under a sticky header.** Use a blur fade (`stop 50%`, `blur 4px`, `height 48px`) whose opacity follows the scroll: `clamp(scrollTop / 15, 0, 1)`. **(NEW)**
- **Snap a dragged item to its projected position.** Projected position is `(v/1000 × 0.998) / (1 − 0.998)`, using iOS's deceleration rate, and the item snaps to the nearest corner from there. _Projection itself is in apple-design. This is a concrete web version._
- **Size icons to their context.** Use 16×16 icons with a 1.5pt stroke, and 18×18 with a 1.75pt stroke when inline with 20pt text, so they line up with the baseline. Use filled variants in dark mode. **(NEW)**

#### Vercel — Web Interface Guidelines (full page) — https://vercel.com/design/guidelines (living doc)

- **Hit targets:** a visual target under 24px gets a hit area of at least 24px, and 44px on mobile. **(NEW vs command.md)**
- **Loading states use a show-delay of ~150–300ms and stay visible for at least ~300–500ms,** which avoids flicker on fast responses. React's `<Suspense>` does this. **(NEW vs command.md)**
- **Loading buttons keep their original label** and add an indicator. **(NEW vs command.md)**
- **Optimistic updates when success is likely.** On failure, show an error and roll back, or offer Undo. **(NEW vs command.md)**
- **Network latency budget:** POST, PATCH and DELETE finish in under 500ms. **(NEW)**
- **Submission:** never disable submit ahead of time. Disable it only while the request is in flight, and send an idempotency key. **(NEW vs command.md)**
- **Never block typing.** Accept any keystroke and show validation instead. Trim trailing whitespace added by text replacement before validating. In a textarea, ⌘/Ctrl+Enter submits. **(NEW)**
- **Inline help first. Tooltips are the last resort.** Every screen offers a next step. Skeletons match the final layout exactly. **(NEW vs command.md)**
- **Visual rules:** layered shadows with at least two layers (ambient and direct light); semi-transparent borders; child radius ≤ parent radius; on colored backgrounds, tint borders, shadows and text toward that hue; prefer APCA over WCAG 2 for contrast. **(NEW vs command.md; radius is in ui.sh design)**

#### React Aria team — "Creating a pointer-friendly submenu experience" — https://react-aria.adobe.com/blog/creating-a-pointer-friendly-submenu-experience (no date or byline on page)

- **The safe triangle** runs from the pointer to the submenu's top and bottom inner corners. On each `pointermove`, compare `atan2` angles: the pointer is heading to the submenu when `Θtop > Θpointer > Θbottom`, with **15° tolerance** on each edge. **(NEW)**
- **Close only after 2 consecutive invalid movements.** If delta-x moves away from the submenu's near edge, skip the angle math. **(NEW)**
- **Use an idle timeout, not velocity.** The timeout resets on each move. If the pointer rests outside the parent item, close. Use a longer timeout for users with motor impairments. **(NEW)**
- **Throttle checks to ~16ms.** Track only while the submenu is open, and ignore `pen` and `touch` pointers. **(NEW)**

#### React Aria team — "Building a Button" parts 1–3 — https://react-aria.adobe.com/blog/building-a-button-part-1 (and -part-2, -part-3) (undated)

- **Press semantics:** `onPress` fires only if the pointer is released over the target. Dragging off removes the active state, and dragging back on restarts the press. Scrolling or an overlay (such as an incoming call) cancels the press. **(NEW)**
- **Ignore repeated keydown from a held key.** Otherwise a held Enter opens a menu and then picks an item. Buttons respond to Enter and Space, links only to Enter. **(NEW)**
- **Text selection:** `user-select: none` on the button isn't enough in Safari. Apply it to the page on touch start and remove it shortly after release. **(NEW)**
- **Hover only for real mice.** iOS fires an emulated `pointerenter` with type "mouse" after `pointerup`. Set a global flag on touch `pointerup` and ignore mouse-enter for **50ms**. `@media (hover: hover)` fails on hybrid devices. **(NEW. Contradicts the Emil skill; see Tensions.)**
- **Focus rings only for keyboard and assistive tech,** tracked by input modality. Modifier shortcuts (Ctrl, Cmd, Alt) don't switch to keyboard mode. Programmatic `focus()` is ignored. Typing into an input you clicked doesn't show the ring. **(NEW)**
- **Safari doesn't focus buttons on mouse down** (WebKit bug 22261, open since 2008). Focus them by hand so focus can be restored when overlays close. **(NEW)**

#### Jakub Krehel — "Details that make interfaces feel better" — https://jakub.kr/writing/details-that-make-interfaces-feel-better — Mar 10, 2026

- **Contextual icon swaps animate `opacity`, `scale` and `blur` together.** **(NEW as an icon rule)**
- **Check numerals after turning on `tabular-nums`.** Some fonts, such as Inter, change how numerals look. **(NEW caveat)**
- **Subtle exits:** a drawer exits to `x: -70%` with `opacity 0` and `blur(4px)` instead of sliding fully off (spring 0.45s, bounce 0). **(NEW)**
- **Optical alignment:** use less padding on the icon side of an icon+text button. Fix lopsided icons inside the SVG, not with margins. **(NEW)**
- **Shadow as border:** light mode uses `0 0 0 1px rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06), 0 2px 4px rgba(0,0,0,.04)`, and dark mode a single `0 0 0 1px rgba(255,255,255,.08)`. On hover, raise the alphas (.08/.08/.06; dark .12) and transition only `box-shadow`. **(NEW)**

#### Jakub Krehel — "Less is more, more or less" — https://jakub.kr/writing/less-is-more — Jun 23, 2026

- **Do the arithmetic:** 200 opens a day × 300ms is about 1 minute a day, or 6+ hours a year, spent watching one menu animate.
- **The context menu he shows animates only on close,** and its item hover `background-color` doesn't transition at all. **(NEW: no hover-color transition on menu items)**

#### Raphael Salaja — "A Note on Timing" (Jan 19, 2026), "When to Use a Spring" (Oct 21, 2025), "The Last 10%" (Oct 12, 2026), "What the Model Misses" (Sep 14, 2026) — https://raphaelsalaja.com/library/…

- **Duration follows frequency:** onboarding 600ms, page 300–400ms, sheet or dialog ~300ms, toast ~240ms, menu 150–200ms (180ms), hover ~100ms. Keyboard-triggered actions often get none. **(NEW: the full ladder)**
- **Exits take a bit more than half the entrance:** a menu that opens in 200ms closes in ~120ms. A context menu can vanish the moment an item is picked.
- **A floor and a ceiling:** visible motion takes at least ~100ms and rarely more than 500ms. Duration grows with distance, but less than proportionally. **(NEW: explicit bounds)**
- **Tune from fast to slow** until the motion reads. If you still notice it on the third viewing, it's too slow. To match a reference, count frames: 12 frames at 60fps is 200ms. **(NEW)**
- **Springs are for things with weight;** eases are for things that just arrive. Starting values: sheet spring with bounce ~0.15 at ~400ms; toggle or segmented pill bounce ~0.2; dragged element returning bounce 0–0.2 with release velocity; popover or menu **ease-out 150–200ms, not a spring** ("feels like it's showing off"); opacity, color and blur ease-out 150–250ms. Keep UI bounce at 0.15–0.25. **(NEW: per-component table)**
- **Never put a spring on opacity or color.** The overshoot gets clipped or shows up as a flash. **(NEW)**
- **The cleanup pass on a model's first output:** delete first; snap every gap to the spacing scale (a 9 or 20 in an 8/12/16/24 scale is a mistake); one curve per kind of motion (all menus share one timing); daily-use cards get no entrance; rewrite copy that could sit on any landing page. **(NEW)**

#### Benji Taylor — "Family Values" — https://benji.org/family-values — 8 July 2024

- **In a sequence of trays, each one differs in height** so the user can see the step change. Copy gets rewritten to make that happen. **(NEW)**
- **Morph button labels through shared letters** ("Con" in Continue → Confirm), so the user notices a significant step. Empty states change only the words that differ. **(NEW)**
- **Never duplicate a persistent element during a transition.** If it stays on screen into the next step, it moves rather than being re-rendered. **(NEW)**
- **Directional tab motion:** tapping a tab on the left slides left. "We fly instead of teleport." _(see Tensions)_
- **Delight-Impact curve:** the less often a feature is used, the more delight it can carry. Frequent flows (sending) get tiny touches, such as commas sliding into place as the user types. **(NEW: the inverse framing for delight)**
- **Point to where the result lives.** After confirming, the spinner travels into the bottom nav tab where the pending transaction now sits. **(NEW)**

#### Josh W. Comeau — CSS transitions (Feb 2021, updated May 5 2026), `linear()` springs (Oct 28 2025), shadows (Sep 2021, updated Apr 2026), CSS vs JS (May 26 2026), whimsy (Feb 24 2025) — joshwcomeau.com

- **Fix the "doom flicker"** (a hover that moves the element out from under the cursor) by keeping the hover target still and animating a child. **(NEW)**
- **Asymmetric hover:** 125ms on hover-in, 450ms on hover-out. A dropdown stays open with a `transition-delay: 300ms` on exit (enter is 100ms with no delay), so re-entering within the window cancels the close. **(NEW: a pure-CSS hover bridge)**
- **`linear()` springs:** ~25 points with time stops are enough; generate them and record stiffness and damping in a comment. Fall back with `@supports (animation-timing-function: linear(0,1))`, because a duplicated `var()` declaration doesn't work as a fallback. Three ~75-point springs cost ~1.3kB gzipped. **(NEW)**
- **Caveat:** an interrupted CSS transition uses the reversing shortening factor, so a 1600ms spring can replay at 400ms and feel wrong. React Spring handled reversals better. **(NEW)**
- **Token health check:** if more than ~20% of transitions use custom one-off curves, the motion tokens need work. **(NEW)**
- **Shadows:** one light source, with y-offset 2× x-offset. Higher elevation means more offset and blur and less opacity. Layer them (5 layers at 1/2/4/8/16px, each α 0.075). Tint the shadow with the background's hue at lower saturation and lightness (on `hsl(220 100% 80%)` use `hsl(220 60% 50%)`). Use `drop-shadow` for non-rectangular shapes. Don't animate layered shadows. **(NEW: ratios and values)**
- **CSS vs JS:** the CSS advantage comes from threading, not speed. Motion, which runs on WAAPI, stayed smooth under main-thread load. rAF loops and layout properties stall. **(Refines the Emil skill)**

#### Emil Kowalski — "Building a drawer component" (Vaul) and "Agents with Taste" — https://emilkowal.ski/ui/… (undated; Agents with Taste mentions a course reopening "January 19th")

- **Drawer motion:** `transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)`, the iOS sheet curve via Ionic. **(NEW: above the skill's 300ms)**
- **Scroll-then-drag guard:** dragging is allowed only when the content is scrolled to the top, plus a **100ms** lockout after reaching the top so a fast scroll doesn't fling the drawer shut. **(NEW)**
- **Mobile keyboard:** turn off the browser's scroll-into-view and resize the drawer from `visualViewport` resize events so it sits above the keyboard. **(NEW)**
- **Typography:** use a fallback font stack whose x-height and weight match the primary font, to avoid layout shift. Reserve underlines for links. Use bold, not italic, for UI emphasis. Loosen tracking on uppercase labels. **(NEW)**

#### Paco Coursey — "Disable transitions on theme toggle" — https://paco.me/writing/disable-theme-transitions — Mar 19, 2020

- **Theme switch:** inject `* { transition: none !important }`, toggle the theme, force a reflow with `getComputedStyle(css).opacity`, then remove the style. rAF was unreliable. **(NEW)**

#### Linear — "How we redesigned the Linear UI (part II)" (Mar 28 2024) and "A calmer interface for a product in motion" (Mar 12 2026) — https://linear.app/now/…

- **Themes from three inputs: base color, accent color and contrast,** instead of 98 variables, generated in LCH. The contrast input produces high-contrast themes for accessibility. **(NEW)**
- **"Don't compete for attention you haven't earned":** the sidebar is dimmed a few notches below the content. Fewer and smaller icons, with no colored icon backgrounds. **(NEW)**
- **"Structure should be felt, not seen":** fewer separators, softer border contrast, rounded edges. 2026 defaults moved from cool blue-gray to a warmer, less saturated gray ("too warm looks muddy"). **(NEW)**

### Cross-source themes

1. **The more often something is used, the less it moves.** Rauno, Jakub, Raphael, Benji (Delight-Impact curve), Devouring Details, Emil skill. Keyboard-triggered and right-click UI shouldn't animate in.
2. **Exits are faster or quieter than entrances.** Raphael (~60% of entrance), Jakub (subtle partial exit), Rauno (macOS menu fades out only), Emil (~20% faster). _Hover-out is the exception:_ Josh makes it slower (see Tensions).
3. **Interruptibility and robustness.** Rauno, Jakub, Raphael, Devouring Details (survive spamming), Vercel, React Aria (cancel the press on scroll). Josh warns that `linear()` springs interrupt badly.
4. **Spatial continuity and origin.** Rauno (Dynamic Island launch origin), Benji (no duplicated elements, spinner travels to the tab), Raphael (menu grows from its button), Vercel (correct transform-origin).
5. **Feedback where the trigger is.** Rauno (inline copy checkmark), Vercel (inline help first; loading button keeps its label), Benji (spinner moves to where the result lives).
6. **Generous hit areas with no dead zones.** Rauno (padding, not gaps, between list items), Vercel (24px/44px), Devouring Details (concentric sibling hit areas), Emil (44px pseudo-element).
7. **Pointer intent for menus.** Rauno and Vercel name the "prediction cone". React Aria gives the algorithm (15° tolerance, 2 strikes, idle timeout, 16ms throttle). Josh gives a CSS-only version (300ms exit delay).
8. **Every state designed, and edge cases sanded:** Vercel (empty, sparse, dense, error; no dead ends), Raphael (the last 10%: 40-character names, 200 items), Devouring Details (sanding by spamming states), Benji (polish rare features too).
9. **Velocity-aware release:** projection (Devouring Details), momentum dismissal (Emil), springs that take the release velocity (Raphael).

### Tensions

- **Hover gating.** The Emil skill and Rauno say to use `@media (hover: hover)`. React Aria says the media query fails on hybrid devices (touch laptops, iPad with trackpad) and gates hover in JS by pointer type, ignoring emulated mouse-enter for 50ms after a touch.
- **Focus-visible.** Vercel's guidelines say to prefer `:focus-visible`. React Aria says browsers apply its heuristics inconsistently and tracks input modality itself (ignoring modifier shortcuts and programmatic focus).
- **Focus ring technique.** Rauno says to use `box-shadow`, not outline, because outlines don't follow radius. His own footnote says Safari 16.4 fixed this, so the rule is dated. Devouring Details switches between inset and outset rings depending on the background.
- **Autocomplete and spellcheck.** Rauno: "disable `spellcheck` and `autocomplete` most of the time." Vercel: set `autocomplete` and meaningful names so autofill works, and disable spellcheck only on emails, codes and usernames.
- **How long interactions take.** Rauno ≤200ms; Emil skill <300ms; Raphael 100–600ms by frequency; Emil's own Vaul drawer 500ms; Stripe 2017 "most under 500ms".
- **Exit speed.** Raphael, Emil and Jakub make exits faster or subtler. Josh makes _hover-out_ slower (450ms vs 125ms) and adds a 300ms close delay to dropdowns. The difference is hover vs dismissal.
- **Springs on menus.** Raphael says popovers and menus use ease-out 150–200ms, because springs there "show off". The Emil skill and Jakub (Motion springs for icons and drawers) use springs more freely. Josh says CSS `linear()` springs interrupt worse than JS springs, which complicates the Emil skill's "CSS transitions for interruptible UI" whenever the curve is a spring.
- **CSS vs JS.** The Emil skill says "CSS animations beat JS under load". Josh: the gap comes from threading, and WAAPI-based libraries like Motion perform like CSS. Vercel: CSS > WAAPI > JS libraries.
- **Static vs fluid transitions.** Benji: "avoid static transitions", including directional motion on tab switches, a high-frequency action. Rauno and Emil remove motion from frequent interactions. Benji partly resolves this with the Delight-Impact curve, but tab motion stays a real disagreement.
- **Borders.** Jakub replaces borders with layered `box-shadow`. Vercel combines borders with shadows. Linear 2026 removes separators and softens border contrast.

### Not reachable or thin

- **Stripe** "Improve the payment experience with animations": 404. The Connect front-end post (Benjamin De Cock, 2017) is marketing animation; only its "most under 500ms" note is used.
- **Paywalled:** Josh Puckett's Interface Craft (landing page only), and Devouring Details' 21 paid chapters (2 free chapters used).
- **No usable primary writing:** Mariana Castilho (site empty, podcasts only), Derek Briggs (empty response), Raphael's userinterface.wiki (client-rendered), Jhey Tompkins (visual experiments only), Lochie Axon (lochie.me subpages 404; web-haptics README gives presets of 50ms taps, nothing beyond apple-design's haptics).
- **Thin:** Emil has no dated 2025–26 posts ("You Don't Need Animations" is covered by the skill). Paco has no posts after 2023. React Aria posts carry no byline or date.

## B. Strand notes: visual design fundamentals and UX

Research date: 2026-11-07. Every bullet comes from a page I read in this session. **(NEW)** marks a rule that none of the installed skills cover. I checked these skill files on disk: `design/guidelines/*` (ui.sh), `web-design-guidelines` (Vercel `command.md`), `ux-laws`, `apple-design`, `emil-design-eng`. Paywalled books are covered only through what the authors publish openly.

### Sources

#### 1. Adam Wathan & Steve Schoger — "7 Practical Tips for Cheating at Design" — https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886 — 2018-02-20

Medium returned 403 on the article page, so I read the full text from the publication's RSS feed (medium.com/feed/refactoring-ui). The _Refactoring UI_ book is paywalled; only its table of contents is public (refactoringui.com).

- **Build text hierarchy with color and weight, not only size** — use 2–3 text colors: dark (not black) for primary, grey for secondary, lighter grey for ancillary. Two weights are enough: 400 or 500 for body, 600 or 700 for emphasis. Avoid weights under 400 in UI; to de-emphasize text, use a lighter color or a smaller size instead of a thinner weight.
- **Don't put grey text on colored backgrounds** — grey on white works because it lowers contrast, not because it is grey. On a colored background, use white text at reduced opacity, or hand-pick a color with the background's hue. **(NEW)**
- **Offset shadows vertically instead of using big blur or spread** — this mimics light from above. Inset shadows (wells, inputs) follow the same rule. **(NEW)**
- **Use fewer borders** — before adding a border, try (1) a box shadow, (2) slightly different background colors on adjacent elements (and drop the border if both are present), or (3) more space.
- **Don't scale up icons drawn for 16–24px** — at 3–4× they look "chunky." Keep the icon near its intended size and put it inside a colored shape, or use an icon set drawn for large sizes.
- **Add color with accent borders** — a colored strip on the side of an alert, on an active nav item, or across the top of the layout. **(NEW)**
- **Style buttons by hierarchy, not semantics** — most pages have one primary action (solid, high contrast), a few secondary ones (outline or low contrast), and a few tertiary ones (styled like links). A destructive action gets big red styling only when it _is_ the primary action, as in a confirmation dialog. ui.sh already covers this.

#### 2. Erik D. Kennedy — "7 Rules for Creating Gorgeous UI" parts 1 & 2 — https://www.learnui.design/blog/7-rules-for-creating-gorgeous-ui-part-1.html and https://www.learnui.design/blog/7-rules-for-creating-gorgeous-ui-part-2.html — updated 2024-06-15

- **Light comes from the sky** — tops are lighter and bottoms darker; elements cast shadows below. Inset: text inputs, pressed buttons, slider tracks, unselected radios, checkboxes. Outset: unpressed buttons, slider thumbs, dropdowns, cards, popups. A pressed button is darker overall. **(NEW)**
- **Design in black and white first, add color last and only with purpose** — start with one accent color on greyscale, then two, or several shades of one hue. **(NEW)**
- **Double your whitespace** — his example: 12px menu text with as much padding above and below it, a 15px gap between a heading and its underline, and 25px between lists.
- **Text on images** — use white text with a dark overlay (e.g. 35% black), a semi-transparent box, blur, a "floor fade" (0% black at the middle to about 20% at the bottom), or a scrim (an elliptical translucent-black gradient behind the text). **(NEW)**
- **Pair "up-pop" with "down-pop"** — only page titles get all-out emphasis. Every other element mixes styles that raise visibility (size, weight, caps) with ones that lower it (light weight, lower contrast), with a bit more up-pop. Example: large numbers in a light weight and low contrast, above small labels in bold uppercase. **(NEW)**

#### 3. Erik D. Kennedy — "Color in UI Design: A (Practical) Framework" — https://www.learnui.design/blog/color-in-ui-design-a-practical-framework.html — updated 2024-06-15

- **Darker variant = lower brightness + higher saturation (HSB). Lighter variant = higher brightness + lower saturation** — this is why a black overlay can't produce a good dark variant: black adds no saturation. **(NEW)**
- **Hue shift for a darker variant moves toward the nearest luminosity minimum** (red 0°, green 120°, blue 240°); a lighter variant moves toward a maximum (yellow 60°, cyan 180°, magenta 300°). Hue matters less than saturation and brightness. **(NEW)**
- **Derive states from one base** — in his Harvest example, hover is the darker variant. One hue with variations can color a whole UI. **(NEW)**

#### 4. Erik D. Kennedy — other articles

"Font Size Guidelines for Responsive Websites" (https://www.learnui.design/blog/mobile-desktop-website-font-size-guidelines.html, updated 2024-05-30), "Why Beginning Designers Don't Need Grids, Type Scales, or Color Theory" (…/why-beginning-designers-dont-need-grids-type-scales-color-theory.html, 2018-12-17), "3 Pro Tips on Alignment" (…/3-pro-tips-on-alignment.html, 2018-11-03), "The 3 Laws of Locality" (…/the-3-laws-of-locality.html, 2019-07-31). I read these through a summarizing fetch tool, so the numbers below come from its output.

- **Font sizes** — page title 28–40px on mobile, 35–50px on desktop. Body text 16–20px on mobile and 18–24px on desktop for text-heavy pages; 16–18px and 14–20px for interaction-heavy ones. Start mobile body at 17px. Secondary text is about 2px smaller and about 70% as strong in color. Use about 4 sizes in total. Buttons and inputs use the default size; inputs are at least 16px.
- **Uppercase labels and buttons should be set slightly smaller** — caps carry more visual weight. **(NEW)**
- **Hang punctuation, bullets and icons outside the text's alignment line. Centering counts as alignment. Left-aligned text aligns only weakly on its right edge.** **(NEW)**
- **Laws of locality** — (1) put a control where it takes effect; (2) a control that affects a whole area goes above that area, recursively; (3) the farther a control sits from what it affects, the more it must stand out. **(NEW)**

#### 5. Adham Dannaway — "16 little UI design tips…" (https://www.adhamdannaway.com/blog/ui-design/ui-design-tips, updated 2026-07-03), "14 logic-driven UI design tips…" (…/ui-design-tips-14, updated 2026-07-03), "Button design tips" (…/button-design-tips, updated 2026-01-01), practical-ui.com and practical-ui.com/design-system

The _Practical UI_ book is paywalled ($59, 373 pages); the free preview sits behind an email form.

- **Four grouping methods, from strongest to weakest** — a shared container, proximity, similar appearance, a continuous alignment line. Containers are the strongest cue but add clutter, so try the others first.
- **Space by relatedness on an 8pt scale** (4pt for dense UIs), with t-shirt names; steps grow larger as values grow.
- **Put brand color on interactive elements only** — links and buttons. Remove it from non-interactive headings and star ratings so color teaches what can be clicked. **(NEW)**
- **Contrast** — text needs 4.5:1, or 3:1 for large text (over 18px bold or over 24px regular). UI elements such as field borders, icons and button shapes need 3:1. Two buttons with identical styles need 3:1 between them. A secondary button fill under 3:1 needs a border of at least 3:1. Avoid light grey buttons because they read as disabled.
- **Use regular and bold weights only** (semibold if bold is too heavy). Thin and very heavy weights only at large sizes. **Avoid pure black text** — use dark grey. **Limit uppercase**; use sentence case.
- **Body line-height at least 1.5, ideally 1.5–2. Line length 40–80 characters. Left-align body text** and center only short text.
- **One primary button per screen. Targets at least 48×48pt** (WCAG asks for 44). Space buttons at least 8pt apart; he uses 16pt to be safe.
- **Balance icon–text pairs** — give the icon and its label similar visual weight. Keep icons consistent: all outlined, 2pt stroke, rounded corners. Don't confuse minimalism with simplicity: keep labels on icon navigation.
- **His design system** — hover and press use a transparent overlay ("state layer") instead of extra palette colors. In dark mode, elevation uses progressively lighter backgrounds. **(NEW: state layers)**

#### 6. Matthew Butterick — Practical Typography: "Summary of key rules", "Headings", "Letterspacing" — https://practicaltypography.com/summary-of-key-rules.html, …/headings.html, …/letterspacing.html — pages show no date

- **Body text on the web is 15–25px; line spacing is 120–145% of the size; average line length is 45–90 characters.**
- **Bold or italic as little as possible, never together. No underlines except perhaps links. All caps only for less than one line. Center sparingly.**
- **Add 5–12% letterspacing to all caps and small caps** (CSS 0.05–0.12em). Lowercase normally gets none; text under 9pt may need some; large lowercase headlines often get negative tracking. **(NEW: the exact range for caps)**
- **Headings** — at most 3 levels ("two is better"). Make them only slightly bigger, by the "smallest increment necessary" (for 12pt body, try 12.5–13pt rather than 14–15). Emphasize with space above and below. No all caps, no underline, no centering, no title case. Bold, not italic. He rejects modular scales. **(NEW)**

#### 7. Matt Ström-Awn — "UI Density" — https://mattstromawn.com/writing/ui-density/ — 2024-05-20; "Tables" — https://mattstromawn.com/writing/tables/ — 2016-08-03

- **UI density is the value a user gets divided by the time and space the interface takes.** Visual density (how much is on screen) is unreliable: grouping the same 500 dots changes how dense they look. **(NEW)**
- **Design density** — count the design decisions (uses of gestalt principles) that do real work against all the decisions made, like Tufte's data-ink ratio. **(NEW)**
- **Temporal density** — under 100ms feels simultaneous, so animation can make it feel slower. From 100ms to 1s, bridge the gap with a transition. From 1–10s, show an indeterminate loader. From 10s to 1min, show a determinate progress bar. Over 1min, let the user leave and notify them when done. **(NEW)**
- **Tables** — right-align numbers, left-align text, give headers their column's alignment, never center. Use tabular lining figures. Show units once per column. Use few, very light, horizontal-only rules. No zebra stripes (his opinion). Keep tables monochrome; mark highlights with symbols, not background color. **(NEW, apart from tabular-nums)**

#### 8. Heydon Pickering & Andy Bell — Every Layout: "Axioms", "Units", "Modular scale", "The Stack" — https://every-layout.dev/rudiments/axioms/ (and /units/, /modular-scale/, /layouts/stack/) — no date; open, no paywall

- **State design rules as axioms and encode them globally** — e.g. "the measure should never exceed 60ch" becomes `--measure: 60ch` set on `*`, with exceptions for `html, body, div, header, nav, main, footer`. Style by exception. Designing for the web is "designing without seeing." **(NEW)**
- **Units** — `rem` for type and blocks (px overrides the user's font setting), `em` for inline elements and icons, `ch` for measure; a fluid root `calc(1rem + 0.5vw)` instead of breakpoints. **(NEW)**
- **Base vertical spacing on body line-height** — 1rem text at 1.5 line-height gives 1.5rem spacing; the scale multiplies by a ratio (default 1.5, `--s-5`…`--s5`). Consistent use of one ratio matters more than which ratio.
- **The Stack** — margin belongs to the relationship between siblings: `.stack > * + * { margin-block-start }`. Use nested non-recursive stacks for different spacing per level, and a flex column with an `auto` margin to split a stack. **(NEW)**

#### 9. James Gilyead (with Trys Mudford) — Utopia: "Designing with fluid type scales" (https://utopia.fyi/blog/designing-with-fluid-type-scales, 2020-02-01) and "Designing with a fluid space palette" (https://utopia.fyi/blog/designing-with-a-fluid-space-palette/, 2021-03-16)

- **Define only two states and interpolate** — e.g. a 1.2 ratio at 320px and 1.333 at 1500px. Phones need a conservative scale; large screens can take a dramatic one. There are no type breakpoints: "H2s are always size 4." **(NEW)**
- **Space derives from body font size** — multipliers 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6. A single step flexes little (16→18px), so pairs such as s→l give spacing "attitude" across viewports. **(NEW)**
- **Use the fewest spaces possible and name them** — named sizes give design and code a shared vocabulary.

#### 10. iA — "Web Design is 95% Typography" (https://ia.net/topics/the-web-is-all-about-typography-period, 2006-10-19) and "Responsive Typography: The Basics" (https://ia.net/topics/responsive-typography-the-basics, 2012-06-01)

- **Typography is the core skill** because the web is mostly text — "it is how we use them," not which typefaces you pick.
- **Size type for reading distance** — screens are farther away than books, so text must be bigger; 16px Georgia was the benchmark. Line-height about 140%, less on phones.
- **Avoid hard black on white** — use dark grey text or a light grey background.

#### 11. Rasmus Andersson — Inter "Dynamic Metrics" (archived: https://d.rsms.me/inter-website/v3/dynmetrics/; the current rsms.me/inter/dynmetrics/ returns 404) and https://rsms.me/inter/

- **Tracking as a function of size** — `tracking(em) = −0.0223 + 0.185 × e^(−0.1745 × size)`. Computed values: 12px ≈ 0, 14px −0.006em, 16px −0.011em, 20px −0.017em, 24px −0.020em, 32px+ about −0.022em. apple-design covers size-dependent tracking in principle; this formula is **(NEW)**.
- **Line-height** — the page's code sets `round(size × 1.4)` px at every size.
- **Inter 4 adds an `opsz` axis (14–32)** — "text" designs have a taller x-height and ink traps for small sizes. My guess is that this is why the v3 page was retired; the site doesn't say.

#### 12. Nielsen Norman Group — visual hierarchy, heuristics, errors, empty states, buttons, icons

"Visual Hierarchy in UX" (Kelley Gordon, https://www.nngroup.com/articles/visual-hierarchy-ux-definition/, 2021-01-17); "10 Usability Heuristics" (Jakob Nielsen, https://www.nngroup.com/articles/ten-usability-heuristics/, 1994, updated 2020, reviewed 2024-01-30); "Error-Message Guidelines" (Neusesser & Sunwall, https://www.nngroup.com/articles/error-message-guidelines/, 2023-05-14); "Designing Empty States in Complex Applications" (Kate Kaplan, https://www.nngroup.com/articles/empty-state-interface-design/, 2021-09-19); "Button States" (Kelley Gordon, https://www.nngroup.com/articles/button-states-communicate-interaction/, 2025-04-25); "UI Copy" (Anna Kaley, https://www.nngroup.com/articles/ui-copy/, 2019-03-03); "Icon Usability" (Aurora Harley, https://www.nngroup.com/articles/icon-usability/, 2014-07-27); "OK-Cancel or Cancel-OK?" (Nielsen, https://www.nngroup.com/articles/ok-cancel-or-cancel-ok/, 2008-05-26)

- **Hierarchy budget** — at most 3 sizes; on the web, 14–16px body, 18–22px subheads, up to 32px headers. At most 2 large elements, 2 primary plus 2 secondary colors, and 3 contrast variations. Reserve warm bright colors such as red for errors. "If everything is contrasted, then nothing stands out." **(NEW)**
- **Squint test with blur** — a 5–10px blur shows the intended hierarchy; 20px reveals unintended hot spots. Content such as photos can break the hierarchy a template set up. **(NEW)**
- **Errors** — place them next to the source; use redundant cues (red plus icon plus bold border), never color or animation alone. Match the format to severity: inline or toast for minor errors, a modal only for severe ones. Don't show an error early (not on blur of an empty field). Use plain language with no codes, and avoid "invalid," "illegal" and "incorrect." No humor. Preserve the user's input and suggest the fix. Vercel's guidelines partly cover this; severity matching, tone words and early-error timing are **(NEW)**.
- **Empty states** — always say why it's empty (system status); never show "No records" while still loading. Teach in context ("Star your favorites to list them here"). Give a direct CTA and, where possible, a second path such as demo data. **(NEW)** beyond Vercel's "don't render broken UI."
- **Button states (2025)** — hover gets a slightly darker background plus a 150–200ms delay against accidental triggers. Focus and pressed states should appear within about 100–150ms; focus uses an outline, not color alone. Loading keeps the enabled style and adds a spinner to the left of the label. Disabled is a muted style with `aria-disabled`. Selected is for checkboxes and radios, not buttons. **(NEW: the hover delay)**
- **Command labels** — 2–4 words, no articles. Name the resulting state ("Pause" while playing). Lead with a verb; add a noun when the verb is ambiguous ("Delete Folder"). Avoid "OK" in confirmations ("Discard"). Use an ellipsis when the command needs more input. Keep the same label for the same command everywhere.
- **Icons** — always show a visible text label, not just on hover. Only home, print and search are near-universal. 5-second rule: if choosing an icon takes longer than that, it won't communicate. Keep icons simple and schematic. **(NEW: always label)**
- **Heuristics** — #1 status feedback, #3 exit and undo, #5 constraints and defaults, #6 recognition over recall, #9 plain-language errors with a fix. **(NEW: ux-laws has the laws, not the heuristics)**

#### 13. Forms — NN/g and Luke Wroblewski

"Website Forms Usability: Top 10 Recommendations" (Kathryn Whitenton, https://www.nngroup.com/articles/web-form-design/, 2016-05-01); "Placeholders in Form Fields Are Harmful" (Katie Sherwin, https://www.nngroup.com/articles/form-design-placeholders/, 2014-05-11); LukeW "Top, Right or Left Aligned Form Labels" (https://www.lukew.com/ff/504/top-right-or-left-aligned-form-labels, 2007-04-02); "Web Application Form Layout" (https://www.lukew.com/ff/144/web-application-form-layout, 2005-01-16); "Inline Validation in Web Forms" (A List Apart, https://alistapart.com/article/inline-validation-in-web-forms/, 2009-09-01)

- **Single column**; short related fields (city, state, ZIP) may share a row. Avoid ambiguous spacing, where a label sits equally far from two fields.
- **Label alignment** — top labels need one fixation and are fastest for familiar data. Right-aligned labels save height but are harder to scan. Left-aligned labels are slowest but best for unfamiliar or optional data, or when users should slow down. **(NEW)**
- **No placeholders as labels** — they burden memory, can't be used to check work, hide the hint during errors, get mistaken for defaults, have low contrast, and aren't always read by screen readers. Keep labels and hints outside the field and persistent. **(NEW; this conflicts with ui.sh and Vercel, see Tensions)**
- **Field width matches the expected input** (about 19 characters for city). Use radios instead of a dropdown for 2–3 options. At most 1–2 optional fields, labeled "optional." State format rules up front. No Reset or Clear buttons; Cancel is much less prominent than Submit. **(NEW)**
- **Inline validation** (study of 22 users) — versus validating on submit: success +22%, errors −22%, satisfaction +31%, completion time −42%, fixations −47%. Validate _after_ the user leaves the field, which was 7–10s faster than validating while typing. Never validate before input. Use it for hard fields: 80–100% of users noticed it on username and password fields versus 30–50% on name fields. Keep messages persistent, put them beside the field, and add a word ("done") to the green check. **(NEW)**

#### 14. Dieter Rams — "Ten principles for good design" — https://www.vitsoe.com/us/about/good-design — no date (the page cites the late 1970s)

- **Unobtrusive** — "neutral and restrained, to leave room for the user's self-expression."
- **Thorough** — "Nothing must be arbitrary or left to chance."
- **As little design as possible** — "Less, but better." The other seven (innovative, useful, aesthetic, understandable, honest, long-lasting, environmentally friendly) carry no UI-specific rules.

### Cross-source themes

- **Hierarchy comes from contrast, not size alone; keep the budget small.** Refactoring UI (2–3 text colors, 2 weights), Kennedy (up-pop with down-pop, about 4 sizes), Adham (regular and bold), NN/g (≤3 sizes, ≤2 large elements, ≤3 contrast levels), Butterick (headings only slightly larger).
- **One primary action; the rest step down.** Refactoring UI, Adham, LukeW, NN/g; ui.sh covers it too.
- **Separate with space first, borders last.** Refactoring UI (fewer borders), Adham (containers are the strongest but noisiest cue), NN/g (borders only when whitespace fails), Butterick (headings set off by space), Ström-Awn (light rules in tables). ui.sh agrees.
- **Light from above, depth from shadow and lightness.** Refactoring UI (offset shadows), Kennedy (inset vs outset; higher surfaces are lighter), Adham (lighter backgrounds for elevation in dark mode).
- **Dark grey, not black, for text.** Refactoring UI, Adham, iA.
- **Line length** — Butterick 45–90, Every Layout 60ch (citing Bringhurst's 45–75), Kennedy 50–75, Adham 40–80.
- **Line-height** — Butterick 120–145%, iA about 140%, Inter 1.4×, Adham ≥1.5.
- **Caps need tracking and restraint.** Butterick (5–12%, under one line), Kennedy (set slightly smaller), Adham (limit uppercase).
- **Never color alone.** Adham, NN/g errors, NN/g forms, NN/g hierarchy.
- **Use color purposefully.** Kennedy (greyscale first, one hue with variations), Adham (brand color only on interactive elements), Ström-Awn (monochrome tables), Rams (unobtrusive).
- **Systematic values over ad-hoc ones.** Every Layout, Utopia, Adham (8pt scale).

### Tensions

- **Placeholders** — NN/g says avoid them and never use them as labels. ui.sh allows `placeholder` plus `aria-label` instead of visible labels on checkout forms; Vercel only asks that placeholders end with "…".
- **Title Case vs sentence case** — Vercel wants Title Case on headings and buttons; Butterick says no title case for headings; Adham prefers sentence case. NN/g's examples use Title Case.
- **Icons in containers** — Refactoring UI and Kennedy recommend putting small icons inside colored shapes; ui.sh says never wrap icons in decorative containers. They agree on not scaling icons up.
- **Icon labels** — NN/g says always show a visible label; ui.sh and Vercel accept icon-only buttons with `aria-label`.
- **Heading weight** — Refactoring UI uses 600–700; Adham bold, or semibold if bold is too heavy; ui.sh never `font-bold`, only semibold or medium.
- **Prose line-height** — ui.sh asks for at least 1.75; Butterick 1.2–1.45, iA about 1.4, Inter 1.4, Adham 1.5–2.
- **Measure** — ui.sh allows 60–90ch; Every Layout caps at 60ch; Adham 40–80; Kennedy 50–75; Butterick 45–90.
- **Uppercase** — ui.sh bans uppercase in table headers and in non-mono eyebrows; Butterick allows caps under one line with 5–12% tracking; Kennedy uses uppercase bold small labels as a down-pop/up-pop balance.
- **Type scales** — Every Layout and Utopia are built on ratios; Butterick rejects modular scales for headings; Kennedy calls scales beginner dogma.
- **Hover timing** — NN/g (2025) recommends a 150–200ms hover delay. The installed skills treat hover only as a capability gate (emil) and a contrast rule (Vercel). Emil's skip-the-delay rule is about tooltips, not buttons.
- **Density** — Kennedy says to double the whitespace (consumer examples); Ström-Awn treats sparseness that costs time as a loss (pro-tool examples).

### Not reachable

- **Medium article page** for "7 Practical Tips" returned 403; I read the full text from the publication's RSS feed instead.
- **Refactoring UI book, screencasts and component gallery** are paywalled; only the table of contents and one preview (color palette, out of scope) are open. **Steve Schoger's tips** live mainly on X, which needs login; I didn't attempt it and found no open archive.
- **Practical UI book** is paywalled; its free preview needs an email signup.
- **LukeW PDF slide decks** (static.lukew.com …082807.pdf, MIX10, AEA 2009) are image-based PDFs; no text could be extracted.
- **rsms.me/inter/dynmetrics/** returns 404; I used the archived v3 page.
- **Not found:** 2025–2026 material from Schoger, Butterick or Every Layout on these topics. The newest primary material is Adham Dannaway's 2026 updates and NN/g's 2025 "Button States."

## C. Strand notes: agent skills and workflows

Scope: gathering only. Every claim below comes from a page or file I read today. Star counts come from the GitHub API and install counts from skills.sh, both taken on 2026-11-07. "Updated" is the repo's last push, or the page date where one is shown.

### Skills and workflows

| Name                                               | Author                                                                                                                | URL                                                                                                                                    | Updated                                     | Stars / installs                                         | What it does                                                                                                                                                                                                                                                                  |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Impeccable** (v4.8.0)                            | Paul Bakaus                                                                                                           | github.com/pbakaus/impeccable, impeccable.style                                                                                        | 2026-11-07 (created 2025-11-16)             | 105k★; `impeccable` 392k installs, each sub-command ~80k | A design skill with 24 commands, a 62-rule deterministic slop detector (Rust CLI, editor hook, Chrome extension), a live variant mode, and PRODUCT.md / DESIGN.md context files                                                                                               |
| **taste-skill** (tasteskill 2.5.1)                 | Leon Lin (Leonxlnx)                                                                                                   | github.com/Leonxlnx/taste-skill                                                                                                        | 2026-11-07                                  | 111k★; `design-taste-frontend` 745k                      | Marketing and company websites: a kit of parts, randomized "deals", copy-lint, a headless-Chrome checker and a Stop-hook finish gate                                                                                                                                          |
| **ui-ux-pro-max**                                  | Next Level Builder (org)                                                                                              | github.com/nextlevelbuilder/ui-ux-pro-max-skill                                                                                        | 2026-11-07                                  | 146k★; 440k                                              | A Python search tool over CSVs: 80 styles, 192 palettes, 74 font pairings, 119 UX rules, 22 stacks                                                                                                                                                                            |
| **frontend-design** ⚠ installed, but an older copy | Anthropic                                                                                                             | github.com/anthropics/skills/tree/main/skills/frontend-design                                                                          | rewritten 2026-09-03 (#1713)                | 188k★ repo; 1.1M installs                                | Sets an aesthetic direction and lists the defaults to avoid. **The upstream file is 1,516 words; the installed copy is 562 words and differs**                                                                                                                                |
| Anthropic blog + cookbook                          | Anthropic Applied AI (Rajasekaran, Wei, Bricken)                                                                      | claude.com/blog/improving-frontend-design-through-skills; anthropics/claude-cookbooks `coding/prompting_for_frontend_aesthetics.ipynb` | blog 2025-11-12; notebook pushed 2026-10-24 | —                                                        | The "distributional convergence" argument and a ~400-token aesthetics prompt                                                                                                                                                                                                  |
| **emilkowalski/skills** (partly installed)         | Emil Kowalski                                                                                                         | github.com/emilkowalski/skills                                                                                                         | 2026-11-04                                  | 54k★; `emil-design-eng` 426k                             | Installed: emil-design-eng plus the animation, apple-design and pick-ui-library skills. **Not installed:** `break-ui`, `choreograph`, `remove-animations`, `animate`, `animation-performance`, `ask-sonner`, and the files `ui-cheatsheet.md` and `performance-cheatsheet.md` |
| **ui-skills**                                      | Julien Thibeault (ibelick)                                                                                            | github.com/ibelick/ui-skills                                                                                                           | 2026-11-07                                  | 10.8k★                                                   | `baseline-ui` (MUST/NEVER constraints), `component-canvas`, `create-design-md`, `fixing-accessibility`, `fixing-motion-performance`                                                                                                                                           |
| **shadcn skill + MCP**                             | shadcn                                                                                                                | github.com/shadcn-ui/ui/tree/main/skills/shadcn                                                                                        | skill 2026-10-14                            | 128k★ repo; skill 140k                                   | Composition rules, a CLI context-injection step, a DESIGN.md → theme workflow, 8 evals, and an MCP server for registry search, view and install                                                                                                                               |
| **DESIGN.md spec**                                 | Google Labs (Stitch)                                                                                                  | github.com/google-labs-code/design.md                                                                                                  | 2026-11-06 (created 2026-04-10)             | 28.8k★                                                   | A format: YAML tokens plus 8 ordered prose sections, with a CLI linter (contrast, broken refs, orphaned tokens, section order) and exporters                                                                                                                                  |
| **Figma MCP server guide + skills**                | Figma                                                                                                                 | github.com/figma/mcp-server-guide                                                                                                      | 2026-11-03                                  | 2.2k★                                                    | Steering files for implement-design, create-design-system-rules and Code Connect, plus a set of agent skills                                                                                                                                                                  |
| **Storybook MCP + manifests**                      | Storybook                                                                                                             | storybook.js.org/docs/ai                                                                                                               | docs v10.6 / v11 alpha                      | —                                                        | A component manifest generated from CSF and JSDoc; MCP tools `docs-list`, `docs-show`, `test-run`, `review-create`                                                                                                                                                            |
| **design-review agent**                            | OneRedOak (Patrick Ellis)                                                                                             | github.com/OneRedOak/claude-code-workflows/tree/main/design-review                                                                     | design-review last changed 2025-08-19       | 3.9k★                                                    | A Playwright subagent that runs a 7-phase live review                                                                                                                                                                                                                         |
| web-design-guidelines / writing-guidelines         | Vercel                                                                                                                | vercel-labs/agent-skills, vercel-labs/web-interface-guidelines                                                                         | WIG 2026-10-05                              | WDG 835k; writing-guidelines 120k                        | WDG is installed. `writing-guidelines` is new: it fetches vercel-labs/writing-guidelines/command.md and outputs `file:line` findings                                                                                                                                          |
| ui.sh (installed)                                  | Unverified: the site names no author; secondary reviews say Adam Wathan and Steve Schoger (Tailwind / Refactoring UI) | ui.sh                                                                                                                                  | —                                           | —                                                        | Lists 9 skills: design, ideas, brand kit, componentize, canonicalize-tailwind, add-dark-mode, dark-mode-image, make-responsive, markup-from-image. Brand kit and markup-from-image are not installed                                                                          |
| design-mobile-apps                                 | designed-by-ai / sleek.design                                                                                         | skills.sh/designed-by-ai/skills/design-mobile-apps                                                                                     | first seen 2026-09-04                       | 1.3M                                                     | A wrapper around the sleek.design REST API. It holds no design guidance, so the install count says nothing about quality                                                                                                                                                      |

#### Impeccable (the deepest source)

- **Mode before aesthetics.** Every surface is classified as Persuade, Operate, Read or Experience. "On Operate and Read, ambition shows as precision and restraint." The mode decides how much expression is allowed: a tool's landing page is Persuade, its docs are Read.
- **A craft floor read right before every UI edit**, with numbers. Body and placeholder contrast ≥4.5:1, large text ≥3:1. Measure 65–75ch. Display type at most 6rem. Tracking no tighter than −0.04em, and "−0.02 to −0.03em usually reads better". Card radii 12–16px, with pills only for small controls. Elevation is declared once, border _or_ shadow: "a 1px border under a wide soft shadow is the ghost card". It also requires theming the "browser surfaces" (selection, caret, scrollbars, focus rings, underline offset, tabular numerals), "the one models skip most reliably".
- **Bans versus defaults.** A kicker or eyebrow above a heading is a ban that "no brief earns back". Everything else is a default that the brief's own words can override ("The brief wins").
- **A 62-rule detector** (`npx impeccable detect`, exit code 2 when it finds anything). It runs in CI, in a browser extension, or as an agent hook that "scans every UI file your agent edits and hands the findings back before the agent calls the work done". Rules come in two groups: `slop` (side-tab, overused-font, gradient-text, ai-color-palette, cream-palette, nested-cards, icon-tile-stack, hero-eyebrow-chip, dark-glow, gpt-thin-border-wide-shadow, codex-grid-background, marketing-buzzword, em-dash-overuse…) and `quality` (low-contrast, flat-type-hierarchy <1.25× per step, line-length >~80ch, tight-leading <1.3, tiny-text <12px, undersized-ui-text <11px, wide-tracking >0.05em on body text, heading-rhythm, skipped-heading). Four `design-system-*` rules flag fonts, colors, radii and font sizes that are not in DESIGN.md. That is drift detection against the project's own tokens.
- **Critique runs as two isolated sub-agents**: A is the design review, B is the detector plus a browser pass. A must finish before detector output enters the context, because "it still anchors judgment". If the run falls back to a single context, the report has to open with a `⚠️ DEGRADED` banner. Scoring uses Nielsen's 10 heuristics (0–4 each; "most real interfaces score 20–32 out of 40"), P0–P3 severity and five personas.
- **Breaking the ranking rut on new work.** The agent derives 5–7 structures, a `concept-seed` script randomly deals 3 of them to the user, and the user locks one. A comp-led path measures the comp and gates the build at 72% overall match, with hard vetoes and numeric readings ("cap height 78px in the build, 103px in the comp").
- **Evidence:** one qualitative before/after in the README (same model, same brief). A "59% quality gain" figure attributed to Tessl appears only in secondary write-ups; I could not verify it.

#### Anthropic frontend-design (the upstream rewrite is new relative to the installed copy)

- **A role framing with stakes:** "This client has already rejected proposals that felt cliché or templated."
- **Two passes.** First a plan: 4–6 named hex colors, type roles, a layout as one-sentence prose plus ASCII wireframes, and principles. Then a review of that plan against the brief: "work through a similar prompt to see if you arrive somewhere similar", revise, and "say what you changed and why". Only then write code.
- **A calibration list of 5 clusters** that AI design currently lands in (see slop tells below). It names `#F4F1EA` and `#D97757`, the latter as "Anthropic's own Claude-interaction accent".
- **Type rules:** one or two families, a scale following _The Elements of Typographic Style_, lines under 80 characters, slightly more line-height for serif body. Bans single-word accents in headlines, all-caps labels, and unnecessary labels above content.
- **Restraint:** "Spend your boldness in one place", and Chanel's "remove one accessory". Self-critique from screenshots ("a picture is worth 1000 tokens"). Keep notes on what was tried, because "human creatives have memory".
- **Copy rules:** active-voice CTAs, the same verb throughout a flow ("Publish" → "Published"), errors that don't apologize.
- **Evidence:** the 2025 blog and cookbook show three side-by-side pairs (SaaS landing page, blog, admin dashboard). The cookbook names three strategies: guide specific dimensions, reference inspirations (IDE themes, cultural aesthetics), call out defaults.

#### taste-skill

- **"Deal, never choose by taste."** Scripts randomly pick the hero, palette, font pairing, nav, footer and button style, and keep a history file so consecutive pages differ. Violet is never allowed: "deal again".
- **Write all the copy first**, then plan the page screen by screen. It enforces 60–80 words per screen on tech pages and requires one hard fact on the first screen.
- **A finish gate wired as a Stop hook** (`gate.mjs`). It checks 1440 and 390 and walks the page at 320 for overflow, collisions and tap size (44px, with a FAIL when targets sit less than 8px apart). It allows 3 rounds at most, and false positives are waived in `waivers.json` with a reason, never "gamed".
- **`copy-tells.md` (dated November 2026)** splits tells into a first generation (ban words: delve, seamless, robust, unlock…) and a second generation that "look like good copy": a house voice, invented specifics, stat strips, "X. Y." headings, contrast frames. Its principle: "every rule that bans a habit needs a positive move beside it, or the model reaches for the nearest substitute."
- **Evidence:** the 2.5.1 changelog (2026-11-07) cites "a 44-site test of 2.5.0". It is strongly oriented to marketing sites. Animation numbers: card lift 2px, photo zoom 1.02–1.03, loops of 2.5–4s.

#### ui-ux-pro-max: popular but thin

- A searchable lookup DB with priority tiers (accessibility, touch and performance first) and "dials" for variance, motion and density from 1 to 10. Density maps to spacing scales: 24–96px, 16–64px, 8–32px.
- Provenance records mark entries as `"type": "derived"` from its own CSVs, with confidence scores; I found no external citations. I found no evals. Its value is breadth, not a point of view.

#### Emil Kowalski: new material beyond the installed skill

- **`break-ui`** feeds the UI plausible worst-case data behind a dev-only "Demo data / Worst case" toggle. Rules: "plausible or schema-backed, never random", "change the data, not the component", and report before fixing. Its catalog includes `Aleksandra Wiśniewska-Kowalczyk`, a 66-character email, `王秀英`, RTL names, ZWJ emoji (where `.charAt(0)` breaks), counts of 0, 1, 1284 and 1M, the German compound `Benachrichtigungseinstellungen`, and French text running ~30% longer.
- **"Agents with Taste"** (emilkowal.ski/ui/agents-with-taste) gives the method: turn each taste decision into its _reason_, then into a strict rule or flowchart, so "the agent doesn't have to guess". It adds typography rules: `tabular-nums` on price columns, `…` not `...`, looser tracking on uppercase, fallback fonts metric-matched to the primary, underline only for links, bold for UI emphasis with italic only for citations.
- **`ui-cheatsheet.md`** adds: switch to an absolute date after a week, `flex-shrink: 0` on avatars, eased gradient stops, `Intl.PluralRules` to avoid "1 members", and −0.02em tracking on large headings.

#### shadcn skill + MCP

- **Injects live project context** by running `npx shadcn@latest info --json` inside SKILL.md: aliases, `base` (radix or base), `iconLibrary` ("Never assume lucide-react"), Tailwind version, preset.
- **"Critical Rules" with Incorrect/Correct pairs:** semantic colors only (never `bg-blue-500`), no manual `dark:` overrides, `gap` instead of `space-y`, no manual z-index on overlays, Dialog/Sheet must have a Title, `Avatar` must have `AvatarFallback`, use `Empty`, `Alert`, `Skeleton` and `Badge` rather than custom divs, and icons in buttons take `data-icon` with no size classes.
- **Fetch docs before writing:** run `npx shadcn@latest docs <component>` and fetch the URLs; after adding a registry item, re-read the added files.
- **The DESIGN.md workflow** extracts a table first (canvas and ink, action states, focus, type substitutes, radius scale, verbatim elevation, control heights, every "Don't"). It then maps roles to variables and picks a structural style from geometry (e.g. "nova: 32–36px controls, 6–8px radius"; "mira: 28–32px controls"). It ends by building a design-system page with a state matrix, and says never to quote a component count from memory.
- **The MCP server** exposes `list_items_in_registries`, `search_items_in_registries`, `view_items_in_registries` and `get_item_examples_from_registries`. Any registry with a `registry.json` index works. Toast guidance now mentions React Aria projects.

#### Design review with visual verification

- **OneRedOak**: "Live Environment First" with Playwright MCP, run in phases: interaction, responsive at 1440/768/375, polish, WCAG 2.1 AA, robustness, code health (tokens, no magic numbers), console. Findings are triaged as Blocker / High / Medium / Nit, and it describes "problems over prescriptions". **Credibility caveat:** its example principles recommend Inter and an ease-in-out 150–300ms default, the opposite of the anti-slop sources. The repo has had no design-review changes since 2025-08.
- **Figma implement-design**: fetch `get_design_context`, then `get_screenshot` as the "source of truth for visual validation", implement, then validate against that screenshot. "Treat the Figma MCP output (React + Tailwind) as a representation of design and behavior, not as final code style." On conflicts, prefer the design-system tokens and adjust minimally.
- **ibelick `baseline-ui`**: hard MUST/NEVER rules, e.g. "NEVER add animation unless it is explicitly requested", interaction feedback ≤200ms, `h-dvh` not `h-screen`, one accent color per view, a fixed z-index scale, "NEVER modify letter-spacing" (this contradicts Impeccable and Emil, who both tighten display tracking).

### Techniques that recur across skills

| Technique                                                   | Who uses it                                                                                                                                                        | Why, per the source                                                                                                                                                                                                                        |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Name the defaults and ban them**                          | Anthropic (blog, skill), Impeccable (62 rules), taste-skill (`copy-tells`), ibelick, Emil                                                                          | Models sample "from this high-probability center" (Anthropic). Anthropic also warns that bans just move the convergence: "You still tend to converge on common choices (Space Grotesk…)". taste-skill: pair every ban with a positive move |
| **A brief or plan before code, reviewed against the brief** | Anthropic (two-pass plan), Impeccable (`shape`, PRODUCT.md, asking 2–3 questions), taste-skill (copy first, then a screen plan), ui-ux-pro-max (`--design-system`) | Catches "the generic default you would produce for any similar page" before it is built                                                                                                                                                    |
| **A specific reference, not adjectives**                    | DESIGN.md PHILOSOPHY, Anthropic cookbook ("IDE themes and cultural aesthetics"), Impeccable (the subject's cultural world, 7 candidate systems)                    | "Adjectives describe a region. A specific reference describes a point" (DESIGN.md)                                                                                                                                                         |
| **Randomization to break mode collapse**                    | Impeccable `concept-seed` (deals 3 of 5–7), taste-skill `deal.mjs` with history                                                                                    | Prevents the "ranking rut" (Impeccable) and keeps consecutive pages different (taste-skill)                                                                                                                                                |
| **Several variants, then pick one**                         | Impeccable `live`/`generate`, ui.sh `ideas`, Anthropic (ASCII wireframes compared)                                                                                 | The user picks a direction instead of inheriting the first sample                                                                                                                                                                          |
| **Deterministic linters as hooks or gates**                 | Impeccable hook and CLI, taste-skill Stop-hook gate, DESIGN.md `lint`, shadcn evals                                                                                | "Without the hook, the detector only runs when someone remembers to run it" (Impeccable)                                                                                                                                                   |
| **Screenshot verification at fixed widths**                 | Impeccable (batch the checks per render), taste-skill (1440/1024/820/768/390, plus 320), OneRedOak (1440/768/375), Figma (screenshot as truth), Anthropic          | Rendered output reveals what source review misses. Impeccable: "fix what one look shows before looking again"                                                                                                                              |
| **Isolated or unanchored review**                           | Impeccable (A and B sub-agents), Emil (`break-ui` reports before fixing)                                                                                           | Detector output "anchors judgment"                                                                                                                                                                                                         |
| **Mode- or kind-dependent rules**                           | Impeccable modes, taste-skill business "kind", ui-ux-pro-max product type                                                                                          | Effects that suit a landing page are wrong in an app; taste-skill allows shaders "only on tech"                                                                                                                                            |
| **Numeric rules**                                           | Everyone (see the numbers above)                                                                                                                                   | Turns taste into something checkable (Emil: "be strict")                                                                                                                                                                                   |
| **Verb commands**                                           | Impeccable (`bolder`, `quieter`, `distill`, `polish`, `harden`…), ui.sh, Emil                                                                                      | "'Make it pop' leaves your agent to guess" (Impeccable)                                                                                                                                                                                    |
| **Spend boldness once**                                     | Anthropic ("one place"), Impeccable ("one authored moment"), taste-skill ("one effect")                                                                            | Scattered effects read as generated                                                                                                                                                                                                        |
| **Worst-case data**                                         | Emil `break-ui`, Impeccable `harden`, OneRedOak Phase 5                                                                                                            | Demo data "is chosen… to make the design look good"                                                                                                                                                                                        |
| **Query live context, not memory**                          | shadcn (`info --json`, `docs`), Storybook ("Never hallucinate component properties!"), Figma (`get_design_context` first)                                          | Avoids invented props and wrong aliases                                                                                                                                                                                                    |

### AI slop tells

| Tell                                                                                                                                                                                              | Named by                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inter / Roboto / Arial / system fonts as the default                                                                                                                                              | Anthropic blog and cookbook, Impeccable (`overused-font`: Inter, Roboto, Fraunces, Geist, Plus Jakarta Sans, Space Grotesk), Impeccable README                  |
| "Second-wave" default faces: Fraunces, Playfair, Cormorant, Lora, Crimson, Newsreader, Syne, Space Grotesk/Mono, IBM Plex, Inter-as-display, DM Sans/Serif, Outfit, Plus Jakarta, Instrument Sans | Impeccable `new-work.md`. **Contradiction:** Anthropic's Nov 2025 prompt _recommended_ Space Grotesk, IBM Plex, Playfair, Crimson Pro, Newsreader and Bricolage |
| Purple/violet gradients on white; cyan-on-dark                                                                                                                                                    | Anthropic, Impeccable (`ai-color-palette`), ibelick, taste-skill ("never violet")                                                                               |
| Warm cream (#F4F1EA) + high-contrast serif + terracotta (#D97757)                                                                                                                                 | Anthropic skill (2026), Impeccable (`cream-palette`, calibration list)                                                                                          |
| Near-black + one neon/acid accent, glow edges                                                                                                                                                     | Anthropic, Impeccable (`dark-glow`, `radial-halo`, `radial-spotlight-glow`), ibelick ("no glow as primary affordance")                                          |
| Broadsheet look: hairline rules, 0 radius, italic display serif, tracked mono labels                                                                                                              | Anthropic, Impeccable (`italic-serif-display`)                                                                                                                  |
| Eyebrow / kicker in tracked ALL-CAPS above headings                                                                                                                                               | Anthropic, Impeccable (a ban: `kicker-above-heading`, `hero-eyebrow-chip`)                                                                                      |
| Numbered sections 01/02/03 that aren't a sequence                                                                                                                                                 | Anthropic, Impeccable                                                                                                                                           |
| Identical icon + heading + text cards; rounded icon tile above the heading                                                                                                                        | Anthropic ("SaaS-card kit"), Impeccable (`icon-tile-stack`)                                                                                                     |
| Nested cards                                                                                                                                                                                      | Impeccable                                                                                                                                                      |
| Thick colored left border on cards or alerts                                                                                                                                                      | Impeccable (`side-tab`: "most recognizable tell")                                                                                                               |
| Hairline border + wide soft shadow on every card; same `rgba(0,0,0,.1)` shadow everywhere                                                                                                         | Impeccable (`gpt-thin-border-wide-shadow`), Anthropic                                                                                                           |
| Hero metric: big number, small label, stats, gradient accent; stat strips                                                                                                                         | Anthropic, Impeccable, taste-skill (`copy-stat-strip`)                                                                                                          |
| Gradient text                                                                                                                                                                                     | Impeccable, Anthropic (one-word accent in headlines)                                                                                                            |
| Hard offset shadows outside real neobrutalism                                                                                                                                                     | Impeccable                                                                                                                                                      |
| Decorative grid or stripe backgrounds                                                                                                                                                             | Impeccable (`codex-grid-background`, `repeating-stripes-gradient`)                                                                                              |
| Fade-and-slide-up on every section; hover effects on every card; bounce/elastic easing; pulsing dots; marquees; fake blinking cursor                                                              | Anthropic, Impeccable                                                                                                                                           |
| Monospace as a "technical" costume; middle-dot meta strings; "WORD — fragment"; `→` on every link                                                                                                 | Anthropic, Impeccable                                                                                                                                           |
| Emoji or Unicode glyphs as icons                                                                                                                                                                  | Impeccable, ui-ux-pro-max                                                                                                                                       |
| Copy: delve/seamless/unlock/empower; "Not X. It's Y."; em-dash saturation (≥8 at ~1 per 500 chars); "theater"; invented specifics                                                                 | taste-skill, Impeccable (`marketing-buzzword`, `aphoristic-cadence`, `em-dash-overuse`, `theater-slop-phrase`)                                                  |
| Gray text on colored backgrounds                                                                                                                                                                  | Impeccable (`gray-on-color`), craft-floor                                                                                                                       |

### Design systems for agents

- **Brad Frost (2025-12-08, "Agentic Design Systems in 2026"):** "DS+AI" differs from vibe coding because "the AI is deliberately constrained to using the high-quality design system materials". He frames it as letting non-technical people "mouth code" features in sessions on production-grade foundations. The post is short and promotional (it is attached to his AI & Design Systems course), so I found no concrete rules from him.
- **Nathan Curtis (Medium, 2026):** components as **contracts** expressed in a **schema**. "A description informs. A contract arbitrates." Good contracts are "well-typed, normalized, independent, verifiable, deterministic, efficient and evolvable". Markdown specs spread because "anyone can author it… agents can read and write it", but they are "loosely structured and not structurally validated, leaving it weak to arbitration". Prefer **generated** specs (extracted deterministically from Figma) over authored ones, and add authored supplements for what Figma can't express (behavior, accessibility, discriminated-union props). **Examples as data:** "Make the common configurable. Make the uncommon composable." Composed examples give "AI a corpus encoding patterns", and slot default content is an example, not part of the contract.
- **Figma (Thomas Lowry; Ana Boyer 2025-08-06):** components plus variables plus **Code Connect** plus **variable code syntax** make the MCP context "exact". Name layers ("card", not "Frame 1337"), use auto layout, add frames per breakpoint, and annotate interactive states, conditional states and dynamic content. `create_design_system_rules` writes a rules file (token locations, "IMPORTANT: Never hardcode colors"). Figma cites its own report: 68% of developers use AI to write code, but only 32% trust the output.
- **Storybook:** each story should show _one_ concept, and its JSDoc should say "why", not "what". Use `@summary` (agents get the summary, or the first 60 characters of the description). A component JSDoc should say when _not_ to use it ("For navigation, use Link instead"). Use `react-docgen-typescript` for accurate props. Agent instructions should include "CRITICAL: Never hallucinate component properties!" and verify with `test-run`.
- **shadcn:** code you own plus registries that agents can search. Semantic tokens only. Rules are written as Incorrect/Correct pairs. Context is injected from the CLI rather than remembered. Evals are shipped with the skill.
- **Google DESIGN.md:** "The quality of a generated design is determined less by the precision of its values than by how clearly the intent is described." Prose explains each token's role and where it may appear, e.g. "Vermilion… only inside diagrams… never on typography". A short, deliberate do's-and-don'ts list is "the sweet spot", while "a long rambling list is often a sign the description was too vague". **Internal tension:** PHILOSOPHY.md says tokens are "context… not rendering instructions", while spec.md and Impeccable's `document` say "tokens are normative". Impeccable, shadcn and ibelick (`create-design-md`) all target this format.
- **Recurring requirement across all of the above:** a machine-readable source (tokens or schema), prose intent per token or component, usage examples with reasons, explicit don'ts, and a verification loop (lint, tests or screenshot diff).

### Not reachable

- **ui.sh authorship:** neither the homepage nor www.ui.sh names an author, and `/changelog` returns 404. The Wathan/Schoger attribution comes only from secondary reviews.
- **bradfrost.com/blog/tag/ai-and-design-systems/** returns "page not found" (his site is being redesigned). I found only the one short post.
- **Impeccable eval numbers:** the "59%" Tessl figure is in secondary write-ups only. The Tessl registry page shows "no eval scenarios run". I did not read the impeccable.style case studies.
- **Nathan Curtis, "We're focused too much on design tokens"**: an interview on designsystemscollective.com, not read (secondary or paywalled).
- **skills.sh `uizze.sh/ui-taste`** (1.0M installs on the leaderboard): the page rendered empty, so I couldn't identify the author or contents.
- **awesome-claude-skills lists** (ComposioHQ 79k★, travisvn 15.7k★) list frontend-design, canvas-design and web-artifacts-builder but carry no UI-quality data; I dropped them as thin.

## D. Strand notes: design-system foundations

Gathered 2026-11-07. Every point below comes from a page read in this session. If a source gives no number, the note says so.

### Sources

#### Color

**Radix: "Understanding the scale"**, https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale (no date). Also "Composing a palette" and "Aliasing" on the same site.

- **12 steps, each with a job:** 1 app bg · 2 subtle bg (cards, sidebars, code blocks) · 3 component bg · 4 hover · 5 pressed/selected · 6 subtle borders on non-interactive elements · 7 borders on interactive elements · 8 strong borders and **focus rings** · 9 solid bg (purest, highest chroma) · 10 solid hover · 11 low-contrast text · 12 high-contrast text.
- **Contrast guarantee:** on step 2 of the same scale, step 11 reaches **APCA Lc 60** and step 12 reaches **Lc 90**.
- **Step 9 foreground:** most step-9 colors take white text. Sky, mint, lime, yellow and amber take dark text. So the text color on step 9 is a property of the hue.
- **Gray pairing:** pick the gray whose hue is nearest the accent (mauve with purple/pink/red, slate with blue/indigo/cyan, sage with green/teal, olive with lime/grass, sand with yellow/amber/orange). Pure gray works with any accent.
- **Brand colors:** Radix scales "are not meant to be customized". Add a custom brand scale beside them and keep Radix for grays and semantic colors.
- **Alias names per step:** base, bg-subtle, bg, bg-hover, bg-active, line, border, border-hover, solid, solid-hover, text, text-contrast. Dark mode re-points mutable aliases under `.dark`, for example `--panel: white` becomes `slate-2`. Alpha scales cover shadows, overlays and translucent surfaces: overlay `black-a8` in light, `black-a11` in dark.

**Evil Martians (Andrey Sitnik, Travis Turner): "OKLCH in CSS: why we moved from RGB and HSL"**, https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl. Current version dated 2025-09-17.

- **L is perceptual across hues; HSL `l` is not.** In HSL a hue change can break contrast.
- **Black text is readable on any background with L ≥ 87%**, per the article. It still says OKLCH alone doesn't guarantee contrast and recommends checking with APCA.
- **Derivations:** hover is ±0.1 L with relative color syntax (`oklch(from var(--c) calc(l + 0.1) c h)`; use 0.1, not %). An accent tint fixes L and C and keeps the input hue (`oklch(from var(--user) 0.87 0.06 h)`). A sibling such as an error color keeps L and C and changes only H, so contrast doesn't move.
- **LCH vs OKLCH:** LCH blues (H 270–330) drift to purple when only L changes. OKLCH keeps the hue.
- **Gamut:** C stays below 0.37 in sRGB and P3. Max chroma depends on L and H. Write an sRGB value and override it with a higher-C value inside `@media (color-gamut: p3)`, e.g. `0.62 0.19 145` → `0.62 0.26 145`. Browsers clip out-of-gamut colors, which can shift hue.
- **Enforcement:** stylelint `color-no-hex`, disallow `rgb/rgba/hsl/hsla`, plus `stylelint-gamut`.

**Evil Martians: Harmonizer and Harmony**, https://github.com/evilmartians/harmonizer, https://github.com/evilmartians/harmony, and "Exploring the OKLCH ecosystem" (notes dated 28.05.2025).

- Inputs: color space (P3 or sRGB), **levels as lightness steps** (e.g. 100–900), **a contrast target per level against the background** (APCA by default, WCAG optional), named hues, and the background context (white/black by default).
- Promise: "equal contrast within lightness groups" and "mirrored contrast pairs". Any two hues at the same level have the same text contrast, and light and dark mirror each other without custom mapping.
- The underlying calculator is **APCACH** (APCA + OKLCH), github.com/antiflasher/apcach.

**Linear (Karri Saarinen, Yann-Edern Gillet, Andreas Eldh, Romain Cascino): "How we redesigned the Linear UI"**, https://linear.app/now/how-we-redesigned-the-linear-ui, 2024-03-28. Follow-up by Charlie Aufmann and Maxime Heckel, "Behind the latest design refresh", https://linear.app/now/behind-the-latest-design-refresh, 2026-03-12.

- **98 theme variables became 3:** base color, accent color, contrast. Contrast is a slider; the article compares 30 and 100, and the high end is for accessibility themes.
- **LCH instead of HSL**, because equal L reads as equally light. LCH also generates the surface elevations (background, panels, dialogs, modals).
- **Chrome stays near neutral:** they limited how much of the brand blue enters the calculations. Text and neutral icons were darkened in light mode and lightened in dark mode.
- **2026:** the default grays moved from cool blue-ish toward a warmer, less saturated gray ("too warm looks muddy"). The sidebar is "a few notches dimmer" than content. Dividers have lower contrast and some borders were removed. The post gives no numbers.

**Stripe (Daryl Koopersmith, Wilson Miner): "Designing accessible color systems"**, https://stripe.com/blog/accessible-color-systems, 2019-10-15.

- They used CIELAB rather than HSL, and **every hue follows the same lightness curve**, so yellow has the same contrast range as blue.
- **Level rule:** two colors ≥ 5 levels apart pass for small text (4.5:1), and ≥ 4 levels apart pass for icons and large text (3:1). The post doesn't give the level count.
- **Brand handling:** simply darkening a failing brand shade made it muddy, so they rebuilt the whole system, keeping each hue's intended hue and saturation where possible. Some combinations don't exist (very dark yellow is "imaginary").
- **Badges:** they moved background and text up one level together, which kept contrast across every hue without tuning each pair.

**Matt Ström-Awn: "Generating color palettes"**, https://mattstromawn.com/writing/generating-color-palettes/, 2024-04-20.

- Works in **OKHsl**. Scale numbers are normalized: n = step / max.
- **Lightness comes from contrast:** target ratio r(n) = e^(k·n) with k = ln 20.25 ≈ 3.009, so r(0.5) = 4.5:1. He uses 3.04 for rounding margin, which makes step 500 vs step 0 ≈ 4.57:1. The contrast target is solved back to luminance, then to L* and the OKHsl toe. Any two steps 500 apart then pass AA (USWDS-style).
- **Chroma peaks mid-scale:** S(n) = −4n² + 4n for colors, and S(n) = −0.8n² + 0.8n for neutrals (peak 20%).
- **Hue shift:** H(n) = H_base + 5(1 − n), against the Bezold–Brücke effect.
- Caveat: the essay's text says toe k₂ = 0.003 but the code uses 0.03.

**Material Design 3: material-color-utilities (MCU)**, https://github.com/material-foundation/material-color-utilities (concepts/, dev_guide/, typescript/). m3.material.io would not render (see Not reachable).

- **HCT:** hue and chroma from CAM16, tone = L*. Tone runs 0–100. Chroma tops out near 120. Colors outside the gamut keep their tone and lose chroma.
- **One source color → 5 key colors → tonal palettes with 13 tones.** Legacy CorePalette recipe: primary chroma max(48, C), secondary 16, tertiary hue+60 at 24, neutral 4, neutral-variant 8, error hue 25 at chroma 84. The content variant keeps proportions instead: C, C/3, C/2, min(C/12, 4), min(C/6, 8).
- **Tone gap ⇒ contrast:** a difference of **40 tones guarantees ≥ 3:1** and **50 guarantees ≥ 4.5:1**. A T50 background reaches only about 4.5:1 even with white.
- **Role tones (light/dark), 2021 spec:** primary 40/80, on-primary 100/20, primary-container 90/30, on-container 30/90 (or 10/90), surface and background 98/6, on-surface 10/90, surface-variant 90/30, on-surface-variant 30/80, outline 50/60, outline-variant 80/30, inverse-surface 20/90.
- **Tonal surface ladder replaces shadows for hierarchy.** Light: lowest 100, low 96, container 94, high 92, highest 90, dim 87. Dark: lowest 4, base 6, low 10, container 12, high 17, highest 22, bright 24. Each moves further at higher contrast levels.
- **Contrast levels −1 / 0 / 0.5 / 1** (ContrastCurve). on-surface targets 4.5 / 7 / 11 / 21. Primary on surface 3 / 4.5 / 7 / 7. outline 1.5 / 3 / 4.5 / 7. outline-variant 1 / 1 / 3 / 4.5. Default level guarantees 4.5:1 for all text and icons and 3:1 for required non-text. Medium adds 3:1 for all non-text. High guarantees 7:1 for text and 4.5:1 for non-text.
- **Failing colors:** after tones are assigned, the foreground tone is pushed until it hits the target ratio. Fidelity schemes may move tone toward the source color's tone or toward reaching the chroma target. `Contrast.darker`/`lighter` return −1 when the target can't be reached; the "unsafe" variants return black or white instead. The 2025 spec adds `tMaxC`, which picks the tone with maximum chroma for primary in some variants.

**Tailwind CSS v4 colors**, https://tailwindcss.com/docs/colors (v4.3), plus `theme.css` in tailwindlabs/tailwindcss.

- 26 families × **11 steps (50–950)** in OKLCH.
- Blue L by step: 97, 93.2, 88.2, 80.9, 70.7, **62.3** (500), 54.6, 48.8, 42.4, 37.9, 28.2. C peaks at 600–700 (0.245). Hue drifts 254 → 268 as steps darken.
- Neutral L by step: 98.5, 97, 92.2, 87, 70.8, 55.6, 43.9, 37.1, 26.9, 20.5, 14.5.
- Example usage: light text gray-950, secondary gray-700; dark surface gray-800, secondary gray-400. Dark-mode accents are low-alpha tints such as `pink-400/10`.

**Vercel Geist: Colors**, https://vercel.com/geist/colors (no date).

- **10 steps per scale.** 100 bg, 200 hover bg, 300 active bg, 400 border, 500 hover border, 600 active border, 700 high-contrast bg, 800 its hover, 900 secondary text/icons, 1000 primary text/icons.
- Two backgrounds: background-100 is the default; background-200 is secondary and should be used sparingly.
- Use solid gray for borders by default and gray-alpha only where the surface should show through. Draw each border once, because overlapping alpha borders show darker joins. Keep shadows translucent, because opaque shadows leave a gray halo. P3 is used where supported.

**Adobe Leonardo: contrast-colors README**, https://github.com/adobe/leonardo (packages/contrast-colors).

- **The inputs are contrast ratios, not lightness values.** Each color has `colorKeys` (interpolation anchors), a `ratios` array or a name→ratio map, a `colorspace` (LCH, LAB, CAM02, HSL, HSLuv, HSV, RGB) and `smooth`. The theme sets the background `lightness` (0–100), a global `contrast` multiplier (default 1) and `saturation` (0–100, default 100).
- **Naming:** positive ratios become 100, 200, …. Negative ratios (lighter than the background) fill in below 100: with three negatives, 25/50/75.
- The output may slightly overshoot a target ratio because of RGB quantization; the README accepts this.
- **Dark mode = new background lightness, same ratios.** The README says this indirectly; it doesn't state it as a rule.

#### Contrast

**W3C: WCAG 2.2**, https://www.w3.org/TR/WCAG22/, Recommendation 2024-12-12.

- 1.4.3 (AA): text **4.5:1**, large text 3:1. 1.4.6 (AAA): **7:1** / 4.5:1. Large text means ≥ 18pt, or ≥ 14pt bold.
- 1.4.11 (AA): UI component and state visuals need **3:1 against adjacent colors**.
- 1.4.12: layouts must survive user overrides of line-height 1.5×, paragraph spacing 2×, letter-spacing 0.12em and word-spacing 0.16em.
- 2.4.13 Focus Appearance (AAA): the indicator area must be ≥ a **2 CSS px perimeter** of the component, with **3:1** between its focused and unfocused pixels. 2.4.11 (AA): focus must not be entirely hidden.
- 2.5.8 (AA): targets **≥ 24×24 CSS px**, or spaced so 24px circles don't intersect. 2.5.5 (AAA): **44×44**.

**APCA (Andrew Somers / Inclusive Reading Technologies): "APCA in a Nutshell"**, https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html (© 2022).

- **Lc 90** preferred for body text (14px/400 or 18px/300). **Lc 75** minimum for body text (18px/400, 16px/500, 14px/700). **Lc 60** minimum for other readable text (24px/400, 16px/700). **Lc 45** large or heavy headlines (36px/400, 24px/700) and fine icons. **Lc 30** absolute minimum for placeholder, disabled text and solid icons. **Lc 15** non-text such as dividers and thick focus outlines; below it counts as invisible. Add 15 Lc for AAA-equivalent levels.
- Lc is perceptually uniform across polarity. WCAG 2 overstates contrast for dark colors.

**Status in 2026: Adrian Roselli, "WCAG3 Contrast as of April 2026"**, https://adrianroselli.com/2026/04/wcag3-contrast-as-of-april-2026.html, 2026-04-10, updated 04-13.

- APCA was marked for removal in early 2023 and dropped from the July 2023 draft. The April 2026 editor's draft says "the contrast algorithm used in WCAG 3 is yet to be determined". Roselli expects WCAG 3 around 2030 at the earliest.
- In a comment dated 2026-04-15, Somers calls APCA "draft guidance" and promotes **BridgePCA**, which also passes WCAG 2. W3C published another WCAG 3 Working Draft on 2026-03-03 (https://www.w3.org/WAI/news/2026-03-03/wcag3); I did not read it.

#### Type and space

**Utopia (James Gilyead, Trys Mudford): "Designing with fluid type scales"**, https://utopia.fyi/blog/designing-with-fluid-type-scales/, 2020-02-01. Calculator: https://utopia.fyi/type/calculator/.

- **Define two scales, one at a minimum viewport and one at a maximum, and interpolate between them.** The default is 18px × 1.2 (minor third) at 360px and 20px × 1.25 (major third) at 1240px, with steps −2…+5, each written as `clamp(min, rem + vw, max)`.
- Rationale: phones want conservative ratios and desktops dramatic ones, and breakpoints are arbitrary.

**Utopia (Trys Mudford): "Painting with a fluid space palette"**, https://utopia.fyi/blog/painting-with-a-fluid-space-palette/, 2021-03-16.

- **Type step 0 is space "S" (1×).** Multipliers: 3XS 0.25, 2XS 0.5, XS 0.75, S 1, M 1.5, L 2, XL 3, 2XL 4, 3XL 6. Steps are denser near the origin.
- **One-up pairs** interpolate from one size at minimum viewport to the next size up at maximum (s-m: 18→33px), so padding grows faster than type. Custom pairs can be steep (3XS→4XL) or reversed (2XL→XS).

**Rasmus Andersson: Inter "Dynamic metrics"**, archive at https://d.rsms.me/inter-website/v3/dynmetrics/ (the live page says it "no longer exists").

- Tracking = a + b·e^(c·z), with **a = −0.0223, b = 0.185, c = −0.1745**, z = font size in px, result in em. Small sizes get positive tracking and large sizes negative.
- The current site, https://rsms.me/inter/, ships Inter 4 with an **`opsz` axis (14–32)** that switches text and display designs. The text design has a taller x-height and ink traps. Features: `tnum`, `cv11`, `ss01`–`ss08`. My reading: the formula page was retired once optical sizes shipped.

**Tailwind v4 `theme.css`** (current main), the clearest primary data I found for line height by size.

- Base unit `--spacing: 0.25rem`.
- Text sizes with line heights: 12/16, 14/20, 16/24, 18/28, 20/28, 24/32, 30/36, 36/40, then **1.0 from 48px up**. The ratio falls from 1.5 to 1.0 as size rises.
- Tracking −0.05 / −0.025 / 0 / 0.025 / 0.05 / 0.1em. Leading 1.25 / 1.375 / 1.5 / 1.625 / 2.

#### Space and density

**IBM Carbon: Spacing**, https://carbondesignsystem.com/elements/spacing/overview/. **2x Grid**: https://carbondesignsystem.com/elements/2x-grid/overview/. **Button style**: https://carbondesignsystem.com/components/button/style/.

- **Spacing:** 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160 (multiples of 2, 4 and 8). The 2x Grid uses an **8px mini unit**.
- **Tokens are not responsive.** At smaller breakpoints you move one or two steps down, e.g. spacing-05 at 1440px becomes spacing-03 at 768px.
- **Sections may be dense, but the whole page should not be crowded.**
- **Component heights:** button 24 / 32 / 40 / 48 / 64 / 80. Each size pairs with a matching input height (32 or 40). Large (48) "pairs with 14px body copy". Carbon says not to mix button sizes in a group.

**Material Components Web: `@material/density`**, github.com/material-components/material-components-web (packages/mdc-density). The m2 guideline page didn't render.

- **height = default + 4px × scale**, where scale runs 0 down to −3 (e.g. button 36 + 4×(−3) = 24px).
- Default is low density. High density is for lists, tables and long forms, and only on components that support it.

**Atlassian: Spacing**, https://atlassian.design/foundations/spacing. **Design tokens**: https://atlassian.design/foundations/tokens/design-tokens. **Elevation**: https://atlassian.design/foundations/elevation.

- **8px base = `space.100`; the suffix is the percent of the base.** 0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, plus negatives down to −32.
- **Ranges:** 0–8px for compact pieces (icon gaps, badge and cell padding, input padding, trigger→menu gap). 12–24px for larger components. 32–80px for layout.
- **Themes are value swaps under fixed names.** Light, dark and high-contrast are color themes. Cozy, comfortable and compact density, reduced motion and custom type are non-color themes.
- **Names:** foundation.property.modifier (`color.icon.success`). Pick tokens by meaning, never because the value looks right.
- **Elevation:** sunken (no shadow), default (no shadow; flat cards get a border), raised (+ `shadow.raised`), overlay (+ `shadow.overlay`). Never mix a surface and a shadow from different levels. **In dark mode, higher means lighter.** Raised and overlay keep their shadows there too.

**Matt Ström-Awn: "UI density"**, https://mattstromawn.com/writing/ui-density/, 2024-05-20 (also shows May 02, 2025).

- **Density = value delivered ÷ (time + space) used.** It has four lenses: visual, information (Tufte data-ink), design (decisions), temporal.
- **Temporal thresholds:** under 100 ms feels instant, and animation makes it feel slower. 0.1–1 s: bridge with a cue. 1–10 s: indeterminate loader. 10 s–1 min: determinate bar. Over 1 min: let the user leave and notify them.
- **Judge density by audience; don't strip whitespace.** It doesn't specify compact/comfortable modes or spacing values.

#### Shape and depth

**Concentric radius: Jakub Krehel, "Concentric border radius"**, https://jakub.kr/work/concentric-border-radius (no date). "Outer radius equals inner radius plus padding", with no numbers. Community posts I found while searching (not primary) add that the gap includes border width, and that the result should be clamped at 0 when padding exceeds the radius.

**shadcn/ui: Theming**, https://ui.shadcn.com/docs/theming.

- **Every surface token has a `-foreground` partner** (`primary` / `primary-foreground`), and the `background` suffix is dropped. Tokens: background, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart-1…5, sidebar-*.
- **One `--radius` (0.625rem) drives the rest:** sm ×0.6, md ×0.8, lg ×1, xl ×1.4, 2xl ×1.8, 3xl ×2.2, 4xl ×2.6.
- **Dark mode re-points the same names under `.dark`.** Borders become alpha white: border `oklch(1 0 0 / 10%)`, input 15%. Destructive gets lighter (L 0.577 → 0.704).

**Josh W. Comeau: "Designing Beautiful Shadows in CSS"**, https://www.joshwcomeau.com/css/designing-shadows/, 2021-09-13, updated 2026-04-27.

- **One light source, one offset ratio:** y = 2·x, e.g. `4px 8px`. As elevation rises, offset and blur go up and opacity goes down.
- **Layered recipes**, color `hsl(220 60% 50%)`:
  - low: `0.5px 1px 1px` at 0.7
  - medium: 1/2/2, 2/4/4, 3/6/6 at 0.333
  - high: five layers doubling 1/2/2 → 16/32/32 at 0.2
- **Tint the shadow with the background hue at lower saturation and lightness instead of using black**, which grays the surface out.
- Use `filter: drop-shadow` for non-rectangular shapes such as tooltip arrows. Don't animate layered shadows.

**Tobias Ahlin: "Smoother & sharper shadows with layered box-shadows"**, https://tobiasahlin.com/blog/layered-smooth-box-shadows/, 2019-09-19.

- **Five layers with y and blur doubling (1, 2, 4, 8, 16) at a constant 0.12 alpha.** Variants: 4 layers at 0.15, 6 layers (to 32px) at 0.11.
- **Sharp:** alpha falls outward (0.25 → 0.05). **Diffuse:** alpha rises outward (0.08 → 0.20).

**Tailwind v4 shadows** (`theme.css`).

- Two-layer shadows with negative spread: `md = 0 4px 6px -1px / 0 2px 4px -2px`, both at 0.1 black. `xl = 0 20px 25px -5px, 0 8px 10px -6px`.
- Radius: 2, 4, 6, 8, 12, 16, 24, 32px.

#### Dark mode (beyond the above)

**Material Components Android: Dark theme and Color docs.** github.com/material-components/material-components-android, docs/theming/Dark.md and Color.md.

- **M2 elevation overlays** composited translucent `colorPrimary` over the surface, with more alpha at higher elevation, so surfaces got "lighter and more colorful" as they rose. **M3 replaced this with the tonal surface roles** (surfaceContainerLowest…Highest, Dim, Bright; tones listed above), and maintenance of overlays has stopped.

#### Tokens

**Design Tokens Community Group: Format Module 2025.10**, https://www.designtokens.org/tr/2025.10/format/, and **Color Module 2025.10**, https://www.designtokens.org/tr/2025.10/color/. Both dated 2025-10-28.

- **The stable version did ship.** It is a "Final Community Group Report", "considered stable", but not a W3C Standard.
- Format: `.tokens` or `.tokens.json`, media type `application/design-tokens+json`.
- Token fields: `$value` (required), `$type` (inherits from the group), `$description`, `$extensions` (reverse-domain keys), `$deprecated`.
- Types: color, dimension, fontFamily, fontWeight, duration, cubicBezier, number, plus composites strokeStyle, border, transition, shadow, gradient, typography. Tools must not infer a type from a value.
- References: `{group.token}` for a whole value. JSON Pointer `$ref` can reach into a value. Cycles are errors.
- Groups: `$extends` deep-merges another group; `$root` is the group's default token.
- Names can't start with `$` or contain `{ } .`.
- **Dimension:** `{value, unit}` with unit px or rem. **Color:** `{colorSpace, components, alpha?, hex?}`. The colorSpace list includes **oklch, oklab, display-p3**, lch, srgb and others. OKLCH L is 0–1, C ≥ 0 (in practice ≤ 0.5), H 0–360. `none` is allowed as a component. `hex` is an optional 6-digit fallback.

**Nathan Curtis (EightShapes): "Naming Tokens in Design Systems"**, https://nathanacurtis.substack.com/p/naming-tokens-in-design-systems-9e86c7444676, 2020-10-15.

- **Levels:** namespace (system/theme/domain) → object (group/component/element) → base (category/concept/property) → modifier (variant/state/scale/mode). Example: `color-action-background-secondary-hover-on-light`.
- **Scale kinds:** enumerated (1–5), ordered (50–900), bounded (lightness), proportional (2-x, half-x), t-shirt.
- **Rules:**
  - Omit default modifiers unless sibling tokens need them.
  - Theme ≠ mode; the two are orthogonal.
  - Start tokens local and promote one to global once about 3+ components share it.
  - Avoid homonyms: use "font", not "type".
  - Polyhierarchy: when one decision belongs at two levels, alias one token to the other.

**GitHub Primer: Token names**, https://primer.style/product/primitives/token-names/.

- **Name parts:** [prefix]-namespace-[pattern]-[variant]-property-[scale]. Only one variant per token. The property matches a CSS property: `bgColor`, `fgColor`, `borderColor`.
- **Tiers:** base (`base-color-green-5`, a reference only), functional (`bgColor-inset`, `borderColor-default`, `fgColor-muted`, `bgColor-accent-emphasis`) and component/pattern (`button-primary-bgColor-hover`, for component CSS only).

### Recipes

#### Color: inputs and derivation

| System         | Inputs                                         | Steps                   | Lightness rule                             | Contrast rule                                        | Failing brand color                                                   |
| -------------- | ---------------------------------------------- | ----------------------- | ------------------------------------------ | ---------------------------------------------------- | --------------------------------------------------------------------- |
| Radix          | Pick a scale; custom brand is a separate scale | 12                      | Hand-tuned per step                        | 11 = Lc 60, 12 = Lc 90 on step 2                     | Don't edit Radix. Add a brand scale; step-9 text color depends on hue |
| Material (MCU) | 1 source color (+ contrast level)              | 13 tones × 5–6 palettes | Fixed tones per role (40/80, 90/30…)       | 40 tones ≥ 3:1, 50 ≥ 4.5:1; per-role curves by level | Tone moved until the ratio is met; the hue is kept                    |
| Linear         | Base, accent, contrast                         | Not stated              | LCH                                        | Contrast slider (30…100)                             | Limit how much the brand enters the chrome                            |
| Stripe         | Brand hues                                     | Not stated              | Same L curve for every hue (CIELAB)        | ≥ 5 levels apart = 4.5:1; ≥ 4 = 3:1                  | Rebuilt; keep hue and saturation, accept limits                       |
| Ström-Awn      | Hue (+ chroma range)                           | 0–100 (or 1000)         | Solved from the target ratio r = e^(3.04n) | Δ 0.5 of the scale ≥ 4.5:1                           | n/a                                                                   |
| Leonardo       | Key colors, background lightness, ratio list   | One per ratio           | Solved from the ratio                      | The input _is_ the ratio                             | n/a; a global contrast multiplier                                     |
| Harmonizer     | Hues, levels, contrast per level, bg           | e.g. 100–900            | OKLCH; same contrast per level across hues | APCA (or WCAG) per level                             | Chroma is limited per level                                           |
| Tailwind v4    | Fixed palette                                  | 11                      | 97 → ~28 L (OKLCH)                         | Not stated                                           | n/a                                                                   |
| Geist          | Fixed palette                                  | 10                      | n/a                                        | Roles per step                                       | n/a                                                                   |

Step roles that most systems share: 1–2 page/subtle bg → 3–5 component bg rest/hover/active → 6–8 border subtle/default/strong (focus) → 9–10 solid fill + hover → 11–12 text secondary/primary (Radix; Geist is the same in 10 steps).

#### Type

- **Fixed scale (Tailwind):** 12–16–18–20–24–30–36–48…; line height 1.5 at 16, ~1.43 at 14, 1.33 at 24, 1.11 at 36, 1.0 at ≥ 48.
- **Fluid modular scale (Utopia):** base and ratio at two viewports (18 × 1.2 at 360 → 20 × 1.25 at 1240), steps −2…+5, clamp().
- **Tracking:** Inter formula `−0.0223 + 0.185·e^(−0.1745·px)` em, or use `opsz` in Inter 4.

#### Space

- Base 4 (Tailwind 0.25rem) or 8 (Carbon mini unit, Atlassian `space.100`). Both include 2px and 6px/12px half-steps near zero.
- Utopia instead anchors space to type step 0 with multipliers 0.25…6 and adds one-up pairs for fluid padding.

#### Radius

- One input with multipliers (shadcn ×0.6…×2.6) or a fixed ladder (Tailwind 2–32px).
- Nested: inner = outer − padding (− border), clamped at 0.

#### Shadow

| Source   | Layers           | Offsets                 | Alpha                                      | Color                         |
| -------- | ---------------- | ----------------------- | ------------------------------------------ | ----------------------------- |
| Comeau   | 1–5 by elevation | x:y = 1:2, doubling     | 0.7 → 0.333 → 0.2 as layers increase       | Background hue, lower S and L |
| Ahlin    | 4–6              | y = blur, doubling 1…32 | 0.11–0.15 constant, or sharp/diffuse ramps | Black                         |
| Tailwind | 1–2              | Negative spread         | 0.05–0.1 (2xl 0.25)                        | Black                         |
| Geist    | n/a              | n/a                     | Translucent only                           | gray-alpha                    |

#### Dark mode

- **Separate tones, not inversion.** MCU picks a dark tone per role: surface 6, text 90, primary 80, container 30. Radix and Geist re-point aliases to dark scales.
- **Elevation reads by lightness:** surface steps 4 → 6 → 10 → 12 → 17 → 22 → 24 (MCU). Atlassian: higher = lighter, and shadows stay on raised and overlay.
- **Brand gets lighter and less saturated in dark mode.** MCU primary goes from T40 to T80. shadcn destructive L goes from 0.577 to 0.704 with lower C. Linear limits chroma in the chrome.
- **Borders and overlays become alpha white:** shadcn 10–15%, Radix `white-a*`, Tailwind `/10` tints.
- **Leonardo keeps the same ratios against a dark background.**

#### Density

- **Material:** height + 4px × (0…−3).
- **Carbon:** discrete component heights 24/32/40/48, paired with body 14 vs 16. Step spacing down 1–2 tokens at smaller breakpoints.
- **Atlassian:** density as a non-color theme (cozy, comfortable, compact) behind the same token names.
- **Floors:** WCAG 2.5.8 sets 24×24 CSS px minimum targets (or 24px spacing circles); 44 for AAA.

### Tensions

- **WCAG 2 vs APCA.** WCAG 2.2 (4.5 / 3 / 7) is the only stable, legal baseline. APCA's Lc table is finer-grained (size × weight, polarity-aware) and is used by Radix (Lc 60/90) and Harmonizer (default). APCA was dropped from WCAG 3 drafts in 2023, and as of April 2026 the WCAG 3 algorithm is undecided. Somers now points to BridgePCA as a way to satisfy both. MCU and Stripe use WCAG 2 ratios.
- **Color space.** HSL is rejected by every source here.
  - Stripe uses CIELAB.
  - Linear uses LCH.
  - Evil Martians uses OKLCH and shows LCH blues drifting purple.
  - Material uses HCT (CAM16 hue/chroma + L* tone, so tone maps directly to WCAG contrast).
  - Ström-Awn uses OKHsl.
  - Leonardo supports CAM02, LCH and HSLuv, among others.
  - DTCG 2025.10 can store all of them.
- **Hand-tuned vs computed scales.** Radix, Tailwind and Geist are curated, and Radix says not to edit its scales. MCU, Leonardo, Harmonizer and Ström-Awn compute steps from a contrast target, so any hue works. Linear computes from three inputs.
- **Contrast-driven vs lightness-driven steps.** Leonardo, Harmonizer and Ström-Awn solve L from a ratio. Tailwind and Evil Martians' recipes fix L values.
- **Fixed vs fluid.** Carbon says spacing tokens are not responsive (step down at breakpoints). Utopia interpolates everything between two viewports. Material and Carbon density are discrete steps.
- **Shadows.** Comeau wants color-matched shadows. Ahlin, Tailwind and Geist use black or gray alpha. Comeau and Ahlin layer 3–6 shadows; Tailwind uses 1–2.
- **Dark elevation.** Material moved from primary-tinted overlays (M2) to neutral tonal surface roles (M3). Atlassian keeps shadows _and_ lightens surfaces.
- **Brand in neutrals.** Radix matches the gray's hue to the accent. Linear deliberately limits brand chroma in the chrome and moved toward warm gray in 2026. MCU tints neutrals with chroma 4–8 of the source hue.
- **Tracking.** The Inter formula gives a continuous value per px. Tailwind uses fixed em steps. Inter 4 moves the job into `opsz`.

**Notes against installed skills:**

- **apple-design** covers tracking and leading. Inter's opsz and dynamic metrics add numbers to check it against.
- **web-design-guidelines** covers focus. WCAG 2.4.13 adds a measurable focus-ring rule: 2px perimeter, 3:1 change. Radix (step 8) and APCA (Lc 15 minimum for thick outlines) give concrete values for the ring color.
- **ui.sh design** covers shadows. Its guidance should be compared with Comeau's color-matched shadows vs Geist's "translucent, never opaque" rule.

### Not reachable

- **m3.material.io (Material 3 "How the system works")** didn't render because the site is a JS app. I used the material-color-utilities repo docs and source instead.
- **m2.material.io "Applying density"** didn't render (JS app). I used the `@material/density` README instead.
- **Medium (eightshapes-llc) Nathan Curtis article** returned 403. I used the author's Substack copy.
- **rsms.me/inter/dynmetrics/** is a 404 ("no longer exists"). I used the archive at d.rsms.me.
- **utopia.fyi/blog/space-palette/** is a 404. I used "Painting with a fluid space palette".
- **Not read:** the W3C WCAG 3 Working Draft (2026-03-03); APCA/BridgePCA pages newer than the Nutshell doc; Radix's custom palette generator docs; Atlassian's density-theme docs (the only density statements I found are the ones on the token and spacing pages); Primer color contrast docs; the Tailwind v4.0 launch post; the modularscale.com and Tim Brown pages.
- **Gaps:**
  - Stripe gives no level count or values.
  - Jakub Krehel's radius post and Ström-Awn's density post give no numbers.
  - Linear's posts give no numbers.
