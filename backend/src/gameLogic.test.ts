
import { Game } from './gameLogic';

describe('Game Logic', () => {
    let game: Game;

    beforeEach(() => {
        game = new Game();
    });

    test('should initialize with specific circles', () => {
        const state = game.state();
        expect(state.circles['c1']).toBeDefined();
        expect(state.circles['c1'].color).toBe('Red');
    });

    test('should allow moving to empty space', () => {
        // Move c1 (Red at 4,0) Up to (3,0)
        const result = game.move('c1', 'UP');
        expect(result.success).toBe(true);
        const pos = game.positions.get('c1');
        expect(pos).toEqual({ row: 3, col: 0 });
    });

    test('should prevent moving out of bounds', () => {
        // Move c1 (Red at 4,0) Down (Limit is 4)
        const result = game.move('c1', 'DOWN');
        expect(result.success).toBe(false);
        expect(result.message).toContain('Out of bounds');
    });

    test('should enforce stacking rules: Red on Blue OK', () => {
        // Setup: Place Blue at 4,0. Place Red at 3,0 (above it).
        // c3 is Blue at 4,2.
        // c1 is Red at 4,0.

        // Let's clear board and setup custom scenario
        game.reset();
        game.gridIds = Array(game.ROWS).fill(null).map(() => Array(game.COLS).fill(null));
        game.circles.clear();
        game.positions.clear();

        game.addCircle('blue1', 'Blue', 4, 0);
        game.addCircle('red1', 'Red', 3, 1); // Float nearby

        // Move Red1 Left to (3,0) -> On top of Blue1
        const result = game.move('red1', 'LEFT');
        expect(result.success).toBe(true);
    });

    test('should enforce stacking rules: Green on Blue FAIL', () => {
        game.reset();
        game.gridIds = Array(game.ROWS).fill(null).map(() => Array(game.COLS).fill(null));
        game.circles.clear();
        game.positions.clear();

        game.addCircle('blue1', 'Blue', 4, 0);
        game.addCircle('green1', 'Green', 3, 1);

        const result = game.move('green1', 'LEFT'); // Try to stack Green on Blue
        expect(result.success).toBe(false);
        expect(result.message).toContain('Only Red can be placed on Blue');
    });

    test('should enforce stacking rules: Anything on Red FAIL', () => {
        game.reset();
        game.gridIds = Array(game.ROWS).fill(null).map(() => Array(game.COLS).fill(null));
        game.circles.clear();
        game.positions.clear();

        game.addCircle('red1', 'Red', 4, 0);
        game.addCircle('green1', 'Green', 3, 1);

        const result = game.move('green1', 'LEFT'); // Try to stack Green on Red
        expect(result.success).toBe(false);
        expect(result.message).toContain('Cannot place anything on top of Red');
    });

    test('should prevent moving Red UNDER a floating circle', () => {
        game.reset();
        game.gridIds = Array(game.ROWS).fill(null).map(() => Array(game.COLS).fill(null));
        game.circles.clear();
        game.positions.clear();

        // Green floating at 3,0
        game.addCircle('green1', 'Green', 3, 0);
        // Red at 4,1
        game.addCircle('red1', 'Red', 4, 1);

        // Try to move Red Left to 4,0 (Directly under Green)
        const result = game.move('red1', 'LEFT');
        expect(result.success).toBe(false);
        expect(result.message).toContain('Red circles cannot have any circles above them');
    });
});
