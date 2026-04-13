# Cartoonish Lab Rooms Design

**Date:** 2026-04-13  
**Status:** Approved

## Overview

Transform the game's visual style to cartoonish lab rooms with PixiJS 2D rendering. Each room should be visually unique with realistic-looking PNG assets created programmatically.

## Visual Style

### Color Palette by Level
1. **Password Security:** Blue/teal (#00B4D8 walls, #0077B6 floor)
2. **Phishing Detection:** Purple (#7B2CBF walls, #5A189A floor)
3. **Encryption:** Green (#2D6A4F walls, #1B4332 floor)
4. **Network Defense:** Orange (#F77F00 walls, #E65100 floor)
5. **Final Escape:** Red (#D62828 walls, #9D0208 floor)

### Aesthetic
- Cartoonish but realistic textures
- Flat colors with subtle gradients/shadows
- Professional lab feel
- Darkindustrial base with colorful accents

## Objects per Room (7-8 items)

### Interactive (kept from current)
- **PC** - Main computer terminal (center of room)
- **Door** - Exit door (right wall)

### Non-interactive (new)
- **Table** - Work table (near PC)
- **Desk** - Control desk
- **Chair** - Office chair
- **Lamp** - Desk lamp (glowing)
- **Server rack** - Server machine
- **Crates** - Storage boxes
- **Machine** - Lab equipment

### Wall decorations
- Pipes, conduits, screens

## Implementation

### Tech Stack
- **Rendering:** PixiJS 2D (WebGL)
- **Assets:** PNG images (programmatically created → saved → loaded as textures)
- **Game Engine:** Updated from Canvas 2D to PixiJS

### Approach
1. Add PixiJS via CDN to index.html
2. Rewrite draw functions to create PNG assets
3. Load assets as PixiJS textures
4. Each room: unique floor + wall textures
5. Layer order: floor → walls → objects → UI

### File Changes
- `index.html` - Add PixiJS CDN
- `js/game.js` - PixiJS Application setup, texture loading
- `images/` - New PNG assets per level

## Acceptance Criteria
- [ ] PixiJS rendering working
- [ ] 5 unique room colors/themes
- [ ] 7-8 objects per room (programmatic PNGs or drawn)
- [ ] Floor image per level (or single tiled)
- [ ] All interactive objects still work (PC, door)
- [ ] Cartoonish lab aesthetic achieved