const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const minimapCanvas = document.getElementById('minimap-canvas');
const minimapCtx = minimapCanvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
minimapCanvas.width = 150;
minimapCanvas.height = 150;

const characterImage = new Image();
characterImage.src = 'images/character.png';

const particles = [];
for (let i = 0; i < 50; i++) {
    particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
    });
}

const player = {
    x: 100,
    y: 100,
    angle: 0,
    speed: 3,
    stamina: 100
};

const keys = {};
const objects = [];
const sounds = {};

const floorImage = new Image();
floorImage.src = 'images/floor_2.png';

const tableImage = new Image();
tableImage.src = 'images/table_1.png';

const objectImages = {};
const objectImageFiles = ['pc_tower', 'monitor', 'desk', 'box', 'shelf', 'server', 'lamp', 'chair'];
objectImageFiles.forEach(name => {
    const img = new Image();
    img.src = `images/${name}.png`;
    objectImages[name] = img;
});

const levels = [
    {
        id: 1,
        name: "Password Security",
        roomWidth: 800,
        roomHeight: 600,
        puzzles: [
            { type: 'password', question: 'Is "123456" a strong password?', options: ['Yes', 'No'], answer: 1 },
            { type: 'password', question: 'Is "Tr0ub4dor&3" a strong password?', options: ['Yes', 'No'], answer: 0 },
            { type: 'password', question: 'Is "correcthorsebatterystaple" strong?', options: ['Yes', 'No'], answer: 0 }
        ],
        keyItem: '🔑 Keycard',
        keyName: 'Blue Keycard',
        doorColor: '#b54848'
    },
    {
        id: 2,
        name: "Phishing Detection",
        roomWidth: 800,
        roomHeight: 600,
        puzzles: [
            { type: 'phishing', question: 'Email from "security@bank-secure.com" - Is this phishing?', options: ['Yes - Suspicious', 'No - Legitimate'], answer: 0 },
            { type: 'phishing', question: 'Email asks to "Click here to verify within 24 hours" - Phishing?', options: ['Yes', 'No'], answer: 0 },
            { type: 'phishing', question: 'Email from your CEO asking for gift cards - Phishing?', options: ['Yes', 'No'], answer: 0 }
        ],
        keyItem: '🔑 USB Drive',
        keyName: 'USB Drive',
        doorColor: '#b54848'
    },
    {
        id: 3,
        name: "Encryption",
        roomWidth: 800,
        roomHeight: 600,
        puzzles: [
            { type: 'cipher', question: 'Decode "KHOOR" (shift -3)', answer: 'HELLO', hint: 'K=H, H=E, O=L, R=O' },
            { type: 'cipher', question: 'Decode "YOLTK" (shift +3)', answer: 'BROWN', hint: 'Y=B, O=R, L=O, T=W, K=N' },
            { type: 'cipher', question: 'Decode "NRFZH" (shift +3)', answer: 'QUICK', hint: 'N=Q, R=U, F=I, Z=C, H=K' }
        ],
        keyItem: '🔑 Encryption Key',
        keyName: 'Encryption Key',
        doorColor: '#b54848'
    },
    {
        id: 4,
        name: "Network Defense",
        roomWidth: 800,
        roomHeight: 600,
        puzzles: [
            { type: 'network', question: 'Which defense blocks unauthorized access?', options: ['Antivirus', 'Firewall', 'VPN'], answer: 1 },
            { type: 'network', question: 'Which detects suspicious activity?', options: ['Firewall', 'IDS', 'VPN'], answer: 1 },
            { type: 'network', question: 'Which encrypts network traffic?', options: ['Antivirus', 'Firewall', 'VPN'], answer: 2 }
        ],
        keyItem: '🔑 Admin Badge',
        keyName: 'Admin Badge',
        doorColor: '#b54848'
    },
    {
        id: 5,
        name: "Final Escape",
        roomWidth: 800,
        roomHeight: 600,
        puzzles: [
            { type: 'final', question: 'Combine all skills! Decode "CLU" (+3)', answer: 'FOX', hint: 'Think Caesar cipher' },
            { type: 'final', question: 'What makes a strong password?', options: ['12+ chars, mixed case, numbers', 'Your birthday', 'Pet name'], answer: 0 },
            { type: 'final', question: 'Phishing email usually contains?', options: ['Urgent action required', 'Company logo', 'Proper spelling'], answer: 0 }
        ],
        keyItem: '🔑 Exit Pass',
        keyName: 'Exit Pass',
        doorColor: '#b54848'
    }
];

let currentLevel = 0;
let currentPuzzle = 0;
let inventory = [];
let gameStarted = false;
let hasKey = false;
let doorUnlocked = false;
let levelCompleted = false;
let puzzleOpen = false;

function playSound(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const frequencies = {
        step: 100,
        interact: 440,
        success: 660,
        error: 220,
        pickup: 880,
        door: 330
    };

    oscillator.frequency.value = frequencies[type] || 440;
    oscillator.type = type === 'error' ? 'sawtooth' : 'sine';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function initLevel(levelIndex) {
    const level = levels[levelIndex];
    currentPuzzle = 0;
    hasKey = false;
    doorUnlocked = false;
    levelCompleted = false;

    objects.length = 0;

    const centerX = level.roomWidth / 2;
    const centerY = level.roomHeight / 2;

    objects.push({
        type: 'monitor',
        x: centerX,
        y: centerY,
        width: 60,
        height: 45,
        color: '#0a0a0a',
        interactive: true,
        name: 'Terminal'
    });

    objects.push({
        type: 'desk',
        x: 120,
        y: 70,
        width: 120,
        height: 45,
        color: '#2d2520',
        interactive: false,
        name: 'Workstation'
    });

    objects.push({
        type: 'pc_tower',
        x: level.roomWidth - 80,
        y: level.roomHeight - 60,
        width: 40,
        height: 80,
        color: '#1a1a1a',
        interactive: false,
        name: 'Screen'
    });

    objects.push({
        type: 'box',
        x: 55,
        y: level.roomHeight - 50,
        width: 50,
        height: 50,
        color: '#3d3025',
        interactive: false,
        name: 'Supply Crate'
    });

    objects.push({
        type: 'door',
        x: level.roomWidth - 40,
        y: level.roomHeight / 2,
        width: 30,
        height: 100,
        color: level.doorColor,
        interactive: true,
        name: 'Exit Door'
    });

    objects.push({
        type: 'server',
        x: level.roomWidth - 70,
        y: 60,
        width: 45,
        height: 65,
        color: '#0a0a0a',
        interactive: false,
        name: 'Server Rack'
    });

    objects.push({
        type: 'shelf',
        x: 60,
        y: level.roomHeight - 150,
        width: 70,
        height: 25,
        color: '#2a1a10',
        interactive: false,
        name: 'Storage Shelf'
    });

    player.x = 100;
    player.y = level.roomHeight / 2;
    player.angle = 0;

    updateObjective();
    updateInventoryUI();
}

function updateObjective() {
    const objEl = document.getElementById('objective');
    if (!hasKey) {
        objEl.textContent = `Level ${currentLevel + 1}: ${levels[currentLevel].name} - Find and use the PC`;
    } else if (!doorUnlocked) {
        objEl.textContent = 'Key obtained! Go to the door to exit';
    } else {
        objEl.textContent = 'Door unlocked! Press E to escape';
    }
}

function updateInventoryUI() {
    const slots = document.querySelectorAll('.inv-slot');
    slots.forEach((slot, i) => {
        if (inventory[i]) {
            slot.textContent = inventory[i].icon;
            slot.classList.add('has-item');
        } else {
            slot.textContent = '';
            slot.classList.remove('has-item');
        }
    });
}

function drawRoom() {
    const level = levels[currentLevel];

    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.fillStyle = `rgba(100, 150, 150, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    const offsetX = canvas.width / 2 - player.x;
    const offsetY = canvas.height / 2 - player.y;

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // Floor with image (scaled to room size)
    if (floorImage.complete && floorImage.naturalWidth > 0) {
        ctx.drawImage(floorImage, 0, 0, level.roomWidth, level.roomHeight);
    } else {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, level.roomWidth, level.roomHeight);
    }

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 20;
    ctx.strokeRect(0, 0, level.roomWidth, level.roomHeight);

    // Walls
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, level.roomWidth, 20);
    ctx.fillRect(0, level.roomHeight - 20, level.roomWidth, 20);
    ctx.fillRect(0, 0, 20, level.roomHeight);
    ctx.fillRect(level.roomWidth - 20, 0, 20, level.roomHeight);

    objects.forEach(obj => {
        const ox = obj.x - obj.width / 2;
        const oy = obj.y - obj.height / 2;

        if (obj.type === 'pc_tower') {
            const grad = ctx.createLinearGradient(ox, oy, ox + obj.width, oy + obj.height);
            grad.addColorStop(0, '#2a2a2a');
            grad.addColorStop(0.5, '#1a1a1a');
            grad.addColorStop(1, '#0a0a0a');
            ctx.fillStyle = grad;
            ctx.fillRect(ox, oy, obj.width, obj.height);

            ctx.fillStyle = '#00ff88';
            ctx.globalAlpha = 0.8;
            ctx.fillRect(ox + 8, oy + 10, 4, 4);
            ctx.fillRect(ox + 8, oy + 20, 4, 4);
            ctx.fillRect(ox + 8, oy + 30, 4, 4);
            ctx.globalAlpha = 1;

            ctx.fillStyle = '#222';
            ctx.fillRect(ox + obj.width - 12, oy + 10, 8, 25);

            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.strokeRect(ox + 1, oy + 1, obj.width - 2, obj.height - 2);
        } else if (obj.type === 'door') {
            const grad = ctx.createLinearGradient(obj.x, obj.y - 50, obj.x + obj.width, obj.y + 50);
            grad.addColorStop(0, doorUnlocked ? '#3a6a3a' : '#5a3030');
            grad.addColorStop(0.5, doorUnlocked ? '#2a4a2a' : '#4a2020');
            grad.addColorStop(1, doorUnlocked ? '#1a3a1a' : '#3a1010');
            ctx.fillStyle = grad;
            ctx.fillRect(obj.x, obj.y - 50, obj.width, 100);

            ctx.fillStyle = doorUnlocked ? '#6af06a' : '#333';
            ctx.fillRect(obj.x + 5, obj.y - 35, 8, 15);
            ctx.fillRect(obj.x + 5, obj.y - 10, 8, 15);

            ctx.strokeStyle = doorUnlocked ? '#4a8a4a' : '#6a4040';
            ctx.lineWidth = 2;
            ctx.strokeRect(obj.x + 2, obj.y - 48, obj.width - 4, 96);

            ctx.fillStyle = '#ccc';
            ctx.beginPath();
            ctx.arc(obj.x + obj.width - 8, obj.y + 5, 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (obj.type === 'desk') {
            const grad = ctx.createLinearGradient(ox, oy, ox, oy + obj.height);
            grad.addColorStop(0, '#4a352a');
            grad.addColorStop(0.1, '#3d2e22');
            grad.addColorStop(0.9, '#2d2015');
            grad.addColorStop(1, '#1d1008');
            ctx.fillStyle = grad;
            ctx.fillRect(ox, oy, obj.width, obj.height);

            ctx.fillStyle = '#1a1510';
            ctx.fillRect(ox + 5, oy + obj.height - 5, 15, 8);
            ctx.fillRect(ox + obj.width - 20, oy + obj.height - 5, 15, 8);

            ctx.strokeStyle = '#1a1008';
            ctx.lineWidth = 1;
            ctx.strokeRect(ox + 1, oy + 1, obj.width - 2, obj.height - 2);
        } else if (obj.type === 'monitor') {
            const bezelGrad = ctx.createLinearGradient(ox, oy, ox + obj.width, oy + obj.height);
            bezelGrad.addColorStop(0, '#2a2a2a');
            bezelGrad.addColorStop(0.5, '#1a1a1a');
            bezelGrad.addColorStop(1, '#0a0a0a');
            ctx.fillStyle = bezelGrad;
            ctx.fillRect(ox, oy, obj.width, obj.height);

            const screenGrad = ctx.createLinearGradient(ox + 4, oy + 4, ox + obj.width - 4, oy + 30);
            screenGrad.addColorStop(0, '#1a3040');
            screenGrad.addColorStop(0.5, '#0a2030');
            screenGrad.addColorStop(1, '#051525');
            ctx.fillStyle = screenGrad;
            ctx.fillRect(ox + 4, oy + 4, obj.width - 8, 32);

            ctx.fillStyle = '#00ffaa';
            ctx.font = '8px monospace';
            ctx.fillText('>', ox + 8, oy + 20);

            ctx.fillStyle = '#333';
            ctx.fillRect(ox + obj.width / 2 - 10, oy + obj.height - 8, 20, 8);
            ctx.fillRect(ox + obj.width / 2 - 15, oy + obj.height - 2, 30, 4);

            ctx.strokeStyle = '#444';
            ctx.lineWidth = 1;
            ctx.strokeRect(ox + 1, oy + 1, obj.width - 2, obj.height - 2);
        } else if (obj.type === 'box') {
            const boxGrad = ctx.createLinearGradient(ox, oy, ox + obj.width, oy + obj.height);
            boxGrad.addColorStop(0, '#4d3e2a');
            boxGrad.addColorStop(0.5, '#3d2e1a');
            boxGrad.addColorStop(1, '#2d1e10');
            ctx.fillStyle = boxGrad;
            ctx.fillRect(ox, oy, obj.width, obj.height);

            ctx.strokeStyle = '#5a4530';
            ctx.lineWidth = 2;
            ctx.strokeRect(ox + 3, oy + 3, obj.width - 6, obj.height - 6);

            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.lineTo(ox + 8, oy + 8);
            ctx.moveTo(ox + obj.width, oy);
            ctx.lineTo(ox + obj.width - 8, oy + 8);
            ctx.stroke();

            ctx.strokeStyle = '#3a2a15';
            ctx.lineWidth = 1;
            ctx.strokeRect(ox + 1, oy + 1, obj.width - 2, obj.height - 2);
        } else {
            ctx.fillStyle = obj.color;
            ctx.fillRect(ox, oy, obj.width, obj.height);
        }
    });

    ctx.restore();

    drawMinimap();
    drawCharacter();
}

function drawMinimap() {
    const level = levels[currentLevel];
    const scale = Math.min(140 / level.roomWidth, 140 / level.roomHeight);

    minimapCtx.fillStyle = '#0d0d0d';
    minimapCtx.fillRect(0, 0, 150, 150);

    minimapCtx.strokeStyle = '#333';
    minimapCtx.lineWidth = 2;
    minimapCtx.strokeRect(5, 5, 140, 140);

    minimapCtx.fillStyle = '#4a7c7c';
    objects.forEach(obj => {
        if (obj.type === 'monitor' || obj.type === 'pc_tower' || obj.type === 'door') {
            minimapCtx.fillRect(5 + obj.x * scale, 5 + obj.y * scale, 8, 8);
        }
    });

    minimapCtx.fillStyle = '#00ffc3';
    minimapCtx.beginPath();
    minimapCtx.arc(5 + player.x * scale, 5 + player.y * scale, 4, 0, Math.PI * 2);
    minimapCtx.fill();

    const dirX = Math.cos(player.angle) * 15;
    const dirY = Math.sin(player.angle) * 15;
    minimapCtx.strokeStyle = '#00ffc3';
    minimapCtx.lineWidth = 2;
    minimapCtx.beginPath();
    minimapCtx.moveTo(5 + player.x * scale, 5 + player.y * scale);
    minimapCtx.lineTo(5 + (player.x + dirX) * scale, 5 + (player.y + dirY) * scale);
    minimapCtx.stroke();
}

function drawCharacter() {
    if (characterImage.complete && characterImage.naturalWidth > 0) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const size = 60;

        ctx.drawImage(characterImage, cx - 40, cy - 30, 110, size);
    } else {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const size = 40;

        ctx.fillStyle = '#3a5c5c';
        ctx.fillRect(cx - size / 2, cy - size / 2, size, size);

        ctx.fillStyle = '#4a7c7c';
        ctx.fillRect(cx - size / 2 + 4, cy - size / 2 + 4, size - 8, size - 8);

        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(cx - 8, cy - 8, 6, 6);
        ctx.fillRect(cx + 2, cy - 8, 6, 6);

        ctx.fillStyle = '#666';
        ctx.fillRect(cx - 4, cy + 4, 8, 3);

        ctx.fillStyle = '#2d2d2d';
        ctx.fillRect(cx - size / 2 - 4, cy - size / 4, 4, size / 2);
        ctx.fillRect(cx + size / 2, cy - size / 4, 4, size / 2);

        ctx.fillStyle = '#4a7c7c';
        ctx.fillRect(cx - 2, cy + 10, 4, 8);
    }
}

function checkInteraction() {
    const level = levels[currentLevel];
    const dx = player.x - level.roomWidth / 2;
    const dy = player.y - level.roomHeight / 2;
    const distToPC = Math.sqrt(dx * dx + dy * dy);

    const door = objects.find(o => o.type === 'door');
    const dxDoor = player.x - door.x;
    const dyDoor = player.y - door.y;
    const distToDoor = Math.sqrt(dxDoor * dxDoor + dyDoor * dyDoor);

    const prompt = document.getElementById('interaction-prompt');

    if (distToPC < 80) {
        prompt.classList.remove('hidden');
        prompt.textContent = 'Press E to use Terminal';
        return { type: 'monitor', obj: objects.find(o => o.type === 'monitor') };
    } else if (distToDoor < 100 && doorUnlocked) {
        prompt.classList.remove('hidden');
        prompt.textContent = 'Press E to exit room';
        return { type: 'door', obj: door };
    } else if (distToDoor < 100 && !doorUnlocked) {
        prompt.classList.remove('hidden');
        prompt.textContent = 'Door is locked - solve puzzle first';
        return null;
    } else {
        prompt.classList.add('hidden');
        return null;
    }
}

function openPuzzle() {
    const level = levels[currentLevel];
    const puzzle = level.puzzles[currentPuzzle];

    document.getElementById('puzzle-title').textContent = level.name;
    const content = document.getElementById('puzzle-content');

    let html = `<div class="puzzle-question">
        <p>Question ${currentPuzzle + 1}/${level.puzzles.length}</p>
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
    document.exitPointerLock();
    playSound('interact');
}

function answerPuzzle(answer) {
    const level = levels[currentLevel];
    const puzzle = level.puzzles[currentPuzzle];
    const feedback = document.getElementById('puzzle-feedback');

    if (answer === puzzle.answer) {
        feedback.innerHTML = '<div class="puzzle-feedback success">Correct!</div>';
        playSound('success');
        currentPuzzle++;

        if (currentPuzzle >= level.puzzles.length) {
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

function submitTextAnswer() {
    const input = document.getElementById('puzzle-answer').value.toUpperCase().trim();
    const level = levels[currentLevel];
    const puzzle = level.puzzles[currentPuzzle];
    const feedback = document.getElementById('puzzle-feedback');

    if (input === puzzle.answer) {
        feedback.innerHTML = '<div class="puzzle-feedback success">Correct!</div>';
        playSound('success');
        currentPuzzle++;

        if (currentPuzzle >= level.puzzles.length) {
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

function collectKey() {
    const level = levels[currentLevel];
    hasKey = true;
    inventory.push({ name: level.keyName, icon: level.keyItem.split(' ')[0] });
    doorUnlocked = true;

    playSound('pickup');
    updateObjective();
    updateInventoryUI();
}

function closePuzzle() {
    document.getElementById('puzzle-overlay').classList.add('hidden');
    puzzleOpen = false;
    if (gameStarted) {
        canvas.requestPointerLock();
    }
    for (let key in keys) {
        keys[key] = false;
    }
}

function nextLevel() {
    currentLevel++;
    if (currentLevel >= levels.length) {
        document.exitPointerLock();
        document.getElementById('victory-screen').classList.remove('hidden');
        document.body.classList.remove('game-started');
        playSound('success');
    } else {
        initLevel(currentLevel);
    }
}

function skipLevel() {
    hasKey = true;
    doorUnlocked = true;
    inventory.push({ name: 'Skip Key', icon: '⏭️' });
    playSound('pickup');
    updateObjective();
    updateInventoryUI();
    checkInteraction();
}

function handleInteraction(type) {
    if (type === 'pc' || type === 'pc_tower' || type === 'monitor') {
        openPuzzle();
    } else if (type === 'door' && doorUnlocked) {
        playSound('door');
        levelCompleted = true;
        setTimeout(nextLevel, 500);
    }
}

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

    checkInteraction();
    drawRoom();
    requestAnimationFrame(update);
}

function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.body.classList.add('game-started');
    canvas.requestPointerLock();
    gameStarted = true;
    initLevel(0);
    update();
}

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (!puzzleOpen && (e.key === 'e' || e.key === 'E')) {
        const interaction = checkInteraction();
        if (interaction && interaction.type) {
            handleInteraction(interaction.type);
        }
    }

    if (e.key === '.') {
        skipLevel();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.addEventListener('blur', () => {
    for (let key in keys) {
        keys[key] = false;
    }
});

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === canvas) {
        player.angle += e.movementX * 0.003;
    }
});

document.addEventListener('click', () => {
    if (!gameStarted) return;
    if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
    }
});

document.addEventListener('pointerlockchange', () => {
    if (!document.pointerLockElement && gameStarted) {
    }
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

document.getElementById('startButton').addEventListener('click', startGame);