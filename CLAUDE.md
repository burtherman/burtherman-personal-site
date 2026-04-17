# Claude Code Project Context

## Project Overview

Personal website for Burt Herman — static single-page site at burtherman.com, hosted via GitHub Pages. Editorial tech-leader tone, not SaaS-portfolio.

## Tech Stack

- **HTML/CSS/JS**: Vanilla, no frameworks, no build step
- **Hosting**: GitHub Pages from the `main` branch
- **Fonts**: Self-hosted iA Writer Quattro + iA Writer Mono (variable TTF, SIL OFL licensed — `fonts/LICENSE.md` must travel with the files)
- **Analytics**: Google Analytics (gtag.js, `G-2WK2XFD3ZD`)

## File Structure

```
/
├── index.html          # Single-page site
├── 404.html            # Custom not-found page (GitHub Pages serves for any unmatched URL)
├── css/style.css       # All styles
├── js/
│   ├── script.js       # Modal + mobile-header-bar + copyright year
│   └── invaders.js     # Space Invaders easter egg (self-contained)
├── fonts/              # iA Writer Quattro/Mono variable TTF + SIL OFL license
├── images/             # Profile photos (profile-2.jpg is the active hero)
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
- `--bg-darker: #08070a` — modal content background
- `--text-light: #ebe8e1` — warm paper (primary text)
- `--text-muted: #9a958a` — warm-tinted gray (secondary text)
- `--border: #2a2622` — warm-tinted hairline
- `--font-sans: 'iA Writer Quattro', …` — body + headings
- `--font-mono: 'iA Writer Mono', …` — tagline, card-source labels, dates, footer

**When changing the accent**: verify contrast against `--bg-dark` hits **≥ 4.5:1** for small text (WCAG AA). Cold-palette accents (cyan/indigo/purple) will read as AI-synthwave — keep the palette warm.

## Key Sections in `index.html`

- **Hero**: single profile photo + H1 name + tagline (`Co-founder, Hacks/Hackers · Brooklyn, NY`) + short bio + Full Bio modal trigger
- **Recent writing**: one featured piece (bordered block with kicker/title/dek/CTA) + archive list (`<ol class="writing-list">` with rows laid out as `date | title | source` via CSS grid)
- **Work with me**: contact CTA section with Email/LinkedIn SVG buttons + Hacks/Hackers link
- **Footer**: copyright + location, mono small-caps

## Easter Egg: Space Invaders

Bottom-left alien button (`#startInvaders` with `title="Play Space Invaders"`). Game is self-contained in `js/invaders.js`.
- **Desktop**: arrow keys to move, space to shoot, ESC/Q to quit
- **Mobile**: drag to move, tap to shoot
- Enemies are a pixelated mosaic of `images/profile-2.jpg`
- Can also shoot DOM elements (selector: `h1, h2, h3, p, img, a, button:not(#startInvaders), .writing-featured, .writing-item`)

## Development Commands

```bash
# Serve locally
python3 -m http.server 8765
# then http://localhost:8765 (and /does-not-exist for 404 preview)

# Font license — do not delete
# fonts/LICENSE.md (SIL OFL 1.1 for iA Writer)
```

Responsive breakpoints: **600px** (writing archive goes single-column), **768px** (mobile layout engages). No 900px breakpoint since the bento grid was removed.

## Common Tasks

**Adding a new writing/talk link**: Edit the `<ol class="writing-list">` in `index.html`. New items go at the top (reverse chronological). The pattern:

```html
<li class="writing-item">
    <a href="URL" target="_blank" rel="noopener noreferrer">
        <time class="writing-date">Mon YYYY</time>
        <span class="writing-title">Title of the piece</span>
        <span class="writing-source">Source name</span>
    </a>
</li>
```

**Promoting a new featured piece**: Swap the `.writing-featured` anchor's `href`, source (`.source`), date (`<time>`), title (`.writing-featured-title`), dek (`.writing-featured-dek`), and CTA label. Demote the old featured piece to the first `<li>` in the archive list.

**Updating bio**: short bio around line 133 in `index.html`; full bio in the modal below.

**Changing profile photo**: update references in `index.html` (hero `<img>`, favicon, apple-touch-icon, preload, `og:image`, `twitter:image`, JSON-LD `image`), `404.html` (favicon), and `js/invaders.js` (game sprite). All seven paths must agree.

**Modifying the game**: `js/invaders.js` is self-contained. Event listeners are cleaned up on `stop()`.

## Design Non-Negotiables

These are the lessons from the April 2026 redesign — re-introducing them would walk the site back toward generic AI aesthetics:

- **Do not** re-add scroll-reveal animations on every block, magnetic buttons, gradient glows, glassmorphism (the `.btn-glass` class name is retained but the actual `backdrop-filter` blur is gone on purpose), scroll progress bar, back-to-top button, or sticky-shrink header.
- **Do not** re-introduce tri-stop gradients (`cyan → indigo → purple` is the #1 AI-synthwave tell of 2024–2025). Single-hue accents only.
- **Do not** re-build the bento grid. 10 near-equal tiles flatten hierarchy; an editorial list with real typography is the correct shape for a writer's index.
- **Do not** use Inter, Roboto, Open Sans, Montserrat, or similar overused fonts. iA Writer Quattro/Mono is the chosen pair.
- **Do not** use pure `#000000` or `#ffffff` anywhere. Neutrals carry a warm tint to match the accent temperature.
- **Do not** skip heading levels. The bento grid used to jump from `<h2>` section to `<h4>` card titles — card titles are now `<h3>` to preserve the outline for screen readers.

## SEO & Meta

Maintain consistency across `<title>`, meta description, Open Graph, Twitter card, and JSON-LD when updating bio or role. Current tagline (`Co-founder, Hacks/Hackers · Brooklyn, NY`) is mirrored in the `jobTitle` field of the Person schema.

## CSP

Content-Security-Policy is declared via `<meta>` in each HTML file. Self-hosted fonts mean `font-src 'self'` — no third-party font origins. If re-adding a Google Font (not recommended), the CSP must be updated in both `index.html` and `404.html`.
