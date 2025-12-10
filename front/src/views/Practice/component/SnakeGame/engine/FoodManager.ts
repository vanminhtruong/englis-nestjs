import type { Position, Vocabulary } from '../types';

export interface FoodItem {
    id: string;
    position: Position;
    label: string;
    isCorrect: boolean;
    color: string;
}

export class FoodManager {
    private foods: FoodItem[] = [];
    private gridWidth: number;
    private gridHeight: number;

    constructor(gridWidth: number, gridHeight: number) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
    }

    spawnFood(
        occupied: Position[],
        currentVocab: Vocabulary,
        otherVocab: Vocabulary,
        colors: { correct: string; incorrect: string }
    ) {
        this.foods = [];

        // Spawn correct food
        const correctPos = this.getRandomPosition(occupied);
        this.foods.push({
            id: 'correct',
            position: correctPos,
            label: currentVocab.meaning,
            isCorrect: true,
            color: colors.correct
        });

        // Spawn incorrect food
        const incorrectPos = this.getRandomPosition([...occupied, correctPos]);
        this.foods.push({
            id: 'incorrect',
            position: incorrectPos,
            label: otherVocab.meaning,
            isCorrect: false,
            color: colors.incorrect
        });
    }

    private getRandomPosition(exclude: Position[]): Position {
        let position: Position = { x: 0, y: 0 };
        let safe = false;

        while (!safe) {
            position = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight),
            };

            // Check if position is in exclude list
            safe = !exclude.some(p => p.x === position.x && p.y === position.y);
        }

        return position;
    }

    getFoods(): FoodItem[] {
        return this.foods;
    }

    checkCollision(position: Position): FoodItem | null {
        return this.foods.find(f => f.position.x === position.x && f.position.y === position.y) || null;
    }
}
