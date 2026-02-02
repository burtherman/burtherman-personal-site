# Claude Code Project Context

## Project Overview

Personal website for Burt Herman - a static site showcasing work in journalism, technology, and media innovation. Hosted at burtherman.com via GitHub Pages.

## Tech Stack

- **HTML/CSS/JS**: Vanilla, no frameworks
- **Hosting**: GitHub Pages (static files only)
- **Analytics**: Google Analytics (gtag.js)

## File Structure

```
/
├── index.html          # Single-page site
├── css/style.css       # All styles (dark theme, responsive)
├── js/
│   ├── script.js       # Main site interactions (scroll, modal, gallery)
│   └── invaders.js     # Space Invaders easter egg game
├── images/             # Profile photos and assets
└── CNAME               # Custom domain config
```

## Key Features

### Easter Egg: Space Invaders

Hidden game triggered by clicking the alien icon (bottom-left corner):
- **Desktop**: Arrow keys to move, Spacebar to shoot, ESC/Q to quit
- **Mobile/Tablet**: Drag to move, tap to shoot, tap on game over to quit
- Enemies are a mosaic of the profile photo
- Can also shoot DOM elements on the page

### Design System

- CSS custom properties in `:root` for theming
- `--accent: #22d3ee` (cyan)
- `--bg-dark: #0a0a0a`
- Glass morphism buttons (`.btn-glass`)
- Bento grid layout for content cards

## Development Notes

- No build process - edit files directly
- Test locally with any static server: `python -m http.server 8000`
- CSP headers defined in HTML `<meta>` tag
- Responsive breakpoints: 600px, 768px, 900px

## Common Tasks

**Adding new content cards**: Edit the `.bento-grid` section in index.html. Use classes `span-2-col` or `span-2-row` for larger cards.

**Updating styles**: All in css/style.css. Dark theme colors are CSS variables.

**Modifying the game**: js/invaders.js is self-contained. Event listeners are properly cleaned up on stop().
