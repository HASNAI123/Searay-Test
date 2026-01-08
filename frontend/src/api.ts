
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export type Color = 'Red' | 'Green' | 'Blue';

export interface Circle {
    id: string;
    color: Color;
}

export interface MoveResult {
    success: boolean;
    message?: string;
    won?: boolean;
}

export interface GameState {
    grid: (string | null)[][];
    circles: Record<string, Circle>;
    rows: number;
    cols: number;
}

export const api = {
    getState: async () => {
        const response = await axios.get<GameState>(`${API_URL}/state`);
        return response.data;
    },
    reset: async () => {
        const response = await axios.post<GameState>(`${API_URL}/reset`);
        return response.data;
    },
    move: async (circleId: string, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
        const response = await axios.post<{ result: MoveResult; state: GameState }>(`${API_URL}/move`, { circleId, direction });
        return response.data;
    },
    downloadCSV: () => {
        window.open(`${API_URL}/history/csv`, '_blank');
    }
};
