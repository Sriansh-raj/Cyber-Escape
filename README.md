# Cyber Escape: Hacker's Edition

An interactive 2D cybersecurity escape room game with puzzles, exploration, and unique room visuals.

## Overview

Navigate through a dark industrial facility using WASD + mouse controls. Explore 5 distinct rooms, interact with computer terminals to solve cybersecurity puzzles, collect keys, and unlock doors to escape.

## Game Features

- **First-Person Exploration**: WASD to move, (.) to skip level
- **Custom Character**: Pixelated character image (110x60 px) visible on screen
- **Interactive Rooms**: Walk around and interact with objects
- **5 Progressive Levels**: Each unlocks after completing the previous
- **Puzzle System**: Solve cybersecurity questions on PC terminals
- **Key Collection**: Collect keys to unlock exit doors
- **UI Elements**:
  - Minimap (top-right) showing room layout and position
  - Inventory (bottom-left) showing collected items
  - Objective text (bottom-center)
  - Skip Level button (top-left)
- **Skip Level**: Press (.) or click button to skip levels
- **Sound Effects**: Audio feedback for interactions
- **Floating Background Particles**: Stars/dots wandering freely in each room
- **Victory Screen**: Animated floating spheres (same as start screen)

## Visual Style

- Dark industrial facility theme (gray/charcoal walls)
- Floor texture: `images/floor_2.png`
- Realistic gradient-based objects:
  - Terminal (pc_tower) - dark case with green LED lights
  - Monitor - screen with dark blue display and stand
  - Desk - wood-textured with legs
  - Box - cardboard crate with corner flaps
  - Server Rack - rack-mount with status LEDs
  - Storage Shelf, Lamp, Chair
- Muted cyan/amber/red accents - eye-friendly, not harsh neon
- Floating animated background shapes on start and victory screens
- Custom cursor: visible on start, puzzle, and victory screens; hidden during gameplay

## Object Placement

Each room contains objects placed in corners (not clustered in center):
- **Terminal (interactive)**: Center of room
- **Workstation**: Top-left corner
- **Screen**: Bottom-right corner
- **Supply Crate**: Bottom-left corner
- **Server Rack**: Top-right corner
- **Storage Shelf**: Upper-left wall area
- **Exit Door**: Right wall

## Controls

| Key | Action |
|-----|--------|
| W | Move up |
| A | Move left |
| S | Move down |
| D | Move right |
| E | Interact with objects |
| . | Skip current level |

## Levels

| Level | Topic | Puzzle Type | Key Reward |
|-------|-------|-------------|------------|
| 1 | Password Security | Yes/No questions | Blue Keycard |
| 2 | Phishing Detection | Identify phishing emails | USB Drive |
| 3 | Encryption | Decode Caesar cipher (text input) | Encryption Key |
| 4 | Network Defense | Multiple choice networking | Admin Badge |
| 5 | Final Escape | Combined challenges | Exit Pass |

## Getting Started

1. Open `index.html` in a web browser
2. Click "START GAME"
3. Click canvas to enable mouse look
4. Use WASD to move around the room
5. Walk to the Terminal (center) and press E to solve puzzles
6. Collect key and exit through door
7. Complete all 5 levels to escape!

## Project Structure

```
├── index.html             # Main HTML entry point
├── css/game.css           # Game styling (industrial theme)
├── js/game.js             # Game engine, levels, rendering
├── images/
│   ├── character.png      # Player character sprite
│   ├── floor_1.png        # Floor texture
│   ├── table_1.png        # Table texture
│   ├── pc_tower.png       # Terminal sprite
│   ├── monitor.png        # Monitor sprite
│   ├── desk.png           # Desk sprite
│   ├── box.png            # Crate sprite
│   ├── server.png         # Server rack sprite
│   ├── shelf.png          # Shelf sprite
│   ├── lamp.png           # Lamp sprite
│   └── chair.png          # Chair sprite
├── package.json           # Node dependencies
├── README.md              # This file
└── docs/superpowers/
    ├── specs/            # Design documents
    └── plans/            # Implementation plans
```

## Tech Stack

- **Vanilla JavaScript** - No frameworks
- **HTML5 Canvas** - Game rendering
- **CSS3** - UI styling with animations
- **Web Audio API** - Sound effects

## Game Flow

1. Start Screen → Click START GAME (cursor visible)
2. Explore room using WASD (cursor hidden)
3. Find Terminal (center) → Press E to open puzzle (cursor visible)
4. Solve all questions → Collect key
5. Go to door → Press E to exit
6. Repeat for all 5 levels
7. Victory screen on completion (cursor visible)

## Design

See design documents in `docs/superpowers/`:
- `specs/2026-04-09-first-person-cyber-escape-design.md` - Original design
- `specs/2026-04-12-combined-map-design.md` - Combined map design (future)
- `specs/2026-04-13-cartoonish-lab-rooms-design.md` - Room visuals design
