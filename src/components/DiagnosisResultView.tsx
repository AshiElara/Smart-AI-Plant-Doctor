import React, { useState } from "react";
import {
  RefreshCw,
  Printer,
  Copy,
  Check,
  ZoomIn,
  X,
  AlertTriangle,
  Info,
  ChevronRight,
  Clock,
  TrendingUp,
  Zap,
} from "lucide-react";
import { DiagnosisResult } from "../types";

interface DiagnosisResultViewProps {
  diagnosis: DiagnosisResult;
  imageDataUrl: string;
  onAnalyzeAnother: () => void;
}

// Clean any accidental occurrences of the word 'svg' from AI responses
const cleanText = (str?: string): string => {
  if (!str) return "";
  return str.replace(/\bsvg\b/gi, "leaf").replace(/svg/gi, "");
};

export const DiagnosisResultView: React.FC<DiagnosisResultViewProps> = ({
  diagnosis,
  imageDataUrl,
  onAnalyzeAnother,
}) => {
  const [copied, setCopied] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Compute Diagnosis Status: 🟢 Healthy | 🟡 Needs Attention | 🔴 Treatment Recommended
  const getDiagnosisStatus = () => {
    if (diagnosis.isHealthy || diagnosis.problem.toLowerCase().includes("healthy")) {
      return {
        status: "Healthy",
        icon: "🟢",
        label: "Healthy",
        badgeBg: "bg-emerald-50 text-emerald-900 border-emerald-300",
        barColor: "bg-emerald-500",
        bannerBg: "bg-emerald-50/90 border-emerald-200 text-emerald-950",
      };
    }
    const sev = (diagnosis.severity || "").toLowerCase();
    if (sev === "mild" || diagnosis.diagnosisStatus === "Needs Attention") {
      return {
        status: "Needs Attention",
        icon: "🟡",
        label: "Needs Attention",
        badgeBg: "bg-amber-50 text-amber-900 border-amber-300",
        barColor: "bg-amber-500",
        bannerBg: "bg-amber-50/90 border-amber-200 text-amber-950",
      };
    }
    return {
      status: "Treatment Recommended",
      icon: "🔴",
      label: "Treatment Recommended",
      badgeBg: "bg-rose-50 text-rose-900 border-rose-300",
      barColor: "bg-rose-600",
      bannerBg: "bg-rose-50/90 border-rose-200 text-rose-950",
    };
  };

  const getSeverityBadge = () => {
    const sev = (diagnosis.severity || "").toLowerCase();
    if (sev === "severe") {
      return {
        label: "Severe",
        badgeBg: "bg-rose-100 text-rose-900 border-rose-200",
      };
    }
    if (sev === "moderate") {
      return {
        label: "Moderate",
        badgeBg: "bg-amber-100 text-amber-900 border-amber-200",
      };
    }
    return {
      label: "Mild",
      badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-200",
    };
  };

  const statusInfo = getDiagnosisStatus();
  const severityBadge = getSeverityBadge();

  // Helper for Care Tips category emoji
  const getCareCategoryEmoji = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes("water")) return "💧";
    if (lower.includes("sun") || lower.includes("light")) return "☀️";
    if (lower.includes("soil")) return "🌱";
    if (lower.includes("air") || lower.includes("wind") || lower.includes("circulation")) return "🌬️";
    return "🪴";
  };

  const handleCopySummary = () => {
    const summary = `🌿 AI Plant Doctor Diagnostic Report
Diagnosis Status: ${statusInfo.icon} ${statusInfo.label}
Plant: ${cleanText(diagnosis.plantIdentified)}
🩺 Most Likely Problem: ${cleanText(diagnosis.problem)}
📊 Confidence: ${diagnosis.confidencePercentage}%
⚠️ Severity: ${diagnosis.severity}

🔍 What I Found:
${(diagnosis.visualObservations || []).map((obs) => `• ${cleanText(obs)}`).join("\n")}

💊 Treatment Plan:
Immediate Action: ${cleanText(diagnosis.immediateAction)}
Step-by-Step Treatment:
${(diagnosis.treatment || []).map((step, i) => `${i + 1}. ${cleanText(step)}`).join("\n")}
Duration: ${cleanText(diagnosis.treatmentDuration)}
Expected Improvement: ${cleanText(diagnosis.expectedImprovement)}

🌱 3 Recommended Actions:
${(diagnosis.threeRecommendations || []).slice(0, 3).map((rec, i) => `${i + 1}. ${cleanText(rec.title)}: ${cleanText(rec.description)}`).join("\n")}

💧 Personalized Care Tips:
${(diagnosis.careTips || []).map((tip) => `• [${tip.category}] ${cleanText(tip.tip)}`).join("\n")}

🚫 What to Avoid:
${(diagnosis.whatToAvoid || []).slice(0, 3).map((item) => `• ${cleanText(item)}`).join("\n")}
`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handlePrint = () => {
    window.print();
  };

  // If image was marked insufficient by AI
  if (!diagnosis.isSufficient) {
    return (
      <div
        id="insufficient-image-card"
        className="w-full max-w-3xl mx-auto rounded-3xl bg-white border border-amber-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6 animate-in fade-in duration-200"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-100 text-amber-700 shrink-0 text-2xl">
            ⚠️
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wide">
              Diagnosis Inconclusive
            </span>
            <h2 className="text-xl font-bold text-stone-900">
              The image is not sufficient for a reliable diagnosis.
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              {cleanText(
                diagnosis.insufficientReason ||
                  "The leaf photo lacks the clarity, lighting, or visible focal detail needed to diagnose symptoms accurately without guessing."
              )}
            </p>
          </div>
        </div>

        {/* Thumbnail preview */}
        <div className="w-52 h-52 mx-auto rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-inner">
          <img
            src={imageDataUrl}
            alt="Leaf capture"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Photography Guidance */}
        <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-3">
          <h3 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
            <span>🔍</span>
            <span>How to capture an optimal diagnostic leaf photo:</span>
          </h3>
          <ul className="text-xs text-stone-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">•</span>
              <span><strong>Bright Natural Daylight:</strong> Avoid harsh flash glare or deep indoor room shadows.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">•</span>
              <span><strong>Close-Up on Symptoms:</strong> Frame spots, holes, discoloration, or curling in sharp focus.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">•</span>
              <span><strong>Leaf Centered:</strong> Keep the leaf blade clearly in view, rather than background pots or ground.</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-center pt-2">
          <button
            id="btn-retake-insufficient-leaf"
            type="button"
            onClick={onAnalyzeAnother}
            className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span>📸</span>
            <span>Capture Another Leaf Photo</span>
          </button>
        </div>
      </div>
    );
  }

  // Ensure exactly 3 recommendations are displayed
  const recommendations = (diagnosis.threeRecommendations || []).slice(0, 3);
  // Ensure visual observations are 3-5 items
  const observations = (diagnosis.visualObservations || []).slice(0, 5);
  // Ensure practical mistakes are 3 items
  const avoidList = (diagnosis.whatToAvoid || []).slice(0, 3);

  return (
    <div
      id="diagnosis-result-container"
      className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12"
    >
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-emerald-100 shadow-xs">
        <button
          id="btn-back-to-scan-top"
          type="button"
          onClick={onAnalyzeAnother}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Scan Another Leaf</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="btn-copy-diagnosis-summary"
            type="button"
            onClick={handleCopySummary}
            className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-medium text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy diagnosis summary text"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            id="btn-print-diagnosis-report"
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-xs font-medium text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Print or save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* DIAGNOSIS STATUS BANNER AT TOP */}
      <div
        id="diagnosis-status-top-banner"
        className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm ${statusInfo.bannerBg}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl sm:text-3xl leading-none" role="img" aria-label="Status indicator">
            {statusInfo.icon}
          </span>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Plant Health Status
            </div>
            <div className="text-lg sm:text-xl font-extrabold text-stone-900">
              {statusInfo.label}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-stone-600 bg-white/70 px-3.5 py-1.5 rounded-xl border border-stone-200/60 self-stretch sm:self-auto justify-between sm:justify-start">
          <span>Target Plant:</span>
          <span className="font-bold text-stone-800">{cleanText(diagnosis.plantIdentified)}</span>
        </div>
      </div>

      {/* 🩺 PRIMARY DIAGNOSIS CARD */}
      <div
        id="plant-health-result-card"
        className="rounded-3xl bg-white border border-emerald-100 shadow-xl overflow-hidden"
      >
        <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
          {/* Captured Leaf Image with Zoom */}
          <div className="relative w-full md:w-64 h-64 shrink-0 rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 shadow-inner group">
            <img
              id="analyzed-leaf-img"
              src={imageDataUrl}
              alt="Analyzed leaf specimen"
              className="w-full h-full object-contain cursor-pointer transition-transform duration-300 group-hover:scale-105"
              onClick={() => setIsZoomOpen(true)}
            />
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="absolute bottom-2.5 right-2.5 bg-black/70 hover:bg-black/90 text-white p-2 rounded-xl backdrop-blur-xs transition-colors cursor-pointer"
              title="Inspect high-resolution photo"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="absolute top-2.5 left-2.5 bg-emerald-950/80 text-emerald-200 text-[11px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-xs border border-emerald-500/20">
              Analyzed Leaf Photo
            </div>
          </div>

          {/* Diagnostic Key Findings */}
          <div className="flex-1 space-y-4 w-full">
            {/* Header with Problem & Plant */}
            <div className="border-b border-stone-100 pb-3">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                Diagnosed Plant Species
              </p>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 mt-0.5">
                {cleanText(diagnosis.plantIdentified)}
              </h1>
            </div>

            {/* 🩺 Most Likely Problem */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-base">🩺</span>
                  <span>Most Likely Problem</span>
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.badgeBg}`}
                >
                  {statusInfo.icon} {statusInfo.label}
                </span>
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-stone-900 leading-snug">
                {cleanText(diagnosis.problem)}
              </div>
              {diagnosis.severityReason && (
                <p className="text-xs text-stone-600 pt-1 leading-relaxed">
                  <strong className="text-stone-700">Severity Assessment:</strong>{" "}
                  {cleanText(diagnosis.severityReason)}
                </p>
              )}
            </div>

            {/* Metrics: 📊 Confidence & ⚠️ Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Confidence */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <span>📊</span>
                    <span>Confidence</span>
                  </span>
                  <span className="font-extrabold text-emerald-800 text-sm">
                    {diagnosis.confidencePercentage}%
                  </span>
                </div>
                <div className="h-2 w-full bg-emerald-100/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(10, diagnosis.confidencePercentage))}%` }}
                  />
                </div>
                <div className="text-[11px] text-emerald-700 font-medium text-right">
                  Level: {diagnosis.confidenceLevel || "High"}
                </div>
              </div>

              {/* Severity */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-700 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>Severity</span>
                  </span>
                  <span
                    className={`font-bold text-xs px-2 py-0.5 rounded-md border ${severityBadge.badgeBg}`}
                  >
                    {severityBadge.label}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Based on tissue necrosis extent & photosynthetic leaf area preserved.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative Differential Diagnosis (If ambiguous) */}
        {diagnosis.hasOtherPossibility && diagnosis.otherPossibility && (
          <div className="mx-6 sm:mx-8 mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
              <span>⚠️</span>
              <span>Alternative Differential Possibility</span>
            </div>
            <p className="text-sm font-bold text-stone-900">
              Other Possibility: {cleanText(diagnosis.otherPossibility.problem)}
            </p>
            {diagnosis.otherPossibility.reason && (
              <p className="text-xs text-stone-600 leading-relaxed">
                {cleanText(diagnosis.otherPossibility.reason)}
              </p>
            )}
            {diagnosis.otherPossibility.additionalInfoNeeded && (
              <p className="text-xs text-amber-900 font-semibold pt-0.5">
                💡 Verification Detail: {cleanText(diagnosis.otherPossibility.additionalInfoNeeded)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 🔍 WHAT I FOUND & 💊 TREATMENT PLAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECTION 2: 🔍 What I Found */}
        <div
          id="card-what-i-found"
          className="rounded-3xl bg-white border border-emerald-100 shadow-md p-6 space-y-4"
        >
          <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
            <span className="text-xl" role="img" aria-label="Visual findings">
              🔍
            </span>
            <div>
              <h2 className="text-base font-bold text-stone-900">🔍 What I Found</h2>
              <p className="text-xs text-stone-500">Visual evidence identified in this photo</p>
            </div>
          </div>

          <ul className="space-y-2.5">
            {observations.map((obs, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 leading-relaxed p-3 rounded-2xl bg-stone-50/90 border border-stone-100/90"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>{cleanText(obs)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* SECTION 3: 💊 Treatment Plan */}
        <div
          id="card-treatment-plan"
          className="rounded-3xl bg-white border border-emerald-100 shadow-md p-6 space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
              <span className="text-xl" role="img" aria-label="Treatment plan">
                💊
              </span>
              <div>
                <h2 className="text-base font-bold text-stone-900">💊 Treatment Plan</h2>
                <p className="text-xs text-stone-500">Targeted therapeutic recovery</p>
              </div>
            </div>

            {/* Immediate Action */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 space-y-1">
              <div className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-700" />
                <span>Immediate Action</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-emerald-950 leading-relaxed">
                {cleanText(diagnosis.immediateAction)}
              </p>
            </div>

            {/* Step-by-Step Treatment */}
            <div className="space-y-2 pt-1">
              <p className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Step-by-Step Treatment
              </p>
              <ol className="space-y-2">
                {(diagnosis.treatment || []).map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700 leading-relaxed"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white text-[11px] font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{cleanText(step)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Treatment Duration & Expected Improvement */}
          <div className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-stone-600">
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 space-y-0.5">
              <span className="font-bold text-stone-800 flex items-center gap-1 text-[11px] uppercase tracking-wide">
                <Clock className="w-3 h-3 text-stone-500" />
                <span>Duration</span>
              </span>
              <p className="text-[11px] leading-snug">
                {cleanText(diagnosis.treatmentDuration || "Monitor daily for 7–14 days.")}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 space-y-0.5">
              <span className="font-bold text-stone-800 flex items-center gap-1 text-[11px] uppercase tracking-wide">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span>Expected Recovery</span>
              </span>
              <p className="text-[11px] leading-snug">
                {cleanText(diagnosis.expectedImprovement || "Halt of lesion spread and fresh new foliage.")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: 🌱 3 Recommended Actions */}
      <div
        id="card-three-recommended-actions"
        className="rounded-3xl bg-white border border-emerald-100 shadow-md p-6 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl" role="img" aria-label="Recommendations">
              🌱
            </span>
            <div>
              <h2 className="text-base font-bold text-stone-900">🌱 3 Recommended Actions</h2>
              <p className="text-xs text-stone-500">Highest-impact steps to preserve plant vitality</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            3 Priority Actions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {recommendations.map((rec, idx) => (
            <div
              key={rec.id || idx}
              className="p-4 rounded-2xl bg-gradient-to-b from-stone-50 to-emerald-50/30 border border-stone-200/80 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-800 text-white text-xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                    Action {idx + 1}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-stone-900 leading-snug">
                  {cleanText(rec.title)}
                </h3>
                <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                  {cleanText(rec.description)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5 & 6: 💧 Personalized Care Tips & 🚫 What to Avoid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SECTION 5: 💧 Personalized Care Tips */}
        <div
          id="card-personalized-care-tips"
          className="rounded-3xl bg-white border border-emerald-100 shadow-md p-6 space-y-4"
        >
          <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
            <span className="text-xl" role="img" aria-label="Care tips">
              💧
            </span>
            <div>
              <h2 className="text-base font-bold text-stone-900">💧 Personalized Care Tips</h2>
              <p className="text-xs text-stone-500">Environmental regimen suited to this species</p>
            </div>
          </div>

          <div className="space-y-3">
            {(diagnosis.careTips || []).map((tipItem, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-stone-50/90 border border-stone-100 flex items-start gap-3"
              >
                <span className="text-lg shrink-0 mt-0.5" role="img" aria-label={tipItem.category}>
                  {getCareCategoryEmoji(tipItem.category)}
                </span>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">
                    {tipItem.category}
                  </span>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {cleanText(tipItem.tip)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 6: 🚫 What to Avoid */}
        <div
          id="card-what-to-avoid"
          className="rounded-3xl bg-white border border-emerald-100 shadow-md p-6 space-y-4"
        >
          <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
            <span className="text-xl" role="img" aria-label="Warnings">
              🚫
            </span>
            <div>
              <h2 className="text-base font-bold text-stone-900">🚫 What to Avoid</h2>
              <p className="text-xs text-stone-500">3 critical mistakes that exacerbate symptoms</p>
            </div>
          </div>

          <ul className="space-y-2.5">
            {avoidList.map((avoidItem, idx) => (
              <li
                key={idx}
                className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100/80 flex items-start gap-3 text-xs sm:text-sm text-stone-700 leading-relaxed"
              >
                <span className="text-base text-rose-600 shrink-0 mt-0.5" role="img" aria-label="Avoid">
                  🚫
                </span>
                <span>{cleanText(avoidItem)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Advisory Notice */}
      <div
        id="user-friendly-warning-banner"
        className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-stone-600 text-xs flex items-start gap-3 leading-relaxed"
      >
        <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
        <p>
          <strong className="text-stone-800">Clinical Notice:</strong>{" "}
          {cleanText(
            diagnosis.disclaimer ||
              "AI diagnosis is an initial visual assessment based on observable leaf morphology. For severe commercial crop infestations, verify with certified agricultural extension agents."
          )}
        </p>
      </div>

      {/* Bottom Floating CTA Bar: 📸 Analyze Another Leaf */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          id="btn-analyze-another-leaf-bottom"
          type="button"
          onClick={onAnalyzeAnother}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <span className="text-lg">📸</span>
          <span>Analyze Another Leaf</span>
        </button>
      </div>

      {/* Image Zoom Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-stone-300 p-1 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={imageDataUrl}
              alt="Leaf specimen high detail inspection"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain border border-white/20 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
