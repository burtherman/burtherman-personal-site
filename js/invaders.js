/**
 * Space Invaders Easter Egg
 * 
 * Instructions:
 * 1. Click the alien button to start.
 * 2. Use Left/Right Arrow keys to move.
 * 3. Spacebar to shoot.
 * 4. Refresh to reset.
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

        this.loadSprites();
        this.initListeners();
    }

    initListeners() {
        // Trigger button logic will be handled outside, or we bind it here if passed
        window.addEventListener('keydown', (e) => {
            if (!this.active) return;
            if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || e.code === 'Space') {
                this.keys[e.code] = true;
                e.preventDefault(); // Prevent scrolling
            } else if (e.key === 'Escape' || e.key.toLowerCase() === 'q') {
                this.stop();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (!this.active) return;
            if (this.keys.hasOwnProperty(e.code)) {
                this.keys[e.code] = false;
            }
        });

        window.addEventListener('resize', () => {
            if (this.active) this.resizeCanvas();
        });
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

        // 1. Setup Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'invaders-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.zIndex = '99999';
        this.canvas.style.pointerEvents = 'none'; // Let clicks pass through if we want, but likely we want to capture keys
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        // Disable smoothing for retro feel
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
        this.generateEnemies();
        this.scanDomTargets();

        // 4. Start Loop
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    stop() {
        this.active = false;
        if (this.canvas) this.canvas.remove();
        document.body.classList.remove('retro-mode');
        // Restore trigger button
        const trigger = document.getElementById('startInvaders');
        if (trigger) trigger.style.display = 'block';

        // Restore DOM elements
        this.domTargets.forEach(t => {
            t.element.style.visibility = 'visible';
        });
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

        // Ensure image is loaded (if not, we might need a fallback or wait, 
        // but for now assume it caches quickly or draws black until loaded)

        // Calculate source image slice size
        const img = this.sprites.profile;
        // We assume square-ish image for simplicity or crop it
        const srcW = img.width / cols;
        const srcH = img.height / rows;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.enemies.push({
                    x: startX + c * (enemyWidth + padding),
                    y: startY + r * (enemyHeight + padding),
                    width: enemyWidth,
                    height: enemyHeight,
                    type: 'profile_part',
                    alive: true,
                    // Store source coordinates for drawing
                    srcX: c * srcW,
                    srcY: r * srcH,
                    srcW: srcW,
                    srcH: srcH
                });
            }
        }
    }

    scanDomTargets() {
        // Find visible elements to shoot
        const selector = 'h1, h2, h3, p, img, a, button, .bento-card';
        const elements = document.querySelectorAll(selector);

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            // Check if visible roughly
            if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= this.height) {
                this.domTargets.push({
                    element: el,
                    rect: rect,
                    alive: true
                });
            }
        });
    }

    update(dt) {
        // Player Movement
        if (this.keys.ArrowLeft) this.player.x -= this.player.speed * dt;
        if (this.keys.ArrowRight) this.player.x += this.player.speed * dt;

        // Clamp Player
        this.player.x = Math.max(0, Math.min(this.width - this.player.width, this.player.x));

        // Shooting
        if (this.keys.Space) {
            this.keys.Space = false; // Semi-automatic for now
            this.fireBullet();
        }

        // Bullets
        this.bullets.forEach((b, i) => {
            b.y -= b.speed * dt;
            if (b.y < 0) this.bullets.splice(i, 1);
        });

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

        // Particles
        this.particles.forEach((p, i) => {
            p.life -= dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        });

        // Game Over Check: Player Collision
        if (!this.gameOver) {
            this.enemies.forEach(e => {
                if (e.alive && this.rectIntersect(e, this.player)) {
                    this.createExplosion(this.player.x, this.player.y, '#22d3ee', 50);
                    this.triggerGameOver(false); // Loss
                }
            });

            // Win Condition: All enemies dead
            if (this.enemies.every(e => !e.alive)) {
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

        // Scanlines Overlay (Optional visual flair)
        this.ctx.fillStyle = "rgba(0, 20, 0, 0.1)";
        for (let i = 0; i < this.height; i += 4) {
            this.ctx.fillRect(0, i, this.width, 1);
        }

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
            this.ctx.fillText("Press 'ESC' or 'Q' to return", this.width / 2, this.height / 2 + 60);
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
