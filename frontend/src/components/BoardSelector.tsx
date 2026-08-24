import React, { useState, useMemo } from 'react';
import type { BoardResponseDto, BoardData } from '../types/board';
import { deleteBoard } from '../services/api';
import { UploadBoardModal } from './UploadBoardModal';
import {
  Search,
  Upload,
  ArrowRight,
  Eye,
  Check,
  Sparkles,
  HelpCircle,
  X,
  Trash2,
} from 'lucide-react';

interface BoardSelectorProps {
  boards: BoardResponseDto[];
  selectedBoard: BoardResponseDto | null;
  onSelectBoard: (board: BoardResponseDto) => void;
  onProceedToSetup: () => void;
  onRefreshBoards: () => Promise<void>;
}

export const BoardSelector: React.FC<BoardSelectorProps> = ({
  boards,
  selectedBoard,
  onSelectBoard,
  onProceedToSetup,
  onRefreshBoards,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [previewBoard, setPreviewBoard] = useState<BoardResponseDto | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const parseBoardData = (dataJson: string): BoardData => {
    try {
      if (typeof dataJson === 'string') {
        return JSON.parse(dataJson);
      }
      return dataJson;
    } catch {
      return { categories: [] };
    }
  };

  const filteredBoards = useMemo(() => {
    if (!searchQuery.trim()) return boards;
    const q = searchQuery.toLowerCase();
    return boards.filter((b) => {
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchDesc = (b.description || '').toLowerCase().includes(q);
      const data = parseBoardData(b.dataJson);
      const matchCat = data.categories?.some((c) =>
        c.name.toLowerCase().includes(q)
      );
      return matchTitle || matchDesc || matchCat;
    });
  }, [boards, searchQuery]);

  const handleDelete = async (e: React.MouseEvent, board: BoardResponseDto) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete board "${board.title}"?`)) {
      try {
        await deleteBoard(board.id);
        await onRefreshBoards();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Failed to delete board');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase shadow-sm">
          <Sparkles className="w-4 h-4" />
          Step 1 • Board Selection
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-100 tracking-tight">
          Select a <span className="text-yellow-400">Trivia Board</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-base">
          Choose a trivia board from the library below or upload your own to get started.
        </p>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, or category..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-8 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer hover:scale-105"
        >
          <Upload className="w-4 h-4" /> Upload Custom Board
        </button>
      </div>

      {/* Boards Grid */}
      {filteredBoards.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">No boards match your search</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Try searching for a different keyword or upload a new custom board.
          </p>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-sm"
          >
            <Upload className="w-4 h-4" /> Upload Board Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBoards.map((board) => {
            const data = parseBoardData(board.dataJson);
            const categories = data.categories || [];
            const isSelected = selectedBoard?.id === board.id;
            const height = categories[0]?.questions?.length || board.gridHeight || 5;
            const totalQuestions = categories.length * height;

            return (
              <div
                key={board.id}
                onClick={() => onSelectBoard(board)}
                className={`rounded-2xl border-2 p-5 flex flex-col justify-between space-y-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-950/80 border-yellow-400 shadow-xl shadow-yellow-500/10 scale-[1.01]'
                    : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <h3 className="font-extrabold text-lg text-slate-100 line-clamp-1">
                        {board.title}
                      </h3>
                      {isSelected && (
                        <span className="bg-yellow-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md shrink-0">
                          Selected
                        </span>
                      )}
                    </div>

                    {boards.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, board)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer shrink-0"
                        title="Delete Board"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">
                    {board.description || 'Jeopardy Trivia Board'}
                  </p>

                  {/* Category Badges */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {categories.slice(0, 5).map((cat, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium bg-slate-950 text-yellow-400/90 px-2 py-0.5 rounded-md border border-slate-700/60"
                        >
                          {cat.name}
                        </span>
                      ))}
                      {categories.length > 5 && (
                        <span className="text-[11px] text-slate-500 font-bold px-1 py-0.5">
                          +{categories.length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-400 font-medium">
                    <span className="text-yellow-400 font-bold">{categories.length}x{height}</span> Grid • {totalQuestions} Questions
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewBoard(board);
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-yellow-400 border-yellow-400 text-slate-950'
                          : 'border-slate-600 bg-slate-900 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom CTA to Proceed to Setup Screen */}
      <div className="flex justify-center pt-4">
        <button
          type="button"
          onClick={onProceedToSetup}
          disabled={!selectedBoard}
          className="w-full sm:w-auto min-w-[320px] flex items-center justify-center gap-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 px-10 py-4 rounded-2xl font-black text-xl tracking-wider transition-all shadow-2xl hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Configure Game & Teams</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Upload Custom Board Modal */}
      {isUploadModalOpen && (
        <UploadBoardModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onBoardUploaded={async (newBoard) => {
            onSelectBoard(newBoard);
            await onRefreshBoards();
          }}
        />
      )}

      {/* Board Preview Modal */}
      {previewBoard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <div>
                <h3 className="text-xl font-black text-yellow-400">{previewBoard.title}</h3>
                <p className="text-xs text-slate-400">{previewBoard.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewBoard(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
              {(() => {
                const data = parseBoardData(previewBoard.dataJson);
                const categories = data.categories || [];
                const width = categories.length || 5;
                const height = categories[0]?.questions?.length || previewBoard.gridHeight || 5;

                return (
                  <div
                    className="grid gap-2 min-w-[700px]"
                    style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }}
                  >
                    {categories.map((cat, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-900 border border-blue-700 p-3 rounded-lg text-center font-bold text-xs uppercase text-yellow-400"
                      >
                        {cat.name}
                      </div>
                    ))}

                    {Array.from({ length: height }).map((_, rowIdx) => (
                      <React.Fragment key={rowIdx}>
                        {categories.map((cat, catIdx) => {
                          const q = cat.questions?.[rowIdx];
                          return (
                            <div
                              key={`${catIdx}-${rowIdx}`}
                              className="bg-blue-950 border border-blue-800/80 rounded-lg p-2.5 text-center flex flex-col justify-between min-h-[90px]"
                            >
                              <span className="text-sm font-black text-yellow-400">
                                ${q?.value || (rowIdx + 1) * 200}
                              </span>
                              <p className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                                {q?.prompt || 'No question prompt'}
                              </p>
                              {q?.isDailyDouble && (
                                <span className="text-[9px] font-bold text-amber-400 uppercase mt-1">
                                  ★ Daily Double
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="px-6 py-4 border-t border-slate-800 flex justify-between items-center bg-slate-950">
              <button
                type="button"
                onClick={() => setPreviewBoard(null)}
                className="text-xs font-semibold text-slate-400 hover:text-white px-4 py-2 rounded-lg bg-slate-800 cursor-pointer"
              >
                Close Preview
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectBoard(previewBoard);
                  setPreviewBoard(null);
                }}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-5 py-2 rounded-xl font-bold text-sm shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" /> Select This Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
