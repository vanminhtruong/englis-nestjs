export interface Position {
    x: number;
    y: number;
}

export interface Vocabulary {
    vocabularyId: string;
    word: string;
    meaning: string;
    pronunciation?: string;
    image?: string;
}

export interface GameConfig {
    gridSize: number;
    speed: number;
    canvasWidth: number;
    canvasHeight: number;
    colors: {
        snakeHead: string;
        snakeBody: string;
        foodCorrect: string;
        foodIncorrect: string;
        text: string;
        background: string;
        grid: string;
    };
}

export interface GameResult {
    vocabularyId: string;
    isCorrect: boolean;
    score: number;
    timeSpent: number;
}
