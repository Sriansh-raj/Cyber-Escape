# Cyber Escape: Combined Map Design

**Date:** 2026-04-12
**Status:** Approved

## Overview

Combine all 5 rooms into a single explorable map. Player starts in Reception, solves puzzles to unlock doors, progresses through IT Office → Server Room → Executive Suite → Rooftop (exit).

## Map Structure

### Grid
- **Total size:** 1500x1500 pixels (5 rooms × 300px each)
- **Rooms:** 5 connected rooms in L-shaped layout

### Room Layout

```
+-------------------+-------------------+-------------------+
|                   |                   |                   |
|   RECEPTION        |    IT OFFICE      |   SERVER ROOM     |
|   (Start)         |                   |                   |
|   [PC-1]          |   [PC-2]    [door]|   [PC-3]    [door]|
|        [door]---->|                   |                   |
|                   +-----> [door]       +-----> [door]      |
+-------------------+-------------------+-------------------+
                                        |
                                        |
                        +---------------+---------------+
                        |                               |
                        |     EXECUTIVE SUITE           |   ROOFTOP
                        |                               |   (Exit)
                        |   [PC-4]         [door]------>|   [EXIT]
                        |        [door]-------+        |
                        |                    |          |
                        +--------------------+----------+
```

### Room Coordinates

| Room | X | Y | Width | Height |
|------|---|---|-------|--------|
| Reception | 0 | 0 | 300 | 300 |
| IT Office | 300 | 0 | 300 | 300 |
| Server Room | 600 | 0 | 300 | 300 |
| Executive Suite | 600 | 300 | 300 | 300 |
| Rooftop | 600 | 600 | 300 | 300 |

## Data Structures

### Map Object

```javascript
const gameMap = {
    width: 1500,
    height: 1500,
    rooms: {
        'reception': {
            id: 'reception',
            name: 'Reception',
            x: 0, y: 0, width: 300, height: 300,
            discovered: true,  // Starting room
            objects: [],
            puzzle: 'password',
            keyItem: '🔑 Keycard',
            keyName: 'Blue Keycard',
            keyId: 'key-1',
            doorColor: '#4a7c7c'
        },
        'it-office': { /* ... */ },
        'server-room': { /* ... */ },
        'executive': { /* ... */ },
        'rooftop': { /* ... */ }
    },
    doors: [
        { from: 'reception', to: 'it-office', x: 300, y: 150, keyRequired: 'key-1' },
        { from: 'it-office', to: 'server-room', x: 600, y: 150, keyRequired: 'key-2' },
        { from: 'server-room', to: 'executive', x: 900, y: 150, keyRequired: 'key-3' },
        { from: 'executive', to: 'rooftop', x: 900, y: 450, keyRequired: 'key-4' }
    ],
    currentRoom: 'reception'
};
```

### Room Objects

Each room contains:
- **PC** - Puzzle interaction point
- **Desk** - Decorative
- **Cabinet/Crates** - Decorative
- **Door** - Exit to next room (locked until puzzle solved)

```javascript
// Example room objects
{
    objects: [
        { type: 'pc', x: 150, y: 150, width: 60, height: 50 },
        { type: 'desk', x: 80, y: 150, width: 80, height: 40 },
        { type: 'cabinet', x: 250, y: 80, width: 50, height: 80 },
        { type: 'door', x: 300, y: 150, width: 30, height: 100, targetRoom: 'it-office' }
    ]
}
```

## Puzzles per Room

| Room | Puzzle Type | Questions | Key Obtained |
|------|-------------|-----------|--------------|
| Reception | Password Security | 3 | Blue Keycard |
| IT Office | Network Defense | 3 | USB Drive |
| Server Room | Encryption | 3 | Encryption Key |
| Executive Suite | Phishing Detection | 3 | Admin Badge |
| Rooftop | Final Escape | 3 | Exit Pass → Win |

## Minimap Discovery System

### Rendering Logic

```javascript
function drawMinimap() {
    minimapCtx.fillStyle = '#0d0d0d';
    minimapCtx.fillRect(0, 0, 150, 150);

    const cellSize = 28; // 140 / 5 rooms

    // Draw each room
    Object.values(gameMap.rooms).forEach(room => {
        if (room.discovered) {
            // Fill discovered room
            minimapCtx.fillStyle = '#1a1a1a';
            minimapCtx.fillRect(room.x / 50 + 5, room.y / 50 + 5, cellSize - 2, cellSize - 2);
            
            // Draw objects
            room.objects.forEach(obj => {
                if (obj.type === 'pc') {
                    minimapCtx.fillStyle = '#4a7c7c';
                    minimapCtx.fillRect(obj.x / 50 + 5, obj.y / 50 + 5, 4, 4);
                } else if (obj.type === 'door') {
                    const door = gameMap.doors.find(d => d.from === room.id);
                    const unlocked = !door || inventory.some(k => k.keyId === door.keyRequired);
                    minimapCtx.fillStyle = unlocked ? '#2a5a2a' : '#8b0000';
                    minimapCtx.fillRect(obj.x / 50 + 5, obj.y / 50 + 5, 4, 4);
                }
            });
        } else {
            // Undiscovered - show "???"
            minimapCtx.fillStyle = '#333';
            minimapCtx.strokeRect(room.x / 50 + 5, room.y / 50 + 5, cellSize - 2, cellSize - 2);
        }

        // Highlight current room
        if (room.id === gameMap.currentRoom) {
            minimapCtx.strokeStyle = '#b8860b';
            minimapCtx.lineWidth = 2;
            minimapCtx.strokeRect(room.x / 50 + 5, room.y / 50 + 5, cellSize - 2, cellSize - 2);
        }
    });

    // Draw player position (center of current room)
    const current = gameMap.rooms[gameMap.currentRoom];
    minimapCtx.fillStyle = '#00ff00';
    minimapCtx.beginPath();
    minimapCtx.arc(75, 75, 4, 0, Math.PI * 2);
    minimapCtx.fill();
}
```

### Visual States

- **Undiscovered:** Gray outline, no fill
- **Discovered:** Dark fill, objects visible
- **Current room:** Amber border highlight
- **Unlocked door:** Green dot
- **Locked door:** Red dot
- **Player:** Green dot in center of minimap

## Room Transition

### Door Collision Detection

```javascript
function checkRoomTransition() {
    const currentRoom = gameMap.rooms[gameMap.currentRoom];
    
    gameMap.doors.forEach(door => {
        if (door.from !== gameMap.currentRoom) return;
        
        // Check if player is at door position
        const dx = player.x - door.x;
        const dy = player.y - door.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 30) {
            // Check if door is unlocked
            const hasKey = inventory.some(k => k.keyId === door.keyRequired);
            if (hasKey) {
                transitionToRoom(door.to);
            }
        }
    });
}

function transitionToRoom(roomId) {
    const newRoom = gameMap.rooms[roomId];
    newRoom.discovered = true;
    gameMap.currentRoom = roomId;
    
    // Position player at room entrance
    player.x = newRoom.x + 50;
    player.y = newRoom.height / 2;
    
    playSound('door');
    updateObjective();
}
```

## Game Flow

1. **Start:** Player in Reception (discovered)
2. **Puzzle:** Approach PC → solve 3 questions → get key
3. **Unlock:** Key auto-applies to door
4. **Transition:** Walk through door → new room discovered
5. **Repeat:** Continue until Rooftop
6. **Win:** Reach exit in Rooftop → victory screen

## UI Updates

### Objective Text

```javascript
function updateObjective() {
    const room = gameMap.rooms[gameMap.currentRoom];
    const door = gameMap.doors.find(d => d.from === room.id);
    const hasKey = door && inventory.some(k => k.keyId === door.keyRequired);
    
    if (!hasKey) {
        document.getElementById('objective').textContent = 
            `${room.name} - Find and use the PC`;
    } else {
        document.getElementById('objective').textContent = 
            'Key obtained! Go to the door to exit';
    }
}
```

### Victory Condition

When reaching Rooftop and interacting with exit:

```javascript
function checkExit() {
    if (gameMap.currentRoom === 'rooftop') {
        const dx = player.x - 750; // Exit position
        const dy = player.y - 700;
        if (Math.sqrt(dx * dx + dy * dy) < 50) {
            showVictory();
        }
    }
}
```

## Implementation Checklist

- [ ] Replace `levels[]` array with `gameMap` object
- [ ] Add room discovery state tracking
- [ ] Update object placement to per-room
- [ ] Add door/target room properties
- [ ] Implement `checkRoomTransition()` function
- [ ] Update minimap to show discovered rooms
- [ ] Update `updateObjective()` for new flow
- [ ] Handle victory at Rooftop exit
- [ ] Preserve all existing puzzles/content

## Backward Compatibility

All existing puzzles remain unchanged - only the map navigation layer changes. Audio, controls, and UI elements stay the same.