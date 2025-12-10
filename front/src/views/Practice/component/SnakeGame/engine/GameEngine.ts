import type { GameConfig, GameResult, Vocabulary } from '../types';
import { Snake } from './Snake';
import { FoodManager } from './FoodManager';
import { Renderer } from './Renderer';

export class GameEngine {
    private snake: Snake;
    private foodManager: FoodManager;
    private renderer: Renderer;
    private config: GameConfig;
    private animationId: number | null = null;
    private lastTime: number = 0;
    private accumulator: number = 0;
    private isPaused: boolean = false;
    private isGameOver: boolean = false;

    private vocabularies: Vocabulary[] = [];
    private currentVocabIndex: number = 0;
    private score: number = 0;
    private results: GameResult[] = [];
    private startTime: number = 0;

    private onGameOver: (results: { score: number, results: GameResult[] }) => void;
    private onScoreUpdate: (score: number) => void;
    private onWordChange: (word: Vocabulary) => void;

    constructor(
        canvas: HTMLCanvasElement,
        config: GameConfig,
        vocabularies: Vocabulary[],
        callbacks: {
            onGameOver: (results: { score: number, results: GameResult[] }) => void;
            onScoreUpdate: (score: number) => void;
            onWordChange: (word: Vocabulary) => void;
        }
    ) {
        this.config = config;
        this.vocabularies = vocabularies;
        this.onGameOver = callbacks.onGameOver;
        this.onScoreUpdate = callbacks.onScoreUpdate;
        this.onWordChange = callbacks.onWordChange;

        const ctx = canvas.getContext('2d')!;
        const gridW = config.canvasWidth / config.gridSize;
        const gridH = config.canvasHeight / config.gridSize;

        this.snake = new Snake(Math.floor(gridW / 2), Math.floor(gridH / 2), gridW, gridH);
        this.foodManager = new FoodManager(gridW, gridH);
        this.renderer = new Renderer(ctx, config);
    }

    start() {
        this.reset();
        this.startTime = Date.now();
        this.lastTime = 0;
        this.accumulator = 0;
        this.animationId = requestAnimationFrame(this.loop.bind(this));
    }

    reset() {
        this.snake.reset(
            Math.floor(this.config.canvasWidth / this.config.gridSize / 2),
            Math.floor(this.config.canvasHeight / this.config.gridSize / 2)
        );
        this.currentVocabIndex = 0;
        this.score = 0;
        this.results = [];
        this.isPaused = false;
        this.isGameOver = false;
        this.onScoreUpdate(0);
        this.nextLevel();
    }

    private nextLevel() {
        if (this.currentVocabIndex >= this.vocabularies.length) {
            this.finishGame();
            return;
        }

        const current = this.vocabularies[this.currentVocabIndex];
        if (!current) {
            this.finishGame();
            return;
        }
        this.onWordChange(current);

        // Pick a random distractor
        let distractorIndex = Math.floor(Math.random() * this.vocabularies.length);
        if (this.vocabularies.length > 1) {
            while (distractorIndex === this.currentVocabIndex) {
                distractorIndex = Math.floor(Math.random() * this.vocabularies.length);
            }
        }
        const distractor = this.vocabularies[distractorIndex];

        if (!distractor) {
            this.finishGame();
            return;
        }

        this.foodManager.spawnFood(
            this.snake.getBody(),
            current,
            distractor,
            {
                correct: this.config.colors.foodCorrect,
                incorrect: this.config.colors.foodIncorrect
            }
        );
    }

    private loop(timestamp: number) {
        if (this.isGameOver) return;

        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (!this.isPaused) {
            this.accumulator += deltaTime;
            // Fixed time step update
            const step = 1000 / this.config.speed;

            while (this.accumulator >= step) {
                this.update();
                this.accumulator -= step;
            }
        }

        this.render();
        this.animationId = requestAnimationFrame(this.loop.bind(this));
    }

    private update() {
        const newHead = this.snake.move();

        // Check collision with self
        if (this.snake.checkCollision(newHead)) {
            this.score = Math.max(0, this.score - 50);
            this.onScoreUpdate(this.score);
            // Optional: Reset snake position
            return;
        }

        // Check collision with food
        const food = this.foodManager.checkCollision(newHead);
        if (food) {
            const currentVocab = this.vocabularies[this.currentVocabIndex];
            if (!currentVocab) return;

            if (food.isCorrect) {
                // Correct!
                this.score += 100;
                this.results.push({
                    vocabularyId: currentVocab.vocabularyId,
                    isCorrect: true,
                    score: 100,
                    timeSpent: (Date.now() - this.startTime) / 1000
                });
                // Explosion effect for correct food
                this.renderer.createExplosion(newHead.x, newHead.y, this.config.colors.foodCorrect, true);

                this.snake.grow(newHead);
                this.currentVocabIndex++;
                this.onScoreUpdate(this.score);
                this.startTime = Date.now(); // reset timer for next word
                this.nextLevel();
            } else {
                // Incorrect!
                this.score = Math.max(0, this.score - 50);
                this.results.push({
                    vocabularyId: currentVocab.vocabularyId,
                    isCorrect: false,
                    score: 0,
                    timeSpent: (Date.now() - this.startTime) / 1000
                });

                // Explosion effect for incorrect food
                this.renderer.createExplosion(newHead.x, newHead.y, this.config.colors.foodIncorrect);

                this.snake.step(newHead); // Move normally (don't grow)
                this.onScoreUpdate(this.score);

                // Respawn food with new distractor
                let distractorIndex = Math.floor(Math.random() * this.vocabularies.length);
                if (this.vocabularies.length > 1) {
                    while (distractorIndex === this.currentVocabIndex) {
                        distractorIndex = Math.floor(Math.random() * this.vocabularies.length);
                    }
                }
                const distractor = this.vocabularies[distractorIndex];
                if (distractor) {
                    this.foodManager.spawnFood(
                        this.snake.getBody(),
                        currentVocab,
                        distractor,
                        {
                            correct: this.config.colors.foodCorrect,
                            incorrect: this.config.colors.foodIncorrect
                        }
                    );
                }
            }
        } else {
            this.snake.step(newHead);
        }
    }

    private render() {
        this.renderer.clear();
        this.renderer.drawFoods(this.foodManager.getFoods());
        this.renderer.updateParticles(); // Update particles
        this.renderer.drawParticles();    // Draw particles
        this.renderer.drawSnake(this.snake);
    }

    private finishGame() {
        this.isGameOver = true;
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.onGameOver({
            score: this.score,
            results: this.results
        });
    }

    handleInput(key: string) {
        switch (key) {
            case 'ArrowUp':
                this.snake.setDirection({ x: 0, y: -1 });
                break;
            case 'ArrowDown':
                this.snake.setDirection({ x: 0, y: 1 });
                break;
            case 'ArrowLeft':
                this.snake.setDirection({ x: -1, y: 0 });
                break;
            case 'ArrowRight':
                this.snake.setDirection({ x: 1, y: 0 });
                break;
        }
    }

    stop() {
        this.isGameOver = true;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}
