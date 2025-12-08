// Ball Shooting Game - Interfaces (Interface Segregation Principle)

export interface IBall {
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
}

export interface IGameState {
    balls: IBall[]
    score: number
    lives: number
    level: number
    isPlaying: boolean
    isPaused: boolean
    currentMeaning: string
    currentVocabularyId: string
    timeRemaining: number
    comboCount: number
    maxCombo: number
}

export interface IExplosionParticle {
    id: string
    x: number
    y: number
    vx: number
    vy: number
    color: string
    size: number
    life: number
    maxLife: number
}

export interface IProjectile {
    id: string
    x: number
    y: number
    targetX: number
    targetY: number
    speed: number
    life: number
    color: string
}

export interface IGameConfig {
    maxBalls: number
    ballSpeed: number
    spawnInterval: number
    gameTime: number
    ballRadius: number
    canvasWidth: number
    canvasHeight: number
    isDarkMode?: boolean
}

export interface IGameResult {
    vocabularyId: string
    word: string
    meaning: string
    isCorrect: boolean
    timeSpent: number
    comboMultiplier: number
}

export interface IPracticeQuestion {
    vocabularyId: string
    word: string
    pronunciation: string
    meaning: string
    example?: string
    image?: string
}

// Events for Observer Pattern
export type GameEventType =
    | 'ball_hit'
    | 'ball_miss'
    | 'game_over'
    | 'level_up'
    | 'combo'
    | 'score_update'

export interface IGameEvent {
    type: GameEventType
    data: any
}

export interface IGameEventListener {
    onGameEvent(event: IGameEvent): void
}
