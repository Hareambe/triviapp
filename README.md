# Jeopardy Trivia Studio (TriviaApp)

A full-featured, responsive, Jeopardy-style trivia game application with dynamic board sizes, custom board upload, full board editing capabilities, multi-team management, and real-time live scoring.

---

## 🌟 Key Features

- **3-Step Game Flow**:
  1. **Board Selection**: Search, filter, and preview trivia boards with size badges (e.g. 4x6, 5x5, 7x3, 10x10).
  2. **Game Lobby & Setup**: Team management (presets for 2, 3, 4 teams or custom add/remove), custom team names, colors, and access to the interactive Board Editor.
  3. **Live Gameplay**: Responsive trivia board with dynamic grid scaling, Daily Doubles, smooth question modals with font auto-scaling, and centered scoreboard with inline score adjustments.

- **Interactive Board Editor**:
  - Live grid view matching the Jeopardy board aesthetic.
  - Inline category title editing.
  - Question editor modal with point selectors, free-form point inputs, multi-line clue & answer textareas, and Daily Double toggles.
  - Direct database updates (`PUT /api/boards/{id}`) to persist changes.

- **Multi-Size Board Support**:
  - Automatically adapts to any grid configuration (4x6, 5x5, 6x4, 7x3, 10x10 Mega Board).
  - Adaptive min-width with horizontal scrolling for large grids.

- **Custom Board JSON Upload**:
  - Upload your own trivia board via `.json` or download starter JSON templates.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, Axios, Canvas Confetti.
- **Backend**: ASP.NET Core 9 Web API, Postgrest C# SDK.
- **Database**: Cloud PostgreSQL via Supabase.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- .NET 9 SDK

### 1. Backend Setup
```bash
cd backend
dotnet restore
dotnet run
```
The backend API runs at `http://localhost:5032`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.
