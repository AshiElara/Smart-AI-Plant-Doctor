import React, { useEffect, useState } from "react";
import { Sparkles, Microscope, Search, ShieldCheck } from "lucide-react";

interface AnalyzingViewProps {
  imageDataUrl: string;
}

const PROGRESS_STEPS = [
  { message: "Checking leaf appearance…", icon: Search },
  { message: "Identifying visible symptoms…", icon: Microscope },
  { message: "Comparing possible plant problems…", icon: Sparkles },
  { message: "Preparing treatment recommendations…", icon: ShieldCheck },
];

export const AnalyzingView: React.FC<AnalyzingViewProps> = ({ imageDataUrl }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const currentStep = PROGRESS_STEPS[currentStepIndex];
  const CurrentIcon = currentStep.icon;

  return (
    <div
      id="analyzing-view-container"
      className="w-full max-w-xl mx-auto rounded-3xl bg-white border border-emerald-100 shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center animate-in fade-in duration-300"
    >
      {/* Title */}
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
          AI Vision in Progress
        </span>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
          🌿 Examining your leaf…
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          Gemini vision is inspecting leaf color, spots, margins, and tissue structure
        </p>
      </div>

      {/* Leaf Scanner Stage with Laser Animation */}
      <div className="relative mt-6 w-52 h-52 sm:w-60 sm:h-60 rounded-2xl overflow-hidden bg-stone-950 border-2 border-emerald-500/40 shadow-xl flex items-center justify-center">
        <img
          src={imageDataUrl}
          alt="Scanning leaf"
          className="w-full h-full object-contain filter contrast-105"
        />

        {/* Botanical Scan Line */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce duration-1000" />
        <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />

        {/* Corner HUD targeting markers */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
      </div>

      {/* Active Step Indicator */}
      <div className="mt-6 w-full max-w-md bg-stone-50 rounded-2xl p-4 border border-stone-100">
        <div className="flex items-center justify-center gap-2.5 text-emerald-800 font-semibold text-sm">
          <CurrentIcon className="w-4 h-4 text-emerald-600 animate-spin" />
          <span>{currentStep.message}</span>
        </div>

        {/* 4-Step Progress Bar */}
        <div className="mt-3.5 flex items-center justify-between gap-1.5 px-2">
          {PROGRESS_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step.message}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                    isCompleted
                      ? "bg-emerald-600"
                      : isCurrent
                      ? "bg-emerald-400 animate-pulse"
                      : "bg-stone-200"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-[11px] text-stone-400">
        Takes about 3–6 seconds depending on image resolution
      </p>
    </div>
  );
};
