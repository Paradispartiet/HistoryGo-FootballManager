# Responsive tactics board v1 — reference-inspired UI

Design target: a compact three-column tactics screen on landscape iPad/desktop, with the **actual editable lineup** on the left, a **clearly labelled static formation reference** in the center and a **real-player-derived shortlist** on the right. Registered bench buttons are relocated below the grid without replacing their existing click handlers.

## Sources and interaction

- The editable pitch continues to be the existing #lineupSlots, including pointer-based movement and exchanges.
- The central pitch mirrors **exactly the chosen formation and positions**, but is not a second tactical engine. It never claims to calculate pressing shape, off-ball rotations, probabilities or phase changes. Its label explains this.
- The right-hand list reads player name, position, role and qualitative fit directly from the source pitch, opens the existing profile via the established player-profile event and links to the full Tropp view.
- Existing #benchPlayersList DOM is **moved**, not copied. The authoritative app.js event handlers and save-state remain attached.
- Existing selected-slot inspector remains accessible below the grid.
- The existing Lag/Tropp/Systemet/Trening structure is unchanged. No overall stars or invented player ratings are introduced.

## Responsive contract

- Width 980px and above: three columns, source pitch + static phase reference + starting eleven, followed by horizontal substitutes rail.
- Below 980px in portrait: large buttons switch between the three views, one main panel at a time.
- Phone-sized landscape: show source/phase pitch next to player list, with a switch between pitch references. Preserve touch targets and allow vertical scrolling rather than shrinking text until it is illegible.
- No fixed landscape-only viewport, forced orientation, direct pixel scaling, new storage key or secondary data engine.
- Native keyboard focus, reduced-motion and safe horizontal bench scrolling remain available.

## Follow-up scope (not implemented by this v1)

The design reference shows two genuinely different in-possession and out-of-possession shapes. That requires a phase-level transformation from authoritative tactical data, not visual invention. A later PR can add it once existing models and formation metadata are mapped and tested. No in-game ability stars or generic average ratings should be invented to imitate the reference screenshot.

## Verification

Browser spec: tests/browser/manager-tactics-responsive-v1.spec.js. Cover landscape iPad, portrait phone, landscape phone, mirroring 11 real positions, original bench node and existing player profile. Run existing lineup, drawer and manager-shell regressions before merging.
