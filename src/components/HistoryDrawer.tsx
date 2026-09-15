import React from "react";
import { History, Trash2, X, ChevronRight, Calendar, Stethoscope } from "lucide-react";
import { ScanHistoryItem } from "../types";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ScanHistoryItem[];
  onSelectScan: (item: ScanHistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectScan,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="history-drawer-overlay"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="history-drawer-panel"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-700" />
            <h2 className="text-base font-bold text-stone-900">Recent Plant Scans</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
              {history.length}
            </span>
          </div>

          <button
            id="btn-close-history-drawer"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 text-stone-400">
              <History className="w-10 h-10 stroke-1 text-stone-300" />
              <p className="text-sm font-medium text-stone-600">No previous scans yet</p>
              <p className="text-xs text-stone-400">
                Diagnosed plant leaves will be securely saved here in your browser.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectScan(item);
                  onClose();
                }}
                className="group p-3 rounded-2xl border border-stone-200/80 hover:border-emerald-300 bg-white hover:bg-emerald-50/30 transition-all cursor-pointer flex items-center gap-3.5 shadow-xs"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-900 shrink-0 border border-stone-200">
                  <img
                    src={item.imageDataUrl}
                    alt={item.diagnosis.plantIdentified}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-emerald-800 truncate">
                    {item.diagnosis.plantIdentified}
                  </h4>
                  <p className="text-sm font-bold text-stone-900 truncate">
                    {item.diagnosis.problem}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-stone-600">
                      {item.diagnosis.confidencePercentage}% conf.
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between">
            <button
              id="btn-clear-history"
              type="button"
              onClick={onClearHistory}
              className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1.5 p-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Scan History
            </button>
            <span className="text-[11px] text-stone-400">Stored locally</span>
          </div>
        )}
      </div>
    </div>
  );
};
