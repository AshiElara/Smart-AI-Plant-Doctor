import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  UploadCloud,
  Sparkles,
  History,
  CheckCircle2,
  AlertCircle,
  Sprout,
  ShieldCheck,
  ChevronRight,
  Leaf,
  Info,
} from "lucide-react";
import { CameraCaptureModal } from "./components/CameraCaptureModal";
import { ImagePreviewCard } from "./components/ImagePreviewCard";
import { AnalyzingView } from "./components/AnalyzingView";
import { DiagnosisResultView } from "./components/DiagnosisResultView";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { SAMPLE_LEAVES } from "./data/sampleLeaves";
import { DiagnosisResult, ScanHistoryItem } from "./types";
import { normalizeImageForAnalysis } from "./utils/imageHelper";

const LOCAL_STORAGE_KEY = "ai_plant_doctor_scan_history_v1";

export default function App() {
  // App views: 'home' | 'preview' | 'analyzing' | 'result'
  const [appState, setAppState] = useState<"home" | "preview" | "analyzing" | "result">("home");

  // Image State
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<"camera" | "upload" | "sample">("upload");

  // Diagnosis Data
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiagnosisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Drawers
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  // Hidden file input
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load scan history from localStorage", e);
    }
  }, []);

  // Save history to localStorage
  const saveScanToHistory = (diagnosis: DiagnosisResult, imageDataUrl: string) => {
    const newItem: ScanHistoryItem = {
      id: "scan_" + Date.now(),
      timestamp: Date.now(),
      imageDataUrl,
      diagnosis,
    };
    const updated = [newItem, ...history].slice(0, 20);
    setHistory(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.warn("Could not clear localStorage", e);
    }
  };

  // Handlers for Camera
  const handleOpenLiveCamera = () => {
    setErrorMessage(null);
    setIsCameraModalOpen(true);
  };

  const handleCameraPhotoCaptured = (dataUrl: string) => {
    setIsCameraModalOpen(false);
    setCurrentImage(dataUrl);
    setImageSource("camera");
    setAppState("preview");
  };

  // Handlers for File Upload
  const handleTriggerUpload = () => {
    setErrorMessage(null);
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCurrentImage(dataUrl);
        setImageSource("upload");
        setAppState("preview");
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be chosen again
    e.target.value = "";
  };

  // Drag & Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setCurrentImage(dataUrl);
          setImageSource("upload");
          setAppState("preview");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample Leaf Selection
  const handleSelectSample = (imageUrl: string) => {
    setCurrentImage(imageUrl);
    setImageSource("sample");
    setAppState("preview");
  };

  // Analyze leaf request to backend
  const handleAnalyzeLeaf = async () => {
    if (!currentImage) return;

    setAppState("analyzing");
    setErrorMessage(null);

    try {
      // Normalize and rasterize (scales oversized photos down and ensures valid base64 JPEG)
      const normalized = await normalizeImageForAnalysis(currentImage);

      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: normalized.base64,
          mimeType: normalized.mimeType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Analysis failed. Please check your network connection.");
      }

      setCurrentDiagnosis(data.diagnosis);
      setAppState("result");

      // Save scan to history if sufficient
      if (data.diagnosis.isSufficient) {
        saveScanToHistory(data.diagnosis, normalized.dataUrl);
      }
    } catch (err: unknown) {
      console.error("Diagnosis error:", err);
      const msg = err instanceof Error ? err.message : "Failed to analyze leaf image.";
      setErrorMessage(msg);
      setAppState("preview");
    }
  };

  const handleRetakeOrChange = () => {
    if (imageSource === "camera") {
      setIsCameraModalOpen(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleResetToHome = () => {
    setAppState("home");
    setCurrentImage(null);
    setCurrentDiagnosis(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col selection:bg-emerald-200">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Global Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-100/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div
            onClick={handleResetToHome}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <span className="font-bold text-stone-900 text-base sm:text-lg tracking-tight flex items-center gap-1.5">
                AI Plant Doctor
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-700 block -mt-0.5">
                Visual Leaf Diagnostics
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-open-history"
              type="button"
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-stone-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              title="View recent diagnoses"
            >
              <History className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">Recent Scans</span>
              {history.length > 0 && (
                <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-emerald-700 text-white text-[10px] font-bold">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Global Error Banner */}
        {errorMessage && (
          <div
            id="global-error-banner"
            className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-xs animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold">Analysis Notice:</strong> {errorMessage}
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-800 text-xs font-semibold px-2 py-0.5"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. HOME SCREEN */}
        {appState === "home" && (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Hero Section */}
            <div className="text-center max-w-2xl mx-auto space-y-4 pt-2 sm:pt-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200/60 text-emerald-800 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Powered by Gemini Vision AI</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
                Snap a leaf. Discover the problem. <br className="hidden sm:inline" />
                <span className="text-emerald-700">Get the right care.</span>
              </h1>

              <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl mx-auto">
                Use your camera or upload a leaf photo and let AI analyze visible plant-health symptoms to diagnose diseases, pests, and nutrient deficiencies.
              </p>

              {/* Main CTAs */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
                <button
                  id="btn-take-leaf-photo-main"
                  type="button"
                  onClick={handleOpenLiveCamera}
                  className="w-full sm:w-1/2 py-4 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 active:scale-98 text-white font-semibold text-sm sm:text-base transition-all shadow-lg shadow-emerald-900/25 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                  Take Leaf Photo
                </button>

                <button
                  id="btn-upload-image-main"
                  type="button"
                  onClick={handleTriggerUpload}
                  className="w-full sm:w-1/2 py-4 px-5 rounded-2xl border-2 border-emerald-700/20 hover:border-emerald-600 bg-white hover:bg-emerald-50/40 text-emerald-900 font-semibold text-sm sm:text-base transition-all shadow-xs flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <UploadCloud className="w-5 h-5 text-emerald-700" />
                  Upload Leaf Image
                </button>
              </div>

              {/* Drag & drop dropzone hint */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={handleTriggerUpload}
                className="mt-4 border-2 border-dashed border-emerald-200/80 hover:border-emerald-400 bg-emerald-50/20 hover:bg-emerald-50/50 rounded-2xl p-4 transition-colors cursor-pointer text-xs text-stone-500 max-w-md mx-auto"
              >
                Or drag and drop a leaf image file here (PNG, JPG, WEBP)
              </div>
            </div>

            {/* How It Works Section */}
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Simple 3-Step Process
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
                  How it works
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {/* Step 1 */}
                <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-2 relative overflow-hidden">
                  <span className="flex h-8 w-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-sm items-center justify-center">
                    1
                  </span>
                  <div className="text-stone-800 font-bold text-base flex items-center gap-2">
                    <span>📸 Capture</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Take a clear photo of the leaf or affected area in natural light, ensuring spots or discoloration are visible.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-2 relative overflow-hidden">
                  <span className="flex h-8 w-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-sm items-center justify-center">
                    2
                  </span>
                  <div className="text-stone-800 font-bold text-base flex items-center gap-2">
                    <span>🤖 Analyze</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Gemini vision examines color shifts, spots, wilting, curling, powdery coatings, and fungal patterns.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-xs space-y-2 relative overflow-hidden">
                  <span className="flex h-8 w-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-sm items-center justify-center">
                    3
                  </span>
                  <div className="text-stone-800 font-bold text-base flex items-center gap-2">
                    <span>🌱 Treat</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Receive specific diagnosis, immediate action steps, 3 priority recommendations, and personalized care tips.
                  </p>
                </div>
              </div>
            </div>

            {/* Test With Sample Leaves Section */}
            <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-white to-emerald-50/30 border border-emerald-100 p-6 sm:p-8 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Instant Demonstration
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                    Try Sample Leaf Diagnoses
                  </h3>
                  <p className="text-xs text-stone-500">
                    No physical plant handy right now? Click any real symptom sample below to test the AI vision pipeline:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {SAMPLE_LEAVES.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => handleSelectSample(sample.imageUrl)}
                    className="group p-3.5 rounded-2xl bg-white border border-stone-200/80 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="w-full h-32 rounded-xl overflow-hidden bg-stone-100 border border-stone-100 flex items-center justify-center relative">
                        <img
                          src={sample.imageUrl}
                          alt={sample.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white">
                          {sample.condition}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                          {sample.plant}
                        </h4>
                        <p className="text-[11px] text-stone-500 mt-0.5 leading-snug line-clamp-2">
                          {sample.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
                      <span>Test Leaf</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. PREVIEW SCREEN (Retake / Choose Another vs Analyze Leaf) */}
        {appState === "preview" && currentImage && (
          <div className="py-2">
            <ImagePreviewCard
              imageDataUrl={currentImage}
              sourceType={imageSource}
              onRetakeOrChange={handleRetakeOrChange}
              onAnalyze={handleAnalyzeLeaf}
              isAnalyzing={false}
            />
          </div>
        )}

        {/* 3. ANALYZING LOADING SCREEN */}
        {appState === "analyzing" && currentImage && (
          <div className="py-6">
            <AnalyzingView imageDataUrl={currentImage} />
          </div>
        )}

        {/* 4. DIAGNOSIS RESULT SCREEN */}
        {appState === "result" && currentDiagnosis && currentImage && (
          <DiagnosisResultView
            diagnosis={currentDiagnosis}
            imageDataUrl={currentImage}
            onAnalyzeAnother={handleResetToHome}
          />
        )}
      </main>

      {/* Live Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraPhotoCaptured}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={history}
        onSelectScan={(item) => {
          setCurrentImage(item.imageDataUrl);
          setCurrentDiagnosis(item.diagnosis);
          setAppState("result");
        }}
        onClearHistory={clearHistory}
      />

      {/* Global Footer */}
      <footer className="mt-auto border-t border-stone-200/80 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center">
            <span className="font-semibold text-stone-700">AI Plant Doctor</span>
            <span>•</span>
            <span>Intelligent Botanical Health Diagnostics</span>
          </div>
          <p className="text-[11px] text-stone-400">
            Always verify severe plant pathogens with agricultural extension agents or certified arborists.
          </p>
        </div>
      </footer>
    </div>
  );
}
