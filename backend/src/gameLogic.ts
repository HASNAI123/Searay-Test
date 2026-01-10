
export type Color = 'Red' | 'Green' | 'Blue';

export interface Circle {
    id: string;
    color: Color;
}

export interface Position {
    row: number;
    col: number;
}

interface MoveHistory {
    circleId: string;
    from: Position;
    to: Position;
    timestamp: Date;
    success: boolean;
    message?: string;
}

export class Game {
    // gridIds[row][col] is a STACK (array) of string IDs.
    // Index 0 is Bottom, Last Index is Top.
    public gridIds: string[][][];
    public circles: Map<string, Circle>;
    public positions: Map<string, Position>;
    public history: MoveHistory[] = [];

    // Grid dimensions
    public readonly ROWS = 3;
    public readonly COLS = 3;

    constructor() {
        this.gridIds = [];
        this.circles = new Map();
        this.positions = new Map();
        this.reset();
    }

    reset() {
        // Initialize 3x3 Grid of Stacks
        this.gridIds = Array(this.ROWS).fill(null).map(() =>
            Array(this.COLS).fill(null).map(() => [])
        );
        this.circles.clear();
        this.positions.clear();
        this.history = [];

        // Initialize 3x3 Layout (1 circle per cell initially)
        // Mapping: Red->Red, Teal->Green, Dark->Blue

        // Row 2 (Bottom) - Image: Dark, Teal, Red
        this.addCircle('c7', 'Blue', 2, 0);
        this.addCircle('c8', 'Green', 2, 1);
        this.addCircle('c9', 'Red', 2, 2);

        // Row 1 (Middle) - Image: Dark, Red, Teal
        this.addCircle('c4', 'Blue', 1, 0);
        this.addCircle('c5', 'Red', 1, 1);
        this.addCircle('c6', 'Green', 1, 2);

        // Row 0 (Top) - Image: Red, Teal, Dark
        this.addCircle('c1', 'Red', 0, 0);
        this.addCircle('c2', 'Green', 0, 1);
        this.addCircle('c3', 'Blue', 0, 2);
    }

    addCircle(id: string, color: Color, row: number, col: number) {
        this.circles.set(id, { id, color });
        this.positions.set(id, { row, col });
        this.gridIds[row][col].push(id);
    }

    state() {
        return {
            grid: this.gridIds, // Now returns Stacks
            circles: Object.fromEntries(this.circles),
            rows: this.ROWS,
            cols: this.COLS
        };
    }

    validateMove(circleId: string, toRow: number, toCol: number): { valid: boolean; message?: string } {
        // 1. Boundaries
        if (toRow < 0 || toRow >= this.ROWS || toCol < 0 || toCol >= this.COLS) {
            return { valid: false, message: 'Out of bounds' };
        }

        const currentPos = this.positions.get(circleId);
        if (!currentPos) return { valid: false, message: 'Circle not found' };

        // 2. Linear Movement (Horiz/Vert only)
        if (currentPos.row !== toRow && currentPos.col !== toCol) {
            return { valid: false, message: 'Diagonal movement not allowed' };
        }

        // 3. Stack Logic: MUST be top of proper stack
        const sourceStack = this.gridIds[currentPos.row][currentPos.col];
        if (sourceStack.length === 0 || sourceStack[sourceStack.length - 1] !== circleId) {
            return { valid: false, message: 'Can only move the TOP circle' };
        }

        const movingCircle = this.circles.get(circleId)!;
        const targetStack = this.gridIds[toRow][toCol];

        // 4. Stacking Rules (Check against TOP of Target Stack)
        if (targetStack.length > 0) {
            const circleBelowId = targetStack[targetStack.length - 1]; // Top of target
            const circleBelow = this.circles.get(circleBelowId)!;

            // Rule: Red circles cannot have any circles above them.
            if (circleBelow.color === 'Red') {
                return { valid: false, message: 'Cannot place anything on top of Red' };
            }

            // Rule: Blue circles can only have red circles placed above them.
            if (circleBelow.color === 'Blue') {
                if (movingCircle.color !== 'Red') {
                    return { valid: false, message: 'Only Red can be placed on Blue' };
                }
            }

            // Rule: Green circles can have any color stacked on top. (No Restriction)
        }

        return { valid: true };
    }

    move(circleId: string, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') {
        const pos = this.positions.get(circleId);
        if (!pos) throw new Error("Circle not found");

        let toRow = pos.row;
        let toCol = pos.col;

        if (direction === 'UP') toRow--;
        if (direction === 'DOWN') toRow++;
        if (direction === 'LEFT') toCol--;
        if (direction === 'RIGHT') toCol++;

        const validation = this.validateMove(circleId, toRow, toCol);

        const moveRecord: MoveHistory = {
            circleId,
            from: { ...pos },
            to: { row: toRow, col: toCol },
            timestamp: new Date(),
            success: validation.valid,
            message: validation.message
        };
        this.history.push(moveRecord);

        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        // Execute Move (Pop & Push)
        // Remove from old (Assumed to be top from validation)
        this.gridIds[pos.row][pos.col].pop();

        // Add to new
        this.gridIds[toRow][toCol].push(circleId);
        this.positions.set(circleId, { row: toRow, col: toCol });

        const won = this.checkWinCondition();
        return { success: true, won };
    }

    checkWinCondition(): boolean {
        // Goal: All circles stacked on the right side (Last Column, index COLS - 1)
        // We iterate through all circles and check their column.
        for (const pos of this.positions.values()) {
            if (pos.col !== this.COLS - 1) {
                return false;
            }
        }
        return true;
    }

    getCSV() {
        const header = "Timestamp,CircleID,FromRow,FromCol,ToRow,ToCol,Success,Message\n";
        const rows = this.history.map(h =>
            `${h.timestamp.toISOString()},${h.circleId},${h.from.row},${h.from.col},${h.to.row},${h.to.col},${h.success},"${h.message || ''}"`
        ).join("\n");
        return header + rows;
    }
}
