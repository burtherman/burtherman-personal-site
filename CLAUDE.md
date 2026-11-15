# Claude Code Project Context

## Project Overview

Personal website for Burt Herman — static single-page site at burtherman.com, hosted via GitHub Pages. Editorial tech-leader tone, not SaaS-portfolio.

## Tech Stack

- **HTML/CSS/JS**: Vanilla, no frameworks, no build step
- **Hosting**: GitHub Pages from the `main` branch
- **Fonts**: Self-hosted iA Writer Quattro + iA Writer Mono (variable WOFF2 with TTF fallback, SIL OFL licensed — `fonts/LICENSE.md` must travel with the files). Regenerate with `fonttools ttLib.woff2 compress <file>.ttf` if the TTFs ever change.
- **Analytics**: Google Analytics (gtag.js, `G-2WK2XFD3ZD`)

## File Structure

```
/
├── index.html          # Single-page site
├── 404.html            # Custom not-found page (GitHub Pages serves for any unmatched URL)
├── css/style.css       # All styles
├── js/
│   ├── script.js       # GA bootstrap + <dialog> modal + mobile-header-bar + copyright year + invaders trigger
│   └── invaders.js     # Space Invaders easter egg (self-contained)
├── fonts/              # iA Writer Quattro/Mono variable WOFF2 + TTF fallback + SIL OFL license
├── images/             # Profile photos (profile-4.jpg is the active hero) + favicon.svg (pixel alien) + og-card.png (1200×630 social card)
├── index.md            # Markdown copy of the page for AI agents — generated, don't hand-edit
├── llms.txt            # Pointer file for AI agents (hand-written)
├── tools/make_md.py    # Regenerates index.md from index.html
├── .nojekyll           # Makes GitHub Pages serve .md files as-is — do not delete
├── CNAME               # Custom domain config — do not delete
├── .gitignore
├── README.md           # Public repo readme
└── CLAUDE.md           # This file
```

## Design System

Tokens in `:root` at the top of `css/style.css`:

- `--accent: #d94f48` — masthead red (WCAG AA passes 4.86:1 on `--bg-dark`)
- `--accent-soft: rgba(217, 79, 72, 0.22)` — focus-ring glow
- `--bg-dark: #0c0a08` — warm near-black (page background)
- `--bg-darker: #090807` — modal content background
- `--radius: 10px` — one corner radius for buttons, the modal and the skip link
- `color-scheme: dark` on `:root` — keeps native scrollbars dark
- `--text-light: #ebe8e1` — warm paper (primary text)
- `--text-muted: #9a958a` — warm-tinted gray (secondary text)
- `--border: #2a2622` — warm-tinted hairline
- `--font-sans: 'iA Writer Quattro', …` — body + headings
- `--font-mono: 'iA Writer Mono', …` — tagline, card-source labels, dates, footer

**When changing the accent**: verify contrast against `--bg-dark` hits **≥ 4.5:1** for small text (WCAG AA). Cold-palette accents (cyan/indigo/purple) will read as AI-synthwave — keep the palette warm.

## Key Sections in `index.html`

- **Layout**: one left-aligned 780px column (`.container > header, main, footer`) carries everything. Don't re-centre the hero, contact section or footer
- **Hero**: a masthead. Red kicker rule (`header::before`, the same mark as the social card), then the H1 name and tagline (`Co-founder, Hacks/Hackers`) on the left with a 128px profile photo on the right. The portrait faces left, so it goes on the right to look into the text. The masthead row and `.bio-short` both run the full column width, so the photo, the bio text and the section hairlines share one right edge; don't give either a narrower `max-width`. The short bio opens with a wire-style dateline (`.dateline`, `Brooklyn, N.Y. —`), which is where the location lives on the page, then the Full Bio modal trigger
- **Datelines** (datelines.burtherman.com, AP stories and the passport) is personal, not a project: its link is the second paragraph of the short bio and stays there permanently. It is also linked from the AP paragraph of the full bio
- **Section labels**: every `<h2>` on the page (`.writing-heading`) is a small mono-caps label with a hairline running to the column edge, so the piece titles are the largest type in each section. The first `.writing-featured` after a label drops its own top border, and the last one in a section drops its bottom border, so no two hairlines sit back to back
- **Writing and talks** (the heading; the list mixes written pieces and videos): up to two stacked featured pieces (bordered blocks with kicker/title/dek/CTA; adjacent blocks share one hairline via the `.writing-featured + .writing-featured` rule) + archive list (`<ol class="writing-list">` with rows laid out as `date | title | source` via CSS grid). Rows from the current and previous year stay visible; older rows live in a second `<ol class="writing-list">` inside `<details class="writing-more">`. Update the year range and the count in its `<summary>` when rows move. Video rows use `Video` as the source, not the host. Hacks/Hackers pieces carry no source label, on rows or on featured pieces (the masthead already says it); only outside publications and `Video` get one
- **Projects**: no section at the moment. It was dropped in November 2026 because its only entry, Voter Guide Commons, repeated the top featured piece. To bring it back, add a `<section class="section writing">` after Writing and talks with an `<h2 class="writing-heading">` and one `.writing-featured` block per project (same markup as a featured piece, with who it is for in `.source`)
- **Work with me**: contact CTA section with Email/LinkedIn SVG buttons
- **Footer**: copyright and a `Markdown` link to `index.md`, on one line, mono small-caps (location lives in the bio dateline, don't repeat it). Right-aligned under 768px so it clears the alien button

## Easter Egg: Space Invaders

Bottom-left alien button (`#startInvaders` with `title="Play Space Invaders"`) or the Konami code (↑↑↓↓←→←→BA, handled in `js/script.js`). Game is self-contained in `js/invaders.js`.
- **Desktop**: arrow keys to move, space to shoot, ESC/Q to quit
- **Mobile**: drag to move, tap to shoot
- Enemies are a pixelated mosaic of `images/profile-4.jpg`
- Can also shoot DOM elements (selector: `h1, h2, h3, p, img, a, button:not(#startInvaders), .writing-featured, .writing-item`); wiping every element off the page awards a one-time `SITE DESTROYED +1000` bonus
- A UFO mystery ship (masthead-red pixel saucer, warbling siren) crosses the top every 12–20s; shooting it awards a random 50/100/150/300 bonus shown as a floating score popup
- 3 lives with 1.5s of blinking invulnerability after a hit; reserve bows drawn bottom-left. An invader physically reaching the player is still instant game over
- 4 destructible bunkers (3 on screens <500px) erode pixel-by-pixel from shots on both sides; descending invaders grind them away; rebuilt each level
- The game-over screen opens with a wire bulletin (`composeBulletin()`): a `BULLETIN` slug and a one-sentence dispatch with the `BROOKLYN, N.Y. —` dateline, the day of the week, level and score, with a variant when the page was wiped. Name entry and high scores sit below it; keep the dispatch short enough to stay at six lines on a phone
- Page content overlapping the bottom gameplay strip (bunkers/ship/lives, bottom ~190px) is hidden via `clearArenaZone()` when play begins and restored on quit

## Development Commands

```bash
# Serve locally
python3 -m http.server 8765
# then http://localhost:8765 (and /does-not-exist for 404 preview)

# Font license — do not delete
# fonts/LICENSE.md (SIL OFL 1.1 for iA Writer)
```

Responsive breakpoint: **768px** (mobile layout engages; writing archive goes single-column). The only 600px breakpoint lives in `404.html`'s inline styles. No 900px breakpoint since the bento grid was removed.

## Common Tasks

**Adding a new writing/talk link**: Edit the first `<ol class="writing-list">` in `index.html`. New items go at the top (reverse chronological). The pattern:

```html
<li class="writing-item">
    <a href="URL" target="_blank" rel="noopener noreferrer">
        <time class="writing-date" datetime="YYYY-MM">Mon YYYY</time>
        <span class="writing-title">Title of the piece</span>
        <span class="writing-source">Source name</span>
    </a>
</li>
```

**Linking an archive row to its project**: add a second link after the row's main `<a>`, inside the same `<li>`: `<a href="…" class="writing-cta writing-item-project">See the demo →</a>`. It sits under the title.

**Promoting a new featured piece**: There are up to two featured slots, newest first. Add or swap a `.writing-featured` `<article>` (source `.source`, date `<time>`, title link inside `.writing-featured-title`, dek `.writing-featured-dek`, and a `.writing-featured-links` row). The block itself is not a link: the title links to the piece, the first `.writing-cta` repeats that link (`tabindex="-1" aria-hidden="true"`) and an optional second `.writing-cta` links to the project the piece describes. This replaced the Projects section. When a piece rotates out of the featured slots, demote it to its chronological spot in the archive list.

**Updating bio**: short bio around line 120 in `index.html`; full bio in the modal below. The modal is a native `<dialog>` (`#bioModal`) opened with `showModal()` in `js/script.js` — focus trapping, ESC, and background inerting come free from the browser; don't re-add manual focus-trap code.

**Changing profile photo**: update references in `index.html` (hero `<img>`, JPEG fallback favicon, apple-touch-icon, preload, `og:image`, `twitter:image`, JSON-LD `image`), `404.html` (JPEG fallback favicon), and `js/invaders.js` (game sprite). All paths must agree. The primary favicon (`images/favicon.svg`, the pixel alien) doesn't change with the photo.

**Modifying the game**: `js/invaders.js` is self-contained. Event listeners are cleaned up on `stop()`.

## Design Non-Negotiables

These are the lessons from the April 2026 redesign — re-introducing them would walk the site back toward generic AI aesthetics:

- **Do not** re-add scroll-reveal animations on every block, magnetic buttons, gradient glows, glassmorphism (the `.btn-glass` class name is retained but the actual `backdrop-filter` blur is gone on purpose), scroll progress bar, back-to-top button, or sticky-shrink header.
- **Do not** re-introduce tri-stop gradients (`cyan → indigo → purple` is the #1 AI-synthwave tell of 2024–2025). Single-hue accents only.
- **Do not** re-build the bento grid. 10 near-equal tiles flatten hierarchy; an editorial list with real typography is the correct shape for a writer's index.
- **Do not** use Inter, Roboto, Open Sans, Montserrat, or similar overused fonts. iA Writer Quattro/Mono is the chosen pair.
- **Do not** use pure `#000000` or `#ffffff` anywhere. Neutrals carry a warm tint to match the accent temperature.
- **Do not** skip heading levels. The bento grid used to jump from `<h2>` section to `<h4>` card titles — card titles are now `<h3>` to preserve the outline for screen readers.

## Agent-readable copy

`index.md` is a Markdown copy of the page (bio, full bio, every writing and video link, contact) and `llms.txt` points agents to it. `index.html` advertises it with `<link rel="alternate" type="text/markdown">`.

**After any content change to `index.html`, regenerate the copy** and commit both files together:

```bash
python3 tools/make_md.py > index.md
```

The script reads the page's own markup (`.bio-short`, `.writing-featured`, `.writing-item`, the bio modal, the contact section), so new rows need no extra work. If those class names change, update the script. Edit `llms.txt` by hand only when the linked sites change. `.nojekyll` must stay: without it GitHub Pages turns `.md` files into HTML pages.

## SEO & Meta

Maintain consistency across `<title>`, meta description, Open Graph, Twitter card, and JSON-LD when updating bio or role. The visible tagline (`Co-founder, Hacks/Hackers`) is mirrored in the `jobTitle` field of the Person schema; the social card and `og:image:alt` still carry the longer `Co-founder, Hacks/Hackers · Brooklyn, NY`.

The social card (`og:image`/`twitter:image`) is `images/og-card.png`, a 1200×630 dark editorial card rendered with the site fonts and palette (name, tagline, domain, pixel alien). If the name/tagline changes, regenerate it — PIL script pattern: render text with `fonts/iAWriterQuattroV.ttf`/`iAWriterMonoV.ttf` on `--bg-dark` with the `--accent` kicker rule. JSON-LD `image` stays the profile photo (it describes the person, not the page).

## CSP

Content-Security-Policy is declared via `<meta>` in each HTML file. Self-hosted fonts mean `font-src 'self'` — no third-party font origins. If re-adding a Google Font (not recommended), the CSP must be updated in both `index.html` and `404.html`.

Cloudflare Web Analytics is on for the zone and Cloudflare injects its beacon into every page, so `script-src` in both files allows `https://static.cloudflareinsights.com`. The beacon reports to the site's own `/cdn-cgi/rum`, which `connect-src 'self'` covers.

`script-src` carries no `'unsafe-inline'`: **inline `<script>` blocks and `onclick=`-style attributes are blocked** — all JS must live in external files (the GA bootstrap is in `js/script.js`). `index.html`'s `style-src` also has no `'unsafe-inline'`, so no `style=""` attributes there either (JS styling via CSSOM, e.g. `el.style.x = …`, is fine and is what `invaders.js` uses). The JSON-LD block is a data block, not a script, so CSP doesn't apply to it. Cache-busting: bump the `?v=` query on `style.css`, `script.js`, and `invaders.js` together when shipping changes.
