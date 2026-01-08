
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
    public gridIds: (string | null)[][]; // grid[row][col] stores circle ID
    public circles: Map<string, Circle>;
    public positions: Map<string, Position>;
    public history: MoveHistory[] = [];

    // Grid dimensions
    public readonly ROWS = 5;
    public readonly COLS = 7;

    constructor() {
        this.gridIds = Array(this.ROWS).fill(null).map(() => Array(this.COLS).fill(null));
        this.circles = new Map();
        this.positions = new Map();
        this.reset();
    }

    reset() {
        this.gridIds = Array(this.ROWS).fill(null).map(() => Array(this.COLS).fill(null));
        this.circles.clear();
        this.positions.clear();
        this.history = [];

        // Initialize with some circles scattered on the left
        this.addCircle('c1', 'Red', 4, 0);
        this.addCircle('c2', 'Green', 4, 1);
        this.addCircle('c3', 'Blue', 4, 2);
        this.addCircle('c4', 'Red', 3, 0); // Stacked on c1 (Red on Red - Wait, is Red on Red allowed?)
        // Rule: Red cannot have any circles *above* them. So c4 on c1 is INVALID if c1 is Red.
        // Let's place them on ground for now.

        // Let's retry valid initial placement
        this.gridIds = Array(this.ROWS).fill(null).map(() => Array(this.COLS).fill(null));
        this.circles.clear();
        this.positions.clear();

        this.addCircle('c1', 'Red', 4, 0);
        this.addCircle('c2', 'Green', 4, 1);
        this.addCircle('c3', 'Blue', 4, 2);
        this.addCircle('c4', 'Green', 3, 1); // Green on Green? OK
        this.addCircle('c5', 'Red', 2, 1); // Red on Green? OK 
    }

    addCircle(id: string, color: Color, row: number, col: number) {
        this.circles.set(id, { id, color });
        this.positions.set(id, { row, col });
        this.gridIds[row][col] = id;
    }

    state() {
        return {
            grid: this.gridIds,
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

        // 3. Collision (Target occupied?)
        // If simply moving in space (not falling), we can't move INTO a circle.
        // Unless we interpret "move" as "swap" or "push". Instructions say "Robot move... stack".
        // Usually means moving ONE circle to an EMPTY spot.
        if (this.gridIds[toRow][toCol] !== null) {
            return { valid: false, message: 'Target position occupied' };
        }

        // 4. Stacking Rules
        // Rule applies if there is a circle BELOW the target position.
        if (toRow < this.ROWS - 1) {
            const circleBelowId = this.gridIds[toRow + 1][toCol];
            if (circleBelowId && circleBelowId !== circleId) {
                const circleBelow = this.circles.get(circleBelowId)!;
                const movingCircle = this.circles.get(circleId)!;

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
        }

        // Check ABOVE
        // If we move UNDER a floating circle, we must ensure WE don't violate OUR rules.
        if (toRow > 0) {
            const circleAboveId = this.gridIds[toRow - 1][toCol];
            if (circleAboveId && circleAboveId !== circleId) {
                const circleAbove = this.circles.get(circleAboveId)!;
                const movingCircle = this.circles.get(circleId)!;

                // Rule: Red circles cannot have any circles above them.
                if (movingCircle.color === 'Red') {
                    return { valid: false, message: 'Red circles cannot have any circles above them' };
                }

                // Rule: Blue circles can only have red circles placed above them.
                if (movingCircle.color === 'Blue') {
                    if (circleAbove.color !== 'Red') {
                        return { valid: false, message: 'Blue circles can only have Red circles above them' };
                    }
                }
            }
        }

        // 5. Physics/Gravity check? 
        // "Stack them" implies we shouldn't leave floating circles.
        // We allow floating to enable lifting and stacking manually.
        // if (toRow < this.ROWS - 1 && this.gridIds[toRow + 1][toCol] === null) {
        //      return { valid: false, message: 'Cannot float in air' };
        // }

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

        // Execute Move
        this.gridIds[pos.row][pos.col] = null;
        this.gridIds[toRow][toCol] = circleId;
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
