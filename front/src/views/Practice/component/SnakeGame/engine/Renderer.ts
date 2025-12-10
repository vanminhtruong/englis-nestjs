import type { GameConfig } from '../types';
import { Snake } from './Snake';
import type { FoodItem } from './FoodManager';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
    type: 'circle' | 'ring' | 'beam';
    rotation?: number;
}

export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private config: GameConfig;
    private particles: Particle[] = [];
    private foodPulse: number = 0;

    constructor(ctx: CanvasRenderingContext2D, config: GameConfig) {
        this.ctx = ctx;
        this.config = config;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);

        // Optional: Draw grid pattern
        this.drawGrid();
    }

    private drawGrid() {
        this.ctx.strokeStyle = this.config.colors.grid;
        // Lighter grid
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.2;
        this.ctx.beginPath();

        const gridSize = this.config.gridSize;

        for (let x = 0; x <= this.config.canvasWidth; x += gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.config.canvasHeight);
        }

        for (let y = 0; y <= this.config.canvasHeight; y += gridSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.config.canvasWidth, y);
        }

        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    drawSnake(snake: Snake) {
        const body = snake.getBody();
        const size = this.config.gridSize;

        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = this.config.colors.snakeHead;

        body.forEach((segment, index) => {
            const isHead = index === 0;
            this.ctx.fillStyle = isHead ? this.config.colors.snakeHead : this.config.colors.snakeBody;

            const x = segment.x * size;
            const y = segment.y * size;
            const radius = size * 0.25;

            this.ctx.beginPath();

            this.drawRoundedRect(x + 1, y + 1, size - 2, size - 2, radius);
            this.ctx.fill();

            // Eyes for head
            if (isHead) {
                this.ctx.fillStyle = 'white';
                this.ctx.shadowBlur = 0; // No glow for eyes

                let eyeOffsetX1 = size * 0.25;
                let eyeOffsetY1 = size * 0.25;
                let eyeOffsetX2 = size * 0.75;
                let eyeOffsetY2 = size * 0.25;

                this.ctx.beginPath();
                this.ctx.arc(x + eyeOffsetX1, y + eyeOffsetY1, size * 0.12, 0, Math.PI * 2);
                this.ctx.arc(x + eyeOffsetX2, y + eyeOffsetY2, size * 0.12, 0, Math.PI * 2);
                this.ctx.fill();

                // Restore shadow for body
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = this.config.colors.snakeHead;
            }
        });

        this.ctx.shadowBlur = 0; // Reset
    }

    drawFoods(foods: FoodItem[]) {
        const size = this.config.gridSize;
        this.foodPulse = (this.foodPulse + 0.1) % (Math.PI * 2);
        const pulseScale = 1 + Math.sin(this.foodPulse) * 0.1;

        foods.forEach(food => {
            const x = food.position.x * size + size / 2;
            const y = food.position.y * size + size / 2;
            const radius = (size * 0.4) * pulseScale;

            // Glow
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = food.color;
            this.ctx.fillStyle = food.color;

            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.shadowBlur = 0; // Reset

            // Draw label (meaning)
            this.drawLabel(food);
        });
    }

    private drawLabel(food: FoodItem) {
        const size = this.config.gridSize;
        const x = food.position.x * size + size / 2;
        const y = food.position.y * size - 12;

        this.ctx.font = 'bold 12px "Inter", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';

        const text = truncate(food.label, 15);
        const metrics = this.ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = 14;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.drawRoundedRect(x - textWidth / 2 - 4, y - textHeight + 2, textWidth + 8, textHeight + 4, 4);
        this.ctx.fill();

        this.ctx.fillStyle = 'white';
        this.ctx.fillText(text, x, y);
    }

    createExplosion(x: number, y: number, color: string, isMagical: boolean = false) {
        const size = this.config.gridSize;
        const centerX = x * size + size / 2;
        const centerY = y * size + size / 2;

        const particleCount = isMagical ? 40 : 15;

        // 1. Basic Particles
        for (let i = 0; i < particleCount; i++) {
            const speed = isMagical ? Math.random() * 8 + 2 : Math.random() * 5 + 1;
            const angle = Math.random() * Math.PI * 2;

            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                maxLife: 1.0,
                color: color,
                size: isMagical ? Math.random() * 5 + 2 : Math.random() * 3 + 1,
                type: 'circle'
            });
        }

        if (isMagical) {
            // 2. Expanding Shockwave Ring
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: 0,
                vy: 0,
                life: 0.8,
                maxLife: 0.8,
                color: color,
                size: size, // Initial size
                type: 'ring'
            });

            // 3. Light Beams (Vệt sáng)
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                this.particles.push({
                    x: centerX,
                    y: centerY,
                    vx: Math.cos(angle) * 15,
                    vy: Math.sin(angle) * 15,
                    life: 0.6,
                    maxLife: 0.6,
                    color: '#fff', // White beams
                    size: 2,
                    type: 'beam',
                    rotation: angle
                });
            }

            // 4. Sparkles
            for (let i = 0; i < 10; i++) {
                this.particles.push({
                    x: centerX + (Math.random() - 0.5) * size * 2,
                    y: centerY + (Math.random() - 0.5) * size * 2,
                    vx: 0,
                    vy: -1, // Floating up
                    life: Math.random() * 0.5 + 0.5,
                    maxLife: 1.0,
                    color: '#FFD700', // Gold sparkles
                    size: Math.random() * 3,
                    type: 'circle'
                });
            }
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            if (!p) continue;

            p.life -= 0.03;

            if (p.type === 'circle') {
                p.x += p.vx;
                p.y += p.vy;
                p.size *= 0.92;
            } else if (p.type === 'ring') {
                p.size += 8; // Expand ring
                p.life -= 0.03;
            } else if (p.type === 'beam') {
                p.x += p.vx;
                p.y += p.vy;
            }

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    drawParticles() {
        this.ctx.globalCompositeOperation = 'lighter';

        this.particles.forEach(p => {
            this.ctx.globalAlpha = Math.max(0, p.life);

            if (p.type === 'circle') {
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (p.type === 'ring') {
                this.ctx.strokeStyle = p.color;
                this.ctx.lineWidth = 4 * p.life;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.stroke();
            } else if (p.type === 'beam') {
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${p.life})`;
                this.ctx.lineWidth = 3 * p.life;
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
                this.ctx.stroke();
            }
        });

        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = 'source-over';
    }

    private drawRoundedRect(x: number, y: number, w: number, h: number, r: number) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.lineTo(x + w - r, y);
        this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        this.ctx.lineTo(x + w, y + h - r);
        this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.ctx.lineTo(x + r, y + h);
        this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        this.ctx.lineTo(x, y + r);
        this.ctx.quadraticCurveTo(x, y, x + r, y);
        this.ctx.closePath();
    }
}

function truncate(str: string, n: number) {
    return (str.length > n) ? str.slice(0, n - 1) + '...' : str;
}
