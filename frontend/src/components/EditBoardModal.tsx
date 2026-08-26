import React, { useState } from 'react';
import type { BoardResponseDto, BoardData, CategoryData, QuestionType, ImageDisplayMode } from '../types/board';
import { updateBoard } from '../services/api';
import {
  Save,
  AlertCircle,
  Star,
  Pencil,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  Undo2,
  Headphones,
  Plus,
  Trash2,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { extractYouTubeInfo } from '../utils/youtube';
import { isImageUrl, getDirectImageUrl, extractGoogleDriveFileId } from '../utils/media';
import { YouTubeIcon } from './YouTubeIcon';

interface EditBoardModalProps {
  board: BoardResponseDto;
  isOpen: boolean;
  onClose: () => void;
  onBoardUpdated: (updated: BoardResponseDto) => void;
}

export const EditBoardModal: React.FC<EditBoardModalProps> = ({
  board,
  isOpen,
  onClose,
  onBoardUpdated,
}) => {
  const [title, setTitle] = useState(board.title);
  const [description, setDescription] = useState(board.description || '');

  // Parse existing categories and questions
  const [categories, setCategories] = useState<CategoryData[]>(() => {
    try {
      const parsed: BoardData =
        typeof board.dataJson === 'string'
          ? JSON.parse(board.dataJson)
          : board.dataJson;
      return Array.isArray(parsed?.categories) ? parsed.categories : [];
    } catch {
      return [];
    }
  });

  // Active cell being edited
  const [activeCell, setActiveCell] = useState<{
    catIndex: number;
    qIndex: number;
  } | null>(null);

  // Local state for active question editing (eliminates point value 0 input bugs)
  const [promptInput, setPromptInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [pointInput, setPointInput] = useState('');
  const [questionTypeInput, setQuestionTypeInput] = useState<QuestionType>('standard');
  const [imageDisplayModeInput, setImageDisplayModeInput] = useState<ImageDisplayMode>('gallery');
  const [mediaUrlsInput, setMediaUrlsInput] = useState<string[]>(['']);
  const [isAudioOnlyInput, setIsAudioOnlyInput] = useState(false);
  const [isDailyDoubleInput, setIsDailyDoubleInput] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const gridWidth = categories.length || board.gridWidth || 5;
  const gridHeight = categories[0]?.questions?.length || board.gridHeight || 5;

  const openQuestionEditor = (catIndex: number, qIndex: number) => {
    const q = categories[catIndex]?.questions?.[qIndex];
    setActiveCell({ catIndex, qIndex });
    setPromptInput(q?.prompt || '');
    setAnswerInput(q?.answer || '');
    setPointInput(q?.value !== undefined && q?.value !== null ? String(q.value) : '200');
    
    const initialUrls =
      q?.mediaUrls && q.mediaUrls.length > 0
        ? [...q.mediaUrls]
        : q?.mediaUrl
        ? [q.mediaUrl]
        : [''];
    setMediaUrlsInput(initialUrls);
    setIsAudioOnlyInput(Boolean(q?.isAudioOnly));
    setIsDailyDoubleInput(Boolean(q?.isDailyDouble));
    setImageDisplayModeInput(q?.imageDisplayMode || 'gallery');

    // Auto-detect question type if not explicitly set
    let determinedType: QuestionType = q?.questionType || 'standard';
    if (!q?.questionType) {
      if (initialUrls.some((u) => isImageUrl(u))) {
        determinedType = 'image';
      } else if (initialUrls.some((u) => extractYouTubeInfo(u))) {
        determinedType = 'media';
      }
    }
    setQuestionTypeInput(determinedType);
  };

  const handleCancelQuestionEdit = () => {
    setActiveCell(null);
  };

  const commitActiveQuestion = (nextCat?: number, nextQ?: number) => {
    if (!activeCell) return;

    const num = parseInt(pointInput, 10);
    const finalPointValue = isNaN(num) ? 0 : num;

    const cleanedMediaUrls =
      questionTypeInput === 'standard'
        ? []
        : mediaUrlsInput.map((u) => u.trim()).filter(Boolean);

    setCategories((prev) =>
      prev.map((cat, cIdx) => {
        if (cIdx !== activeCell.catIndex) return cat;
        const updatedQuestions = cat.questions.map((q, qIdx) => {
          if (qIdx !== activeCell.qIndex) return q;
          return {
            ...q,
            prompt: promptInput,
            answer: answerInput,
            value: finalPointValue,
            questionType: questionTypeInput,
            imageDisplayMode: questionTypeInput === 'image' ? imageDisplayModeInput : undefined,
            mediaUrl: cleanedMediaUrls[0] || undefined,
            mediaUrls: cleanedMediaUrls.length > 0 ? cleanedMediaUrls : undefined,
            isAudioOnly: questionTypeInput === 'media' ? isAudioOnlyInput : false,
            isDailyDouble: isDailyDoubleInput,
          };
        });
        return { ...cat, questions: updatedQuestions };
      })
    );

    if (nextCat !== undefined && nextQ !== undefined) {
      const nextQObj = categories[nextCat]?.questions?.[nextQ];
      setActiveCell({ catIndex: nextCat, qIndex: nextQ });
      setPromptInput(nextQObj?.prompt || '');
      setAnswerInput(nextQObj?.answer || '');
      setPointInput(
        nextQObj?.value !== undefined && nextQObj?.value !== null
          ? String(nextQObj.value)
          : '200'
      );
      const nextUrls =
        nextQObj?.mediaUrls && nextQObj.mediaUrls.length > 0
          ? [...nextQObj.mediaUrls]
          : nextQObj?.mediaUrl
          ? [nextQObj.mediaUrl]
          : [''];
      setMediaUrlsInput(nextUrls);
      setIsAudioOnlyInput(Boolean(nextQObj?.isAudioOnly));
      setIsDailyDoubleInput(Boolean(nextQObj?.isDailyDouble));
    } else {
      setActiveCell(null);
    }
  };

  const handleCategoryNameChange = (catIdx: number, newName: string) => {
    setCategories((prev) =>
      prev.map((c, i) => (i === catIdx ? { ...c, name: newName } : c))
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Board title is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Sanitize questions to ensure numeric values
      const sanitizedCategories = categories.map((cat) => ({
        ...cat,
        questions: cat.questions.map((q) => ({
          ...q,
          value: parseInt(String(q.value), 10) || 0,
        })),
      }));

      const dataJson = JSON.stringify({ categories: sanitizedCategories });
      const updated = await updateBoard(board.id, {
        title: title.trim(),
        description: description.trim(),
        gridWidth: categories.length,
        gridHeight,
        dataJson,
      });

      onBoardUpdated(updated);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update board';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const activeCategoryName =
    activeCell !== null ? categories[activeCell.catIndex]?.name || '' : '';

  // Navigate to previous/next question in the board
  const navigateQuestion = (direction: 'prev' | 'next') => {
    if (!activeCell) return;
    const { catIndex, qIndex } = activeCell;
    const totalCols = categories.length;
    const totalRows = gridHeight;

    let nextCat = catIndex;
    let nextQ = qIndex;

    if (direction === 'next') {
      if (nextQ + 1 < totalRows) {
        nextQ += 1;
      } else if (nextCat + 1 < totalCols) {
        nextCat += 1;
        nextQ = 0;
      }
    } else {
      if (nextQ - 1 >= 0) {
        nextQ -= 1;
      } else if (nextCat - 1 >= 0) {
        nextCat -= 1;
        nextQ = totalRows - 1;
      }
    }

    commitActiveQuestion(nextCat, nextQ);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header (Styled like Game Board Header) */}
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 shrink-0">
              <Pencil className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Board Title..."
                  className="text-xl sm:text-2xl font-black text-yellow-400 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-yellow-400 focus:outline-none w-full sm:w-auto px-1 py-0.5 rounded transition-colors"
                />
                <span className="text-[10px] font-black bg-blue-900 text-yellow-400 border border-blue-700 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                  {gridWidth}x{gridHeight} Grid
                </span>
              </div>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a board description..."
                className="text-xs text-slate-400 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-yellow-400 focus:outline-none w-full px-1 py-0.5 rounded transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-400 hover:text-white px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-slate-950 px-5 py-2 rounded-xl font-black text-sm shadow-lg transition-all cursor-pointer hover:scale-105"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Board
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-6 mt-3 flex items-center gap-2 p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Subheader hint */}
        <div className="px-6 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Click any category title or question tile below to edit its values, prompts, and answers.</span>
          </div>
          <span className="font-bold text-slate-300">
            {categories.length} Categories • {categories.length * gridHeight} Questions
          </span>
        </div>

        {/* Interactive Board Grid */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-6 bg-slate-900/60">
          <div
            className="grid gap-3 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${gridWidth}, minmax(0, 1fr))`,
              minWidth: `${Math.max(800, gridWidth * 130)}px`,
            }}
          >
            {/* Category Header Tiles (Inline Editable) */}
            {categories.map((cat, catIdx) => (
              <div
                key={catIdx}
                className="bg-blue-900 border-2 border-blue-700 p-3.5 text-center font-bold uppercase rounded-xl shadow-md flex flex-col justify-center items-center min-h-[85px] transition-all hover:border-yellow-400/80 group"
              >
                <span className="text-[10px] text-yellow-400/70 font-semibold mb-1">
                  Category {catIdx + 1}
                </span>
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => handleCategoryNameChange(catIdx, e.target.value)}
                  placeholder={`Category ${catIdx + 1}`}
                  className="w-full text-center text-yellow-400 text-sm sm:text-base font-black bg-transparent focus:bg-blue-950/90 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-yellow-400 uppercase tracking-wider"
                />
              </div>
            ))}

            {/* Question Grid Tiles (Price Only) */}
            {Array.from({ length: gridHeight }).map((_, rowIdx) => (
              <React.Fragment key={rowIdx}>
                {categories.map((cat, catIdx) => {
                  const question = cat.questions?.[rowIdx] || {
                    value: (rowIdx + 1) * 200,
                    prompt: '',
                    answer: '',
                    isDailyDouble: false,
                  };

                  const isSelectedForEdit =
                    activeCell?.catIndex === catIdx && activeCell?.qIndex === rowIdx;

                  return (
                    <div
                      key={`${catIdx}-${rowIdx}`}
                      onClick={() => openQuestionEditor(catIdx, rowIdx)}
                      className={`rounded-xl border-2 transition-all flex flex-col items-center justify-center min-h-[100px] sm:min-h-[110px] p-3 select-none shadow-lg cursor-pointer group relative ${
                        isSelectedForEdit
                          ? 'bg-blue-900 border-yellow-400 ring-2 ring-yellow-400/60 scale-[1.02]'
                          : 'bg-blue-950 border-blue-800 hover:border-yellow-400 hover:scale-[1.02]'
                      }`}
                    >
                      {question.isDailyDouble && (
                        <span className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                          <Star className="w-3 h-3 fill-slate-950" /> DD
                        </span>
                      )}

                      <span className="text-2xl sm:text-3xl font-extrabold text-yellow-400 tracking-wider">
                        ${question.value}
                      </span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Focused Question Editor Modal (Centered Dialog with Two Square Boxes) */}
        {activeCell !== null && (() => {
          const promptYt = extractYouTubeInfo(promptInput);

          return (
            <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-slate-900 border-2 border-blue-600/90 rounded-3xl shadow-2xl p-6 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
                {/* Top Bar of Question Editor */}
                <div className="flex justify-between items-center border-b border-blue-800/80 pb-3 w-full">
                  <div className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm font-bold bg-blue-900 text-yellow-400 px-3 py-1 rounded-lg border border-blue-700">
                      Category {activeCell.catIndex + 1}: {activeCategoryName}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Question {activeCell.qIndex + 1} of {gridHeight}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Daily Double Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsDailyDoubleInput(!isDailyDoubleInput)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isDailyDoubleInput
                          ? 'bg-amber-500 text-slate-950 font-black shadow-lg animate-pulse'
                          : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>{isDailyDoubleInput ? '★ Daily Double' : 'Set Daily Double'}</span>
                    </button>

                    {/* Single Top Cancel Button */}
                    <button
                      type="button"
                      onClick={handleCancelQuestionEdit}
                      className="flex items-center gap-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      title="Cancel question edits and return"
                    >
                      <Undo2 className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </div>

                {/* Point Value Controls & Free-Form Number Input */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-blue-950/80 border border-blue-800 p-2.5 rounded-xl">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Point Value:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[100, 200, 300, 400, 500, 600, 800, 1000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPointInput(String(val))}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          pointInput === String(val)
                            ? 'bg-yellow-400 text-slate-950 shadow-md'
                            : 'bg-blue-900 text-slate-300 hover:text-white hover:bg-blue-800'
                        }`}
                      >
                        ${val}
                      </button>
                    ))}
                    <div className="flex items-center bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-700 ml-1 focus-within:border-yellow-400">
                      <span className="text-yellow-400 font-bold text-xs">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={pointInput}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/[^0-9]/g, '');
                          setPointInput(clean);
                        }}
                        placeholder="0"
                        className="w-16 bg-transparent text-sm font-black text-yellow-400 focus:outline-none ml-1 text-right"
                        title="Custom point value"
                      />
                    </div>
                  </div>
                </div>

                {/* 3 Question Types Selector & Media Section */}
                <div className="flex flex-col gap-3 bg-blue-950/80 border border-blue-800 p-3.5 rounded-2xl shadow-inner">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
                      Question Type
                    </label>

                    <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
                      <button
                        type="button"
                        onClick={() => setQuestionTypeInput('standard')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          questionTypeInput === 'standard'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-300" />
                        <span>Standard Trivia</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setQuestionTypeInput('media');
                          if (mediaUrlsInput.length === 0 || (mediaUrlsInput.length === 1 && !mediaUrlsInput[0])) {
                            setMediaUrlsInput(['']);
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          questionTypeInput === 'media'
                            ? 'bg-red-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        <YouTubeIcon className="w-3.5 h-3.5 text-red-300" />
                        <span>Video / Sound</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setQuestionTypeInput('image');
                          if (mediaUrlsInput.length === 0 || (mediaUrlsInput.length === 1 && !mediaUrlsInput[0])) {
                            setMediaUrlsInput(['']);
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          questionTypeInput === 'image'
                            ? 'bg-cyan-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Image Question</span>
                      </button>
                    </div>
                  </div>

                  {/* 1. Standard Trivia Note */}
                  {questionTypeInput === 'standard' && (
                    <div className="text-[11px] text-slate-400 bg-slate-900/50 border border-slate-800/80 px-3 py-2 rounded-xl flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Standard question: Text prompt clue and answer only. No media attachments.</span>
                    </div>
                  )}

                  {/* 2. Video / Sound Section */}
                  {questionTypeInput === 'media' && (
                    <div className="flex flex-col gap-2.5 pt-2 border-t border-blue-900/60">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
                            <YouTubeIcon className="w-4 h-4 text-red-500" /> YouTube Media Clips
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 bg-blue-900/80 px-2 py-0.5 rounded-full border border-blue-700">
                            {mediaUrlsInput.filter((u) => u.trim()).length} clip(s)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMediaUrlsInput((prev) => [...prev, ''])}
                            className="flex items-center gap-1 bg-blue-900 hover:bg-blue-800 text-yellow-400 border border-blue-700 hover:border-yellow-400 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                            title="Add another sound or video clip"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Clip
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsAudioOnlyInput(!isAudioOnlyInput)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                              isAudioOnlyInput
                                ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                            }`}
                            title="Plays only the sound clips with interactive player and hides video titles/thumbnails"
                          >
                            <Headphones className="w-3.5 h-3.5" />
                            <span>{isAudioOnlyInput ? '🎧 Sound Only Mode' : '🎬 Full Video Mode'}</span>
                          </button>
                        </div>
                      </div>

                      {/* YouTube URL Inputs */}
                      <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                        {mediaUrlsInput.map((url, idx) => {
                          const detected = extractYouTubeInfo(url);
                          return (
                            <div key={idx} className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-blue-900/40">
                              <span className="text-xs font-bold text-slate-400 w-12 shrink-0">
                                Clip #{idx + 1}
                              </span>
                              <input
                                type="text"
                                value={url}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMediaUrlsInput((prev) =>
                                    prev.map((item, i) => (i === idx ? val : item))
                                  );
                                }}
                                placeholder="Paste YouTube link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)"
                                className="flex-1 bg-slate-950 border border-slate-700 focus:border-red-500 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                              />

                              {detected && (
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-1 rounded-md shrink-0">
                                  ✓ Video (ID: {detected.videoId}) {detected.startSeconds ? `[@${detected.startSeconds}s]` : ''}
                                </span>
                              )}

                              {mediaUrlsInput.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setMediaUrlsInput((prev) => prev.filter((_, i) => i !== idx))
                                  }
                                  className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-950 hover:bg-rose-950/40 rounded-lg border border-slate-800 transition-colors cursor-pointer shrink-0"
                                  title="Delete clip"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3. Image Question Section */}
                  {questionTypeInput === 'image' && (
                    <div className="flex flex-col gap-2.5 pt-2 border-t border-blue-900/60">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                            <ImageIcon className="w-4 h-4 text-cyan-400" /> Image Clue Links
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 bg-blue-900/80 px-2 py-0.5 rounded-full border border-blue-700">
                            {mediaUrlsInput.filter((u) => u.trim()).length} image(s)
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMediaUrlsInput((prev) => [...prev, ''])}
                            className="flex items-center gap-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 hover:border-cyan-400 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                            title="Add another image link"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Image
                          </button>

                          {/* Multi-Image Display Mode Switcher */}
                          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 gap-0.5">
                            <button
                              type="button"
                              onClick={() => setImageDisplayModeInput('gallery')}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                                imageDisplayModeInput === 'gallery'
                                  ? 'bg-cyan-600 text-white shadow-sm'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
                              }`}
                              title="All images are visible together in a gallery grid"
                            >
                              🖼️ Side-by-Side (All)
                            </button>
                            <button
                              type="button"
                              onClick={() => setImageDisplayModeInput('progressive')}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                                imageDisplayModeInput === 'progressive'
                                  ? 'bg-purple-600 text-white shadow-sm'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
                              }`}
                              title="Images reveal step-by-step as progressive hints"
                            >
                              🔢 Step-by-Step (Progressive)
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Image URL Inputs */}
                      <div className="flex flex-col gap-2 max-h-[170px] overflow-y-auto pr-1">
                        {mediaUrlsInput.map((url, idx) => {
                          const isDriveImg = Boolean(extractGoogleDriveFileId(url));
                          const isImg = isImageUrl(url) || (url.trim().startsWith('http') && !extractYouTubeInfo(url));
                          const directImgUrl = isImg ? getDirectImageUrl(url) : '';

                          return (
                            <div key={idx} className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-blue-900/40">
                              <span className="text-xs font-bold text-slate-400 w-14 shrink-0">
                                Image #{idx + 1}
                              </span>

                              {/* Image Thumbnail Preview for any image URL */}
                              {directImgUrl && (
                                <div className="w-8 h-8 rounded-lg overflow-hidden bg-black shrink-0 border border-emerald-500 shadow-sm relative group">
                                  <img
                                    src={directImgUrl}
                                    alt="Clue preview"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}

                              <input
                                type="text"
                                value={url}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMediaUrlsInput((prev) =>
                                    prev.map((item, i) => (i === idx ? val : item))
                                  );
                                }}
                                placeholder="Paste any image URL, Google Drive link, Imgur, Pinterest, Unsplash, etc..."
                                className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                              />

                              {/* Detection Badges */}
                              {isDriveImg && (
                                <span className="text-[10px] font-bold text-blue-300 bg-blue-950/80 border border-blue-800 px-2 py-1 rounded-md shrink-0 flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3 text-blue-400" /> Google Drive
                                </span>
                              )}

                              {!isDriveImg && url.trim().length > 0 && isImg && (
                                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2 py-1 rounded-md shrink-0 flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3 text-cyan-400" /> Image Link
                                </span>
                              )}

                              {mediaUrlsInput.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setMediaUrlsInput((prev) => prev.filter((_, i) => i !== idx))
                                  }
                                  className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-950 hover:bg-rose-950/40 rounded-lg border border-slate-800 transition-colors cursor-pointer shrink-0"
                                  title="Delete image link"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {promptYt && questionTypeInput !== 'standard' && (
                    <div className="text-[11px] text-amber-400 font-medium bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      ℹ️ Video URL also detected inside prompt text (ID: {promptYt.videoId})
                    </div>
                  )}
                </div>

              {/* Two Explicit Square Boxes Side-by-Side */}
              <div className="flex flex-col sm:flex-row gap-5 items-center justify-center">
                {/* Question Prompt Section (360x360 Square Box) */}
                <div className="flex flex-col space-y-1.5 w-[300px] sm:w-[350px]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
                      Question Prompt (The Clue)
                    </label>
                    <span className="text-slate-400 text-[11px] font-medium">
                      {promptInput.length} chars
                    </span>
                  </div>
                  <textarea
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="Enter the trivia clue / prompt displayed to contestants..."
                    className="w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] bg-blue-950 border-2 border-blue-700 focus:border-yellow-400 rounded-2xl p-5 text-base sm:text-lg font-bold text-slate-100 placeholder-slate-500 focus:outline-none shadow-inner leading-relaxed resize-none"
                  />
                </div>

                {/* Correct Answer Section (360x360 Square Box) */}
                <div className="flex flex-col space-y-1.5 w-[300px] sm:w-[350px]">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                      Correct Answer (Response)
                    </label>
                    <span className="text-slate-400 text-[11px] font-medium">
                      {answerInput.length} chars
                    </span>
                  </div>
                  <textarea
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    placeholder="Enter the correct answer / explanation..."
                    className="w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] bg-blue-950 border-2 border-emerald-700/80 focus:border-emerald-400 rounded-2xl p-5 text-base sm:text-lg font-extrabold text-emerald-300 placeholder-slate-500 focus:outline-none shadow-inner leading-relaxed resize-none"
                  />
                </div>
              </div>

              {/* Navigation & Save Question Actions */}
              <div className="flex justify-between items-center w-full pt-2 border-t border-blue-800/80">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigateQuestion('prev')}
                    className="flex items-center gap-1 bg-blue-900/80 hover:bg-blue-800 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-blue-700"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateQuestion('next')}
                    className="flex items-center gap-1 bg-blue-900/80 hover:bg-blue-800 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-blue-700"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => commitActiveQuestion()}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 px-8 py-2.5 rounded-xl font-black text-sm shadow-xl transition-all cursor-pointer hover:scale-105"
                >
                  <Check className="w-4 h-4" /> Save Question
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      </div>
    </div>
  );
};
