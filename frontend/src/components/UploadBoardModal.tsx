import React, { useState, useRef } from 'react';
import type { BoardResponseDto } from '../types/board';
import { createBoard } from '../services/api';
import {
  Upload,
  Download,
  X,
  FileJson,
  AlertCircle,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface UploadBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBoardUploaded: (board: BoardResponseDto) => void;
}

export const UploadBoardModal: React.FC<UploadBoardModalProps> = ({
  isOpen,
  onClose,
  onBoardUploaded,
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customJsonStr, setCustomJsonStr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (parsed.title && !customTitle) {
          setCustomTitle(parsed.title);
        } else if (!customTitle) {
          setCustomTitle(file.name.replace(/\.[^/.]+$/, ''));
        }

        if (parsed.description && !customDesc) {
          setCustomDesc(parsed.description);
        }

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
            'JSON format invalid: expected a "categories" array with questions.'
          );
        }

        setCustomJsonStr(finalDataJson);
        setSuccess(`Loaded "${file.name}" successfully!`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid JSON file';
        setError(message);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) {
      setError('Please enter a board title.');
      return;
    }
    if (!customJsonStr.trim()) {
      setError('Please provide or upload board JSON data.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

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

      onBoardUploaded(created);
      onClose();
      setCustomTitle('');
      setCustomDesc('');
      setCustomJsonStr('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create board';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const sampleTemplate = {
      title: 'Custom Jeopardy Championship',
      description: '4x5 Custom Board Example',
      categories: [
        {
          name: 'General Knowledge',
          questions: [
            { value: 100, prompt: 'Sample question prompt for $100', answer: 'Answer 1', isDailyDouble: false },
            { value: 200, prompt: 'Sample question prompt for $200', answer: 'Answer 2', isDailyDouble: false },
            { value: 300, prompt: 'Sample question prompt for $300', answer: 'Answer 3', isDailyDouble: false },
            { value: 400, prompt: 'Sample question prompt for $400', answer: 'Answer 4', isDailyDouble: true },
            { value: 500, prompt: 'Sample question prompt for $500', answer: 'Answer 5', isDailyDouble: false },
          ],
        },
        {
          name: 'Pop Culture',
          questions: [
            { value: 100, prompt: 'Sample question prompt for $100', answer: 'Answer 1', isDailyDouble: false },
            { value: 200, prompt: 'Sample question prompt for $200', answer: 'Answer 2', isDailyDouble: false },
            { value: 300, prompt: 'Sample question prompt for $300', answer: 'Answer 3', isDailyDouble: false },
            { value: 400, prompt: 'Sample question prompt for $400', answer: 'Answer 4', isDailyDouble: false },
            { value: 500, prompt: 'Sample question prompt for $500', answer: 'Answer 5', isDailyDouble: false },
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
    link.download = 'custom-jeopardy-board-template.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400">
              <FileJson className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-100">Upload Custom Trivia Board</h2>
              <p className="text-xs text-slate-400">Import a Jeopardy JSON board file or paste categories</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs">
              <Check className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* File Dropzone */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select .JSON File
              </label>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1 text-xs text-yellow-400 hover:underline cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Starter Template
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-yellow-400 rounded-xl p-5 text-center bg-slate-950/60 hover:bg-slate-950 transition-all cursor-pointer"
            >
              <Upload className="w-7 h-7 text-yellow-400 mx-auto mb-1.5" />
              <p className="text-sm font-bold text-slate-200">
                Click to browse or drop a .json board file
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Automatically parses categories and question dimensions (e.g. 4x6, 7x3, 5x5)
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

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Board Title *
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Cinema & Pop Culture"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 font-bold focus:outline-none focus:border-yellow-400"
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
              placeholder="e.g. Custom 4-category challenge with 6 questions each"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-yellow-400"
            />
          </div>

          {/* JSON Payload */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Categories JSON Payload *
            </label>
            <textarea
              value={customJsonStr}
              onChange={(e) => setCustomJsonStr(e.target.value)}
              rows={4}
              placeholder={`{\n  "categories": [\n    {\n      "name": "Category 1",\n      "questions": [\n        { "value": 200, "prompt": "...", "answer": "..." }\n      ]\n    }\n  ]\n}`}
              className="w-full bg-slate-950 font-mono text-xs text-slate-200 border border-slate-700 rounded-xl p-3 focus:outline-none focus:border-yellow-400"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex justify-end items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-400 hover:text-white px-4 py-2 rounded-xl bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-slate-950 px-6 py-2 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              {loading ? (
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
  );
};

