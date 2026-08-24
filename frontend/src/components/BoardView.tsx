import React, { useState, useMemo } from 'react';
import type { BoardResponseDto, BoardData, QuestionData, Team } from '../types/board';
import { CheckCircle, Plus, Minus, ArrowLeft, Eye, EyeOff, X } from 'lucide-react';
import { TEAM_COLORS } from '../constants/teams';

interface BoardViewProps {
  board: BoardResponseDto;
  initialTeams?: Team[];
  onUpdateTeams?: (teams: Team[]) => void;
  onExitGame?: () => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  board,
  initialTeams = [],
  onUpdateTeams,
  onExitGame,
}) => {
  const boardData: BoardData = useMemo(() => {
    if (!board?.dataJson) return { categories: [] };

    let parsed: unknown = board.dataJson;

    if (typeof board.dataJson === 'string') {
      try {
        parsed = JSON.parse(board.dataJson);
      } catch (err) {
        console.error('Failed to parse dataJson:', err);
        return { categories: [] };
      }
    }

    const dataObj = parsed as Partial<BoardData> | null;
    return {
      categories: Array.isArray(dataObj?.categories) ? dataObj.categories : [],
    };
  }, [board]);

  const [activeQuestion, setActiveQuestion] = useState<{
    catIndex: number;
    qIndex: number;
    data: QuestionData;
  } | null>(null);

  const [showAnswer, setShowAnswer] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<Record<string, boolean>>({});

  // Team state initialized from setup screen
  const [teams, setTeams] = useState<Team[]>(() => {
    if (initialTeams && initialTeams.length > 0) return initialTeams;
    return [
      { id: '1', name: 'Team 1', score: 0, color: 'Amber' },
      { id: '2', name: 'Team 2', score: 0, color: 'Sky' },
    ];
  });

  const [selectedTeamId, setSelectedTeamId] = useState<string>(() => {
    return initialTeams[0]?.id || '1';
  });

  const notifyTeamsChange = (updated: Team[]) => {
    setTeams(updated);
    if (onUpdateTeams) onUpdateTeams(updated);
  };

  const updateTeamName = (id: string, name: string) => {
    const updated = teams.map((t) => (t.id === id ? { ...t, name } : t));
    notifyTeamsChange(updated);
  };

  const updateTeamScore = (id: string, delta: number) => {
    const updated = teams.map((t) => (t.id === id ? { ...t, score: t.score + delta } : t));
    notifyTeamsChange(updated);
  };

  const setExplicitTeamScore = (id: string, score: number) => {
    const updated = teams.map((t) => (t.id === id ? { ...t, score } : t));
    notifyTeamsChange(updated);
  };

  const markCompleted = (key: string) => {
    setCompletedQuestions((prev) => ({ ...prev, [key]: true }));
    setActiveQuestion(null);
    setShowAnswer(false);
  };

  const closeQuestionModal = (markAsDone: boolean = true) => {
    if (activeQuestion && markAsDone) {
      markCompleted(`${activeQuestion.catIndex}-${activeQuestion.qIndex}`);
    } else {
      setActiveQuestion(null);
      setShowAnswer(false);
    }
  };

  const categories = boardData.categories || [];
  const gridWidth = categories.length || board.gridWidth || 5;

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-4 space-y-6 animate-in fade-in duration-300">
      {/* Header & Editable Scoreboard */}
      <div className="bg-slate-800 p-5 sm:p-6 rounded-2xl border border-slate-700 shadow-xl space-y-5">
        {/* Centered Title & Description with Absolute Left Setup Navigation */}
        <div className="relative flex items-center justify-center border-b border-slate-700 pb-4">
          {onExitGame && (
            <button
              type="button"
              onClick={onExitGame}
              className="absolute left-0 flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-700 transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Setup
            </button>
          )}
          <div className="text-center px-12">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-yellow-400">
              {board.title}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              {board.description || 'Jeopardy Trivia Board'}
            </p>
          </div>
        </div>

        {/* Centered & Appropriately Sized Teams Scoreboard */}
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-5xl mx-auto">
          {teams.map((team, idx) => {
            const colorObj =
              TEAM_COLORS.find((c) => c.name === team.color) ||
              TEAM_COLORS[idx % TEAM_COLORS.length];

            const isSelected = selectedTeamId === team.id;

            return (
              <div
                key={team.id}
                className={`w-[170px] sm:w-[200px] p-3 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                  isSelected
                    ? `bg-blue-950 shadow-lg ${colorObj.border} ring-2 ring-yellow-400/50 scale-[1.02]`
                    : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                }`}
                onClick={() => setSelectedTeamId(team.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px] shrink-0 ${colorObj.badge}`}
                    >
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={team.name}
                      onChange={(e) => updateTeamName(team.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-transparent text-slate-100 font-bold focus:outline-none focus:border-b border-yellow-400 w-full truncate text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* Score and Quick Adjustment Controls */}
                <div className="flex items-center justify-between gap-1.5 pt-0.5">
                  <div className="flex items-center bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 focus-within:border-yellow-400 flex-1 min-w-0">
                    <span className="text-emerald-400 font-black text-xs">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={team.score}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9-]/g, '');
                        setExplicitTeamScore(
                          team.id,
                          clean === '' || clean === '-' ? 0 : parseInt(clean, 10)
                        );
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-transparent text-sm sm:text-base font-black text-emerald-400 w-full focus:outline-none ml-1 text-right"
                    />
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTeamScore(team.id, -100);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="-100 points"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTeamScore(team.id, 100);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="+100 points"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Grid with Adaptive Width for 10x10 and custom sizes */}
      <div className="overflow-x-auto pb-4">
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${gridWidth}, minmax(0, 1fr))`,
            minWidth: `${Math.max(800, gridWidth * 130)}px`,
          }}
        >
          {categories.map((cat, catIdx) => (
            <div
              key={catIdx}
              className="bg-blue-900 border-2 border-blue-700 p-3 sm:p-4 text-center font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center min-h-[80px]"
            >
              <span className="text-yellow-400 font-black text-xs sm:text-sm md:text-base leading-tight">
                {cat.name}
              </span>
            </div>
          ))}

          {Array.from({ length: board.gridHeight || 5 }).map((_, rowIdx) => (
            <React.Fragment key={rowIdx}>
              {categories.map((cat, catIdx) => {
                const question = cat.questions?.[rowIdx] || {
                  value: (rowIdx + 1) * 200,
                  prompt: 'No prompt available',
                  answer: 'No answer available',
                  isDailyDouble: false,
                };

                const cardKey = `${catIdx}-${rowIdx}`;
                const isDone = completedQuestions[cardKey];

                return (
                  <div
                    key={cardKey}
                    className={`rounded-xl border-2 transition-all flex flex-col items-center justify-center min-h-[90px] sm:min-h-[100px] p-2 text-center select-none shadow-lg ${
                      isDone
                        ? 'bg-slate-900 border-slate-800 opacity-40 cursor-not-allowed'
                        : 'bg-blue-950 border-blue-800 hover:border-yellow-400 hover:scale-[1.02] cursor-pointer'
                    }`}
                    onClick={() => {
                      if (!isDone) {
                        setActiveQuestion({ catIndex: catIdx, qIndex: rowIdx, data: question });
                      }
                    }}
                  >
                    {isDone ? (
                      <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-slate-600" />
                    ) : (
                      <span className="text-2xl sm:text-3xl font-extrabold text-yellow-400 tracking-wider">
                        ${question.value}
                      </span>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Fullscreen Question Modal */}
      {activeQuestion && (
        <div className="fixed inset-0 bg-blue-950 z-50 flex flex-col justify-between p-6 sm:p-10 animate-in fade-in duration-200 overflow-y-auto">
          {/* Modal Header */}
          <div className="flex justify-between items-center w-full max-w-6xl mx-auto border-b border-blue-800/60 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 font-extrabold text-lg sm:text-xl tracking-widest uppercase">
                {categories[activeQuestion.catIndex]?.name}
              </span>
              <span className="bg-yellow-400/20 text-yellow-400 border border-yellow-400/40 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Category {activeQuestion.catIndex + 1}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-2xl sm:text-4xl font-black text-yellow-400">
                ${activeQuestion.data.value}
              </span>
              <button
                type="button"
                onClick={() => closeQuestionModal(false)}
                className="p-2 text-slate-400 hover:text-white bg-blue-900/60 hover:bg-blue-800 rounded-xl border border-blue-700 transition-colors cursor-pointer"
                title="Exit without marking completed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Question & Answer Body (Responsive & accommodating for long prompts/answers) */}
          <div className="flex-1 overflow-y-auto max-h-[52vh] sm:max-h-[58vh] max-w-5xl mx-auto w-full text-center space-y-4 my-auto py-4 px-2 flex flex-col items-center justify-center">
            {activeQuestion.data.isDailyDouble && (
              <div className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-950 px-5 py-1.5 rounded-full font-black tracking-widest text-sm uppercase shadow-lg animate-bounce shrink-0">
                ★ Daily Double ★
              </div>
            )}

            <h2
              className={`font-extrabold text-slate-100 leading-snug tracking-wide max-w-4xl mx-auto break-words ${
                activeQuestion.data.prompt.length > 200
                  ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold'
                  : activeQuestion.data.prompt.length > 100
                  ? 'text-xl sm:text-2xl md:text-3xl lg:text-4xl'
                  : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'
              }`}
            >
              {activeQuestion.data.prompt}
            </h2>

            {showAnswer && (
              <div className="pt-4 animate-in fade-in slide-in-from-bottom-3 duration-300 w-full max-w-4xl mx-auto">
                <span className="text-emerald-400 font-bold text-xs sm:text-sm uppercase tracking-widest block mb-1.5">
                  Correct Answer
                </span>
                <p
                  className={`font-extrabold text-emerald-300 break-words leading-relaxed ${
                    activeQuestion.data.answer.length > 150
                      ? 'text-base sm:text-lg md:text-xl lg:text-2xl'
                      : activeQuestion.data.answer.length > 60
                      ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl'
                      : 'text-xl sm:text-2xl md:text-3xl lg:text-4xl'
                  }`}
                >
                  {activeQuestion.data.answer}
                </p>
              </div>
            )}
          </div>

          {/* Modal Answering & Team Points Controls */}
          <div className="flex flex-col items-center gap-5 w-full max-w-6xl mx-auto pt-4 border-t border-blue-800/60">
            {/* Team Scoring Cards Grid */}
            <div className="w-full">
              <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Team Answering & Live Point Controls
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {teams.map((team, idx) => {
                  const colorObj =
                    TEAM_COLORS.find((c) => c.name === team.color) ||
                    TEAM_COLORS[idx % TEAM_COLORS.length];

                  return (
                    <div
                      key={team.id}
                      className={`p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between space-y-2.5 bg-slate-900/90 shadow-md ${colorObj.border}`}
                    >
                      {/* Team Name and Badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px] shrink-0 ${colorObj.badge}`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-100 text-sm truncate">
                            {team.name}
                          </span>
                        </div>
                      </div>

                      {/* Editable Score Input & +/- 100 steppers */}
                      <div className="flex items-center justify-between gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 focus-within:border-yellow-400">
                        <span className="text-emerald-400 font-black text-sm">$</span>
                        <input
                          type="number"
                          value={team.score}
                          onChange={(e) =>
                            setExplicitTeamScore(team.id, parseInt(e.target.value) || 0)
                          }
                          className="bg-transparent text-lg font-black text-emerald-400 w-full focus:outline-none ml-1"
                          title="Directly edit score"
                        />
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateTeamScore(team.id, -100)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1 rounded transition-colors cursor-pointer"
                            title="-100 points"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => updateTeamScore(team.id, 100)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1 rounded transition-colors cursor-pointer"
                            title="+100 points"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Question Value +/- Actions for THIS Team */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => updateTeamScore(team.id, activeQuestion.data.value)}
                          className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white py-2 px-2 rounded-lg font-extrabold text-xs transition-all shadow-md cursor-pointer"
                          title={`Add +$${activeQuestion.data.value} to ${team.name}`}
                        >
                          <Plus className="w-3.5 h-3.5" /> ${activeQuestion.data.value}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTeamScore(team.id, -activeQuestion.data.value)}
                          className="flex items-center justify-center gap-1 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white py-2 px-2 rounded-lg font-extrabold text-xs transition-all shadow-md cursor-pointer"
                          title={`Deduct -$${activeQuestion.data.value} from ${team.name}`}
                        >
                          <Minus className="w-3.5 h-3.5" /> ${activeQuestion.data.value}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Bottom Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 w-full pt-2">
              <button
                type="button"
                onClick={() => setShowAnswer(!showAnswer)}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-6 py-3 rounded-xl font-black text-base transition-all shadow-lg hover:scale-105 cursor-pointer"
              >
                {showAnswer ? (
                  <>
                    <EyeOff className="w-5 h-5" /> Hide Answer
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5" /> Reveal Answer
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => closeQuestionModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-extrabold text-base transition-all shadow-lg hover:scale-105 cursor-pointer"
                title="Mark this question as answered and return to board"
              >
                <CheckCircle className="w-5 h-5" /> Complete Question
              </button>

              <button
                type="button"
                onClick={() => closeQuestionModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer"
                title="Close modal without marking question as completed"
              >
                Pass / Keep Open
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};