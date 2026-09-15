import React from "react";
import { Sparkles, RefreshCcw, CheckCircle2, ShieldAlert } from "lucide-react";

interface ImagePreviewCardProps {
  imageDataUrl: string;
  sourceType: "camera" | "upload" | "sample";
  onRetakeOrChange: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const ImagePreviewCard: React.FC<ImagePreviewCardProps> = ({
  imageDataUrl,
  sourceType,
  onRetakeOrChange,
  onAnalyze,
  isAnalyzing,
}) => {
  const retakeLabel = sourceType === "camera" ? "Retake Photo" : "Choose Another Image";

  return (
    <div
      id="image-preview-card"
      className="w-full max-w-2xl mx-auto rounded-3xl bg-white/90 backdrop-blur-md border border-emerald-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Top Banner */}
      <div className="px-6 py-4 border-b border-emerald-50 bg-gradient-to-r from-emerald-50/80 to-teal-50/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-800">Leaf Image Staged</h3>
            <p className="text-xs text-stone-500">Ready for visual diagnosis</p>
          </div>
        </div>

        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200/60 capitalize">
          {sourceType} Source
        </span>
      </div>

      {/* Image Display */}
      <div className="relative p-6 flex flex-col items-center">
        <div className="relative w-full max-w-md h-72 sm:h-80 rounded-2xl overflow-hidden bg-stone-900 shadow-inner flex items-center justify-center border border-stone-200">
          <img
            id="staged-leaf-preview-img"
            src={imageDataUrl}
            alt="Leaf staged for diagnosis"
            className="w-full h-full object-contain"
          />

          {/* Quick inspection watermark */}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white/90 text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Visual Analysis Target</span>
          </div>
        </div>

        {/* Quality tip */}
        <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 text-amber-800 text-xs w-full max-w-md">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <p className="leading-relaxed">
            Ensure key symptoms (discoloration, spots, mold, or edge browning) are in sharp focus for the most accurate diagnosis.
          </p>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
          <button
            id="btn-retake-or-choose-another"
            type="button"
            onClick={onRetakeOrChange}
            disabled={isAnalyzing}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-stone-200 hover:border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCcw className="w-4 h-4 text-stone-500" />
            {retakeLabel}
          </button>

          <button
            id="btn-analyze-leaf-submit"
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-[0.99] text-white text-sm font-semibold transition-all shadow-md shadow-emerald-800/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            {isAnalyzing ? "Analyzing..." : "Analyze Leaf"}
          </button>
        </div>
      </div>
    </div>
  );
};
