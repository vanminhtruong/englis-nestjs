// Game Engine - Manages game loop and state (Single Responsibility + Dependency Inversion)
import { Ball } from './Ball'
import { ExplosionManager } from './ExplosionManager'
import type { IGameState, IGameConfig, IGameResult, IPracticeQuestion, IGameEvent, IGameEventListener } from './interfaces'

export class GameEngine {
    private state: IGameState
    private config: IGameConfig
    private questions: IPracticeQuestion[]
    private questionIndex: number = 0
    private explosionManager: ExplosionManager
    private lastSpawnTime: number = 0
    private gameLoopId: number | null = null
    private lastFrameTime: number = 0
    private listeners: IGameEventListener[] = []
    private results: IGameResult[] = []
    private questionStartTime: number = 0

    constructor(config: Partial<IGameConfig> = {}) {
        this.config = {
            maxBalls: 5,
            ballSpeed: 1.5,
            spawnInterval: 2000,
            gameTime: 60,
            ballRadius: 50,
            canvasWidth: 800,
            canvasHeight: 600,
            isDarkMode: false,
            ...config
        }

        this.questions = []
        this.explosionManager = new ExplosionManager()

        this.state = this.getInitialState()
    }

    private getInitialState(): IGameState {
        return {
            balls: [],
            score: 0,
            lives: 3,
            level: 1,
            isPlaying: false,
            isPaused: false,
            currentMeaning: '',
            currentVocabularyId: '',
            timeRemaining: this.config.gameTime,
            comboCount: 0,
            maxCombo: 0
        }
    }

    // Observer Pattern - Add listener
    addListener(listener: IGameEventListener): void {
        this.listeners.push(listener)
    }

    removeListener(listener: IGameEventListener): void {
        const index = this.listeners.indexOf(listener)
        if (index > -1) {
            this.listeners.splice(index, 1)
        }
    }

    private emit(event: IGameEvent): void {
        this.listeners.forEach(l => l.onGameEvent(event))
    }

    // Initialize game with questions
    initialize(questions: IPracticeQuestion[]): void {
        this.questions = this.shuffleArray([...questions])
        this.questionIndex = 0
        this.results = []
        this.state = this.getInitialState()
        this.setNextQuestion()
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const temp = shuffled[i]
            shuffled[i] = shuffled[j] as T
            shuffled[j] = temp as T
        }
        return shuffled
    }

    private setNextQuestion(): void {
        if (this.questions.length === 0) return

        if (this.questionIndex >= this.questions.length) {
            // Recycle questions
            this.questions = this.shuffleArray(this.questions)
            this.questionIndex = 0
        }

        const question = this.questions[this.questionIndex]
        if (question) {
            this.state.currentMeaning = question.meaning
            this.state.currentVocabularyId = question.vocabularyId
            this.questionStartTime = Date.now()
            this.questionIndex++
        }
    }

    start(): void {
        if (this.state.isPlaying) return

        this.state.isPlaying = true
        this.state.isPaused = false
        this.lastFrameTime = performance.now()
        this.lastSpawnTime = this.lastFrameTime

        this.gameLoop()
    }

    pause(): void {
        this.state.isPaused = true
    }

    resume(): void {
        if (!this.state.isPlaying) return
        this.state.isPaused = false
        this.lastFrameTime = performance.now()
        this.gameLoop()
    }

    stop(): void {
        this.state.isPlaying = false
        if (this.gameLoopId !== null) {
            cancelAnimationFrame(this.gameLoopId)
            this.gameLoopId = null
        }
        this.emit({ type: 'game_over', data: this.getResults() })
    }

    private gameLoop(): void {
        if (!this.state.isPlaying || this.state.isPaused) return

        const now = performance.now()
        const deltaTime = Math.min((now - this.lastFrameTime) / 1000, 0.1) // Cap delta time
        this.lastFrameTime = now

        this.update(deltaTime, now)

        this.gameLoopId = requestAnimationFrame(() => this.gameLoop())
    }

    private update(deltaTime: number, now: number): void {
        // Update timer
        this.state.timeRemaining -= deltaTime
        if (this.state.timeRemaining <= 0) {
            this.stop()
            return
        }

        // Spawn new balls
        if (now - this.lastSpawnTime > this.config.spawnInterval) {
            this.spawnBall()
            this.lastSpawnTime = now
        }

        // Update balls
        this.state.balls = this.state.balls.filter(ball => {
            if (ball instanceof Ball) {
                ball.update(deltaTime)

                // Remove out of bounds balls
                if (ball.isOutOfBounds(this.config.canvasWidth, this.config.canvasHeight)) {
                    return false
                }
            }
            return ball.isActive
        })

        // Update explosions
        this.explosionManager.update(deltaTime)
    }

    private spawnBall(): void {
        if (this.state.balls.length >= this.config.maxBalls) return
        if (this.questions.length === 0) return

        // Select a random question for the ball
        const availableQuestions = this.questions.filter(
            q => !this.state.balls.some(b => b.vocabularyId === q.vocabularyId)
        )

        if (availableQuestions.length === 0) return

        const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
        if (!question) return

        const ball = Ball.createFromVocabulary(
            { vocabularyId: question.vocabularyId, word: question.word },
            this.config.canvasWidth,
            this.config.canvasHeight,
            this.config.ballSpeed * (1 + this.state.level * 0.1)
        )

        this.state.balls.push(ball)
    }

    // Handle ball click
    handleClick(x: number, y: number): boolean {
        const hitBalls: Ball[] = []

        // Find all balls that contain the click point
        for (const ball of this.state.balls) {
            if (ball instanceof Ball && ball.containsPoint(x, y) && ball.isActive) {
                hitBalls.push(ball)
            }
        }

        if (hitBalls.length === 0) return false

        // Check if any hit ball matches the current question
        const correctBall = hitBalls.find(b => b.vocabularyId === this.state.currentVocabularyId)

        if (correctBall) {
            // Correct hit!
            this.handleCorrectHit(correctBall)
            return true
        } else {
            // Wrong hit
            const wrongBall = hitBalls[0]
            if (wrongBall) {
                this.handleWrongHit(wrongBall)
            }
            return false
        }
    }

    private handleCorrectHit(ball: Ball): void {
        const timeSpent = (Date.now() - this.questionStartTime) / 1000

        // Increase combo
        this.state.comboCount++
        this.state.maxCombo = Math.max(this.state.maxCombo, this.state.comboCount)

        // Calculate score with combo multiplier
        const comboMultiplier = 1 + (this.state.comboCount - 1) * 0.5
        const timeBonus = Math.max(0, 10 - timeSpent)
        const baseScore = 100
        const score = Math.round((baseScore + timeBonus * 10) * comboMultiplier)

        this.state.score += score

        // Record result
        const question = this.questions.find(q => q.vocabularyId === ball.vocabularyId)
        if (question) {
            this.results.push({
                vocabularyId: ball.vocabularyId,
                word: ball.word,
                meaning: question.meaning,
                isCorrect: true,
                timeSpent,
                comboMultiplier
            })
        }

        // Create explosion effect
        const explosionIntensity = Math.min(3, this.state.comboCount)
        if (this.state.comboCount >= 3) {
            this.explosionManager.createComboExplosion(ball.x, ball.y, 3)
        } else {
            this.explosionManager.createExplosion(ball.x, ball.y, ball.color, explosionIntensity)
        }

        // Remove ball
        ball.isActive = false

        // Emit events
        this.emit({ type: 'ball_hit', data: { ball, score, combo: this.state.comboCount } })
        this.emit({ type: 'score_update', data: { score: this.state.score } })

        if (this.state.comboCount >= 3) {
            this.emit({ type: 'combo', data: { count: this.state.comboCount } })
        }

        // Level up every 500 points
        if (this.state.score >= this.state.level * 500) {
            this.state.level++
            this.config.ballSpeed += 0.2
            this.emit({ type: 'level_up', data: { level: this.state.level } })
        }

        // Set next question
        this.setNextQuestion()
    }

    private handleWrongHit(ball: Ball): void {
        const timeSpent = (Date.now() - this.questionStartTime) / 1000

        // Reset combo
        this.state.comboCount = 0

        // Lose a life
        this.state.lives--

        // Record result
        const question = this.questions.find(q => q.vocabularyId === this.state.currentVocabularyId)
        if (question) {
            this.results.push({
                vocabularyId: question.vocabularyId,
                word: question.word,
                meaning: question.meaning,
                isCorrect: false,
                timeSpent,
                comboMultiplier: 1
            })
        }

        // Small explosion effect for wrong hit
        this.explosionManager.createExplosion(ball.x, ball.y, '#FF4444', 0.5)

        this.emit({ type: 'ball_miss', data: { remainingLives: this.state.lives } })

        // Game over if no lives
        if (this.state.lives <= 0) {
            this.stop()
            return
        }

        // Set next question
        this.setNextQuestion()
    }

    // Getters
    getState(): IGameState {
        return { ...this.state }
    }

    getExplosionManager(): ExplosionManager {
        return this.explosionManager
    }

    getResults(): { results: IGameResult[]; score: number; maxCombo: number } {
        return {
            results: this.results,
            score: this.state.score,
            maxCombo: this.state.maxCombo
        }
    }

    getConfig(): IGameConfig {
        return { ...this.config }
    }

    updateConfig(config: Partial<IGameConfig>): void {
        this.config = { ...this.config, ...config }
    }
}
