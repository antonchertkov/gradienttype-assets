# gradienttype-assets

Files for the **GradientType** creative tool, embedded on chertkov.design/tools/gradient-type.
Same deployment pattern as `calfont-assets`: self-contained scripts on GitHub, served
through the jsDelivr CDN, embedded natively into a Webflow page (no iframe, no backend).

## What loads at runtime (root of this repo)

| File | Role |
|------|------|
| `three.min.js` | 3D library (vendor). Needed for the "Carve" relief view. |
| `RoomEnvironment.js` | three.js lighting environment (vendor). |
| `SVGLoader.js` | three.js SVG loader (vendor). |
| `gradienttype-engine.js` | **The tool itself** — styles, markup, logic and 3D, all in one isolated bundle. |

The Webflow page loads these four files (in this order) plus one `<div id="gt-root">`.
That's it. See `gradienttype-embed.html` for the exact snippet.

## Isolation (why this is safe to drop onto a live page)

The tool shares the page with Webflow's own code, so the engine is built to not collide:

- All JavaScript is wrapped in a single private scope (IIFE) — no global variables leak out.
- All styles are scoped under `#gt-root` and every class is prefixed `gt-`, so the tool's
  CSS can't touch the rest of the page, and the page's CSS can't touch the tool.
- The tool mounts into `#gt-root` and injects its own markup and styles.

**One caveat:** the tool still uses a handful of plain element `id`s internally
(`board`, `color`, `angle`, `bg`, `rows`, `cols`, …). Don't give other elements on the
same Webflow page those same ids.

## Versioning (how updates work)

The Webflow embed pins every script to a git tag (e.g. `@v1`). The live tool never
changes until the embed is pointed at a new tag. To publish an update:

1. Change the files here and push to `main`.
2. Tag the new version: `git tag v2 && git push origin v2`
3. In the Webflow embed, change `@v1` → `@v2` on all four `<script>` lines and re-publish.

This sidesteps jsDelivr's caching entirely — each tag is a permanent, immutable URL.

## /source (reference only — not loaded at runtime)

- `index.original.html` — the original single-file tool as authored.
- `gl.js`, `carvegl.js` — the two 3D helper files, now bundled into `gradienttype-engine.js`.

## Local preview

Open `index.html` from a local web server (e.g. `python3 -m http.server`) — it uses the
same embed pattern pointed at the local files.
