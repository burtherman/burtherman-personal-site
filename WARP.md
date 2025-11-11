# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Personal website for Burt Herman - a single-page HTML site showcasing work at the intersection of journalism, technology, and media innovation. The site is deployed via GitHub Pages with a custom domain (burtherman.com).

## Architecture

### Single-File Structure
- **index.html**: Self-contained HTML file (~725 lines) with embedded CSS and JavaScript
  - No build process, frameworks, or dependencies
  - All styles defined in `<style>` tag (lines 85-569)
  - Inline JavaScript for modal and scroll interactions (lines 664-724)
  - Uses Google Fonts (Poppins) as the only external resource

### Key Components
1. **Sticky Header**: Animated header that shrinks on scroll, showing large profile image at top
2. **Bio Section**: Short bio with expandable modal for full biography
3. **Links Section**: Chronologically ordered writing samples and media appearances
4. **Contact Section**: Email and LinkedIn links with pre-filled email templates
5. **Mobile Responsive**: Separate mobile header bar that appears on scroll

### Design System
- Dark theme (`--bg-dark: #0a0a0a`) with cyan accents (`--accent: #22d3ee`)
- Responsive breakpoint at 768px for mobile
- Animation: fadeIn on page load, smooth transitions on scroll

## Development Commands

### Preview Locally
```bash
# Serve with Python's built-in server
python3 -m http.server 8000
# Then visit http://localhost:8000
```

```bash
# Or use any static file server
npx serve .
```

### Deploy
Changes are deployed automatically via GitHub Pages when pushed to the `main` branch. No build step required.

### View Changes
```bash
git --no-pager log --oneline -10
git --no-pager diff
```

## Content Guidelines

### Adding New Links/Writing
New links should be added to the "Recent writing and other links" section (around line 601-619) in **reverse chronological order** (newest first). Format:
```html
<p style="margin: 12px 0;">
  <span style="color: var(--accent);">•</span> 
  <span style="color: var(--text-muted); margin-left: 8px; font-size: 0.9rem;">Source:</span> 
  <a href="URL" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: underline; margin-left: 6px; font-size: 1rem;">Title</a> 
  <span style="color: var(--text-muted); font-size: 0.85rem;">(Date)</span>
</p>
```

### Updating Bio
- **Short bio**: Line 592 (visible on main page)
- **Full bio**: Lines 627-633 (in modal)

### Images
Images stored in `/images/` directory:
- `profile.jpg`: Main profile photo used in header and meta tags
- `mountain.jpeg`: Currently unused asset

## SEO & Meta
The site includes comprehensive SEO optimization:
- **Structured Data**: JSON-LD schema for Person (lines 45-83)
- **Open Graph**: Full OG and Twitter card meta tags (lines 18-33)
- **Google Analytics**: GA4 tracking with ID G-2WK2XFD3ZD (lines 36-42)
- **Content Security Policy**: Defined in meta tag (line 6)

When updating SEO content, maintain consistency across:
1. `<title>` tag
2. Meta description
3. Open Graph tags
4. Structured data JSON-LD

## Important Notes

- The site uses inline styles throughout - do not attempt to extract to separate CSS file without understanding the deployment implications
- All external links use `target="_blank" rel="noopener noreferrer"` for security
- Email links include pre-filled subject and body parameters
- The CNAME file is critical for custom domain - never delete
- Mobile detection uses `window.innerWidth <= 768` breakpoint
