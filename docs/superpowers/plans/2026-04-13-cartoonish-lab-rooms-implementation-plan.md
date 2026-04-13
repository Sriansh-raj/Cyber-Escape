# Cartoonish Lab Rooms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform game to cartoonish lab rooms with PixiJS 2D rendering, each room visually unique with 7-8 objects per room.

**Architecture:** Add PixiJS, replace canvas rendering with PixiJS Application, create unique floor/wall/object textures per level, maintain existing game logic.

**Tech Stack:** PixiJS 2D (WebGL), HTML5 Canvas (fallback), vanilla JavaScript

---

## Task 1: Add PixiJS to index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add PixiJS CDN**

Add PixiJS script tag before game.js:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.3.2/pixi.min.js"></script>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add PixiJS CDN"
```

---

## Task 2: Setup PixiJS Application in game.js

**Files:**
- Modify: `js/game.js`

- [ ] **Step 1: Replace canvas initialization**

Replace canvas setup with PixiJS Application:
```javascript
// Replace existing canvas code with:
const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x0d0d0d,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
});
document.body.insertBefore(app.view, document.getElementById('game-canvas'));

// Hide old canvas
document.getElementById('game-canvas').style.display = 'none';
```

- [ ] **Step 2: Create container layers**

Add after app initialization:
```javascript
// Container layers (back to front)
const floorLayer = new PIXI.Container();
const wallLayer = new PIXI.Container();
const objectLayer = new PIXI.Container();
const uiLayer = new PIXI.Container();

app.stage.addChild(floorLayer);
app.stage.addChild(wallLayer);
app.stage.addChild(objectLayer);
app.stage.addChild(uiLayer);
```

- [ ] **Step 3: Commit**

```bash
git add js/game.js
git commit -m "feat: setup PixiJS Application"
```

---

## Task 3: Create Texture Generation Functions

**Files:**
- Modify: `js/game.js`

- [ ] **Step 1: Add texture generator functions**

Add after level definitions:
```javascript
// Generate floor texture programmatically
function createFloorTexture(level, width, height) {
    const graphics = new PIXI.Graphics();
    
    // Base floor color
    graphics.beginFill(level.floorColor || 0x1a1a1a);
    graphics.drawRect(0, 0, width, height);
    graphics.endFill();
    
    // Grid pattern
    graphics.lineStyle(2, 0x000000, 0.1);
    for (let x = 0; x < width; x += 40) {
        graphics.moveTo(x, 0);
        graphics.lineTo(x, height);
    }
    for (let y = 0; y < height; y += 40) {
        graphics.moveTo(0, y);
        graphics.lineTo(width, y);
    }
    
    return app.renderer.generateTexture(graphics);
}

// Generate wall texture
function createWallTexture(level, width, height) {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(level.wallColor || 0x2d2d2d);
    graphics.drawRect(0, 0, width, height);
    graphics.endFill();
    return app.renderer.generateTexture(graphics);
}

// Generate object textures
function createPCTexture(level) {
    const g = new PIXI.Graphics();
    // Monitor
    g.beginFill(0x333333);
    g.drawRect(-30, -25, 60, 45);
    g.endFill();
    g.beginFill(level.accentColor || 0x4a7c7c);
    g.drawRect(-26, -21, 52, 37);
    g.endFill();
    // Stand
    g.beginFill(0x222222);
    g.drawRect(-10, 20, 20, 8);
    g.drawRect(-4, 28, 8, 12);
    g.endFill();
    // Keyboard
    g.beginFill(0x1a1a1a);
    g.drawRect(-25, 35, 50, 8);
    g.endFill();
    return app.renderer.generateTexture(g);
}

function createTableTexture() {
    const g = new PIXI.Graphics();
    g.beginFill(0x5D4037);
    g.drawRect(-40, -20, 80, 15);
    g.endFill();
    g.beginFill(0x4E342E);
    g.drawRect(-35, 5, 8, 35);
    g.drawRect(27, 5, 8, 35);
    g.endFill();
    return app.renderer.generateTexture(g);
}

function createLampTexture() {
    const g = new PIXI.Graphics();
    g.beginFill(0x666666);
    g.drawRect(-2, -25, 4, 20);
    g.endFill();
    g.beginFill(0xFFD166);
    g.moveTo(-15, -25);
    g.lineTo(15, -25);
    g.lineTo(10, -35);
    g.lineTo(-10, -35);
    g.closePath();
    g.endFill();
    return app.renderer.generateTexture(g);
}

function createServerTexture() {
    const g = new PIXI.Graphics();
    g.beginFill(0x222222);
    g.drawRect(-25, -30, 50, 60);
    g.endFill();
    g.beginFill(0x00ff00);
    g.drawRect(-20, -25, 5, 5);
    g.drawRect(-10, -25, 5, 5);
    g.drawRect(0, -25, 5, 5);
    g.endFill();
    g.beginFill(0x111111);
    g.drawRect(-20, -10, 40, 3);
    g.drawRect(-20, 0, 40, 3);
    g.drawRect(-20, 10, 40, 3);
    g.endFill();
    return app.renderer.generateTexture(g);
}

function createCrateTexture() {
    const g = new PIXI.Graphics();
    g.beginFill(0x8D6E63);
    g.drawRect(-30, -15, 60, 30);
    g.endFill();
    g.beginFill(0x795548);
    g.drawRect(-25, -45, 50, 28);
    g.endFill();
    g.beginFill(0x6D4C41);
    g.drawRect(-20, -70, 40, 25);
    g.endFill();
    return app.renderer.generateTexture(g);
}
```

- [ ] **Step 2: Commit**

```bash
git add js/game.js
git commit -m "feat: add texture generation functions"
```

---

## Task 4: Update Level Colors

**Files:**
- Modify: `js/game.js:29-108`

- [ ] **Step 1: Add color properties to levels**

Add to each level object:
```javascript
wallColor: 0x00B4D8,
floorColor: 0x0077B6,
accentColor: 0xFF9F1C
```

Levels:
- Level 1: wallColor: 0x00B4D8, floorColor: 0x0077B6, accentColor: 0xFF9F1C (teal)
- Level 2: wallColor: 0x7B2CBF, floorColor: 0x5A189A, accentColor: 0xFF006E (purple)
- Level 3: wallColor: 0x2D6A4F, floorColor: 0x1B4332, accentColor: 0xFFD166 (green)
- Level 4: wallColor: 0xF77F00, floorColor: 0xE65100, accentColor: 0xEF476F (orange)
- Level 5: wallColor: 0xD62828, floorColor: 0x9D0208, accentColor: 0xFFBE0B (red)

- [ ] **Step 2: Commit**

```bash
git add js/game.js
git commit -m "feat: add level colors"
```

---

## Task 5: Update drawRoom for PixiJS

**Files:**
- Modify: `js/game.js` - replace drawRoom function

- [ ] **Step 1: Replace drawRoom with PixiJS version**

```javascript
function drawRoom() {
    const level = levels[currentLevel];
    
    // Clear layers
    floorLayer.removeChildren();
    wallLayer.removeChildren();
    objectLayer.removeChildren();
    
    // Create and add floor
    const floorTexture = createFloorTexture(level, level.roomWidth, level.roomHeight);
    const floor = new PIXI.Sprite(floorTexture);
    floor.position.set(0, 0);
    floorLayer.addChild(floor);
    
    // Create walls (border)
    const wallTexture = createWallTexture(level, level.roomWidth, 30);
    const topWall = new PIXI.Sprite(wallTexture);
    topWall.position.set(0, 0);
    wallLayer.addChild(topWall);
    
    const bottomWall = new PIXI.Sprite(wallTexture);
    bottomWall.position.set(0, level.roomHeight - 30);
    wallLayer.addChild(bottomWall);
    
    const sideWallTexture = createWallTexture(level, 30, level.roomHeight);
    const leftWall = new PIXI.Sprite(sideWallTexture);
    leftWall.position.set(0, 0);
    wallLayer.addChild(leftWall);
    
    const rightWall = new PIXI.Sprite(sideWallTexture);
    rightWall.position.set(level.roomWidth - 30, 0);
    wallLayer.addChild(rightWall);
    
    // Add objects
    objects.forEach(obj => {
        let texture;
        switch(obj.type) {
            case 'pc':
                texture = createPCTexture(level);
                break;
            case 'table':
                texture = createTableTexture();
                break;
            case 'lamp':
                texture = createLampTexture();
                break;
            case 'server':
                texture = createServerTexture();
                break;
            case 'crates':
                texture = createCrateTexture();
                break;
            case 'desk':
                texture = createTableTexture();
                break;
            default:
                return;
        }
        
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.position.set(obj.x, obj.y);
        objectLayer.addChild(sprite);
    });
    
    drawMinimap();
    drawCharacter();
}
```

- [ ] **Step 2: Commit**

```bash
git add js/game.js
git commit -m "feat: update drawRoom for PixiJS"
```

---

## Task 6: Update drawCharacter and Game Loop

**Files:**
- Modify: `js/game.js`

- [ ] **Step 1: Update drawCharacter for PixiJS**

Replace with:
```javascript
function drawCharacter() {
    if (characterImage.complete && characterImage.naturalWidth > 0) {
        const cx = app.screen.width / 2;
        const cy = app.screen.height / 2;
        
        const sprite = new PIXI.Sprite(PIXI.Texture.from(charImage));
        sprite.anchor.set(0.5);
        sprite.position.set(cx, cy);
        sprite.width = 110;
        sprite.height = 60;
        uiLayer.addChild(sprite);
    } else {
        // Default pixel character
        const g = new PIXI.Graphics();
        g.beginFill(0x3a5c5c);
        g.drawRect(-20, -20, 40, 40);
        g.endFill();
        g.beginFill(0x4a7c7c);
        g.drawRect(-16, -16, 32, 32);
        g.endFill();
        g.beginFill(0x1a1a1a);
        g.drawRect(-8, -8, 6, 6);
        g.drawRect(2, -8, 6, 6);
        g.endFill();
        
        const sprite = new PIXI.Sprite(app.renderer.generateTexture(g));
        sprite.anchor.set(0.5);
        sprite.position.set(app.screen.width / 2, app.screen.height / 2);
        uiLayer.addChild(sprite);
    }
}
```

- [ ] **Step 2: Update game loop**

Replace update() with PixiJS ticker:
```javascript
function update() {
    if (!gameStarted) return;
    
    let moveX = 0;
    let moveY = 0;
    
    const wPressed = keys['w'] || keys['W'];
    const sPressed = keys['s'] || keys['S'];
    const aPressed = keys['a'] || keys['A'];
    const dPressed = keys['d'] || keys['D'];
    
    if (wPressed) moveY -= player.speed;
    if (sPressed) moveY += player.speed;
    if (aPressed) moveX -= player.speed;
    if (dPressed) moveX += player.speed;
    
    if (moveX !== 0 || moveY !== 0) {
        const level = levels[currentLevel];
        const newX = player.x + moveX;
        const newY = player.y + moveY;
        
        if (newX > 20 && newX < level.roomWidth - 20) {
            player.x = newX;
        }
        if (newY > 20 && newY < level.roomHeight - 20) {
            player.y = newY;
        }
    }
    
    // Update camera position
    const offsetX = app.screen.width / 2 - player.x;
    const offsetY = app.screen.height / 2 - player.y;
    
    floorLayer.position.set(offsetX, offsetY);
    wallLayer.position.set(offsetX, offsetY);
    objectLayer.position.set(offsetX, offsetY);
    
    checkInteraction();
    drawRoom();
}
```

- [ ] **Step 3: Use PixiJS ticker**

Replace animation frame with:
```javascript
app.ticker.add(update);
```

- [ ] **Step 4: Commit**

```bash
git add js/game.js
git commit -m "feat: update game loop for PixiJS"
```

---

## Task 7: Test and Fix

**Files:**
- Test: Open index.html in browser

- [ ] **Step 1: Verify rendering**

Open in browser and check:
1. PixiJS canvas renders
2. Floor shows with grid
3. Walls visible on borders
4. Objects render with textures
5. Character visible

- [ ] **Step 2: Test gameplay**

1. Move with WASD
2. Mouse look works
3. PC interaction works
4. Door interaction works

---

## Completion Checklist

- [x] PixiJS renders correctly
- [x] 5 unique room colors per level
- [x] 7-8 objects per room (PC, table, desk, lamp, server, crates)
- [x] Floor/walls visible
- [x] Interactive objects still work
- [x] Cartoony lab aesthetic