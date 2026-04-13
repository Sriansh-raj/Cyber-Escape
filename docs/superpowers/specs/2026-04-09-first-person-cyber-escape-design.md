# Cyber Escape: Hacker's Edition - First Person Game Design

## Overview
First-person exploration game where players navigate through maze-like rooms in a hacker's facility. Each room contains interactive objects (PCs, desks, cabinets) and a locked door. Players interact with PCs to solve cybersecurity puzzles, collect key items, and unlock doors to progress.

## Visual Style - Industrial Facility
- Dark charcoal/gray walls (#1a1a1a, #2d2d2d)
- Dim emergency red/amber accent lights
- Flickering fluorescent overhead (subtle)
- Dust particles floating
- CRT-style interaction screens
- Ambient shadows and depth
- **Eye-friendly**: Low brightness, no harsh neon

## Game Mechanics

### Movement
- WASD keys for movement
- Mouse to look around (pointer lock)
- Click to interact with objects
- Walking speed: moderate pace
- Collision detection with walls/objects

### Room Structure
- Each level = one floor with multiple rooms
- Rooms connected by corridors
- Objects in rooms: PC, desk, cabinet, crates, boxes, chairs
- Door at end of room - locked until puzzle solved

### PC Interaction Flow
1. Approach PC → "Press E to interact" prompt
2. Click/press E → Puzzle screen overlays (like Among Us tasks)
3. Solve puzzle → Key/item drops
4. Collect key → Door unlocks
5. Exit room → Next room/level

### UI Elements
- **Health/Stamina bar** - Top left (optional damage from hazards)
- **Inventory** - Bottom right (shows collected keys/items)
- **Minimap** - Top right corner (top-down room layout)
- **Current objective** - Bottom center text
- **Interaction prompt** - "Press E" when near object

## Level Design

### Level 1: Password Security Room
- **Room**: Server room with multiple PCs, cable racks
- **Puzzle**: Identify weak vs strong passwords on PC screen
- **Reward**: Keycard Blue
- **Door**: Blue-coded lock

### Level 2: Phishing Detection Room
- **Room**: Office with desks, filing cabinets, monitors
- **Puzzle**: Analyze emails, identify phishing attempts
- **Reward**: USB Drive
- **Door**: Requires USB to unlock

### Level 3: Encryption Room
- **Room**: Lab with cipher machines, mathematical displays
- **Puzzle**: Caesar cipher decoding challenges
- **Reward**: Encryption Key
- **Door**: Encrypted lock (solve 3 ciphers)

### Level 4: Network Defense Room
- **Room**: Server hub with network diagrams, firewalls
- **Puzzle**: Place correct defenses to block attacks
- **Reward**: Admin Badge
- **Door**: Biometric scan (requires badge)

### Level 5: Final Escape
- **Room**: Main control room, escape tunnel visible
- **Puzzle**: Combine all skills - timed challenge
- **Reward**: Access to escape route
- **Door**: Final exit - game complete

## Technical Implementation

### Engine (Vanilla JS + Canvas)
- First-person camera (no Three.js for simplicity)
- Raycasting or simple 2D-based pseudo-3D
- Sprite-based room objects
- HTML overlay for puzzle screens

### Audio
- Footstep sounds (concrete floor)
- Door open/close sounds
- Keyboard typing when using PC
- Puzzle complete chime
- Ambient facility hum
- Key pickup sound

### Controls
- W/A/S/D - Move forward/left/back/right
- Mouse - Look around
- E - Interact
- ESC - Pause/menu
- Click - Confirm choices in puzzles

## UI Layout
```
┌─────────────────────────────────────────┐
│ [Health]              [Minimap]        │
│                                         │
│                                         │
│            [3D Game View]               │
│                                         │
│                                         │
│ [Inventory: Keycard]    [Objective]     │
│         Press E to interact            │
└─────────────────────────────────────────┘
```

## Acceptance Criteria
- [ ] First-person movement with WASD works smoothly
- [ ] Mouse look rotates camera
- [ ] Room contains multiple interactive objects
- [ ] PC interaction opens puzzle overlay
- [ ] Puzzle completion awards key/item
- [ ] Key collection unlocks door
- [ ] Door opens and leads to next room
- [ ] Minimap shows room layout
- [ ] Inventory displays collected items
- [ ] Sound effects play for interactions
- [ ] Industrial dark theme is eye-friendly
- [ ] All 5 levels are playable