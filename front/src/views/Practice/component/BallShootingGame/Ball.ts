// Ball Class - Single Responsibility: Manage ball state and behavior
import type { IBall } from './interfaces'

export class Ball implements IBall {
    id: string
    x: number
    y: number
    radius: number
    word: string
    vocabularyId: string
    color: string
    velocity: { x: number; y: number }
    isActive: boolean
    opacity: number

    private pulsePhase: number = 0
    private glowIntensity: number = 0

    constructor(
        id: string,
        word: string,
        vocabularyId: string,
        canvasWidth: number,
        canvasHeight: number,
        speed: number = 1
    ) {
        this.id = id
        this.word = word
        this.vocabularyId = vocabularyId
        this.radius = 45 + Math.random() * 15
        this.isActive = true
        this.opacity = 1
        this.color = this.generateGradientColor()

        // Spawn from edges
        const side = Math.floor(Math.random() * 4)
        switch (side) {
            case 0: // Top
                this.x = Math.random() * canvasWidth
                this.y = -this.radius
                break
            case 1: // Right
                this.x = canvasWidth + this.radius
                this.y = Math.random() * canvasHeight
                break
            case 2: // Bottom
                this.x = Math.random() * canvasWidth
                this.y = canvasHeight + this.radius
                break
            default: // Left
                this.x = -this.radius
                this.y = Math.random() * canvasHeight
                break
        }

        // Calculate velocity towards center with some randomness
        const centerX = canvasWidth / 2 + (Math.random() - 0.5) * 200
        const centerY = canvasHeight / 2 + (Math.random() - 0.5) * 200
        const angle = Math.atan2(centerY - this.y, centerX - this.x)
        const speedVariation = speed * (0.8 + Math.random() * 0.4)

        this.velocity = {
            x: Math.cos(angle) * speedVariation,
            y: Math.sin(angle) * speedVariation
        }

        this.pulsePhase = Math.random() * Math.PI * 2
    }

    private generateGradientColor(): string {
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        ]
        return colors[Math.floor(Math.random() * colors.length)] ?? colors[0] ?? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }

    update(deltaTime: number): void {
        if (!this.isActive) return

        this.x += this.velocity.x * deltaTime * 60
        this.y += this.velocity.y * deltaTime * 60
        this.pulsePhase += deltaTime * 3
        this.glowIntensity = 0.5 + Math.sin(this.pulsePhase) * 0.3
    }

    isOutOfBounds(canvasWidth: number, canvasHeight: number): boolean {
        const margin = this.radius * 2
        return (
            this.x < -margin ||
            this.x > canvasWidth + margin ||
            this.y < -margin ||
            this.y > canvasHeight + margin
        )
    }

    containsPoint(px: number, py: number): boolean {
        const dx = px - this.x
        const dy = py - this.y
        return Math.sqrt(dx * dx + dy * dy) <= this.radius * 1.2
    }

    getGlowIntensity(): number {
        return this.glowIntensity
    }

    // Factory method pattern
    static createFromVocabulary(
        vocabulary: { vocabularyId: string; word: string },
        canvasWidth: number,
        canvasHeight: number,
        speed: number
    ): Ball {
        return new Ball(
            `ball_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            vocabulary.word,
            vocabulary.vocabularyId,
            canvasWidth,
            canvasHeight,
            speed
        )
    }
}
