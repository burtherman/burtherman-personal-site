/**
 * Space Invaders Easter Egg
 *
 * Desktop Controls:
 * - Left/Right Arrow keys to move
 * - Spacebar to shoot
 * - ESC or Q to quit
 *
 * Mobile/Tablet Controls:
 * - Drag finger to move ship
 * - Tap to shoot
 * - Tap on game over screen to quit
 */

class SpaceInvadersGame {
    constructor() {
        this.active = false;
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;

        // Game State
        this.player = null;
        this.bullets = [];
        this.enemyBullets = []; // Bullets fired by enemies
        this.lastEnemyShot = 0; // Time tracking for enemy fire rate
        this.particles = []; // Explosions
        this.enemies = []; // Classic aliens
        this.domTargets = []; // Website elements to destroy
        this.score = 0;
        this.level = 1;
        this.levelStartTime = 0; // For showing level announcement
        this.readyPhase = false;
        this.readyTime = 0;
        this.enemyDirection = 1; // 1 for right, -1 for left
        this.baseEnemySpeed = 100; // Base pixels per second
        this.baseFireRate = 1.0; // Base seconds between enemy shots
        this.enemySpeed = 100;
        this.enemyFireRate = 1.0;
        this.enemyDropDistance = 30;
        this.lastTime = 0;
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false
        };

        // Assets
        this.sprites = {
            player: null,
            alien1: null,
            alien2: null
        };

        // Touch state
        this.touch = {
            active: false,
            x: 0,
            lastTap: 0
        };

        // Detect touch capability
        this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        // High score state
        this.highScores = this.loadHighScores();
        this.enteringName = false;
        this.playerName = ['A', 'A', 'A'];
        this.nameIndex = 0; // Which character is being edited (0-2)
        this.scoreSaved = false;

        // Audio
        this.audioCtx = null;
        this.rhythmInterval = null;
        this.rhythmNote = 0; // Alternates between 0 and 1
        this.baseRhythmSpeed = 500; // ms between notes at level 1

        // Bound event handlers (for proper cleanup)
        this.boundHandlers = {
            keydown: this.handleKeyDown.bind(this),
            keyup: this.handleKeyUp.bind(this),
            resize: this.handleResize.bind(this),
            touchstart: this.handleTouchStart.bind(this),
            touchmove: this.handleTouchMove.bind(this),
            touchend: this.handleTouchEnd.bind(this)
        };

        this.loadSprites();
    }

    addEventListeners() {
        window.addEventListener('keydown', this.boundHandlers.keydown);
        window.addEventListener('keyup', this.boundHandlers.keyup);
        window.addEventListener('resize', this.boundHandlers.resize);
        window.addEventListener('touchstart', this.boundHandlers.touchstart, { passive: false });
        window.addEventListener('touchmove', this.boundHandlers.touchmove, { passive: false });
        window.addEventListener('touchend', this.boundHandlers.touchend);
    }

    removeEventListeners() {
        window.removeEventListener('keydown', this.boundHandlers.keydown);
        window.removeEventListener('keyup', this.boundHandlers.keyup);
        window.removeEventListener('resize', this.boundHandlers.resize);
        window.removeEventListener('touchstart', this.boundHandlers.touchstart);
        window.removeEventListener('touchmove', this.boundHandlers.touchmove);
        window.removeEventListener('touchend', this.boundHandlers.touchend);
    }

    handleKeyDown(e) {
        if (!this.active) return;

        // Skip ready screen on any key
        if (this.readyPhase) {
            this.beginGameplay();
            e.preventDefault();
            return;
        }

        // Handle name entry when game is over
        if (this.enteringName) {
            if (this.handleNameEntry(e.key)) {
                e.preventDefault();
                return;
            }
        }

        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'Space') {
            this.keys[e.code] = true;
            e.preventDefault();
        } else if (e.key === 'Escape' || e.key.toLowerCase() === 'q') {
            if (this.enteringName) {
                // Skip name entry
                this.enteringName = false;
                this.scoreSaved = true;
            } else {
                this.stop();
            }
        }
    }

    handleKeyUp(e) {
        if (!this.active) return;
        if (Object.prototype.hasOwnProperty.call(this.keys, e.code)) {
            this.keys[e.code] = false;
        }
    }

    handleResize() {
        if (this.active) this.resizeCanvas();
    }

    handleTouchStart(e) {
        if (!this.active) return;
        e.preventDefault();

        // Skip ready screen on tap
        if (this.readyPhase) {
            this.beginGameplay();
            return;
        }

        if (this.gameOver) {
            // Don't exit during name entry - wait until they're done
            if (!this.enteringName) {
                this.stop();
            }
            return;
        }

        this.touch.active = true;
        this.touch.x = e.touches[0].clientX;

        const now = Date.now();
        if (now - this.touch.lastTap > 150) {
            this.fireBullet();
            this.touch.lastTap = now;
        }
    }

    handleTouchMove(e) {
        if (!this.active || !this.touch.active) return;
        e.preventDefault();
        this.touch.x = e.touches[0].clientX;
    }

    handleTouchEnd() {
        if (!this.active) return;
        this.touch.active = false;
    }

    loadSprites() {
        // Create simple bitmap-like sprites using data URLs or just drawing them
        // For simplicity in a single file, we'll draw them procedurally or use emojis if lazy, 
        // but pixel drawing is better for the vibe.
        // Load the profile photo for the mosaic enemies
        this.sprites.profile = new Image();
        this.sprites.profile.src = 'images/profile-1.jpg';
    }

    start() {
        if (this.active) return;
        this.active = true;
        this.gameOver = false;
        this.readyPhase = true;
        this.readyTime = 0;

        // Hide the trigger button during gameplay
        const trigger = document.getElementById('startInvaders');
        if (trigger) trigger.style.display = 'none';

        // Add event listeners
        this.addEventListeners();

        // 1. Setup Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'invaders-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.zIndex = '99999';
        this.canvas.style.pointerEvents = 'none';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        this.resizeCanvas();

        // 2. Apply Retro Mode
        document.body.classList.add('retro-mode');

        // 3. Initialize Game Objects
        this.player = {
            x: this.width / 2,
            y: this.height - 60,
            width: 40,
            height: 24,
            speed: 500
        };

        this.bullets = [];
        this.enemyBullets = [];
        this.lastEnemyShot = 0;
        this.enemies = [];
        this.particles = [];
        this.domTargets = [];
        this.gameTime = 0;
        this.score = 0;
        this.level = 1;
        this.levelStartTime = 0;
        this.enteringName = false;
        this.scoreSaved = false;
        this.highScores = this.loadHighScores(); // Refresh high scores

        // Set difficulty for level 1
        this.applyLevelDifficulty();

        // Preload enemies during ready phase
        const img = this.sprites.profile;
        if (img.complete && img.naturalWidth > 0) {
            this.generateEnemies();
        } else {
            img.onload = () => this.generateEnemies();
            img.onerror = () => this.generateEnemies();
        }

        // Init audio and play ready arpeggio
        this.initAudio();
        this.playReadySound();

        // Start render loop (ready phase draws its own screen)
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    beginGameplay() {
        this.readyPhase = false;

        // Scan DOM targets
        this.scanDomTargets();

        // Start rhythm
        this.startRhythm();
    }

    stop() {
        this.active = false;

        // Stop audio
        this.stopAudio();

        // Remove event listeners to prevent memory leaks
        this.removeEventListeners();

        // Reset key states
        this.keys.ArrowLeft = false;
        this.keys.ArrowRight = false;
        this.keys.Space = false;
        this.touch.active = false;

        if (this.canvas) this.canvas.remove();
        this.canvas = null;
        this.ctx = null;
        this.scanlinePattern = null; // Reset pattern for next game
        document.body.classList.remove('retro-mode');

        // Restore trigger button
        const trigger = document.getElementById('startInvaders');
        if (trigger) {
            trigger.style.display = '';
            trigger.style.visibility = '';
            trigger.style.opacity = '';
            // Re-trigger animation by removing and re-adding the class
            trigger.classList.remove('invader-trigger');
            void trigger.offsetWidth; // Force reflow
            trigger.classList.add('invader-trigger');
        }

        // Restore DOM elements
        this.domTargets.forEach(t => {
            if (t.element) {
                t.element.style.visibility = 'visible';
            }
        });
        this.domTargets = [];
    }

    resizeCanvas() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        if (this.ctx) this.ctx.imageSmoothingEnabled = false;
        if (this.player) this.player.y = this.height - 60;
    }

    generateEnemies() {
        // Adapt grid to screen size - grid should take at most 60% of width
        const maxGridWidth = this.width * 0.6;
        const cols = this.width < 500 ? 4 : 6;
        const rows = this.width < 500 ? 5 : 6;
        const padding = this.width < 500 ? 6 : 10;
        const enemyWidth = Math.floor(Math.min(50, (maxGridWidth - (cols - 1) * padding) / cols));
        const enemyHeight = enemyWidth;

        const gridWidth = (cols * enemyWidth) + ((cols - 1) * padding);
        const startX = (this.width - gridWidth) / 2;
        const startY = 80;

        // Calculate source image slice size (use fallback if image not loaded)
        const img = this.sprites.profile;
        const imgWidth = img.naturalWidth || img.width || 300;
        const imgHeight = img.naturalHeight || img.height || 300;
        const srcW = imgWidth / cols;
        const srcH = imgHeight / rows;

        // Clear existing enemies before generating new ones
        this.enemies = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.enemies.push({
                    x: startX + c * (enemyWidth + padding),
                    y: startY + r * (enemyHeight + padding),
                    width: enemyWidth,
                    height: enemyHeight,
                    type: 'profile_part',
                    alive: true,
                    srcX: c * srcW,
                    srcY: r * srcH,
                    srcW: srcW,
                    srcH: srcH
                });
            }
        }
    }

    scanDomTargets() {
        // Clear existing targets
        this.domTargets = [];

        // Find visible elements to shoot (exclude game UI elements)
        const selector = 'h1, h2, h3, p, img:not([src*="data:"]), a, button:not(#startInvaders):not(#backToTop), .bento-card';
        const elements = document.querySelectorAll(selector);

        elements.forEach(el => {
            // Skip elements that are part of the game or hidden
            if (el.closest('#invaders-canvas') || el.closest('.invader-trigger')) {
                return;
            }

            const rect = el.getBoundingClientRect();
            // Check if visible and within viewport
            if (rect.width > 10 && rect.height > 10 &&
                rect.top >= 0 && rect.bottom <= this.height &&
                rect.left >= 0 && rect.right <= this.width) {
                this.domTargets.push({
                    element: el,
                    rect: rect,
                    alive: true
                });
            }
        });
    }

    update(dt) {
        // Ready phase - just track time, skip all game logic
        if (this.readyPhase) {
            this.readyTime += dt;
            return;
        }

        // Track game time for UI hints
        this.gameTime += dt;

        // Player Movement - Keyboard
        if (this.keys.ArrowLeft) this.player.x -= this.player.speed * dt;
        if (this.keys.ArrowRight) this.player.x += this.player.speed * dt;

        // Player Movement - Touch (ship follows finger x position)
        if (this.touch.active) {
            const targetX = this.touch.x - this.player.width / 2;
            const diff = targetX - this.player.x;
            const moveSpeed = this.player.speed * 1.5 * dt;

            if (Math.abs(diff) > 5) {
                this.player.x += Math.sign(diff) * Math.min(Math.abs(diff), moveSpeed);
            }
        }

        // Clamp Player
        this.player.x = Math.max(0, Math.min(this.width - this.player.width, this.player.x));

        // Shooting
        if (this.keys.Space) {
            this.keys.Space = false; // Semi-automatic for now
            this.fireBullet();
        }

        // Bullets - update positions
        this.bullets.forEach(b => {
            b.y -= b.speed * dt;
        });
        // Remove off-screen bullets
        this.bullets = this.bullets.filter(b => b.y >= 0);

        // Collision Detection
        this.checkCollisions();

        // Helper to check edge collisions
        let hitEdge = false;

        // Enemy Movement
        this.enemies.forEach(e => {
            if (!e.alive) return;
            e.x += this.enemySpeed * dt * this.enemyDirection;

            // Check edges
            if ((this.enemyDirection === 1 && e.x + e.width > this.width - 20) ||
                (this.enemyDirection === -1 && e.x < 20)) {
                hitEdge = true;
            }
        });

        if (hitEdge) {
            this.enemyDirection *= -1;
            this.enemies.forEach(e => {
                e.y += this.enemyDropDistance;
            });
        }

        // Enemy Shooting (rate varies by level)
        this.lastEnemyShot += dt;
        if (this.lastEnemyShot >= this.enemyFireRate && !this.gameOver) {
            const aliveEnemies = this.enemies.filter(e => e.alive);
            if (aliveEnemies.length > 0) {
                const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
                this.enemyBullets.push({
                    x: shooter.x + shooter.width / 2,
                    y: shooter.y + shooter.height,
                    width: 4,
                    height: 12,
                    speed: 300
                });
                this.lastEnemyShot = 0;
            }
        }

        // Update enemy bullets
        this.enemyBullets.forEach(b => {
            b.y += b.speed * dt;
        });
        // Remove off-screen enemy bullets
        this.enemyBullets = this.enemyBullets.filter(b => b.y < this.height);

        // Check enemy bullets hitting player
        if (!this.gameOver) {
            for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
                const b = this.enemyBullets[i];
                if (this.rectIntersect(b, this.player)) {
                    this.enemyBullets.splice(i, 1);
                    this.createExplosion(this.player.x + this.player.width / 2, this.player.y, '#22d3ee', 50);
                    this.triggerGameOver();
                    break;
                }
            }
        }

        // Particles - update positions
        this.particles.forEach(p => {
            p.life -= dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
        });
        // Remove dead particles
        this.particles = this.particles.filter(p => p.life > 0);

        // Game Over Check: Player Collision
        if (!this.gameOver) {
            this.enemies.forEach(e => {
                if (e.alive && this.rectIntersect(e, this.player)) {
                    this.createExplosion(this.player.x, this.player.y, '#22d3ee', 50);
                    this.triggerGameOver();
                }
            });

            // Win Condition: All enemies dead - advance to next level
            if (this.enemies.length > 0 && this.enemies.every(e => !e.alive)) {
                this.startNextLevel();
            }
        }
    }

    applyLevelDifficulty() {
        // Increase speed by 20% per level, fire rate decreases (faster shooting)
        this.enemySpeed = this.baseEnemySpeed * (1 + (this.level - 1) * 0.2);
        this.enemyFireRate = Math.max(0.2, this.baseFireRate - (this.level - 1) * 0.15);
        this.enemyDirection = 1; // Reset direction
    }

    startNextLevel() {
        this.level++;
        this.levelStartTime = this.gameTime;

        // Clear bullets
        this.bullets = [];
        this.enemyBullets = [];
        this.lastEnemyShot = 0;

        // Apply new difficulty
        this.applyLevelDifficulty();

        // Regenerate enemies
        this.generateEnemies();

        // Bonus points for completing a level
        this.score += 500 * (this.level - 1);
    }

    triggerGameOver() {
        this.gameOver = true;
        this.stopRhythm();
        this.playGameOverSound();

        // Check if this is a high score
        if (this.score > 0 && this.isHighScore(this.score)) {
            this.enteringName = true;
            this.playerName = ['A', 'A', 'A'];
            this.nameIndex = 0;
            this.scoreSaved = false;
        } else {
            this.scoreSaved = true; // No name entry needed
        }
    }

    fireBullet() {
        if (this.gameOver) return;
        this.bullets.push({
            x: this.player.x + this.player.width / 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: 600
        });

        this.playShootSound();
    }

    checkCollisions() {
        // Bullets vs Enemies
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            let hit = false;

            // Check Space Invaders
            for (let e of this.enemies) {
                if (e.alive && this.rectIntersect(b, e)) {
                    e.alive = false;
                    hit = true;
                    this.score += 100;
                    this.createExplosion(e.x + e.width / 2, e.y + e.height / 2, '#00ff00');
                    this.playExplosionSound();
                    break;
                }
            }

            // Check DOM Targets
            if (!hit) {
                for (let t of this.domTargets) {
                    if (t.alive && this.rectIntersect(b, {
                        x: t.rect.left,
                        y: t.rect.top,
                        width: t.rect.width,
                        height: t.rect.height
                    })) {
                        t.alive = false;
                        t.element.style.visibility = 'hidden'; // Hide from DOM
                        hit = true;
                        this.score += 50;
                        this.createExplosion(
                            t.rect.left + t.rect.width / 2,
                            t.rect.top + t.rect.height / 2,
                            '#ffffff',
                            Math.min(t.rect.width, 100)
                        );
                        break;
                    }
                }
            }

            if (hit) {
                this.bullets.splice(i, 1);
            }
        }
    }

    rectIntersect(r1, r2) {
        return !(r2.x > r1.x + r1.width ||
            r2.x + r2.width < r1.x ||
            r2.y > r1.y + r1.height ||
            r2.y + r2.height < r1.y);
    }

    createExplosion(x, y, color, size = 20) {
        const count = 10;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 100;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5,
                color: color,
                size: Math.random() * 3 + 1
            });
        }
    }

    loop(timestamp) {
        if (!this.active) return;
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw Ready Phase Screen
        if (this.readyPhase) {
            // Dim the page
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            this.ctx.fillRect(0, 0, this.width, this.height);

            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // "READY PLAYER ONE" with pulsing glow
            const pulse = Math.sin(this.readyTime * 3) * 0.2 + 0.8;
            const titleSize = this.width < 500 ? 30 : 52;

            this.ctx.globalAlpha = pulse;

            // Shadow/glow
            this.ctx.fillStyle = '#005500';
            this.ctx.font = `bold ${titleSize}px "Courier New", monospace`;
            this.ctx.fillText("READY PLAYER ONE", this.width / 2 + 2, this.height / 2 - 48);

            // Main text
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillText("READY PLAYER ONE", this.width / 2, this.height / 2 - 50);

            this.ctx.globalAlpha = 1;

            // Control instructions
            const instrSize = this.width < 500 ? 14 : 20;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = `${instrSize}px "Courier New", monospace`;
            if (this.isTouchDevice) {
                this.ctx.fillText("DRAG to move \u2022 TAP to shoot", this.width / 2, this.height / 2 + 15);
            } else {
                this.ctx.fillText("\u2190 \u2192 to move \u2022 SPACE to shoot \u2022 ESC to quit", this.width / 2, this.height / 2 + 15);
            }

            // Blinking "press to start" prompt
            const blink = Math.sin(this.readyTime * 4) > 0;
            if (blink) {
                this.ctx.fillStyle = '#aaaaaa';
                this.ctx.font = `${this.width < 500 ? 13 : 18}px "Courier New", monospace`;
                const startText = this.isTouchDevice ? "TAP TO START" : "PRESS ANY KEY TO START";
                this.ctx.fillText(startText, this.width / 2, this.height / 2 + 65);
            }

            // Scanlines on top of ready screen
            if (!this.scanlinePattern) {
                const patternCanvas = document.createElement('canvas');
                patternCanvas.width = 1;
                patternCanvas.height = 4;
                const pCtx = patternCanvas.getContext('2d');
                pCtx.fillStyle = 'rgba(0, 20, 0, 0.1)';
                pCtx.fillRect(0, 0, 1, 1);
                this.scanlinePattern = this.ctx.createPattern(patternCanvas, 'repeat');
            }
            this.ctx.fillStyle = this.scanlinePattern;
            this.ctx.fillRect(0, 0, this.width, this.height);

            return; // Don't draw game elements during ready phase
        }

        // Draw Score (bitmap style)
        this.ctx.save();
        this.ctx.font = 'bold 32px "Courier New", monospace';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        // Shadow for depth
        this.ctx.fillStyle = '#005500';
        this.ctx.fillText(`SCORE ${String(this.score).padStart(6, '0')}`, 22, 22);
        // Main text
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillText(`SCORE ${String(this.score).padStart(6, '0')}`, 20, 20);

        // Draw Level (top right)
        this.ctx.textAlign = 'right';
        this.ctx.fillStyle = '#005555';
        this.ctx.fillText(`LEVEL ${this.level}`, this.width - 18, 22);
        this.ctx.fillStyle = '#22d3ee';
        this.ctx.fillText(`LEVEL ${this.level}`, this.width - 20, 20);
        this.ctx.restore();

        // Draw Player
        if (!this.gameOver) {
            this.ctx.fillStyle = '#00ff00';
            this.drawSprite(this.player.x, this.player.y, 40, 24, 'player');
        }

        // Draw Enemies (Photo Mosaic)
        this.enemies.forEach(e => {
            if (e.alive) {
                if (this.sprites.profile && this.sprites.profile.complete) {
                    this.ctx.drawImage(this.sprites.profile,
                        e.srcX, e.srcY, e.srcW, e.srcH,
                        e.x, e.y, e.width, e.height);
                } else {
                    // Fallback if image not loaded
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(e.x, e.y, e.width, e.height);
                }
            }
        });

        // Draw Player Bullets
        this.ctx.fillStyle = '#00ff00';
        this.bullets.forEach(b => {
            this.ctx.fillRect(b.x, b.y, b.width, b.height);
        });

        // Draw Enemy Bullets
        this.ctx.fillStyle = '#ff0000';
        this.enemyBullets.forEach(b => {
            this.ctx.fillRect(b.x, b.y, b.width, b.height);
        });

        // Draw Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life * 2;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
            this.ctx.globalAlpha = 1.0;
        });

        // Scanlines Overlay (using cached pattern for performance)
        if (!this.scanlinePattern) {
            const patternCanvas = document.createElement('canvas');
            patternCanvas.width = 1;
            patternCanvas.height = 4;
            const pCtx = patternCanvas.getContext('2d');
            pCtx.fillStyle = 'rgba(0, 20, 0, 0.1)';
            pCtx.fillRect(0, 0, 1, 1);
            this.scanlinePattern = this.ctx.createPattern(patternCanvas, 'repeat');
        }
        this.ctx.fillStyle = this.scanlinePattern;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Level Announcement (shows for 2 seconds when level starts)
        const timeSinceLevelStart = this.gameTime - this.levelStartTime;
        if (this.level > 1 && timeSinceLevelStart < 2) {
            const alpha = timeSinceLevelStart > 1.5 ? 1 - (timeSinceLevelStart - 1.5) * 2 : 1;

            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(this.width / 2 - 150, this.height / 2 - 50, 300, 100);

            this.ctx.fillStyle = '#ffff00';
            this.ctx.font = 'bold 48px "Courier New", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(`LEVEL ${this.level}`, this.width / 2, this.height / 2);
            this.ctx.globalAlpha = 1;
        }

        // Draw Game Over Screen
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            this.ctx.fillRect(0, 0, this.width, this.height);

            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Game Over title
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = 'bold 48px "Courier New", monospace';
            this.ctx.fillText("GAME OVER", this.width / 2, this.height / 2 - 140);

            // Final Score and Level
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 32px "Courier New", monospace';
            this.ctx.fillText(`SCORE: ${this.score}`, this.width / 2, this.height / 2 - 85);
            this.ctx.fillStyle = '#22d3ee';
            this.ctx.font = '24px "Courier New", monospace';
            this.ctx.fillText(`LEVEL ${this.level}`, this.width / 2, this.height / 2 - 50);

            if (this.enteringName) {
                // Name entry UI
                this.ctx.fillStyle = '#ffff00';
                this.ctx.font = '20px "Courier New", monospace';
                this.ctx.fillText("NEW HIGH SCORE!", this.width / 2, this.height / 2 - 30);

                this.ctx.fillStyle = '#aaaaaa';
                this.ctx.font = '16px "Courier New", monospace';
                this.ctx.fillText("ENTER YOUR NAME", this.width / 2, this.height / 2);

                // Draw the 3 letters
                this.ctx.font = 'bold 36px "Courier New", monospace';
                const letterSpacing = 50;
                const startX = this.width / 2 - letterSpacing;

                for (let i = 0; i < 3; i++) {
                    const x = startX + i * letterSpacing;
                    const y = this.height / 2 + 50;

                    // Highlight current letter
                    if (i === this.nameIndex) {
                        this.ctx.fillStyle = '#00ff00';
                        // Draw arrows
                        this.ctx.font = '18px "Courier New", monospace';
                        this.ctx.fillText('▲', x, y - 30);
                        this.ctx.fillText('▼', x, y + 35);
                        this.ctx.font = 'bold 36px "Courier New", monospace';
                    } else {
                        this.ctx.fillStyle = '#ffffff';
                    }
                    this.ctx.fillText(this.playerName[i], x, y);
                }

                this.ctx.fillStyle = '#aaaaaa';
                this.ctx.font = '14px "Courier New", monospace';
                this.ctx.fillText("← → to select • ↑ ↓ to change • ENTER to submit", this.width / 2, this.height / 2 + 100);
            } else {
                // Show high scores
                this.ctx.fillStyle = '#ffff00';
                this.ctx.font = 'bold 28px "Courier New", monospace';
                this.ctx.fillText("HIGH SCORES", this.width / 2, this.height / 2 - 20);

                this.ctx.font = 'bold 24px "Courier New", monospace';
                const scores = this.highScores.length > 0 ? this.highScores : [{ name: '---', score: 0 }];

                scores.slice(0, 5).forEach((entry, i) => {
                    const y = this.height / 2 + 25 + i * 36;
                    const isCurrentScore = this.scoreSaved && entry.score === this.score;
                    this.ctx.fillStyle = isCurrentScore ? '#00ff00' : '#ffffff';
                    this.ctx.fillText(`${i + 1}. ${entry.name}  ${String(entry.score).padStart(6, '0')}`, this.width / 2, y);
                });

                // Exit instructions
                this.ctx.fillStyle = '#aaaaaa';
                this.ctx.font = '18px "Courier New", monospace';
                const exitText = this.isTouchDevice ? "Tap anywhere to return" : "Press 'ESC' or 'Q' to return";
                this.ctx.fillText(exitText, this.width / 2, this.height / 2 + 220);
            }
        }

        // Show instructions briefly at game start (first 4 seconds)
        if (!this.gameOver && this.gameTime < 4) {
            // Fade out during the last second
            const alpha = this.gameTime > 3 ? 1 - (this.gameTime - 3) : 1;

            // Semi-transparent backdrop centered on screen
            const boxWidth = 400;
            const boxHeight = 60;
            const boxX = (this.width - boxWidth) / 2;
            const boxY = (this.height - boxHeight) / 2;

            this.ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * alpha})`;
            this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 18px "Courier New", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            if (this.isTouchDevice) {
                this.ctx.fillText("DRAG to move • TAP to shoot", this.width / 2, this.height / 2);
            } else {
                this.ctx.fillText("← → to move • SPACE to shoot • ESC to quit", this.width / 2, this.height / 2);
            }
            this.ctx.globalAlpha = 1;
        }
    }

    drawSprite(x, y, w, h, type) {
        // Proceedural pixel art can go here

        // Simple ship shape
        if (type === 'player') {
            this.ctx.fillStyle = '#22d3ee';
            this.ctx.beginPath();
            this.ctx.moveTo(x + w / 2, y);
            this.ctx.lineTo(x + w, y + h);
            this.ctx.lineTo(x + w / 2, y + h - 5);
            this.ctx.lineTo(x, y + h);
            this.ctx.fill();
        }
    }

    // High Score Methods
    loadHighScores() {
        try {
            const stored = localStorage.getItem('spaceInvadersHighScores');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }

    saveHighScores() {
        try {
            localStorage.setItem('spaceInvadersHighScores', JSON.stringify(this.highScores));
        } catch (e) {
            // Storage might be full or disabled
        }
    }

    isHighScore(score) {
        if (this.highScores.length < 5) return true;
        return score > this.highScores[this.highScores.length - 1].score;
    }

    addHighScore(name, score) {
        this.highScores.push({ name, score });
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, 5); // Keep top 5
        this.saveHighScores();
    }

    handleNameEntry(key) {
        if (!this.enteringName) return false;

        // Character set: A-Z plus space
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ';

        if (key === 'ArrowUp') {
            // Cycle character up
            let char = this.playerName[this.nameIndex];
            let idx = chars.indexOf(char);
            idx = (idx + 1) % chars.length;
            this.playerName[this.nameIndex] = chars[idx];
            return true;
        } else if (key === 'ArrowDown') {
            // Cycle character down
            let char = this.playerName[this.nameIndex];
            let idx = chars.indexOf(char);
            idx = (idx - 1 + chars.length) % chars.length;
            this.playerName[this.nameIndex] = chars[idx];
            return true;
        } else if (key === 'ArrowRight') {
            this.nameIndex = Math.min(2, this.nameIndex + 1);
            return true;
        } else if (key === 'ArrowLeft') {
            this.nameIndex = Math.max(0, this.nameIndex - 1);
            return true;
        } else if (key === 'Enter') {
            // Submit name
            this.addHighScore(this.playerName.join(''), this.score);
            this.enteringName = false;
            this.scoreSaved = true;
            return true;
        }
        return false;
    }

    // Audio Methods
    initAudio() {
        if (this.audioCtx) return;
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            // Audio not supported
            this.audioCtx = null;
        }
    }

    playReadySound() {
        if (!this.audioCtx) return;

        // Ascending arpeggio - C major through two octaves
        const notes = [262, 330, 392, 523, 659, 784, 1047];
        const noteLength = 0.12;
        const gap = 0.02;
        const now = this.audioCtx.currentTime;

        notes.forEach((freq, i) => {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now);

            const start = now + i * (noteLength + gap);
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.15, start + 0.01);
            gain.gain.setValueAtTime(0.15, start + noteLength - 0.03);
            gain.gain.linearRampToValueAtTime(0, start + noteLength);

            osc.start(start);
            osc.stop(start + noteLength);
        });
    }

    playShootSound() {
        if (!this.audioCtx) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.audioCtx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);

        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 0.1);
    }

    playExplosionSound() {
        if (!this.audioCtx) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.audioCtx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);

        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 0.2);
    }

    playGameOverSound() {
        if (!this.audioCtx) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.type = 'square';
        // Long dramatic descent from high to very low
        osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.audioCtx.currentTime + 1.5);

        gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 1.5);

        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 1.5);
    }

    playRhythmNote() {
        if (!this.audioCtx || this.gameOver) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.type = 'square';
        // Alternate between two notes a half step apart (e.g., E and F)
        const baseFreq = 82.41; // E2
        const freq = this.rhythmNote === 0 ? baseFreq : baseFreq * Math.pow(2, 1/12); // Half step up
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.08);

        osc.start(this.audioCtx.currentTime);
        osc.stop(this.audioCtx.currentTime + 0.08);

        this.rhythmNote = 1 - this.rhythmNote; // Toggle between 0 and 1
    }

    startRhythm() {
        this.stopRhythm(); // Clear any existing rhythm

        const updateRhythm = () => {
            if (!this.active) return;

            this.playRhythmNote();

            // Speed up based on level and remaining enemies
            const aliveCount = this.enemies.filter(e => e.alive).length;
            const totalEnemies = this.enemies.length || 1;
            const enemyFactor = 1 - (aliveCount / totalEnemies) * 0.5; // Speeds up as enemies die
            const levelFactor = 1 - (this.level - 1) * 0.1; // Speeds up with level
            const speed = Math.max(100, this.baseRhythmSpeed * levelFactor * enemyFactor);

            this.rhythmInterval = setTimeout(updateRhythm, speed);
        };

        updateRhythm();
    }

    stopRhythm() {
        if (this.rhythmInterval) {
            clearTimeout(this.rhythmInterval);
            this.rhythmInterval = null;
        }
    }

    stopAudio() {
        this.stopRhythm();
        if (this.audioCtx) {
            this.audioCtx.close().catch(() => {});
            this.audioCtx = null;
        }
    }
}

// Global instance to be accessible
window.spaceInvaders = new SpaceInvadersGame();
