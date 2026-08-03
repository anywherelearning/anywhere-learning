# Design — The Adventure Map (member experience)

<!-- impeccable:design-schema 1 -->

The visual world for the Anywhere Learning member experience, replacing the prior
"Pack, alive" storybook look (July 2026 redesign). Product truth is unchanged:
parent-led expedition, engine-picks/parent-nudges, the explorer/gear/trail world,
and all per-kid data and function are preserved. See PRODUCT.md. Established on
Home first, then rolled across the other member surfaces.

(An earlier "Field Study" specimen-plate direction was built and rejected; the
committed world is now The Adventure Map.)

## Thesis

The member Home is a **hand-illustrated adventure map you are traveling**, not a
dashboard. The child's explorer is a **token on a winding trail**; completed
activities are **waypoints behind them** (visited, gear collected); the next
activity is the **glowing stop just ahead**, reached via a trail signpost. It
refuses the category default it replaced: a centered headline over balanced cards
on a flat ground. The composition IS a journey across terrain.

## Palette — illustrated, saturated terrain (NOT flat cream)

Warm map-paper base carrying SATURATED illustrated terrain: forest, water, hills,
sky. Cream is never a flat empty ground here; it is the paper the map is printed on.

- `--am-paper` #ece0c2 — map paper base
- `--am-sky` #cfe1e6 — top sky band
- `--am-forest` #4f7a4a / `--am-forest-deep` #3c6338 — tree/forest masses
- `--am-water` #7bb0c9 — rivers, lakes
- `--am-hill` #cdb885 / `--am-hill-2` #b8a06a — terrain bands
- `--am-trail` #b5763a — the trail route
- `--am-ink` #3a2c17 — map ink / labels
- `--am-flag` #c2492e — waypoint flags, "next" marker, primary action
- `--am-gold` #d99a3c — collected-gear pins, compass, accents

## Type

Dancing Script is retired. Faces (loaded in `app/layout.tsx`):

- `--font-plate` Bricolage Grotesque (600–800) — the map title / cartouche, headers.
- `--font-catalog` JetBrains Mono — coordinates, distances, waypoint numbers, legend.
- `--font-body` DM Sans — running body and signpost copy.

## Composition rules

- **A full-bleed illustrated map is the hero**, edge to edge. Chrome (kid tabs,
  title cartouche, compass rose, legend, signpost) sits as overlays on the terrain.
- **The trail is a bold dashed route** winding across the map through fixed stops.
- **Explorer token** = the kid's `ExplorerFigure` at a "YOU ARE HERE" marker.
- **Visited waypoints** (completed activities) sit behind the token as landmark
  pins carrying the gear icon earned there; the trail behind is solid/traveled.
- **Next stop** is a glowing flag ahead; a **trail signpost card** carries the
  next activity title and the primary action ("Open the guide" / "We did this",
  which advances the token).
- **Compass rose** and a small **legend/scale** are map ornament, not decoration
  for its own sake.

## Motion & craft

- The token advances the trail on log; a waypoint stamps in; the route draws.
  Respect `prefers-reduced-motion`.
- Contrast floor holds: ink `#3a2c17` on paper passes; label text on terrain uses
  a paper chip behind it where terrain would drop contrast below 4.5:1.
- Depth via real shadow (offset + blur). Flat illustration is the world's grammar,
  so terrain shapes are flat by intent; UI cards still carry real elevation.

## Scope / status

Home (`components/account/AdventureMapHome.tsx`) is the first build. The prior
`--pack-*` token system, the rejected `--fs-*` tokens, and the old surfaces
remain until this world is approved and rolled out. Do not delete them yet.
