import React, { useState, useMemo, useRef } from 'react';
import type { BoardResponseDto, BoardData } from '../types/board';
import {
  Search,
  Upload,
  Download,
  Trash2,
  Play,
  Layers,
  Eye,
  X,
  Check,
  FileJson,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { createBoard, deleteBoard } from '../services/api';

interface BoardBrowserProps {
  boards: BoardResponseDto[];
  selectedBoard: BoardResponseDto | null;
  onSelectBoard: (board: BoardResponseDto) => void;
  onRefreshBoards: () => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export const BoardBrowser: React.FC<BoardBrowserProps> = ({
  boards,
  selectedBoard,
  onSelectBoard,
  onRefreshBoards,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [previewBoard, setPreviewBoard] = useState<BoardResponseDto | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload Form State
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customJsonStr, setCustomJsonStr] = useState('');

  // Helper to parse board data safely
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

  // Filtered boards based on search query
  const filteredBoards = useMemo(() => {
    if (!searchQuery.trim()) return boards;
    const q = searchQuery.toLowerCase();

    return boards.filter((b) => {
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchDesc = (b.description || '').toLowerCase().includes(q);
      const data = parseBoardData(b.dataJson);
      const matchCategory = data.categories?.some((c) =>
        c.name.toLowerCase().includes(q)
      );
      return matchTitle || matchDesc || matchCategory;
    });
  }, [boards, searchQuery]);

  // Handle File Upload Parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Check if root has title or categories
        if (parsed.title && !customTitle) {
          setCustomTitle(parsed.title);
        } else if (!customTitle) {
          setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));
        }

        if (parsed.description && !customDesc) {
          setCustomDesc(parsed.description);
        }

        // Format dataJson
        let finalDataJson = '';
        if (parsed.categories && Array.isArray(parsed.categories)) {
          finalDataJson = JSON.stringify({ categories: parsed.categories });
        } else if (parsed.dataJson) {
          finalDataJson =
            typeof parsed.dataJson === 'string'
              ? parsed.dataJson
              : JSON.stringify(parsed.dataJson);
        } else {
          throw new Error(
            'JSON format invalid: expected a "categories" array with question details.'
          );
        }

        setCustomJsonStr(finalDataJson);
        setUploadSuccess(`Loaded file "${file.name}" successfully!`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid JSON file';
        setUploadError(message);
      }
    };
    reader.readAsText(file);
  };

  // Submit Uploaded Board
  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) {
      setUploadError('Please provide a board title.');
      return;
    }
    if (!customJsonStr.trim()) {
      setUploadError('Please provide or upload board JSON data.');
      return;
    }

    try {
      setUploadLoading(true);
      setUploadError(null);

      // Validate JSON structure
      const parsedData = JSON.parse(customJsonStr);
      if (!Array.isArray(parsedData.categories) || parsedData.categories.length === 0) {
        throw new Error('Board data must contain at least 1 category in "categories".');
      }

      const gridWidth = parsedData.categories.length;
      const gridHeight = parsedData.categories[0]?.questions?.length || 5;

      const created = await createBoard({
        title: customTitle.trim(),
        description: customDesc.trim(),
        gridWidth,
        gridHeight,
        dataJson: customJsonStr,
      });

      await onRefreshBoards();
      onSelectBoard(created);
      setIsUploadOpen(false);
      setCustomTitle('');
      setCustomDesc('');
      setCustomJsonStr('');
      setUploadSuccess(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create board';
      setUploadError(message);
    } finally {
      setUploadLoading(false);
    }
  };

  // Download Sample Template
  const handleDownloadTemplate = () => {
    const sampleTemplate = {
      title: 'Sample Trivia Championship',
      description: 'Custom 5x5 Jeopardy board template',
      categories: [
        {
          name: 'Category 1',
          questions: [
            { value: 200, prompt: 'Sample Question for $200', answer: 'Sample Answer', isDailyDouble: false },
            { value: 400, prompt: 'Sample Question for $400', answer: 'Sample Answer', isDailyDouble: false },
            { value: 600, prompt: 'Sample Question for $600', answer: 'Sample Answer', isDailyDouble: false },
            { value: 800, prompt: 'Sample Question for $800', answer: 'Sample Answer', isDailyDouble: true },
            { value: 1000, prompt: 'Sample Question for $1000', answer: 'Sample Answer', isDailyDouble: false },
          ],
        },
        {
          name: 'Category 2',
          questions: [
            { value: 200, prompt: 'Sample Question for $200', answer: 'Sample Answer', isDailyDouble: false },
            { value: 400, prompt: 'Sample Question for $400', answer: 'Sample Answer', isDailyDouble: false },
            { value: 600, prompt: 'Sample Question for $600', answer: 'Sample Answer', isDailyDouble: false },
            { value: 800, prompt: 'Sample Question for $800', answer: 'Sample Answer', isDailyDouble: false },
            { value: 1000, prompt: 'Sample Question for $1000', answer: 'Sample Answer', isDailyDouble: false },
          ],
        },
      ],
    };

    const blob = new Blob([JSON.stringify(sampleTemplate, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'jeopardy-board-template.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle Delete Board
  const handleDeleteBoard = async (e: React.MouseEvent, board: BoardResponseDto) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${board.title}"?`)) {
      try {
        await deleteBoard(board.id);
        await onRefreshBoards();
      } catch (err) {
        console.error('Failed to delete board:', err);
        alert('Failed to delete board. Please try again.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
                Trivia Board Library
                <span className="text-xs bg-yellow-400/20 text-yellow-400 border border-yellow-400/40 px-2.5 py-0.5 rounded-full font-bold">
                  {boards.length} Boards
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Browse, preview, and upload Jeopardy trivia boards for your game show.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" /> Upload Board
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar (Search & Actions) */}
        <div className="px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, or category..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-400 transition-colors"
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

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-yellow-400 bg-slate-950 border border-slate-700 hover:border-slate-500 px-3 py-2 rounded-xl transition-all cursor-pointer"
              title="Download a starter JSON template"
            >
              <Download className="w-3.5 h-3.5" /> Sample JSON Template
            </button>
          </div>
        </div>

        {/* Board Cards Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredBoards.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <HelpCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">No boards match your search</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Try searching for different keywords or upload a new custom Jeopardy board.
              </p>
              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg"
              >
                <Upload className="w-4 h-4" /> Upload Board Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBoards.map((board) => {
                const data = parseBoardData(board.dataJson);
                const categories = data.categories || [];
                const isSelected = selectedBoard?.id === board.id;
                const totalQuestions =
                  categories.length * (board.gridHeight || 5);

                return (
                  <div
                    key={board.id}
                    className={`rounded-2xl border-2 p-5 flex flex-col justify-between space-y-4 transition-all ${
                      isSelected
                        ? 'bg-blue-950/70 border-yellow-400 shadow-xl shadow-yellow-500/10'
                        : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800'
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
                            onClick={(e) => handleDeleteBoard(e, board)}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer shrink-0"
                            title="Delete Board"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">
                        {board.description || 'Custom Jeopardy trivia board.'}
                      </p>

                      {/* Categories Badges */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Categories ({categories.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {categories.slice(0, 5).map((cat, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-medium bg-slate-900/90 text-yellow-400/90 px-2 py-0.5 rounded-md border border-slate-700/60 truncate max-w-[180px]"
                            >
                              {cat.name}
                            </span>
                          ))}
                          {categories.length > 5 && (
                            <span className="text-[11px] text-slate-500 font-bold px-1.5 py-0.5">
                              +{categories.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer & Action Buttons */}
                    <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-400 font-medium">
                        {categories.length}x{board.gridHeight || 5} • {totalQuestions} Qs
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewBoard(board)}
                          className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectBoard(board);
                            onClose();
                          }}
                          className={`flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm ${
                            isSelected
                              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                              : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Active
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-slate-950" /> Select
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Board Preview Modal */}
      {previewBoard && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <div>
                <h3 className="text-xl font-black text-yellow-400">{previewBoard.title}</h3>
                <p className="text-xs text-slate-400">{previewBoard.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewBoard(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
              {(() => {
                const data = parseBoardData(previewBoard.dataJson);
                const categories = data.categories || [];
                const width = categories.length || 5;

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

                    {Array.from({ length: previewBoard.gridHeight || 5 }).map((_, rowIdx) => (
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
                className="text-xs font-semibold text-slate-400 hover:text-white px-4 py-2 rounded-lg bg-slate-800"
              >
                Close Preview
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectBoard(previewBoard);
                  setPreviewBoard(null);
                  onClose();
                }}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-5 py-2 rounded-xl font-bold text-sm shadow-md cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" /> Select This Board
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Custom Board Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-black text-slate-100">Upload Custom Trivia Board</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsUploadOpen(false);
                  setUploadError(null);
                  setUploadSuccess(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitUpload} className="p-6 space-y-4">
              {uploadError && (
                <div className="flex items-center gap-2 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {/* File Dropzone */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Import from JSON File
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-yellow-400 rounded-xl p-6 text-center bg-slate-950/60 hover:bg-slate-950 transition-all cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-200">
                    Click to browse or drop a .json board file
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Accepts standard Jeopardy JSON schema
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json,application/json"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Board Title */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Board Title *
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Science & Space Trivia"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="e.g. 5 categories of science and astronomy questions"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* JSON Payload Preview */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Categories & Questions JSON *
                  </label>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-[11px] text-yellow-400 hover:underline"
                  >
                    Get template
                  </button>
                </div>
                <textarea
                  value={customJsonStr}
                  onChange={(e) => setCustomJsonStr(e.target.value)}
                  rows={5}
                  placeholder={`{\n  "categories": [\n    {\n      "name": "Science",\n      "questions": [\n        { "value": 200, "prompt": "...", "answer": "..." }\n      ]\n    }\n  ]\n}`}
                  className="w-full bg-slate-950 font-mono text-xs text-slate-200 border border-slate-700 rounded-xl p-3 focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex justify-end items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-white px-4 py-2 rounded-xl bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-slate-950 px-6 py-2 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  {uploadLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Save & Use Board
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

