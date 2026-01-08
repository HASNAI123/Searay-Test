
import express from 'express';
import cors from 'cors';
import { Game } from './gameLogic';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const game = new Game();

app.get('/api/state', (req, res) => {
    res.json(game.state());
});

app.post('/api/reset', (req, res) => {
    game.reset();
    res.json(game.state());
});

app.post('/api/move', (req, res) => {
    const { circleId, direction } = req.body;
    if (!circleId || !direction) {
        return res.status(400).json({ error: 'Missing circleId or direction' });
    }
    const result = game.move(circleId, direction);
    res.json({ result, state: game.state() });
});

app.get('/api/history/csv', (req, res) => {
    const csv = game.getCSV();
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="movement_history.csv"');
    res.send(csv);
});

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});
