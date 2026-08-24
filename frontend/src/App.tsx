import { useEffect, useState, useCallback } from 'react';
import type { BoardResponseDto, Team } from './types/board';
import { fetchBoards } from './services/api';
import { BoardSelector } from './components/BoardSelector';
import { TeamSetup } from './components/TeamSetup';
import { BoardView } from './components/BoardView';
import { Loader2, Gamepad2 } from 'lucide-react';

export function App() {
  const [boards, setBoards] = useState<BoardResponseDto[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<BoardResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // App flow: 'board-select' (Page 1) -> 'team-setup' (Page 2) -> 'playing' (Page 3)
  const [gameState, setGameState] = useState<'board-select' | 'team-setup' | 'playing'>('board-select');

  // Configured teams state
  const [teams, setTeams] = useState<Team[]>([
    { id: '1', name: 'Team 1', score: 0, color: 'Amber' },
    { id: '2', name: 'Team 2', score: 0, color: 'Sky' },
  ]);

  const reloadBoards = useCallback(async () => {
    try {
      const data = await fetchBoards();
      setBoards(data);
      if (data.length > 0) {
        setSelectedBoard((prev) => {
          if (!prev) return data[0];
          const exists = data.find((b) => b.id === prev.id);
          return exists || data[0];
        });
      } else {
        setSelectedBoard(null);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to trivia backend. Make sure the ASP.NET Core server is running.');
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchBoards()
      .then((data) => {
        if (!ignore) {
          setBoards(data);
          if (data.length > 0) setSelectedBoard(data[0]);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error(err);
          setError('Failed to connect to trivia backend. Make sure the ASP.NET Core server is running.');
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-slate-400 bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
        <span className="text-base font-medium">Loading trivia boards from backend...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* App Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-950 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="flex items-center gap-2 cursor-pointer group bg-transparent border-0 p-0 text-left"
            onClick={() => setGameState('board-select')}
            title="Return to Board Selection"
          >
            <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center group-hover:bg-yellow-400/20 transition-colors">
              <Gamepad2 className="w-5 h-5 text-yellow-400" />
            </div>
            <h1 className="text-xl font-black text-yellow-400 tracking-wider group-hover:text-yellow-300 transition-colors">
              JEOPARDY STUDIO
            </h1>
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                gameState === 'board-select'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : gameState === 'team-setup'
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {gameState === 'board-select'
                ? '1. Board Selection'
                : gameState === 'team-setup'
                ? '2. Game Setup'
                : '3. Live Game'}
            </span>
          </div>
        </div>
      </header>

      {/* Main App Content Area */}
      <main className="flex-1 py-6">
        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-sm">
            {error}
          </div>
        )}

        {gameState === 'board-select' && (
          <BoardSelector
            boards={boards}
            selectedBoard={selectedBoard}
            onSelectBoard={setSelectedBoard}
            onProceedToSetup={() => setGameState('team-setup')}
            onRefreshBoards={reloadBoards}
          />
        )}

        {gameState === 'team-setup' && selectedBoard && (
          <TeamSetup
            selectedBoard={selectedBoard}
            onBackToBoardSelect={() => setGameState('board-select')}
            onBoardUpdated={(updated) => {
              setSelectedBoard(updated);
              reloadBoards();
            }}
            teams={teams}
            setTeams={setTeams}
            onStartGame={() => setGameState('playing')}
          />
        )}

        {gameState === 'playing' && selectedBoard && (
          <BoardView
            board={selectedBoard}
            initialTeams={teams}
            onUpdateTeams={setTeams}
            onExitGame={() => setGameState('team-setup')}
          />
        )}
      </main>
    </div>
  );
}

export default App;