
import { useEffect, useState, useCallback } from 'react';
import { api, type GameState } from './api';
import { Grid } from './components/Grid';
import './App.css';

import { solveGame } from './solver';

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);

  const fetchState = async () => {
    try {
      const state = await api.getState();
      setGameState(state);
    } catch (err) {
      console.error(err);
      setError('Failed to connect to backend');
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleReset = async () => {
    const state = await api.reset();
    setGameState(state);
    setSelectedCircleId(null);
    setError(null);
  };

  const handleSolve = async () => {
    if (isSolving) return;
    setIsSolving(true);
    await solveGame(fetchState);
    setIsSolving(false);
  };

  const handleMove = useCallback(async (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (!selectedCircleId || isSolving) return;

    try {
      const { result, state } = await api.move(selectedCircleId, direction);
      setGameState(state);
      if (!result.success) {
        setError(result.message || 'Move failed');
        // Clear error after 2 seconds
        setTimeout(() => setError(null), 2000);
      } else {
        setError(null);
        if (result.won) {
          alert('Congratulations! You completed the challenge!');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Error executing move');
    }
  }, [selectedCircleId, isSolving]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCircleId) return;

      switch (e.key) {
        case 'ArrowUp': handleMove('UP'); break;
        case 'ArrowDown': handleMove('DOWN'); break;
        case 'ArrowLeft': handleMove('LEFT'); break;
        case 'ArrowRight': handleMove('RIGHT'); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCircleId, handleMove]);

  if (!gameState) return <div className="loading">Loading...</div>;

  return (
    <div className="app-container">
      <header>
        <h1>Stack Up Robot</h1>
        <p>Select a circle and use Arrow Keys to move.</p>
      </header>

      <main>
        <Grid
          gameState={gameState}
          selectedCircleId={selectedCircleId}
          onSelectCircle={setSelectedCircleId}
        />

        {error && (
          <div className="error-toast">
            {error}
          </div>
        )}

        <div className="controls">
          <button className="btn btn-reset" onClick={handleReset} disabled={isSolving}>Reset Game</button>
          <button className="btn btn-primary" onClick={handleSolve} disabled={isSolving}>
            {isSolving ? 'Solving...' : 'Auto Solve'}
          </button>
          <button className="btn btn-secondary" onClick={api.downloadCSV} disabled={isSolving}>Download History CSV</button>
        </div>

        <div className="legend">
          <div className="legend-item"><span className="dot red"></span> Red: Top only</div>
          <div className="legend-item"><span className="dot green"></span> Green: Support Any</div>
          <div className="legend-item"><span className="dot blue"></span> Blue: Support Red Only</div>
        </div>
      </main>
    </div>
  );
}

export default App;
