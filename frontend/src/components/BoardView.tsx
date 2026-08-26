import React, { useState, useMemo } from 'react';
import type { BoardResponseDto, BoardData, QuestionData, Team } from '../types/board';
import {
  CheckCircle,
  Plus,
  Minus,
  ArrowLeft,
  Eye,
  EyeOff,
  X,
  Headphones,
  Maximize2,
  ChevronRight,
} from 'lucide-react';
import { TEAM_COLORS } from '../constants/teams';
import { extractYouTubeInfo, extractAllYouTubeInfos } from '../utils/youtube';
import { isImageUrl, getDirectImageUrl } from '../utils/media';
import { YouTubeAudioPlayer } from './YouTubeAudioPlayer';

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
  const { categories } = useMemo(() => {
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

  const [activeClipIndex, setActiveClipIndex] = useState(0);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [unblurredUrls, setUnblurredUrls] = useState<Record<string, boolean>>({});
  const [progressiveImgIndex, setProgressiveImgIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

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

  const [completedQuestions, setCompletedQuestions] = useState<Record<string, boolean>>({});

  const markCompleted = (key: string) => {
    setCompletedQuestions((prev) => ({ ...prev, [key]: true }));
    setActiveQuestion(null);
    setShowAnswer(false);
    setZoomedImageUrl(null);
    setUnblurredUrls({});
    setProgressiveImgIndex(0);
  };

  const closeQuestionModal = (markAsDone: boolean = true) => {
    if (activeQuestion && markAsDone) {
      markCompleted(`${activeQuestion.catIndex}-${activeQuestion.qIndex}`);
    } else {
      setActiveQuestion(null);
      setShowAnswer(false);
      setZoomedImageUrl(null);
      setUnblurredUrls({});
      setProgressiveImgIndex(0);
    }
  };

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
                        setActiveClipIndex(0);
                        setUnblurredUrls({});
                        setProgressiveImgIndex(0);
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
      {activeQuestion && (() => {
        const rawUrls = (
          activeQuestion.data.mediaUrls && activeQuestion.data.mediaUrls.length > 0
            ? activeQuestion.data.mediaUrls
            : activeQuestion.data.mediaUrl
            ? [activeQuestion.data.mediaUrl]
            : []
        ).filter(Boolean) as string[];

        const allMediaUrls = Array.from(new Set(rawUrls));
        const isImageQuestion = activeQuestion.data.questionType === 'image';
        const imageUrls = Array.from(
          new Set(
            allMediaUrls
              .filter((u) => (isImageQuestion ? !extractYouTubeInfo(u) : isImageUrl(u)))
              .map((u) => getDirectImageUrl(u))
          )
        );
        const ytInfos = extractAllYouTubeInfos(
          activeQuestion.data.mediaUrls,
          activeQuestion.data.mediaUrl,
          activeQuestion.data.prompt
        );
        const currentYtInfo = ytInfos[activeClipIndex] || ytInfos[0] || null;

        // Prompt text: Clean YouTube URL out if embedded in prompt text
        let promptDisplayText = activeQuestion.data.prompt;
        const promptYt = extractYouTubeInfo(activeQuestion.data.prompt);
        if (promptYt) {
          promptDisplayText = promptYt.cleanText || activeQuestion.data.prompt;
        }

        return (
          <>
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

            {/* Modal Question & Answer Body (Shows Question Prompt, Image, Video, or Audio) */}
            <div className="flex-1 overflow-y-auto max-h-[58vh] max-w-5xl mx-auto w-full text-center space-y-4 my-auto py-4 px-2 flex flex-col items-center justify-center">
              {activeQuestion.data.isDailyDouble && (
                <div className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-950 px-5 py-1.5 rounded-full font-black tracking-widest text-sm uppercase shadow-lg animate-bounce shrink-0">
                  ★ Daily Double ★
                </div>
              )}

              {/* Question Prompt Text (Always Displayed) */}
              {promptDisplayText && (
                <h2
                  className={`font-extrabold text-slate-100 leading-snug tracking-wide max-w-4xl mx-auto break-words ${
                    promptDisplayText.length > 200
                      ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold'
                      : promptDisplayText.length > 100
                      ? 'text-xl sm:text-2xl md:text-3xl lg:text-4xl'
                      : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'
                  }`}
                >
                  {promptDisplayText}
                </h2>
              )}

              {/* Image Clues Section (Direct Image Filter & Click-to-Unblur) */}
              {imageUrls.length > 0 && (
                <div className="my-2 flex flex-col items-center gap-3 w-full max-w-4xl mx-auto shrink-0 animate-in fade-in duration-300">
                  {/* Progressive Hint Navigator (if progressive mode and >1 image) */}
                  {activeQuestion.data.imageDisplayMode === 'progressive' && imageUrls.length > 1 && (
                    <div className="flex items-center justify-between w-full max-w-2xl px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-yellow-400 bg-yellow-950/80 border border-yellow-800 px-3 py-1 rounded-xl">
                          Hint #{progressiveImgIndex + 1} of {imageUrls.length}
                        </span>
                        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                          {imageUrls.map((_, hIdx) => (
                            <button
                              key={hIdx}
                              type="button"
                              onClick={() => setProgressiveImgIndex(hIdx)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                progressiveImgIndex === hIdx
                                  ? 'bg-purple-600 text-white shadow-md'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                              }`}
                            >
                              Hint #{hIdx + 1}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Next Hint Quick Button */}
                      {progressiveImgIndex < imageUrls.length - 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setProgressiveImgIndex((prev) =>
                              Math.min(imageUrls.length - 1, prev + 1)
                            )
                          }
                          className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md"
                        >
                          <span>Next Hint #{progressiveImgIndex + 2}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Progressive Single Image or Side-by-Side Gallery */}
                  {activeQuestion.data.imageDisplayMode === 'progressive' ? (
                    /* Single Progressive Image with On-Image Blur Filter */
                    (() => {
                      const url = imageUrls[progressiveImgIndex];
                      const isUnblurred = Boolean(unblurredUrls[url]);

                      return (
                        <div className="flex flex-col items-center gap-2 w-full max-w-3xl">
                          <div
                            onClick={() => {
                              if (!isUnblurred) {
                                setUnblurredUrls((prev) => ({ ...prev, [url]: true }));
                              } else {
                                setZoomedImageUrl(url);
                              }
                            }}
                            className={`relative group rounded-2xl overflow-hidden border-2 shadow-2xl bg-black min-h-[240px] sm:min-h-[280px] max-h-[46vh] flex items-center justify-center transition-all cursor-pointer select-none ${
                              isUnblurred
                                ? 'border-purple-500/80 hover:border-yellow-400 hover:scale-[1.01]'
                                : 'border-cyan-500/80 hover:border-cyan-400'
                            }`}
                          >
                            <img
                              src={url}
                              alt={`Progressive Clue #${progressiveImgIndex + 1}`}
                              referrerPolicy="no-referrer"
                              className={`max-h-[46vh] w-auto max-w-full object-contain rounded-2xl transition-all duration-700 ease-out ${
                                isUnblurred
                                  ? 'filter-none scale-100'
                                  : 'filter blur-2xl brightness-75 scale-105'
                              }`}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target.src.includes('drive.google.com/thumbnail')) {
                                  const idMatch = target.src.match(/id=([a-zA-Z0-9_-]+)/);
                                  if (idMatch) target.src = `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
                                }
                              }}
                            />

                            {/* Filter Overlay / Click to Unblur Badge */}
                            {!isUnblurred ? (
                              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center group-hover:bg-slate-950/30 transition-colors">
                                <div className="bg-cyan-600/90 text-white px-5 py-2.5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-2xl border border-cyan-400 group-hover:scale-105 transition-transform animate-pulse">
                                  <Eye className="w-4 h-4" /> Click Image to Reveal
                                </div>
                              </div>
                            ) : (
                              <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-sm text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                <Maximize2 className="w-3.5 h-3.5 text-yellow-400" /> Click to Zoom
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    /* Side-by-Side Gallery Grid with On-Image Blur Filters */
                    <div
                      className={`grid gap-3.5 w-full mx-auto ${
                        imageUrls.length === 1
                          ? 'grid-cols-1 max-w-2xl'
                          : imageUrls.length === 2
                          ? 'grid-cols-1 sm:grid-cols-2 max-w-4xl'
                          : imageUrls.length === 3
                          ? 'grid-cols-1 sm:grid-cols-3 max-w-5xl'
                          : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4 max-w-5xl'
                      }`}
                    >
                      {imageUrls.map((url, imgIdx) => {
                        const isUnblurred = Boolean(unblurredUrls[url]);

                        return (
                          <div
                            key={imgIdx}
                            onClick={() => {
                              if (!isUnblurred) {
                                setUnblurredUrls((prev) => ({ ...prev, [url]: true }));
                              } else {
                                setZoomedImageUrl(url);
                              }
                            }}
                            className={`relative group rounded-2xl overflow-hidden border-2 shadow-2xl bg-black min-h-[200px] sm:min-h-[240px] max-h-[44vh] flex items-center justify-center transition-all cursor-pointer select-none ${
                              isUnblurred
                                ? 'border-cyan-500/70 hover:border-yellow-400 hover:scale-[1.02]'
                                : 'border-cyan-500/50 hover:border-cyan-400'
                            }`}
                          >
                            <img
                              src={url}
                              alt={`Clue #${imgIdx + 1}`}
                              referrerPolicy="no-referrer"
                              className={`max-h-[44vh] w-auto max-w-full object-contain rounded-2xl transition-all duration-700 ease-out ${
                                isUnblurred
                                  ? 'filter-none scale-100'
                                  : 'filter blur-2xl brightness-75 scale-105'
                              }`}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target.src.includes('drive.google.com/thumbnail')) {
                                  const idMatch = target.src.match(/id=([a-zA-Z0-9_-]+)/);
                                  if (idMatch) target.src = `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
                                }
                              }}
                            />

                            {/* Corner Tag */}
                            {imageUrls.length > 1 && (
                              <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-sm text-cyan-300 border border-cyan-800/80 px-2 py-0.5 rounded-md text-[10px] font-black z-10">
                                #{imgIdx + 1}
                              </div>
                            )}

                            {/* Filter Overlay / Click to Unblur Badge */}
                            {!isUnblurred ? (
                              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md flex flex-col items-center justify-center p-3 text-center group-hover:bg-slate-950/30 transition-colors">
                                <div className="bg-cyan-600/90 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xl border border-cyan-400 group-hover:scale-105 transition-transform">
                                  <Eye className="w-3.5 h-3.5" /> Click to Reveal
                                </div>
                              </div>
                            ) : (
                              <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-sm text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                <Maximize2 className="w-3.5 h-3.5 text-yellow-400" /> Zoom
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

                {/* Multi-Clip Track Switcher Tabs */}
                {ytInfos.length > 1 && (
                  <div className="flex items-center justify-center gap-2 flex-wrap my-1">
                    {ytInfos.map((clip, cIdx) => (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => setActiveClipIndex(cIdx)}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md ${
                          activeClipIndex === cIdx
                            ? 'bg-purple-600 text-white ring-2 ring-purple-400 scale-105'
                            : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        <Headphones className="w-3.5 h-3.5 text-purple-300" />
                        <span>Sound Clip #{cIdx + 1}</span>
                        {clip.startSeconds ? (
                          <span className="text-[10px] opacity-75">[@{clip.startSeconds}s]</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}

              {/* Embedded YouTube Media Player (Video or Pure Audio-Only Player) */}
              {currentYtInfo && (
                activeQuestion.data.isAudioOnly ? (
                  <YouTubeAudioPlayer
                    key={`${currentYtInfo.videoId}-${activeClipIndex}`}
                    videoId={currentYtInfo.videoId}
                    startSeconds={currentYtInfo.startSeconds}
                  />
                ) : (
                  <div className="w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-red-600/70 bg-black my-2 mx-auto shrink-0 ring-4 ring-red-950/50">
                    <iframe
                      key={`${currentYtInfo.videoId}-${activeClipIndex}`}
                      src={currentYtInfo.embedUrl}
                      title="YouTube Trivia Video"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )
              )}

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

                      {/* Award / Deduct Question Value */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
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
                          className="flex items-center justify-center gap-1 bg-rose-700 hover:bg-rose-600 active:scale-95 text-white py-2 px-2 rounded-lg font-extrabold text-xs transition-all shadow-md cursor-pointer"
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

        {/* Fullscreen Image Lightbox */}
          {zoomedImageUrl && (
            <div
              className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
              onClick={() => setZoomedImageUrl(null)}
            >
              <button
                type="button"
                onClick={() => setZoomedImageUrl(null)}
                className="absolute top-6 right-6 p-3 bg-slate-900/90 hover:bg-slate-800 text-white rounded-2xl border border-slate-700 transition-all cursor-pointer shadow-2xl"
                title="Close Fullscreen Image"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={zoomedImageUrl}
                alt="Full Size Clue"
                referrerPolicy="no-referrer"
                className="max-h-[90vh] max-w-[95vw] object-contain rounded-2xl shadow-2xl border border-slate-800 select-none"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </>
      );
    })()}
    </div>
  );
};