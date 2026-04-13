# Colorful Rooms Design

**Date:** 2026-04-12  
**Status:** Approved

## Overview

Transform the game's visual style from a bland black/grey industrial theme to vibrant, colorful rooms inspired by Among Us floor plans, featuring decorative non-interactable objects.

## Visual Style

### Color Palette (Among Us Inspired)
- **Level 1 (Password Security):** Teal/Cyan walls (#00B4D8), Orange accent (#FF9F1C)
- **Level 2 (Phishing Detection):** Purple walls (#7B2CBF), Pink accent (#FF006E)
- **Level 3 (Encryption):** Green walls (#2D6A4F), Gold accent (#FFD166)
- **Level 4 (Network Defense):** Blue walls (#3A86FF), Red accent (#EF476F)
- **Level 5 (Final Escape):** Mixed colors, Rainbow accent

### Room Elements
- **Walls:** Vibrant solid colors with subtle gradient
- **Floor:** Darker shade of wall color with grid pattern
- **Baseboards:** Dark trim around floor edges
- **Doors:** Matching accent color with frame

### Decorative Objects (Non-interactable)
Each room contains 8-12 small objects:
- **Furniture:** Chairs, tables, lamps, plants, bookshelves
- **Electronics:** Servers, routers, monitors, keyboards
- **Props:** Boxes, bins, posters, clocks, phones
- **Environment:** Pipes, vents, cables on walls

All objects are drawn with flat colors and simple shapes (rectangles, circles).

## Implementation

### Changes to `js/game.js`
1. Add level-specific color definitions to each level object
2. Update `drawRoom()` to use colorful backgrounds with grid floors
3. Add decorative objects to `initLevel()` for each level
4. Create drawing functions for each decorative object type

### Object Drawing Approach
- Use simple shapes (rects, circles, lines)
- No images required - all drawn with canvas
- Objects have varied colors matching room theme
- Layer objects behind interactive objects

## Acceptance Criteria
- [ ] Each level has unique wall/floor colors
- [ ] Rooms contain 8+ decorative objects
- [ ] All decorative objects are non-interactable
- [ ] Visual style is vibrant and colorful, not dark/grey
- [ ] Among Us-inspired flat, bright aesthetic achieved