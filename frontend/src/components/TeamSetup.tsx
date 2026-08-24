import React, { useState } from 'react';
import type { BoardResponseDto, Team, BoardData } from '../types/board';
import { Users, Plus, Trash2, Play, Sparkles, Layers, Pencil, ArrowLeft } from 'lucide-react';
import { TEAM_COLORS } from '../constants/teams';
import { EditBoardModal } from './EditBoardModal';

interface TeamSetupProps {
  selectedBoard: BoardResponseDto;
  onBackToBoardSelect: () => void;
  onBoardUpdated: (updated: BoardResponseDto) => void;
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  onStartGame: () => void;
}

export const TeamSetup: React.FC<TeamSetupProps> = ({
  selectedBoard,
  onBackToBoardSelect,
  onBoardUpdated,
  teams,
  setTeams,
  onStartGame,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Parse categories from selected board to show stats
  const categoryCount = React.useMemo(() => {
    if (!selectedBoard?.dataJson) return selectedBoard?.gridWidth || 0;
    try {
      const parsed =
        typeof selectedBoard.dataJson === 'string'
          ? (JSON.parse(selectedBoard.dataJson) as BoardData)
          : (selectedBoard.dataJson as BoardData);
      return parsed.categories?.length || selectedBoard.gridWidth || 0;
    } catch {
      return selectedBoard.gridWidth || 0;
    }
  }, [selectedBoard]);

  const totalQuestions = (categoryCount || 5) * (selectedBoard?.gridHeight || 5);

  const addTeam = () => {
    const nextIndex = teams.length;
    const colorObj = TEAM_COLORS[nextIndex % TEAM_COLORS.length];
    const newTeam: Team = {
      id: Date.now().toString(),
      name: `Team ${teams.length + 1}`,
      score: 0,
      color: colorObj.name,
    };
    setTeams((prev) => [...prev, newTeam]);
  };

  const removeTeam = (id: string) => {
    if (teams.length <= 1) return;
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTeamName = (id: string, name: string) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name } : t))
    );
  };

  const updateTeamColor = (id: string, color: string) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, color } : t))
    );
  };

  const setPresetTeams = (count: number) => {
    const presetTeams: Team[] = Array.from({ length: count }, (_, i) => {
      const colorObj = TEAM_COLORS[i % TEAM_COLORS.length];
      return {
        id: (i + 1).toString(),
        name: `Team ${i + 1}`,
        score: 0,
        color: colorObj.name,
      };
    });
    setTeams(presetTeams);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation Row */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onBackToBoardSelect}
          className="flex items-center gap-2 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Change Board
        </button>

        <div className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          Step 2 • Game Setup
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-100 tracking-tight">
          Ready for <span className="text-yellow-400">Trivia Night</span>?
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-sm">
          Configure your teams, adjust board questions if desired, and launch the match.
        </p>
      </div>

      {/* Board Card with Edit Button */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-lg">
            <Layers className="w-5 h-5 text-yellow-400" />
            <span>Active Trivia Board</span>
          </div>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer hover:scale-105"
            title="Edit categories, prompts, values, and answers"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit Board
          </button>
        </div>

        <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
              Selected Board
            </div>
            <h3 className="text-xl font-extrabold text-slate-100">{selectedBoard.title}</h3>
            <p className="text-sm text-slate-400">{selectedBoard.description || 'Jeopardy Trivia Board'}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-center bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Categories</div>
              <div className="text-base font-black text-yellow-400">{categoryCount}</div>
            </div>
            <div className="text-center bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Questions</div>
              <div className="text-base font-black text-emerald-400">{totalQuestions}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Setup Card */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-700 pb-4">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-lg">
            <Users className="w-5 h-5 text-yellow-400" />
            <span>Participating Teams</span>
            <span className="text-xs font-semibold bg-slate-900 px-2 py-0.5 rounded-full text-slate-300 border border-slate-700">
              {teams.length} {teams.length === 1 ? 'Team' : 'Teams'}
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">Presets:</span>
            {[2, 3, 4].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPresetTeams(num)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  teams.length === num
                    ? 'bg-yellow-500 text-slate-950 border-yellow-400'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                }`}
              >
                {num} Teams
              </button>
            ))}
            <button
              type="button"
              onClick={addTeam}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm ml-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Teams List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teams.map((team, idx) => {
            const colorObj =
              TEAM_COLORS.find((c) => c.name === team.color) ||
              TEAM_COLORS[idx % TEAM_COLORS.length];

            return (
              <div
                key={team.id}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between space-y-3 bg-slate-900/90 ${colorObj.border}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${colorObj.badge}`}
                    >
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={team.name}
                      onChange={(e) => updateTeamName(team.id, e.target.value)}
                      placeholder={`Team ${idx + 1}`}
                      className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-100 font-bold focus:outline-none focus:border-yellow-400 w-full text-base transition-colors"
                    />
                  </div>

                  {teams.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTeam(team.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors rounded-lg hover:bg-slate-800 shrink-0 cursor-pointer"
                      title="Remove Team"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Team Color Palette Picker */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400">Team Theme</span>
                  <div className="flex items-center gap-1.5">
                    {TEAM_COLORS.slice(0, 6).map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => updateTeamColor(team.id, c.name)}
                        className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                          (team.color || colorObj.name) === c.name
                            ? 'scale-125 ring-2 ring-white'
                            : 'opacity-70 hover:opacity-100'
                        } ${c.badge.split(' ')[0]}`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Team Button at bottom if list is short */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={addTeam}
            className="flex items-center gap-2 text-slate-300 hover:text-yellow-400 text-sm font-semibold bg-slate-900/60 hover:bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Another Team
          </button>
        </div>
      </div>

      {/* Start Game Action */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onStartGame}
          disabled={!selectedBoard || teams.length === 0}
          className="w-full sm:w-auto min-w-[280px] flex items-center justify-center gap-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 px-10 py-4 rounded-2xl font-black text-2xl tracking-wider transition-all shadow-2xl hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Play className="w-6 h-6 fill-slate-950" /> Start Game
        </button>
      </div>

      {/* Edit Board Modal */}
      {isEditModalOpen && (
        <EditBoardModal
          board={selectedBoard}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onBoardUpdated={onBoardUpdated}
        />
      )}
    </div>
  );
};
