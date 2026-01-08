
import React from 'react';
import type { GameState } from '../api';
import './Grid.css';

interface GridProps {
    gameState: GameState;
    selectedCircleId: string | null;
    onSelectCircle: (id: string) => void;
}

export const Grid: React.FC<GridProps> = ({ gameState, selectedCircleId, onSelectCircle }) => {
    const { grid, circles, rows, cols } = gameState;

    return (
        <div
            className="grid-container"
            style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`
            }}
        >
            {grid.flatMap((row, rIndex) =>
                row.map((cellValue, cIndex) => {
                    const circle = cellValue ? circles[cellValue] : null;
                    const isSelected = circle?.id === selectedCircleId;

                    return (
                        <div
                            key={`${rIndex}-${cIndex}`}
                            className={`grid-cell ${circle ? 'has-circle' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={() => circle && onSelectCircle(circle.id)}
                        >
                            {circle && (
                                <div className={`circle circle-${circle.color.toLowerCase()}`}>
                                    <span className="circle-label">{circle.id}</span>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};
