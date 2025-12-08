// Explosion Effects Manager - Single Responsibility: Handle all explosion visual effects
import type { IExplosionParticle } from './interfaces'

export class ExplosionParticle implements IExplosionParticle {
    id: string
    x: number
    y: number
    vx: number
    vy: number
    color: string
    size: number
    life: number
    maxLife: number
    rotation: number
    rotationSpeed: number

    constructor(x: number, y: number, color: string) {
        this.id = `particle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        this.x = x
        this.y = y
        this.color = color
        this.maxLife = 1 + Math.random() * 0.5
        this.life = this.maxLife
        this.size = 5 + Math.random() * 15

        // Random direction
        const angle = Math.random() * Math.PI * 2
        const speed = 100 + Math.random() * 200
        this.vx = Math.cos(angle) * speed
        this.vy = Math.sin(angle) * speed
        this.rotation = Math.random() * 360
        this.rotationSpeed = (Math.random() - 0.5) * 720
    }

    update(deltaTime: number): boolean {
        this.life -= deltaTime
        if (this.life <= 0) return false

        this.x += this.vx * deltaTime
        this.y += this.vy * deltaTime
        this.vy += 300 * deltaTime // Gravity
        this.vx *= 0.99 // Air resistance
        this.vy *= 0.99
        this.rotation += this.rotationSpeed * deltaTime
        this.size *= 0.98

        return true
    }

    getOpacity(): number {
        return Math.max(0, this.life / this.maxLife)
    }
}

export class ExplosionManager {
    private particles: ExplosionParticle[] = []
    private shockwaves: Shockwave[] = []

    createExplosion(x: number, y: number, color: string, intensity: number = 1): void {
        const particleCount = Math.floor(20 * intensity + Math.random() * 10 * intensity)

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const particle = new ExplosionParticle(x, y, this.getParticleColor(color, i))
            this.particles.push(particle)
        }

        // Create shockwave
        this.shockwaves.push(new Shockwave(x, y, color))
    }

    createComboExplosion(x: number, y: number, comboCount: number): void {
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
        const intensity = 1 + comboCount * 0.5

        for (let i = 0; i < comboCount; i++) {
            setTimeout(() => {
                const color = colors[i % colors.length] ?? '#FFD700'
                this.createExplosion(
                    x + (Math.random() - 0.5) * 50,
                    y + (Math.random() - 0.5) * 50,
                    color,
                    intensity
                )
            }, i * 100)
        }
    }

    private getParticleColor(baseColor: string, index: number): string {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ]
        return colors[index % colors.length] ?? '#FF6B6B'
    }

    update(deltaTime: number): void {
        // Update particles
        this.particles = this.particles.filter(p => p.update(deltaTime))

        // Update shockwaves
        this.shockwaves = this.shockwaves.filter(s => s.update(deltaTime))
    }

    getParticles(): ExplosionParticle[] {
        return this.particles
    }

    getShockwaves(): Shockwave[] {
        return this.shockwaves
    }

    clear(): void {
        this.particles = []
        this.shockwaves = []
    }
}

export class Shockwave {
    x: number
    y: number
    radius: number
    maxRadius: number
    opacity: number
    color: string

    constructor(x: number, y: number, color: string) {
        this.x = x
        this.y = y
        this.radius = 0
        this.maxRadius = 150
        this.opacity = 0.8
        this.color = color
    }

    update(deltaTime: number): boolean {
        this.radius += 400 * deltaTime
        this.opacity -= deltaTime * 1.5

        return this.opacity > 0 && this.radius < this.maxRadius
    }
}
