Stack Up
========

A web-based robot control game where you organize colored circles on a grid.

Quick Start
-----------

1. Start Backend:
   cd backend
   npm install
   npm start

2. Start Frontend:
   cd frontend
   npm install
   npm run dev

How to Play
-----------
Click a circle to select it, then use your Arrow Keys to move it around.
The goal is to stack all circles on the far right column.

Stacking Rules:
- Red: Must be the top of a stack. You can't put anything on top of a Red circle.
- Blue: Only Red circles can be placed on top of Blue ones.
- Green: Sturdy! You can stack any color on top of Green.

Notes
-----
- The game state is stored in memory, so restarting the backend will reset the board.
- You can download a CSV of your move history from the UI.
