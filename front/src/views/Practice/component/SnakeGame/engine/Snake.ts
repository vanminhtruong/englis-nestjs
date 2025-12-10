import type { Position } from '../types';

export class Snake {
    private body: Position[] = [];
    private direction: Position = { x: 1, y: 0 };
    private nextDirection: Position = { x: 1, y: 0 };
    private gridWidth: number;
    private gridHeight: number;

    constructor(startX: number, startY: number, gridWidth: number, gridHeight: number) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.reset(startX, startY);
    }

    reset(startX: number, startY: number) {
        this.body = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY },
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
    }

    setDirection(direction: Position) {
        // Prevent reversing direction
        if (this.direction.x + direction.x === 0 && this.direction.y + direction.y === 0) {
            return;
        }
        this.nextDirection = direction;
    }

    move(): Position {
        this.direction = this.nextDirection;
        const head = this.body[0];
        if (!head) {
            throw new Error("Snake has no body!");
        }
        const newHead = {
            x: (head.x + this.direction.x + this.gridWidth) % this.gridWidth,
            y: (head.y + this.direction.y + this.gridHeight) % this.gridHeight,
        };

        return newHead;
    }

    grow(position: Position) {
        this.body.unshift(position);
    }

    step(position: Position) {
        this.body.unshift(position);
        this.body.pop();
    }

    checkCollision(position: Position): boolean {
        return this.body.some(segment => segment.x === position.x && segment.y === position.y);
    }

    getBody(): Position[] {
        return [...this.body];
    }

    getHead(): Position {
        return this.body[0] || { x: 0, y: 0 };
    }
}
