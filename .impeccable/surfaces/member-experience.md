---
slug: member-experience
primary_target: route:/account/home
related_targets: ["route:/account", "route:/account/this-month", "route:/account/plan", "route:/account/record", "components/layout/SiteHeader.tsx"]
mode: operate
---

# Member Experience — Coherence Pass ("The Pack System")

Refinement of the existing "The Pack, alive" world. Visual/craft convergence only:
the *look* converges onto one system; product logic, per-kid state, copy, routes,
and metadata are untouched.

## Job & audience
A homeschool **parent** (primary operator) moving between six member surfaces via
the `SiteHeader` member nav: Home · This Month · Library · My Plan · Record · the
shell itself. Mode: **Operate**, with a kid-delight layer carried by the storybook
world. Success = switching between any two surfaces reads as unmistakably one
product, and the whole set feels a notch more crafted than any single screen today.

## The problem (audited July 2026)
The member area spans two visual dialects sitting adjacent in the nav:
- **Storybook "Pack, alive"** (Home, inline styles): centered Dancing Script hero,
  gold-underline divider, warm gradients, hills/pines/fireflies scene, floating
  explorer figure. Home is the *craft bar* but the *token outlier*.
- **Editorial library tool** (Library / `AccountDashboard`, Tailwind utilities):
  `font-display italic` "Your library.", dense filter list, cold `#D8D4C5` borders.

Plus per-surface drift documented in the audit: card fill (`#ffffff` on Home vs
`#fffdf9` elsewhere), eyebrow color/weight/tracking (3 colors, 2 weights, 3
trackings), neutrals (`#efece5`/`#3a352c` on Home vs `#f2efe6`/`#2b2a26`
elsewhere), mixed radii (9/10/12/13/14/16/20), gold underline Home-only, kid
selector as three different metaphors.

## Selected direction — one token system, extracted best-of
Adopt the majority *warm* tokens (the three utility surfaces already share them),
keep Home's signature *motifs* (gold underline, trail, floating explorer), and
propagate those motifs outward. Home converges its tokens toward the warm system;
it does NOT get flattened.

### The Pack System tokens (source of truth: `:root` in `app/globals.css`)
- Neutrals: page `--pack-page #f2efe6` · ink `--pack-ink #2b2a26` · muted `--pack-muted #8a877e`
- Card: fill `--pack-card #fffdf9` · border `--pack-card-border rgba(88,129,87,0.14)` ·
  radius `--pack-radius-card 16px` · shadow `--pack-card-shadow 0 2px 10px -4px rgba(70,55,30,0.12)`
- Eyebrow: DM Sans **700 · 0.14em · uppercase** · `--pack-eyebrow #a9762f`
- Section head: `font-display` forest `#588157`, ~24–28px
- Signature underline: `--pack-underline linear-gradient(90deg,transparent,#d4a373,transparent)` (180×4) under **every** surface H1
- Buttons: primary forest `#588157`/cream, **radius 12**; ghost transparent +
  `1px solid var(--pack-ghost-border rgba(88,129,87,0.35))` + forest, radius 12; small-action radius 10
- Kid selector: one shared pill — selected forest/cream; unselected `#fffdf9` +
  `1.5px solid rgba(61,92,59,0.18)` + `#54524b`, radius 999

## Fork decisions (confirmed by owner)
1. **Library reconciled too** — swap `AccountDashboard` onto the warm Pack tokens
   (cards, eyebrow, borders, neutrals, buttons, gold underline) while keeping it a
   dense filterable Operate list. Its italic "Your library." headline stays.
2. **Light storybook echo everywhere** — Home keeps its full trail + floating
   explorer spike. Plan/Record/This-Month/Library each get the shared `HeroScene`
   backdrop (Home's hand-inlined scene rerouted through the component), the gold
   underline, and one small explorer/footprint motif in the header.
3. **Light shell polish** — the member nav gets a warmer app-shell active state
   (soft forest-tint pill or fuller underline), not the current flat text + dot.

## Scope & boundaries
- **In:** token/pattern convergence + the three fork items across all six surfaces. Visual/craft only.
- **Untouched:** product logic, per-kid state wiring, copy, engine-picks/parent-nudges
  model, gear/effort model, routes, JSON-LD/metadata. No new features, no layout restructuring.
- **Anti-goals:** don't flatten Home's storybook richness; don't invent hues outside
  the brand palette; don't turn the dense Library list into a decorative scene.
- **Preserve:** every existing state (first-run, empty, 1-vs-many kids, trial cap,
  Record print). Standardize the empty-state chip to one warm panel (`#f5f1e8`).

## Platform note
PRODUCT.md records platform = adaptive (Capacitor iOS/Android). This pass is a
web-surface token convergence; genuine per-OS native affordance work is a separate effort.

## Implementation order (highest-leverage first)
1. Shared token layer (`globals.css` `:root` + doc).
2. Home (`PackHome`) — biggest token outlier: cards, neutrals, eyebrow. Keep motifs.
3. Plan / Record / This-Month — eyebrow, neutrals, underline, echo motif, section heads.
4. Library (`AccountDashboard`) — warm cards, eyebrow, borders, underline.
5. Shell (`SiteHeader`) — warmer member-nav active state.
