
import { api } from './api';

const DELAY_MS = 300;

interface MoveStep {
    id: string;
    dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
}

// Winning Sequence (23 Moves)
const SOLUTION_MOVES: MoveStep[] = [
    { id: 'c3', dir: 'LEFT' },  // 1
    { id: 'c6', dir: 'UP' },    // 2 (Base Stk 1: G)
    { id: 'c9', dir: 'LEFT' },  // 3
    { id: 'c9', dir: 'LEFT' },  // 4
    { id: 'c8', dir: 'RIGHT' }, // 5 (Base Stk 2: G)
    { id: 'c9', dir: 'UP' },    // 6
    { id: 'c7', dir: 'RIGHT' }, // 7
    { id: 'c7', dir: 'RIGHT' }, // 8 (Stk 2: G, B)
    { id: 'c9', dir: 'DOWN' },  // 9
    { id: 'c9', dir: 'RIGHT' }, // 10
    { id: 'c9', dir: 'RIGHT' }, // 11 (Stk 2: G, B, R) - Complete
    { id: 'c3', dir: 'RIGHT' }, // 12 (Stk 1: G, B)
    { id: 'c1', dir: 'RIGHT' }, // 13
    { id: 'c1', dir: 'RIGHT' }, // 14 (Stk 1: G, B, R) - Complete
    { id: 'c5', dir: 'LEFT' },  // 15
    { id: 'c2', dir: 'DOWN' },  // 16
    { id: 'c2', dir: 'RIGHT' }, // 17 (Base Stk 3: G)
    { id: 'c5', dir: 'UP' },    // 18
    { id: 'c5', dir: 'RIGHT' }, // 19
    { id: 'c4', dir: 'RIGHT' }, // 20
    { id: 'c4', dir: 'RIGHT' }, // 21 (Stk 3: G, B)
    { id: 'c5', dir: 'DOWN' },  // 22
    { id: 'c5', dir: 'RIGHT' }, // 23 (Stk 3: G, B, R) - Complete
];

export const solveGame = async (onUpdate: () => void) => {
    // 1. Reset first to ensure known state
    await api.reset();
    onUpdate();
    await new Promise(r => setTimeout(r, DELAY_MS));

    // 2. Execute Moves
    for (const move of SOLUTION_MOVES) {
        try {
            await api.move(move.id, move.dir);
            onUpdate(); // Update UI
            await new Promise(r => setTimeout(r, DELAY_MS));
        } catch (e) {
            console.error("Move failed", move, e);
            break;
        }
    }
};
