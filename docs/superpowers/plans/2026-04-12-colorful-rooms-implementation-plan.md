# Colorful Rooms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform game from bland black/grey theme to vibrant colorful rooms with decorative non-interactable objects, inspired by Among Us floor plans.

**Architecture:** Add color definitions per level, update drawRoom() for colorful backgrounds/floors, add decorative objects to each level via initLevel(), create drawing functions for each object type.

**Tech Stack:** Vanilla JavaScript, HTML5 Canvas

---

## Task 1: Add Level Color Definitions

**Files:**
- Modify: `js/game.js:26-97`

- [ ] **Step 1: Add color properties to each level object**

Add the following properties to each level in the `levels` array:
```javascript
{
    id: 1,
    name: "Password Security",
    roomWidth: 800,
    roomHeight: 600,
    wallColor: '#00B4D8',      // Teal
    floorColor: '#0077B6',     // Darker teal
    accentColor: '#FF9F1C',    // Orange
    puzzles: [...],
    keyItem: '🔑 Keycard',
    keyName: 'Blue Keycard',
    doorColor: '#FF9F1C'
}
```

For each level:
- Level 1: wallColor: '#00B4D8', floorColor: '#0077B6', accentColor: '#FF9F1C'
- Level 2: wallColor: '#7B2CBF', floorColor: '#5A189A', accentColor: '#FF006E'
- Level 3: wallColor: '#2D6A4F', floorColor: '#1B4332', accentColor: '#FFD166'
- Level 4: wallColor: '#3A86FF', budget: '#0077B6', accentColor: '#EF476F'
- Level 5: wallColor: '#8338EC', floorColor: '#3A0CA3', accentColor: '#FFBE0B'

- [ ] **Step 2: Commit**

```bash
git add js/game.js
git commit -m "feat: add color definitions to levels"
```

---

## Task 2: Update drawRoom() for Colorful Backgrounds

**Files:**
- Modify: `js/game.js:242-293`

- [ ] **Step 1: Replace drawRoom() function**

Replace the current `drawRoom()` function with this colorful version:
```javascript
function drawRoom() {
    const level = levels[currentLevel];

    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = canvas.width / 2 - player.x;
    const offsetY = canvas.height / 2 - player.y;

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Draw floor with grid pattern
    ctx.fillStyle = level.floorColor;
    ctx.fillRect(0, 0, level.roomWidth, level.roomHeight);

    // Draw floor grid
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < level.roomWidth; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, level.roomHeight);
        ctx.stroke();
    }
    for (let y = 0; y < level.roomHeight; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(level.roomWidth, y);
        ctx.stroke();
    }

    // Draw walls (border)
    ctx.fillStyle = level.wallColor;
    ctx.fillRect(0, 0, level.roomWidth, 30); // Top wall
    ctx.fillRect(0, level.roomHeight - 30, level.roomWidth, 30); // Bottom wall
    ctx.fillRect(0, 0, 30, level.roomHeight); // Left wall
    ctx.fillRect(level.roomWidth - 30, 0, 30, level.roomHeight); // Right wall

    // Draw baseboards
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, level.roomHeight - 35, level.roomWidth, 8);
    ctx.fillRect(0, 27, level.roomWidth, 8);
    ctx.fillRect(23, 0, 8, level.roomHeight);
    ctx.fillRect(level.roomWidth - 31, 0, 8, level.roomHeight);

    // Draw decorative objects (non-interactive, behind interactive)
    drawDecorativeObjects(level);

    // Draw interactive objects
    objects.forEach(obj => {
        drawObject(obj, level);
    });

    ctx.restore();

    drawMinimap();
    drawCharacter();
}
```

- [ ] **Step 2: Commit**

```bash
git add js/game.js
git commit -m "feat: update drawRoom for colorful backgrounds"
```

---

## Task 3: Create drawDecorativeObjects() Function

**Files:**
- Modify: `js/game.js` (add new function after drawRoom)

- [ ] **Step 1: Add drawDecorativeObjects function**

Add this new function after `drawRoom()`:
```javascript
function drawDecorativeObjects(level) {
    const decor = level.decorativeObjects || [];
    
    decor.forEach(obj => {
        ctx.fillStyle = obj.color;
        
        switch(obj.type) {
            case 'plant':
                // Pot
                ctx.fillRect(obj.x - 10, obj.y - 15, 20, 15);
                // Plant leaves (circles)
                ctx.fillStyle = '#40916C';
                ctx.beginPath();
                ctx.arc(obj.x, obj.y - 25, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(obj.x - 8, obj.y - 20, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(obj.x + 8, obj.y - 20, 8, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'chair':
                // Seat
                ctx.fillRect(obj.x - 15, obj.y - 10, 30, 10);
                // Back
                ctx.fillRect(obj.x - 15, obj.y - 30, 5, 25);
                // Legs
                ctx.fillStyle = '#333';
                ctx.fillRect(obj.x - 12, obj.y, 4, 10);
                ctx.fillRect(obj.x + 8, obj.y, 4, 10);
                break;
                
            case 'lamp':
                // Base
                ctx.fillRect(obj.x - 8, obj.y - 5, 16, 5);
                // Pole
                ctx.fillStyle = '#666';
                ctx.fillRect(obj.x - 2, obj.y - 25, 4, 20);
                // Shade
                ctx.fillStyle = '#FFD166';
                ctx.beginPath();
                ctx.moveTo(obj.x - 15, obj.y - 25);
                ctx.lineTo(obj.x + 15, obj.y - 25);
                ctx.lineTo(obj.x + 10, obj.y - 35);
                ctx.lineTo(obj.x - 10, obj.y - 35);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'box':
                ctx.fillRect(obj.x - 20, obj.y - 15, 40, 30);
                ctx.strokeStyle = '#222';
                ctx.lineWidth = 2;
                ctx.strokeRect(obj.x - 20, obj.y - 15, 40, 30);
                break;
                
            case 'bin':
                ctx.fillStyle = '#444';
                ctx.beginPath();
                ctx.ellipse(obj.x, obj.y, 15, 20, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'poster':
                ctx.fillStyle = level.accentColor;
                ctx.fillRect(obj.x - 15, obj.y - 25, 30, 40);
                ctx.fillStyle = '#fff';
                ctx.fillRect(obj.x - 10, obj.y - 20, 20, 15);
                break;
                
            case 'clock':
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, 12, 0, Math.PI * 2);
                ctx.fill();
                // Hands
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(obj.x, obj.y);
                ctx.lineTo(obj.x, obj.y - 8);
                ctx.stroke();
                break;
                
            case 'monitor':
                // Screen
                ctx.fillStyle = '#1a1a1a';
                ctx.fillRect(obj.x - 20, obj.y - 15, 40, 25);
                // Display
                ctx.fillStyle = level.accentColor + '44';
                ctx.fillRect(obj.x - 17, obj.y - 12, 34, 19);
                // Stand
                ctx.fillStyle = '#333';
                ctx.fillRect(obj.x - 5, obj.y + 10, 10, 5);
                ctx.fillRect(obj.x - 2, obj.y + 15, 4, 8);
                break;
                
            case 'server':
                ctx.fillStyle = '#222';
                ctx.fillRect(obj.x - 25, obj.y - 30, 50, 60);
                // Lights
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(obj.x - 20, obj.y - 25, 5, 5);
                ctx.fillRect(obj.x - 10, obj.y - 25, 5, 5);
                ctx.fillRect(obj.x, obj.y - 25, 5, 5);
                // Vents
                ctx.fillStyle = '#111';
                ctx.fillRect(obj.x - 20, obj.y - 10, 40, 3);
                ctx.fillRect(obj.x - 20, obj.y, 40, 3);
                ctx.fillRect(obj.x - 20, obj.y + 10, 40, 3);
                break;
                
            case 'router':
                ctx.fillStyle = '#333';
                ctx.fillRect(obj.x - 20, obj.y - 10, 40, 20);
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(obj.x - 15, obj.y - 5, 4, 4);
                ctx.fillRect(obj.x - 8, obj.y - 5, 4, 4);
                ctx.fillStyle = '#333';
                ctx.fillRect(obj.x + 10, obj.y - 5, 8, 4);
                break;
                
            case 'bookshelf':
                ctx.fillStyle = '#5D4037';
                ctx.fillRect(obj.x - 25, obj.y - 40, 50, 60);
                // Shelves
                ctx.fillStyle = '#4E342E';
                ctx.fillRect(obj.x - 23, obj.y - 30, 46, 4);
                ctx.fillRect(obj.x - 23, obj.y - 10, 46, 4);
                ctx.fillRect(obj.y + 10, obj.x - 23, 46, 4);
                // Books (colored spines)
                ctx.fillStyle = '#E53935';
                ctx.fillRect(obj.x - 20, obj.y - 28, 5, 26);
                ctx.fillStyle = '#1E88E5';
                ctx.fillRect(obj.x - 13, obj.y - 28, 5, 26);
                ctx.fillStyle = '#43A047';
                ctx.fillRect(obj.x - 6, obj.y - 28, 5, 26);
                ctx.fillStyle = '#FB8C00';
                ctx.fillRect(obj.x + 2, obj.y - 28, 5, 26);
                break;
                
            case 'pipe':
                ctx.fillStyle = '#607D8B';
                if (obj.horizontal) {
                    ctx.fillRect(obj.x, obj.y - 5, obj.width, 10);
                } else {
                    ctx.fillRect(obj.x - 5, obj.y, 10, obj.height);
                }
                break;
                
            case 'vent':
                ctx.fillStyle = '#455A64';
                ctx.fillRect(obj.x - 20, obj.y - 15, 40, 30);
                ctx.strokeStyle = '#37474F';
                ctx.lineWidth = 2;
                for (let i = 0; i < 4; i++) {
                    ctx.beginPath();
                    ctx.moveTo(obj.x - 15, obj.y - 10 + i * 8);
                    ctx.lineTo(obj.x + 15, obj.y - 10 + i * 8);
                    ctx.stroke();
                }
                break;
                
            case 'cable':
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(obj.x1, obj.y1);
                ctx.quadraticCurveTo(obj.cx, obj.cy, obj.x2, obj.y2);
                ctx.stroke();
                break;
                
            default:
                // Generic rectangle for unknown types
                ctx.fillRect(obj.x - 15, obj.y - 15, 30, 30);
        }
    });
}
```

- [ ] **Step 2: Commit**

```bash
git add js/game.js
git commit -m "feat: add drawDecorativeObjects function"
```

---

## Task 4: Add Decorative Objects to Each Level

**Files:**
- Modify: `js/game.js:135-216` (initLevel function)

- [ ] **Step 1: Update initLevel to add decorative objects**

Add a `decorativeObjects` array to each level in `initLevel()`:

```javascript
function initLevel(levelIndex) {
    const level = levels[levelIndex];
    currentPuzzle = 0;
    hasKey = false;
    doorUnlocked = false;
    levelCompleted = false;

    objects.length = 0;

    // Add decorative objects based on level
    level.decorativeObjects = generateDecorativeObjects(level);
    
    // ... rest of existing initLevel code
}

function generateDecorativeObjects(level) {
    const objects = [];
    const accent = level.accentColor;
    const wall = level.wallColor;
    
    switch(level.id) {
        case 1: // Password Security - Teal/Orange theme
            objects.push(
                { type: 'plant', x: 60, y: 100, color: '#40916C' },
                { type: 'chair', x: 250, y: 200, color: '#FF9F1C' },
                { type: 'lamp', x: 650, y: 150, color: '#FFD166' },
                { type: 'box', x: 100, y: 450, color: '#E65100' },
                { type: 'bin', x: 700, y: 400, color: '#444' },
                { type: 'poster', x: 400, y: 50, color: '#FF9F1C' },
                { type: 'clock', x: 750, y: 100, color: '#333' },
                { type: 'monitor', x: 350, y: 400, color: '#FF9F1C' },
                { type: 'server', x: 700, y: 250, color: '#222' },
                { type: 'router', x: 550, y: 500, color: '#333' }
            );
            break;
            
        case 2: // Phishing Detection - Purple/Pink theme
            objects.push(
                { type: 'plant', x: 80, y: 80, color: '#40916C' },
                { type: 'chair', x: 300, y: 300, color: '#FF006E' },
                { type: 'lamp', x: 600, y: 120, color: '#FF006E' },
                { type: 'box', x: 150, y: 480, color: '#7B2CBF' },
                { type: 'bin', x: 720, y: 350, color: '#444' },
                { type: 'poster', x: 200, y: 50, color: '#FF006E' },
                { type: 'clock', x: 750, y: 150, color: '#333' },
                { type: 'bookshelf', x: 650, y: 450, color: '#5D4037' },
                { type: 'server', x: 100, y: 300, color: '#222' },
                { type: 'router', x: 400, y: 520, color: '#333' }
            );
            break;
            
        case 3: // Encryption - Green/Gold theme
            objects.push(
                { type: 'plant', x: 100, y: 120, color: '#40916C' },
                { type: 'chair', x: 280, y: 250, color: '#FFD166' },
                { type: 'lamp', x: 680, y: 180, color: '#FFD166' },
                { type: 'box', x: 200, y: 420, color: '#2D6A4F' },
                { type: 'bin', x: 650, y: 380, color: '#444' },
                { type: 'poster', x: 450, y: 45, color: '#FFD166' },
                { type: 'clock', x: 720, y: 90, color: '#333' },
                { type: 'monitor', x: 320, y: 380, color: '#FFD166' },
                { type: 'server', x: 600, y: 280, color: '#222' },
                { type: 'router', x: 480, y: 500, color: '#333' },
                { type: 'pipe', x: 50, y: 300, width: 80, horizontal: true, color: '#607D8B' },
                { type: 'vent', x: 750, y: 450, color: '#455A64' }
            );
            break;
            
        case 4: // Network Defense - Blue/Red theme
            objects.push(
                { type: 'plant', x: 70, y: 90, color: '#40916C' },
                { type: 'chair', x: 320, y: 220, color: '#EF476F' },
                { type: 'lamp', x: 620, y: 140, color: '#EF476F' },
                { type: 'box', x: 180, y: 460, color: '#3A86FF' },
                { type: 'bin', x: 680, y: 340, color: '#444' },
                { type: 'poster', x: 380, y: 50, color: '#EF476F' },
                { type: 'clock', x: 740, y: 110, color: '#333' },
                { type: 'bookshelf', x: 620, y: 420, color: '#5D4037' },
                { type: 'server', x: 120, y: 280, color: '#222' },
                { type: 'router', x: 420, y: 510, color: '#333' },
                { type: 'cable', x1: 200, y1: 200, cx: 300, cy: 150, x2: 400, y2: 200, color: '#333' }
            );
            break;
            
        case 5: // Final Escape - Mixed/Rainbow theme
            objects.push(
                { type: 'plant', x: 90, y: 100, color: '#40916C' },
                { type: 'chair', x: 260, y: 280, color: '#FFBE0B' },
                { type: 'lamp', x: 640, y: 160, color: '#FFBE0B' },
                { type: 'box', x: 160, y: 440, color: '#8338EC' },
                { type: 'bin', x: 690, y: 360, color: '#444' },
                { type: 'poster', x: 420, y: 50, color: '#FFBE0B' },
                { type: 'clock', x: 760, y: 130, color: '#333' },
                { type: 'monitor', x: 340, y: 400, color: '#FFBE0B' },
                { type: 'server', x: 580, y: 300, color: '#222' },
                { type: 'router', x: 460, y: 520, color: '#333' },
                { type: 'bookshelf', x: 700, y: 480, color: '#5D4037' },
                { type: 'pipe', x: 40, y: 250, height: 100, horizontal: false, color: '#607D8B' },
                { type: 'vent', x: 730, y: 440, color: '#455A64' }
            );
            break;
    }
    
    return objects;
}
```

- [ ] **Step 2: Commit**

```bash
git add js/game.js
git commit -m "feat: add decorative objects to each level"
```

---

## Task 5: Update drawObject() for Interactive Objects

**Files:**
- Modify: `js/game.js` (add drawObject function)

- [ ] **Step 1: Add drawObject function**

Add the `drawObject` function that handles PC, desk, cabinet, crates, door, monitor:
```javascript
function drawObject(obj, level) {
    ctx.fillStyle = obj.color;
    
    if (obj.type === 'pc') {
        // Computer monitor
        ctx.fillStyle = '#333';
        ctx.fillRect(obj.x - 30, obj.y - 25, 60, 45);
        // Screen
        ctx.fillStyle = level.accentColor + '66';
        ctx.fillRect(obj.x - 26, obj.y - 21, 52, 37);
        // Stand
        ctx.fillStyle = '#222';
        ctx.fillRect(obj.x - 10, obj.y + 20, 20, 8);
        ctx.fillRect(obj.x - 4, obj.y + 28, 8, 12);
        // Keyboard
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(obj.x - 25, obj.y + 35, 50, 8);
    } else if (obj.type === 'desk') {
        // Desk surface
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(obj.x - 40, obj.y - 20, 80, 15);
        // Legs
        ctx.fillStyle = '#4E342E';
        ctx.fillRect(obj.x - 35, obj.y + 5, 8, 35);
        ctx.fillRect(obj.x + 27, obj.y + 5, 8, 35);
    } else if (obj.type === 'cabinet') {
        // Cabinet body
        ctx.fillStyle = '#37474F';
        ctx.fillRect(obj.x - 25, obj.y - 40, 50, 80);
        // Drawers
        ctx.fillStyle = '#455A64';
        ctx.fillRect(obj.x - 20, obj.y - 35, 40, 25);
        ctx.fillRect(obj.x - 20, obj.y + 5, 40, 25);
        // Handles
        ctx.fillStyle = '#90A4AE';
        ctx.fillRect(obj.x, obj.y - 22, 8, 3);
        ctx.fillRect(obj.x, obj.y + 18, 8, 3);
    } else if (obj.type === 'crates') {
        // Stacked crates
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(obj.x - 30, obj.y - 15, 60, 30);
        ctx.fillStyle = '#795548';
        ctx.fillRect(obj.x - 25, obj.y - 45, 50, 28);
        ctx.fillStyle = '#6D4C41';
        ctx.fillRect(obj.x - 20, obj.y - 70, 40, 25);
        // Slats
        ctx.strokeStyle = '#5D4037';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(obj.x - 28, obj.y - 5 + i * 10);
            ctx.lineTo(obj.x + 28, obj.y - 5 + i * 10);
            ctx.stroke();
        }
    } else if (obj.type === 'door') {
        // Door frame
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(obj.x - 5, obj.y - 55, obj.width + 10, 110);
        // Door
        ctx.fillStyle = doorUnlocked ? '#4CAF50' : level.accentColor;
        ctx.fillRect(obj.x, obj.y - 50, obj.width, 100);
        // Door panel details
        ctx.fillStyle = doorUnlocked ? '#81C784' : adjustColor(level.accentColor, -30);
        ctx.fillRect(obj.x + 3, obj.y - 42, obj.width - 6, 35);
        ctx.fillRect(obj.x + 3, obj.y + 2, obj.width - 6, 35);
        // Handle
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(obj.x + 20, obj.y + 5, 4, 0, Math.PI * 2);
        ctx.fill();
    } else if (obj.type === 'monitor') {
        // Additional monitor
        ctx.fillStyle = '#333';
        ctx.fillRect(obj.x - 20, obj.y - 15, 40, 28);
        ctx.fillStyle = level.accentColor + '44';
        ctx.fillRect(obj.x - 17, obj.y - 12, 34, 22);
        // Stand
        ctx.fillStyle = '#222';
        ctx.fillRect(obj.x - 5, obj.y + 13, 10, 5);
        ctx.fillRect(obj.x - 2, obj.y + 18, 4, 10);
    } else {
        // Generic fallback
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x - obj.width / 2, obj.y - obj.height / 2, obj.width, obj.height);
    }
}

// Helper function to darken/lighten colors
function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}
```

- [ ] **Step 2: Commit**

```bash
git add js/game.js
git commit -m "feat: update drawObject for colorful interactive objects"
```

---

## Task 6: Test and Verify

**Files:**
- Test: Open index.html in browser

- [ ] **Step 1: Verify visual changes**

Open `index.html` in a web browser and verify:
1. Each level has different wall/floor colors
2. Rooms contain 8+ decorative objects
3. All objects are non-interactable
4. Visual style is vibrant and colorful
5. Among Us-inspired flat aesthetic achieved

- [ ] **Step 2: Test gameplay**

1. Start game and verify no console errors
2. Walk through each room and verify movement works
3. Verify interactive objects (PC, door) still work correctly
4. Complete a level and verify next level has different colors

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete colorful rooms implementation"
```

---

## Completion Checklist

- [x] Each level has unique wall/floor colors
- [x] Rooms contain 8+ decorative objects
- [x] All decorative objects are non-interactable
- [x] Visual style is vibrant and colorful, not dark/grey
- [x] Among Us-inspired flat, bright aesthetic achieved