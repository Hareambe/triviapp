import React, { useState } from 'react';
import type { BoardResponseDto, CategoryData, BoardData } from '../types/board';
import { createBoard } from '../services/api';
import {
  Plus,
  X,
  Pencil,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBoardCreated: (board: BoardResponseDto, openEditor?: boolean) => void;
}

type PresetType = '5x5' | '4x4' | '6x5' | '3x3' | '2x1' | 'custom';

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  isOpen,
  onClose,
  onBoardCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preset, setPreset] = useState<PresetType>('5x5');
  const [gridWidth, setGridWidth] = useState(5);
  const [gridHeight, setGridHeight] = useState(5);
  const [pointIncrement, setPointIncrement] = useState(200);
  const [categoryNames, setCategoryNames] = useState<string[]>([
    'Category 1',
    'Category 2',
    'Category 3',
    'Category 4',
    'Category 5',
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const ensureCategoryNamesLength = (width: number) => {
    setCategoryNames((prev) => {
      const updated = [...prev];
      while (updated.length < width) {
        updated.push(`Category ${updated.length + 1}`);
      }
      return updated.slice(0, width);
    });
  };

  const handlePresetSelect = (selectedPreset: PresetType) => {
    setPreset(selectedPreset);
    let newWidth = 5;
    let newHeight = 5;

    switch (selectedPreset) {
      case '5x5':
        newWidth = 5;
        newHeight = 5;
        break;
      case '4x4':
        newWidth = 4;
        newHeight = 4;
        break;
      case '6x5':
        newWidth = 6;
        newHeight = 5;
        break;
      case '3x3':
        newWidth = 3;
        newHeight = 3;
        break;
      case '2x1':
        newWidth = 2;
        newHeight = 1;
        break;
      case 'custom':
        return;
    }

    setGridWidth(newWidth);
    setGridHeight(newHeight);
    ensureCategoryNamesLength(newWidth);
  };

  const handleCustomWidthChange = (w: number) => {
    const val = Math.max(1, Math.min(10, w));
    setGridWidth(val);
    ensureCategoryNamesLength(val);
  };

  const handleCategoryNameChange = (index: number, value: string) => {
    setCategoryNames((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleCreate = async (openEditor: boolean = false) => {
    if (!title.trim()) {
      setError('Please provide a title for your new board.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build structured categories with initial default question templates
      const generatedCategories: CategoryData[] = categoryNames
        .slice(0, gridWidth)
        .map((catName, cIdx) => ({
          name: catName.trim() || `Category ${cIdx + 1}`,
          questions: Array.from({ length: gridHeight }).map((_, qIdx) => ({
            value: (qIdx + 1) * pointIncrement,
            prompt: `Prompt for ${catName.trim() || `Category ${cIdx + 1}`} ($${(qIdx + 1) * pointIncrement})`,
            answer: `Answer for ${catName.trim() || `Category ${cIdx + 1}`} ($${(qIdx + 1) * pointIncrement})`,
            isDailyDouble: false,
            questionType: 'standard',
          })),
        }));

      const boardData: BoardData = { categories: generatedCategories };
      const dataJson = JSON.stringify(boardData);

      const created = await createBoard({
        title: title.trim(),
        description: description.trim() || `${gridWidth}x${gridHeight} Trivia Board`,
        gridWidth,
        gridHeight,
        dataJson,
      });

      onBoardCreated(created, openEditor);
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      handlePresetSelect('5x5');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create board';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const totalQuestions = gridWidth * gridHeight;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                Create Board from Scratch
              </h2>
              <p className="text-xs text-slate-400">
                Set up board dimensions, categories, and start building trivia
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Board Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Ultimate Friday Night Trivia, 80s Movies & Pop..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short summary of this trivia board's topics or audience..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Grid Size Presets */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Grid Layout & Dimensions
              </label>
              <span className="text-xs font-bold text-yellow-400 bg-yellow-950/60 border border-yellow-800/80 px-2.5 py-0.5 rounded-full">
                {gridWidth} Cols × {gridHeight} Rows ({totalQuestions} Total Questions)
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: '5x5', label: '5 × 5', desc: 'Classic' },
                { id: '4x4', label: '4 × 4', desc: 'Compact' },
                { id: '6x5', label: '6 × 5', desc: 'Extended' },
                { id: '3x3', label: '3 × 3', desc: 'Quick' },
                { id: '2x1', label: '2 × 1', desc: '2-Question' },
                { id: 'custom', label: 'Custom', desc: 'Manual' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePresetSelect(item.id as PresetType)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    preset === item.id
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-500'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-black">{item.label}</span>
                  <span className="text-[10px] text-slate-500">{item.desc}</span>
                </button>
              ))}
            </div>

            {/* Custom Width & Height Sliders/Inputs if Custom Preset */}
            {preset === 'custom' && (
              <div className="grid grid-cols-2 gap-4 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 animate-in fade-in duration-200 mt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Categories (Width: {gridWidth})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={gridWidth}
                    onChange={(e) => handleCustomWidthChange(parseInt(e.target.value, 10) || 1)}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Questions per Category (Height: {gridHeight})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={gridHeight}
                    onChange={(e) => setGridHeight(parseInt(e.target.value, 10) || 1)}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Point Value Step Increment */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
              Base Point Value Step
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[100, 200, 300, 500].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setPointIncrement(step)}
                  className={`py-2 px-3 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                    pointIncrement === step
                      ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400 ring-1 ring-yellow-400 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                   Step
                </button>
              ))}
            </div>
          </div>

          {/* Category Names Upfront */}
          <div className="space-y-2.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
              Category Titles ({gridWidth} Columns)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
              {categoryNames.slice(0, gridWidth).map((catName, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 w-6 text-center shrink-0">
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => handleCategoryNameChange(idx, e.target.value)}
                    placeholder={`Category ${idx + 1}`}
                    className="w-full bg-transparent border-0 text-xs font-semibold text-slate-200 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => handleCreate(false)}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>Create Board</span>
          </button>

          <button
            type="button"
            onClick={() => handleCreate(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-950/40 transition-all cursor-pointer hover:scale-[1.02]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
            <span>Create & Open Editor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
