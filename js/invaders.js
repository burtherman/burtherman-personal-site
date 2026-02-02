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
        this.particles = []; // Explosions
        this.enemies = []; // Classic aliens
        this.domTargets = []; // Website elements to destroy
        this.score = 0;
        this.enemyDirection = 1; // 1 for right, -1 for left
        this.enemySpeed = 100; // Pixels per second
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
        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'Space') {
            this.keys[e.code] = true;
            e.preventDefault();
        } else if (e.key === 'Escape' || e.key.toLowerCase() === 'q') {
            this.stop();
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

        if (this.gameOver) {
            this.stop();
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
        this.enemies = [];
        this.particles = [];
        this.domTargets = [];
        this.gameTime = 0;

        // Wait for image to load before generating enemies (or use fallback)
        const img = this.sprites.profile;
        if (img.complete && img.naturalWidth > 0) {
            this.generateEnemies();
        } else {
            img.onload = () => this.generateEnemies();
            img.onerror = () => this.generateEnemies(); // Generate with fallback
        }

        // Scan DOM targets after a brief delay to ensure scroll has completed
        setTimeout(() => this.scanDomTargets(), 100);

        // 4. Start Loop
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    stop() {
        this.active = false;

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
        if (trigger) trigger.style.display = 'block';

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
        // Grid configuration
        const rows = 6;
        const cols = 6;
        const enemyWidth = 50;
        const enemyHeight = 50;
        const padding = 10;

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
                    this.triggerGameOver(false); // Loss
                }
            });

            // Win Condition: All enemies dead (must have enemies first)
            if (this.enemies.length > 0 && this.enemies.every(e => !e.alive)) {
                this.triggerGameOver(true); // Win
            }
        }
    }

    triggerGameOver(win) {
        this.gameOver = true;
        this.win = win;
        // Stop player?
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

        // Pew sound? (Optional)
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
                    this.createExplosion(e.x + e.width / 2, e.y + e.height / 2, '#00ff00');
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

        // Draw Player
        if (!this.gameOver || this.win) {
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

        // Draw Bullets
        this.ctx.fillStyle = '#ff0000';
        this.bullets.forEach(b => {
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

        // Draw Game Over Screen
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            this.ctx.fillRect(0, 0, this.width, this.height);

            this.ctx.fillStyle = this.win ? '#00ff00' : '#ff0000';
            this.ctx.font = 'bold 48px "Courier New", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // User requested "Game Over" for both win and loss
            const title = "GAME OVER";
            this.ctx.fillText(title, this.width / 2, this.height / 2 - 40);

            this.ctx.fillStyle = '#aaaaaa';
            this.ctx.font = '18px "Courier New", monospace';
            const exitText = this.isTouchDevice ? "Tap anywhere to return" : "Press 'ESC' or 'Q' to return";
            this.ctx.fillText(exitText, this.width / 2, this.height / 2 + 60);
        }

        // Show touch instructions briefly at game start (first 3 seconds)
        if (this.isTouchDevice && !this.gameOver && this.gameTime < 3) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, this.height - 80, this.width, 80);
            this.ctx.fillStyle = '#22d3ee';
            this.ctx.font = '16px "Courier New", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("DRAG to move • TAP to shoot", this.width / 2, this.height - 45);
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
}

// Global instance to be accessible
window.spaceInvaders = new SpaceInvadersGame();
