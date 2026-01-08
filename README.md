# Stack Up - Robot Challenge

This project implements the "Stack Up" challenge, where a robot moves colored circles on a grid to stack them according to specific rules.

## Assumptions

1.  **Movement Mechanics (Lifting vs. Sliding):**
    *   *Assumption:* The robot can lift circles and place them anywhere on the grid, even if there is empty space below them (floating).
    *   *Reasoning:* If we strictly enforced gravity (circles must always fall), moving a circle from the bottom of a stack to the top of another would be extremely difficult or impossible without complex "sliding" puzzles. Allowing "floating" simulates a robot arm holding the object or placing it on a temporary shelf.

2.  **Game State & Persistence:**
    *   *Assumption:* The game state does not need to persist after a server restart.
    *   *Reasoning:* For a take-home test of this scope, in-memory storage is sufficient and allows for easier setup/testing.

3.  **"Stacking" Logic:**
    *   *Assumption:* The stacking rules (e.g., "Red cannot have any circles above them") apply regardless of whether the circle above is immediately adjacent or further up the column.
    *   *Implementation:* Currently, the check validates the relationship between the *immediate* circle below the target position. This covers the most direct stacking interactions.

4.  **Grid Dimensions:**
    *   *Assumption:* A 5x7 grid is sufficient to demonstrate the mechanics and allow enough space for maneuvering.

## Design Decisions

### 1. Architecture: Client-Server Separation
*   **Decision:** Split the application into a distinct Frontend (React) and Backend (Node.js/Express).
*   **Justification:** This was a requirement ("Develop a frontend... and a backend..."). It also enforces a clean separation of concerns where the backend is the source of truth for the game state and validation rules, preventing client-side cheating or state desynchronization.

### 2. Technology Stack
*   **Frontend: React + Vite + TypeScript**
    *   *Why:* React provides an efficient component-based architecture for rendering the grid. Vite ensures a fast development environment. TypeScript offers type safety, which is crucial for defining the shared data structures (Circle, GameState) between frontend and backend.
*   **Backend: Express + TypeScript**
    *   *Why:* Express is a minimal and flexible framework for handling the API endpoints. Using TypeScript on the backend allows code sharing (interfaces) and robust compile-time checks.

### 3. API Design (REST)
*   **Decision:** Use simple REST endpoints (`GET /state`, `POST /move`).
*   **Justification:** The interaction model is discrete (move by move), so a stateless HTTP protocol is appropriate. WebSockets could be used for real-time multi-player updates, but for a single-user control interface, REST is simpler and sufficient.

### 4. Validation Logic
*   **Decision:** Validate moves *before* updating the state.
*   **Justification:** This ensures the grid never enters an invalid state. The validation logic is centralized in the `Game` class, making it easy to test and modify rules without touching the API handlers.

## How to Run

### Backend
1.  Navigate to `backend`: `cd backend`
2.  Install dependencies: `npm install`
3.  Start server: `npm start`
    *   Server runs on: `http://localhost:3001`

### Frontend
1.  Navigate to `frontend`: `cd frontend`
2.  Install dependencies: `npm install`
3.  Start dev server: `npm run dev`
    *   App runs on: `http://localhost:5173`

## Usage
1.  Open the Frontend URL.
2.  Click on a colored circle to select it.
3.  Use **Arrow Keys** to move the selected circle.
4.  Stack the circles on the right side of the grid following these rules:
    *   🔴 **Red:** Top of the stack only (nothing above it).
    *   🟢 **Green:** Can support any color.
    *   🔵 **Blue:** Can only support Red.
5.  Click **"Download History CSV"** to get a log of all movements.
