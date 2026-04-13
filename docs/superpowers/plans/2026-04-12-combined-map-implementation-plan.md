# Combined Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace 5 separate levels with single explorable map - player starts in Reception, unlocks doors to progress through IT Office → Server Room → Executive Suite → Rooftop.

**Architecture:** Single gameMap object with rooms array, doors array, and discovery state. Room transition via door collision. Minimap shows discovered rooms.

**Tech Stack:** Vanilla JavaScript, HTML Canvas, existing game.js/css

---

## File Structure

**Modify:**
- `js/game.js` - Replace level system with map/rooms, add discovery logic, update minimap and game flow

**Test:**
- Play through all 5 rooms, verify door transitions, key collection, minimap discovery

---

### Task 1: Replace levels array with gameMap object

**Files:**
- Modify: `js/game.js:23-94`

- [ ] **Step 1: Replace levels array with gameMap structure**

```javascript
const gameMap = {
    width: 1500,
    height: 1500,
    currentRoom: 'reception',
    rooms: {
        'reception': {
            id: 'reception',
            name: 'Reception',
            x: 0, y: 0,
            width: 300, height: 300,
            discovered: true,
            keyId: 'key-1',
            keyName: 'Blue Keycard',
            keyItem: '🔑 Keycard',
            doorColor: '#4a7c7c',
            puzzles: [
                { type: 'password', question: 'Is "123456" a strong password?', options: ['Yes', 'No'], answer: 1 },
                { type: 'password', question: 'Is "Tr0ub4dor&3" a strong password?', options: ['Yes', 'No'], answer: 0 },
                { type: 'password', question: 'Is "correcthorsebatterystaple" strong?', options: ['Yes', 'No'], answer: 0 }
            ]
        },
        'it-office': {
            id: 'it-office',
            name: 'IT Office',
            x: 300, y: 0,
            width: 300, height: 300,
            discovered: false,
            keyId: 'key-2',
            keyName: 'USB Drive',
            keyItem: '💾 USB Drive',
            doorColor: '#b8860b',
            puzzles: [
                { type: 'network', question: 'Which defense blocks unauthorized access?', options: ['Antivirus', 'Firewall', 'VPN'], answer: 1 },
                { type: 'network', question: 'Which detects suspicious activity?', options: ['Firewall', 'IDS', 'VPN'], answer: 1 },
                { type: 'network', question: 'Which encrypts network traffic?', options: ['Antivirus', 'Firewall', 'VPN'], answer: 2 }
            ]
        },
        'server-room': {
            id: 'server-room',
            name: 'Server Room',
            x: 600, y: 0,
            width: 300, height: 300,
            discovered: false,
            keyId: 'key-3',
            keyName: 'Encryption Key',
            keyItem: '🔐 Encryption Key',
            doorColor: '#8b0000',
            puzzles: [
                { type: 'cipher', question: 'Decode "KHOOR" (shift +3)', answer: 'HELLO', hint: 'K=H, H=E, O=L, R=O' },
                { type: 'cipher', question: 'Decode "FURVV" (shift +3)', answer: 'CROSS', hint: 'F=C, U=R, R=O, S=S' },
                { type: 'cipher', question: 'Decode "ZHOOG" (shift +3)', answer: 'WATCH', hint: 'Z=W, H=A, O=C, G=K' }
            ]
        },
        'executive': {
            id: 'executive',
            name: 'Executive Suite',
            x: 600, y: 300,
            width: 300, height: 300,
            discovered: false,
            keyId: 'key-4',
            keyName: 'Admin Badge',
            keyItem: '🛡️ Admin Badge',
            doorColor: '#4a7c7c',
            puzzles: [
                { type: 'phishing', question: 'Email from "security@bank-secure.com" - Is this phishing?', options: ['Yes - Suspicious', 'No - Legitimate'], answer: 0 },
                { type: 'phishing', question: 'Email asks to "Click here to verify within 24 hours" - Phishing?', options: ['Yes', 'No'], answer: 0 },
                { type: 'phishing', question: 'Email from your CEO asking for gift cards - Phishing?', options: ['Yes', 'No'], answer: 0 }
            ]
        },
        'rooftop': {
            id: 'rooftop',
            name: 'Rooftop',
            x: 600, y: 600,
            width: 300, height: 300,
            discovered: false,
            isExit: true,
            puzzles: [
                { type: 'final', question: 'Combine all skills! Decode "FLQP" (+3)', answer: 'CILO', hint: 'Think Caesar cipher' },
                { type: 'final', question: 'What makes a strong password?', options: ['12+ chars, mixed case, numbers', 'Your birthday', 'Pet name'], answer: 0 },
                { type: 'final', question: 'Phishing email usually contains?', options: ['Urgent action required', 'Company logo', 'Proper spelling'], answer: 0 }
            ]
        }
    },
    doors: [
        { from: 'reception', to: 'it-office', x: 300, y: 150, keyRequired: 'key-1' },
        { from: 'it-office', to: 'server-room', x: 600, y: 150, keyRequired: 'key-2' },
        { from: 'server-room', to: 'executive', x: 900, y: 150, keyRequired: 'key-3' },
        { from: 'executive', to: 'rooftop', x: 900, y: 450, keyRequired: 'key-4' }
    ]
};
```

- [ ] **Step 2: Add global state variables after gameMap**

```javascript
let currentRoomId = 'reception';
let currentPuzzle = 0;
let hasKey = false;
let doorUnlocked = false;
let levelCompleted = false;
let puzzleOpen = false;
```

- [ ] **Step 3: Remove the old levels array and currentLevel variable**

Delete lines 23-94 (`const levels = [...]`) and line 96 (`let currentLevel = 0`)

- [ ] **Step 4: Add helper to get current room**

```javascript
function getCurrentRoom() {
    return gameMap.rooms[currentRoomId];
}
```

---

### Task 2: Create room object initialization

**Files:**
- Modify: `js/game.js:132-213`

- [ ] **Step 1: Replace initLevel with initRoom function**

```javascript
function initRoom(roomId) {
    const room = gameMap.rooms[roomId];
    if (!room) return;
    
    currentRoomId = roomId;
    currentPuzzle = 0;
    hasKey = false;
    doorUnlocked = false;
    levelCompleted = false;
    
    objects.length = 0;
    
    // PC (puzzle point) - centered in room
    objects.push({
        type: 'pc',
        x: room.x + room.width / 2,
        y: room.y + room.height / 2,
        width: 60,
        height: 50,
        color: '#2d2d2d',
        interactive: true,
        name: 'Computer'
    });
    
    // Desk
    objects.push({
        type: 'desk',
        x: room.x + room.width / 2 - 80,
        y: room.y + room.height / 2 - 60,
        width: 80,
        height: 40,
        color: '#1a1a1a',
        interactive: false,
        name: 'Desk'
    });
    
    // Cabinet
    objects.push({
        type: 'cabinet',
        x: room.x + room.width - 60,
        y: room.y + 60,
        width: 50,
        height: 80,
        color: '#252525',
        interactive: false,
        name: 'Cabinet'
    });
    
    // Crates
    objects.push({
        type: 'crates',
        x: room.x + 60,
        y: room.y + room.height - 60,
        width: 60,
        height: 60,
        color: '#1f1f1f',
        interactive: false,
        name: 'Crates'
    });
    
    // Door (if not exit room)
    if (!room.isExit) {
        const door = gameMap.doors.find(d => d.from === roomId);
        if (door) {
            objects.push({
                type: 'door',
                x: door.x,
                y: door.y,
                width: 30,
                height: 100,
                color: room.doorColor,
                interactive: true,
                name: 'Exit Door',
                targetRoom: door.to,
                keyRequired: door.keyRequired
            });
        }
    } else {
        // Rooftop exit
        objects.push({
            type: 'exit',
            x: room.x + room.width - 60,
            y: room.y + room.height / 2,
            width: 40,
            height: 100,
            color: '#00ff00',
            interactive: true,
            name: 'Exit'
        });
    }
    
    // Reset player position to room entrance
    player.x = room.x + 50;
    player.y = room.y + room.height / 2;
    player.angle = 0;
    
    updateObjective();
    updateInventoryUI();
}
```

- [ ] **Step 2: Update updateObjective to use new structure**

```javascript
function updateObjective() {
    const room = getCurrentRoom();
    const door = gameMap.doors.find(d => d.from === currentRoomId);
    const hasRequiredKey = door && inventory.some(k => k.keyId === door.keyRequired);
    
    if (room.isExit) {
        document.getElementById('objective').textContent = 'Rooftop - Reach the exit to escape!';
    } else if (!hasKey) {
        document.getElementById('objective').textContent = `${room.name} - Find and use the PC`;
    } else if (!doorUnlocked) {
        document.getElementById('objective').textContent = 'Key obtained! Go to the door to exit';
    } else {
        document.getElementById('objective').textContent = 'Door unlocked! Press E to escape';
    }
}
```

- [ ] **Step 3: Update collectKey to use new structure**

```javascript
function collectKey() {
    const room = getCurrentRoom();
    hasKey = true;
    inventory.push({ name: room.keyName, keyId: room.keyId, icon: room.keyItem.split(' ')[0] });
    doorUnlocked = true;
    
    playSound('pickup');
    updateObjective();
    updateInventoryUI();
}
```

---

### Task 3: Update drawRoom for new map

**Files:**
- Modify: `js/game.js:239-290`

- [ ] **Step 1: Update drawRoom to render current room only**

```javascript
function drawRoom() {
    const room = getCurrentRoom();
    
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Camera follows player within current room
    const offsetX = canvas.width / 2 - player.x;
    const offsetY = canvas.height / 2 - player.y;
    
    ctx.save();
    ctx.translate(offsetX, offsetY);
    
    // Draw room boundaries
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 20;
    ctx.strokeRect(room.x, room.y, room.width, room.height);
    
    ctx.fillStyle = '#111';
    ctx.fillRect(room.x, room.y, room.width, room.height);
    
    // Draw objects (only those in current room)
    objects.forEach(obj => {
        ctx.fillStyle = obj.color;
        
        if (obj.type === 'pc') {
            ctx.fillRect(obj.x - 30, obj.y - 25, 60, 50);
            ctx.fillStyle = '#4a7c7c';
            ctx.fillRect(obj.x - 25, obj.y - 20, 50, 35);
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(obj.x - 10, obj.y + 15, 20, 10);
        } else if (obj.type === 'door') {
            ctx.fillStyle = doorUnlocked ? '#2a5a2a' : obj.color;
            ctx.fillRect(obj.x, obj.y - 50, obj.width, 100);
            ctx.fillStyle = doorUnlocked ? '#4a8a4a' : '#333';
            ctx.fillRect(obj.x + 5, obj.y - 40, 20, 20);
        } else if (obj.type === 'exit') {
            ctx.fillStyle = '#2a5a2a';
            ctx.fillRect(obj.x - 20, obj.y - 50, 40, 100);
            ctx.fillStyle = '#4a8a4a';
            ctx.fillRect(obj.x - 10, obj.y - 30, 20, 20);
            ctx.fillStyle = '#00ff00';
            ctx.font = '14px monospace';
            ctx.fillText('EXIT', obj.x - 15, obj.y + 20);
        } else if (obj.type === 'cabinet') {
            ctx.fillRect(obj.x - 25, obj.y - 40, 50, 80);
            ctx.fillStyle = '#222';
            ctx.fillRect(obj.x - 20, obj.y - 35, 40, 30);
            ctx.fillRect(obj.x - 20, obj.y + 5, 40, 30);
        } else if (obj.type === 'crates') {
            ctx.fillRect(obj.x - 30, obj.y - 30, 60, 25);
            ctx.fillRect(obj.x - 25, obj.y - 55, 50, 25);
            ctx.fillRect(obj.x - 20, obj.y - 75, 40, 20);
        } else {
            ctx.fillRect(obj.x - obj.width / 2, obj.y - obj.height / 2, obj.width, obj.height);
        }
    });
    
    ctx.restore();
    
    drawMinimap();
    drawCharacter();
}
```

---

### Task 4: Update minimap for discovery system

**Files:**
- Modify: `js/game.js:292-323`

- [ ] **Step 1: Replace drawMinimap with discovery-based version**

```javascript
function drawMinimap() {
    minimapCtx.fillStyle = '#0d0d0d';
    minimapCtx.fillRect(0, 0, 150, 150);
    
    // Scale: 150px minimap / 1500px map = 0.1
    const scale = 0.1;
    const cellSize = 28; // 140 / 5 rooms
    
    // Draw each room
    Object.values(gameMap.rooms).forEach(room => {
        const roomX = room.x * scale + 5;
        const roomY = room.y * scale + 5;
        const roomW = room.width * scale;
        const roomH = room.height * scale;
        
        if (room.discovered) {
            // Discovered room - filled
            minimapCtx.fillStyle = '#1a1a1a';
            minimapCtx.fillRect(roomX, roomY, roomW - 2, roomH - 2);
            
            // Draw objects if in current room
            if (room.id === currentRoomId) {
                objects.forEach(obj => {
                    const objX = obj.x * scale + 5;
                    const objY = obj.y * scale + 5;
                    
                    if (obj.type === 'pc') {
                        minimapCtx.fillStyle = '#4a7c7c';
                        minimapCtx.fillRect(objX - 2, objY - 2, 4, 4);
                    } else if (obj.type === 'door') {
                        const door = gameMap.doors.find(d => d.from === room.id);
                        const unlocked = door && inventory.some(k => k.keyId === door.keyRequired);
                        minimapCtx.fillStyle = unlocked ? '#2a5a2a' : '#8b0000';
                        minimapCtx.fillRect(objX - 2, objY - 2, 4, 4);
                    } else if (obj.type === 'exit') {
                        minimapCtx.fillStyle = '#00ff00';
                        minimapCtx.fillRect(objX - 2, objY - 2, 4, 4);
                    }
                });
            }
        } else {
            // Undiscovered room - outline only
            minimapCtx.fillStyle = '#333';
            minimapCtx.strokeRect(roomX, roomY, roomW - 2, roomH - 2);
            minimapCtx.fillStyle = '#555';
            minimapCtx.font = '10px monospace';
            minimapCtx.fillText('???', roomX + 5, roomY + 15);
        }
        
        // Highlight current room
        if (room.id === currentRoomId) {
            minimapCtx.strokeStyle = '#b8860b';
            minimapCtx.lineWidth = 2;
            minimapCtx.strokeRect(roomX, roomY, roomW - 2, roomH - 2);
        }
    });
    
    // Draw player position at center of minimap
    minimapCtx.fillStyle = '#00ff00';
    minimapCtx.beginPath();
    minimapCtx.arc(75, 75, 4, 0, Math.PI * 2);
    minimapCtx.fill();
    
    // Direction indicator
    const dirX = Math.cos(player.angle) * 12;
    const dirY = Math.sin(player.angle) * 12;
    minimapCtx.strokeStyle = '#00ff00';
    minimapCtx.lineWidth = 2;
    minimapCtx.beginPath();
    minimapCtx.moveTo(75, 75);
    minimapCtx.lineTo(75 + dirX, 75 + dirY);
    minimapCtx.stroke();
}
```

---

### Task 5: Update checkInteraction and add room transition

**Files:**
- Modify: `js/game.js:351-380`, add new function after

- [ ] **Step 1: Update checkInteraction for new structure**

```javascript
function checkInteraction() {
    const room = getCurrentRoom();
    const pc = objects.find(o => o.type === 'pc');
    const door = objects.find(o => o.type === 'door');
    const exit = objects.find(o => o.type === 'exit');
    
    const prompt = document.getElementById('interaction-prompt');
    
    // Check PC proximity
    if (pc) {
        const dx = player.x - pc.x;
        const dy = player.y - pc.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 80) {
            prompt.classList.remove('hidden');
            prompt.textContent = 'Press E to use Computer';
            return { type: 'pc', obj: pc };
        }
    }
    
    // Check exit proximity (rooftop)
    if (exit) {
        const dx = player.x - exit.x;
        const dy = player.y - exit.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 80) {
            prompt.classList.remove('hidden');
            prompt.textContent = 'Press E to escape!';
            return { type: 'exit', obj: exit };
        }
    }
    
    // Check door proximity
    if (door) {
        const dx = player.x - door.x;
        const dy = player.y - door.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
            if (doorUnlocked) {
                prompt.classList.remove('hidden');
                prompt.textContent = 'Press E to enter next room';
                return { type: 'door', obj: door };
            } else {
                prompt.classList.remove('hidden');
                prompt.textContent = 'Door is locked - solve puzzle first';
                return null;
            }
        }
    }
    
    prompt.classList.add('hidden');
    return null;
}
```

- [ ] **Step 2: Add room transition function after checkInteraction**

```javascript
function transitionToRoom(roomId) {
    const newRoom = gameMap.rooms[roomId];
    if (!newRoom) return;
    
    newRoom.discovered = true;
    currentRoomId = roomId;
    
    playSound('door');
    
    initRoom(roomId);
    checkInteraction();
}

function checkVictory() {
    const room = getCurrentRoom();
    if (room.isExit) {
        const exit = objects.find(o => o.type === 'exit');
        if (exit) {
            const dx = player.x - exit.x;
            const dy = player.y - exit.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 50) {
                document.getElementById('victory-screen').classList.remove('hidden');
                playSound('success');
                return true;
            }
        }
    }
    return false;
}
```

---

### Task 6: Update puzzle functions for new structure

**Files:**
- Modify: `js/game.js:382-461`

- [ ] **Step 1: Update openPuzzle to use current room**

```javascript
function openPuzzle() {
    const room = getCurrentRoom();
    if (!room.puzzles || room.isExit) {
        // Rooftop - handle as victory
        if (room.isExit) {
            checkVictory();
        }
        return;
    }
    
    const puzzle = room.puzzles[currentPuzzle];
    if (!puzzle) return;
    
    document.getElementById('puzzle-title').textContent = room.name;
    const content = document.getElementById('puzzle-content');
    
    let html = `<div class="puzzle-question">
        <p>Question ${currentPuzzle + 1}/${room.puzzles.length}</p>
        <p style="font-size: 1.2rem; color: #aaa;">${puzzle.question}</p>`;
    
    if (puzzle.options) {
        html += '<div class="puzzle-options">';
        puzzle.options.forEach((opt, i) => {
            html += `<button class="puzzle-btn" onclick="answerPuzzle(${i})">${opt}</button>`;
        });
        html += '</div>';
    } else if (puzzle.type === 'cipher' || puzzle.type === 'final') {
        html += `<div class="puzzle-input-area">
            <input type="text" id="puzzle-answer" placeholder="Enter answer..." style="background:#0d0d0d;border:1px solid #4a7c7c;color:#4a7c7c;padding:12px 20px;font-family:'Courier New',monospace;font-size:1.1rem;">
            <button class="puzzle-btn" onclick="submitTextAnswer()" style="margin-left:10px;">Submit</button>
        </div>`;
    }
    
    html += '</div><div id="puzzle-feedback"></div>';
    content.innerHTML = html;
    
    document.getElementById('puzzle-overlay').classList.remove('hidden');
    puzzleOpen = true;
    playSound('interact');
}
```

- [ ] **Step 2: Update answerPuzzle for new structure**

```javascript
function answerPuzzle(answer) {
    const room = getCurrentRoom();
    const puzzle = room.puzzles[currentPuzzle];
    const feedback = document.getElementById('puzzle-feedback');
    
    if (answer === puzzle.answer) {
        feedback.innerHTML = '<div class="puzzle-feedback success">Correct!</div>';
        playSound('success');
        currentPuzzle++;
        
        if (currentPuzzle >= room.puzzles.length) {
            setTimeout(() => {
                closePuzzle();
                collectKey();
            }, 1000);
        } else {
            setTimeout(() => openPuzzle(), 1000);
        }
    } else {
        feedback.innerHTML = '<div class="puzzle-feedback error">Wrong! Try again.</div>';
        playSound('error');
    }
}
```

- [ ] **Step 3: Update submitTextAnswer for new structure**

```javascript
function submitTextAnswer() {
    const input = document.getElementById('puzzle-answer').value.toUpperCase().trim();
    const room = getCurrentRoom();
    const puzzle = room.puzzles[currentPuzzle];
    const feedback = document.getElementById('puzzle-feedback');
    
    if (input === puzzle.answer) {
        feedback.innerHTML = '<div class="puzzle-feedback success">Correct!</div>';
        playSound('success');
        currentPuzzle++;
        
        if (currentPuzzle >= room.puzzles.length) {
            setTimeout(() => {
                closePuzzle();
                collectKey();
            }, 1000);
        } else {
            setTimeout(() => openPuzzle(), 1000);
        }
    } else {
        feedback.innerHTML = '<div class="puzzle-feedback error">Wrong! Try again.</div>';
        playSound('error');
    }
}
```

---

### Task 7: Update handleInteraction and update function

**Files:**
- Modify: `js/game.js:502-509`, `js/game.js:512-544`

- [ ] **Step 1: Update handleInteraction for room transitions**

```javascript
function handleInteraction(type) {
    if (type === 'pc') {
        openPuzzle();
    } else if (type === 'door' && doorUnlocked) {
        const door = objects.find(o => o.type === 'door');
        if (door && door.targetRoom) {
            transitionToRoom(door.targetRoom);
        }
    } else if (type === 'exit') {
        checkVictory();
    }
}
```

- [ ] **Step 2: Update update function to include victory check**

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
    if (dPressed) moveX += playerSpeed;
    
    if (moveX !== 0 || moveY !== 0) {
        const room = getCurrentRoom();
        const newX = player.x + moveX;
        const newY = player.y + moveY;
        
        if (newX > room.x + 20 && newX < room.x + room.width - 20) {
            player.x = newX;
        }
        if (newY > room.y + 20 && newY < room.y + room.height - 20) {
            player.y = newY;
        }
    }
    
    checkInteraction();
    drawRoom();
    requestAnimationFrame(update);
}
```

---

### Task 8: Update startGame to use initRoom

**Files:**
- Modify: `js/game.js:546-553`

- [ ] **Step 1: Replace startGame to initialize reception room**

```javascript
function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.body.classList.add('game-started');
    canvas.requestPointerLock();
    gameStarted = true;
    initRoom('reception');
    update();
}
```

---

### Task 9: Test all functionality

**Files:**
- Test: Open game in browser

- [ ] **Step 1: Verify start screen and game launch**
- [ ] **Step 2: Verify player starts in Reception room**
- [ ] **Step 3: Verify minimap shows Reception discovered, others hidden**
- [ ] **Step 4: Test PC puzzle interaction and key collection**
- [ ] **Step 5: Test door unlock and room transition to IT Office**
- [ ] **Step 6: Verify new room appears on minimap as discovered**
- [ ] **Step 7: Complete all 5 rooms and reach Rooftop exit**
- [ ] **Step 8: Verify victory screen appears**
- [ ] **Step 9: Test skip level (K key) still works**
- [ ] **Step 10: Test cursor visibility on start vs gameplay