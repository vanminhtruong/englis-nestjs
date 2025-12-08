// Game Renderer - Single Responsibility: Handle all rendering logic
import { ExplosionManager, ExplosionParticle, Shockwave } from './ExplosionManager'
import type { IGameState, IGameConfig, IProjectile, IBall } from './interfaces'

interface Cannon {
    x: number
    y: number
    angle: number
    width: number
    height: number
}

interface ShootEffect {
    x: number
    y: number
    targetX: number
    targetY: number
    progress: number
    color: string
}

export class GameRenderer {
    private ctx: CanvasRenderingContext2D
    private config: IGameConfig
    private animationId: number | null = null
    private backgroundGradient: CanvasGradient | null = null
    private cannon: Cannon
    private shootEffects: ShootEffect[] = []

    constructor(canvas: HTMLCanvasElement, config: IGameConfig) {
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Could not get canvas context')

        this.ctx = ctx
        this.config = config
        this.cannon = {
            x: config.canvasWidth / 2,
            y: config.canvasHeight - 40,
            angle: -Math.PI / 2,
            width: 50,
            height: 70
        }
        this.setupCanvas()
    }

    private setupCanvas(): void {
        // Create background gradient based on theme
        this.backgroundGradient = this.ctx.createLinearGradient(0, 0, 0, this.config.canvasHeight)

        if (this.config.isDarkMode) {
            this.backgroundGradient.addColorStop(0, '#0f0f23')
            this.backgroundGradient.addColorStop(0.5, '#1a1a3e')
            this.backgroundGradient.addColorStop(1, '#0f0f23')
        } else {
            this.backgroundGradient.addColorStop(0, '#f8fafc')
            this.backgroundGradient.addColorStop(0.5, '#e2e8f0')
            this.backgroundGradient.addColorStop(1, '#f8fafc')
        }
    }

    // Add shooting effect
    addShootEffect(targetX: number, targetY: number, color: string = '#ffd700'): void {
        this.shootEffects.push({
            x: this.cannon.x,
            y: this.cannon.y - this.cannon.height / 2,
            targetX,
            targetY,
            progress: 0,
            color
        })
    }

    render(state: IGameState, explosionManager: ExplosionManager): void {
        this.clear()
        this.drawBackground()
        this.drawCannon()
        this.updateAndDrawShootEffects()
        this.drawShockwaves(explosionManager.getShockwaves())
        this.drawBalls(state.balls)
        this.drawParticles(explosionManager.getParticles())
        this.drawUI(state)
    }

    private clear(): void {
        this.ctx.clearRect(0, 0, this.config.canvasWidth, this.config.canvasHeight)
    }

    private drawBackground(): void {
        // Draw gradient background
        if (this.backgroundGradient) {
            this.ctx.fillStyle = this.backgroundGradient
            this.ctx.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight)
        }

        // Draw animated grid
        const isDark = this.config.isDarkMode
        this.ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'
        this.ctx.lineWidth = 1
        const gridSize = 50
        const time = Date.now() / 5000

        for (let x = 0; x < this.config.canvasWidth; x += gridSize) {
            const offset = Math.sin(time + x / 100) * 5
            this.ctx.beginPath()
            this.ctx.moveTo(x, 0)
            this.ctx.lineTo(x + offset, this.config.canvasHeight)
            this.ctx.stroke()
        }

        for (let y = 0; y < this.config.canvasHeight; y += gridSize) {
            const offset = Math.cos(time + y / 100) * 5
            this.ctx.beginPath()
            this.ctx.moveTo(0, y)
            this.ctx.lineTo(this.config.canvasWidth, y + offset)
            this.ctx.stroke()
        }
    }

    private drawCannon(): void {
        const { x, y, width, height } = this.cannon

        this.ctx.save()
        this.ctx.translate(x, y)

        // Draw cannon base (circular platform)
        const baseGradient = this.ctx.createRadialGradient(0, 10, 5, 0, 10, 50)
        baseGradient.addColorStop(0, '#4a5568')
        baseGradient.addColorStop(0.5, '#2d3748')
        baseGradient.addColorStop(1, '#1a202c')

        this.ctx.beginPath()
        this.ctx.ellipse(0, 10, 45, 20, 0, 0, Math.PI * 2)
        this.ctx.fillStyle = baseGradient
        this.ctx.fill()
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        this.ctx.lineWidth = 2
        this.ctx.stroke()

        // Draw cannon barrel
        const barrelGradient = this.ctx.createLinearGradient(-width / 2, 0, width / 2, 0)
        barrelGradient.addColorStop(0, '#667eea')
        barrelGradient.addColorStop(0.5, '#764ba2')
        barrelGradient.addColorStop(1, '#667eea')

        // Barrel body
        this.ctx.beginPath()
        this.ctx.roundRect(-width / 2, -height, width, height, [10, 10, 5, 5])
        this.ctx.fillStyle = barrelGradient
        this.ctx.fill()

        // Barrel highlight
        this.ctx.beginPath()
        this.ctx.roundRect(-width / 2 + 5, -height + 5, width / 3, height - 15, 5)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
        this.ctx.fill()

        // Barrel opening (muzzle)
        this.ctx.beginPath()
        this.ctx.ellipse(0, -height, width / 2 - 5, 10, 0, 0, Math.PI * 2)
        const muzzleGradient = this.ctx.createRadialGradient(0, -height, 0, 0, -height, 20)
        muzzleGradient.addColorStop(0, '#1a1a2e')
        muzzleGradient.addColorStop(1, '#2d2d5a')
        this.ctx.fillStyle = muzzleGradient
        this.ctx.fill()
        this.ctx.strokeStyle = '#667eea'
        this.ctx.lineWidth = 2
        this.ctx.stroke()

        // Glow effect
        this.ctx.shadowColor = '#667eea'
        this.ctx.shadowBlur = 15
        this.ctx.beginPath()
        this.ctx.ellipse(0, -height, width / 2 - 8, 5, 0, 0, Math.PI * 2)
        this.ctx.fillStyle = 'rgba(102, 126, 234, 0.5)'
        this.ctx.fill()
        this.ctx.shadowBlur = 0

        // Decorative rings on barrel
        for (let i = 0; i < 3; i++) {
            const ringY = -height + 20 + i * 18
            this.ctx.beginPath()
            this.ctx.moveTo(-width / 2 - 2, ringY)
            this.ctx.lineTo(width / 2 + 2, ringY)
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
            this.ctx.lineWidth = 3
            this.ctx.stroke()
        }

        this.ctx.restore()
    }

    private updateAndDrawShootEffects(): void {
        this.shootEffects = this.shootEffects.filter(effect => {
            effect.progress += 0.15

            if (effect.progress >= 1) {
                return false
            }

            // Calculate current position
            const currentX = effect.x + (effect.targetX - effect.x) * effect.progress
            const currentY = effect.y + (effect.targetY - effect.y) * effect.progress

            // Draw projectile trail
            this.ctx.save()

            // Create trail gradient
            const trailLength = 30
            const tailX = effect.x + (effect.targetX - effect.x) * Math.max(0, effect.progress - 0.3)
            const tailY = effect.y + (effect.targetY - effect.y) * Math.max(0, effect.progress - 0.3)

            const gradient = this.ctx.createLinearGradient(tailX, tailY, currentX, currentY)
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0)')
            gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.5)')
            gradient.addColorStop(1, effect.color)

            // Draw trail
            this.ctx.beginPath()
            this.ctx.moveTo(tailX, tailY)
            this.ctx.lineTo(currentX, currentY)
            this.ctx.strokeStyle = gradient
            this.ctx.lineWidth = 6
            this.ctx.lineCap = 'round'
            this.ctx.stroke()

            // Draw projectile head (glowing ball)
            const headGradient = this.ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, 12)
            headGradient.addColorStop(0, '#ffffff')
            headGradient.addColorStop(0.3, effect.color)
            headGradient.addColorStop(1, 'rgba(255, 215, 0, 0)')

            this.ctx.beginPath()
            this.ctx.arc(currentX, currentY, 12, 0, Math.PI * 2)
            this.ctx.fillStyle = headGradient
            this.ctx.fill()

            // Add glow
            this.ctx.shadowColor = effect.color
            this.ctx.shadowBlur = 20
            this.ctx.beginPath()
            this.ctx.arc(currentX, currentY, 6, 0, Math.PI * 2)
            this.ctx.fillStyle = '#ffffff'
            this.ctx.fill()

            this.ctx.restore()

            return true
        })
    }

    private drawBalls(balls: IBall[]): void {
        for (const ball of balls) {
            if (!ball.isActive) continue
            this.drawBall(ball)
        }
    }

    private drawBall(ball: IBall): void {
        const { x, y, radius, word, color, opacity } = ball
        const glowIntensity = opacity * 0.8

        this.ctx.save()

        // Draw glow effect
        const glowRadius = radius * (1.3 + glowIntensity * 0.2)
        const glowGradient = this.ctx.createRadialGradient(x, y, radius * 0.5, x, y, glowRadius)
        glowGradient.addColorStop(0, `rgba(255, 255, 255, ${0.3 * glowIntensity})`)
        glowGradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.1 * glowIntensity})`)
        glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

        this.ctx.beginPath()
        this.ctx.arc(x, y, glowRadius, 0, Math.PI * 2)
        this.ctx.fillStyle = glowGradient
        this.ctx.fill()

        // Draw main ball
        const ballGradient = this.ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0,
            x, y, radius
        )

        // Parse gradient colors from CSS gradient
        const colors = this.parseGradientColors(color)
        ballGradient.addColorStop(0, colors[0])
        ballGradient.addColorStop(1, colors[1])

        this.ctx.beginPath()
        this.ctx.arc(x, y, radius, 0, Math.PI * 2)
        this.ctx.fillStyle = ballGradient
        this.ctx.fill()

        // Draw highlight
        const highlightGradient = this.ctx.createRadialGradient(
            x - radius * 0.4, y - radius * 0.4, 0,
            x - radius * 0.2, y - radius * 0.2, radius * 0.5
        )
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)')
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

        this.ctx.beginPath()
        this.ctx.arc(x, y, radius, 0, Math.PI * 2)
        this.ctx.fillStyle = highlightGradient
        this.ctx.fill()

        // Draw border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        this.ctx.lineWidth = 2
        this.ctx.stroke()

        // Draw word text
        this.ctx.fillStyle = 'white'
        this.ctx.font = `bold ${Math.max(12, radius * 0.35)}px 'Inter', sans-serif`
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'middle'
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        this.ctx.shadowBlur = 4
        this.ctx.shadowOffsetX = 1
        this.ctx.shadowOffsetY = 1

        // Truncate word if too long
        const displayWord = word.length > 10 ? word.substring(0, 8) + '...' : word
        this.ctx.fillText(displayWord, x, y)

        this.ctx.restore()
    }

    private parseGradientColors(cssGradient: string): [string, string] {
        // Extract colors from CSS linear-gradient
        const colorMatch = cssGradient.match(/#[a-fA-F0-9]{6}/g)
        if (colorMatch && colorMatch.length >= 2) {
            const color0 = colorMatch[0] ?? '#667eea'
            const color1 = colorMatch[1] ?? '#764ba2'
            return [color0, color1]
        }
        return ['#667eea', '#764ba2']
    }

    private drawParticles(particles: ExplosionParticle[]): void {
        for (const particle of particles) {
            this.ctx.save()
            this.ctx.translate(particle.x, particle.y)
            this.ctx.rotate((particle.rotation * Math.PI) / 180)
            this.ctx.globalAlpha = particle.getOpacity()

            // Draw particle as a star shape
            this.ctx.fillStyle = particle.color
            this.ctx.beginPath()

            const spikes = 5
            const outerRadius = particle.size
            const innerRadius = particle.size * 0.5

            for (let i = 0; i < spikes * 2; i++) {
                const r = i % 2 === 0 ? outerRadius : innerRadius
                const angle = (Math.PI / spikes) * i - Math.PI / 2
                if (i === 0) {
                    this.ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
                } else {
                    this.ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r)
                }
            }

            this.ctx.closePath()
            this.ctx.fill()

            // Add glow
            this.ctx.shadowColor = particle.color
            this.ctx.shadowBlur = 10
            this.ctx.fill()

            this.ctx.restore()
        }
    }

    private drawShockwaves(shockwaves: Shockwave[]): void {
        for (const shockwave of shockwaves) {
            this.ctx.save()
            this.ctx.globalAlpha = shockwave.opacity
            this.ctx.strokeStyle = shockwave.color
            this.ctx.lineWidth = 3
            this.ctx.beginPath()
            this.ctx.arc(shockwave.x, shockwave.y, shockwave.radius, 0, Math.PI * 2)
            this.ctx.stroke()

            // Inner ring
            this.ctx.globalAlpha = shockwave.opacity * 0.5
            this.ctx.lineWidth = 1
            this.ctx.beginPath()
            this.ctx.arc(shockwave.x, shockwave.y, shockwave.radius * 0.7, 0, Math.PI * 2)
            this.ctx.stroke()

            this.ctx.restore()
        }
    }

    private drawUI(state: IGameState): void {
        // This is handled by Vue component, but we can add canvas-based UI here if needed
    }

    updateConfig(config: Partial<IGameConfig>): void {
        this.config = { ...this.config, ...config }
        this.cannon.x = this.config.canvasWidth / 2
        this.cannon.y = this.config.canvasHeight - 40
        this.setupCanvas()
    }

    destroy(): void {
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId)
        }
    }
}
