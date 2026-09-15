import React, { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, X, AlertCircle, Sparkles, SwitchCamera } from "lucide-react";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    stopCamera();
    setError(null);
    setIsStarting(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported on this browser.");
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: unknown) {
      console.warn("Unable to start live video stream:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Camera access was denied or is not available on this device.";
      setError(msg);
    } finally {
      setIsStarting(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    stopCamera();
    onCapture(dataUrl);
  };

  const handleFallbackFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          stopCamera();
          onCapture(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="camera-capture-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div
        id="camera-capture-dialog"
        className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-stone-900 text-white shadow-2xl border border-stone-700 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-900/90 z-10">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-stone-200 text-sm">Live Leaf Camera</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-switch-camera-facing"
              type="button"
              onClick={toggleCameraFacing}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              title="Switch front/rear camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
            <button
              id="btn-close-camera-modal"
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
              title="Close camera"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Stage with Leaf Frame Guide */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[360px] sm:min-h-[420px]">
          {error ? (
            <div className="p-6 text-center max-w-md mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Direct Camera Access Limited</h3>
                <p className="text-xs text-stone-400 leading-relaxed">{error}</p>
              </div>
              <div className="pt-2">
                <button
                  id="btn-use-native-camera-fallback"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors inline-flex items-center gap-2 shadow-lg shadow-emerald-900/40"
                >
                  <Camera className="w-4 h-4" />
                  Open Device Camera App
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFallbackFileInput}
                />
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Leaf Guidance Silhouette Overlay */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6">
                <div className="relative w-64 h-72 sm:w-72 sm:h-80 border-2 border-dashed border-emerald-400/70 rounded-[40px] shadow-[0_0_25px_rgba(16,185,129,0.25)] flex items-center justify-center">
                  <div className="absolute inset-0 bg-emerald-900/10 rounded-[38px]" />
                  {/* Subtle leaf icon indicator */}
                  <div className="text-emerald-300/60 flex flex-col items-center gap-1.5 z-10">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                    <span className="text-[11px] font-medium tracking-wide uppercase bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      Center Leaf Here
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-xs font-medium text-stone-300 bg-black/60 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
                  Hold steady & ensure clear lighting on symptoms
                </p>
              </div>

              {isStarting && (
                <div className="absolute inset-0 bg-stone-900/90 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin" />
                  <span className="text-sm text-stone-300">Initializing camera feed...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Shutter Bar */}
        {!error && (
          <div className="p-4 bg-stone-900 border-t border-stone-800 flex items-center justify-around">
            <button
              id="btn-retry-camera"
              type="button"
              onClick={startCamera}
              className="p-3 text-stone-400 hover:text-white transition-colors rounded-full hover:bg-stone-800"
              title="Restart camera stream"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            {/* Shutter Button */}
            <button
              id="btn-shutter-capture"
              type="button"
              onClick={capturePhoto}
              className="group relative flex h-18 w-18 items-center justify-center rounded-full border-4 border-white bg-emerald-600 transition-all active:scale-95 hover:bg-emerald-500 shadow-lg shadow-emerald-900/50"
              title="Take Photo"
            >
              <div className="h-13 w-13 rounded-full bg-white transition-transform group-hover:scale-90" />
            </button>

            {/* Device Native Camera Fallback option */}
            <button
              id="btn-open-fallback-file-camera"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-stone-400 hover:text-white transition-colors rounded-full hover:bg-stone-800 text-xs flex flex-col items-center gap-1"
              title="Use Native System Camera"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFallbackFileInput}
            />
          </div>
        )}
      </div>
    </div>
  );
};
