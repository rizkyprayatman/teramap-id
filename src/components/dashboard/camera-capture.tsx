"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, X, Upload, Loader2, ImageIcon } from "lucide-react";

interface CameraCaptureProps {
  maxPhotos?: number;
  existingPhotos?: string[];
  onPhotosChange: (photos: string[]) => void;
  folder?: string;
  label?: string;
}

export function CameraCapture({
  maxPhotos = 5,
  existingPhotos = [],
  onPhotosChange,
  folder = "captures",
  label = "Foto",
}: CameraCaptureProps) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [pendingPhotos, setPendingPhotos] = useState<Array<{ id: string; dataUrl: string }>>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const totalCount = photos.length + pendingPhotos.length;

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
    setIsStartingCamera(false);
    setIsVideoReady(false);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const waitForVideoDimensions = (video: HTMLVideoElement, timeoutMs = 2500) => {
    return new Promise<void>((resolve, reject) => {
      const start = performance.now();
      const tick = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          resolve();
          return;
        }
        if (performance.now() - start > timeoutMs) {
          reject(new Error("Kamera belum siap. Coba lagi."));
          return;
        }
        requestAnimationFrame(tick);
      };
      tick();
    });
  };

  const waitForVideoElement = (timeoutMs = 2500) => {
    return new Promise<HTMLVideoElement>((resolve, reject) => {
      const start = performance.now();
      const tick = () => {
        const el = videoRef.current;
        if (el) {
          resolve(el);
          return;
        }
        if (performance.now() - start > timeoutMs) {
          reject(new Error("Kamera belum siap. Coba lagi."));
          return;
        }
        requestAnimationFrame(tick);
      };
      tick();
    });
  };

  const startCamera = async () => {
    setError("");
    setIsStartingCamera(true);
    setIsVideoReady(false);
    try {
      const videoEl = await waitForVideoElement();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      videoEl.srcObject = stream;
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.setAttribute("playsinline", "true");
      // Wait for metadata to load before playing
      await new Promise<void>((resolve, reject) => {
        videoEl.onloadedmetadata = () => {
          videoEl.play().then(resolve).catch(reject);
        };
        videoEl.onerror = () => reject(new Error("Video gagal dimuat"));
      });

      await waitForVideoDimensions(videoEl);
      setIsVideoReady(true);
      setIsCapturing(true);
    } catch {
      setError("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.");
      setIsCapturing(false);
      setIsVideoReady(false);
    } finally {
      setIsStartingCamera(false);
    }
  };

  useEffect(() => {
    if (!cameraOpen) return;
    void startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOpen]);

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      try {
        await waitForVideoDimensions(video);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kamera belum siap. Coba lagi.");
        return;
      }
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    // Collect overlay info
    const timestamp = new Date().toLocaleString("id-ID");
    let gpsText = "";

    // Try to get GPS info first
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
      });
      gpsText = `🌐 ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
    } catch {
      // GPS not available
    }

    // Draw overlay once with all info
    const overlayHeight = gpsText ? 60 : 40;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, canvas.height - overlayHeight, canvas.width, overlayHeight);
    ctx.fillStyle = "#ffffff";
    ctx.font = "14px monospace";
    if (gpsText) {
      ctx.fillText(`📍 ${timestamp}`, 10, canvas.height - 35);
      ctx.fillText(gpsText, 10, canvas.height - 12);
    } else {
      ctx.fillText(`📍 ${timestamp}`, 10, canvas.height - 15);
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    if (totalCount >= maxPhotos) {
      setError(`Maksimal ${maxPhotos} foto`);
      return;
    }
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    setPendingPhotos((prev) => [...prev, { id, dataUrl }]);
    setCameraOpen(false);
    stopCamera();
  };

  const uploadPending = async () => {
    if (pendingPhotos.length === 0) return;

    setIsUploading(true);
    setError("");
    const uploadedUrls: string[] = [];
    const failed: Array<{ id: string; dataUrl: string }> = [];

    try {
      for (const item of pendingPhotos) {
        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: item.dataUrl, folder }),
          });

          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Upload gagal");
          uploadedUrls.push(result.url);
        } catch {
          failed.push(item);
        }
      }

      const newPhotos = [...photos, ...uploadedUrls];
      setPhotos(newPhotos);
      onPhotosChange(newPhotos);
      setPendingPhotos(failed);

      if (failed.length > 0) {
        setError(`${failed.length} foto gagal diupload. Silakan coba upload ulang.`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  /** Convert any image file to JPEG via canvas for guaranteed browser/server compatibility */
  const convertToJpeg = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1920;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas tidak tersedia")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        URL.revokeObjectURL(img.src);
        resolve(dataUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error(`${file.name}: Format gambar tidak didukung`));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = maxPhotos - totalCount;
    const filesToAdd = Array.from(files).slice(0, remaining);

    setError("");

    try {
      const nextPending: Array<{ id: string; dataUrl: string }> = [];

      for (const file of filesToAdd) {
        if (file.size > 5 * 1024 * 1024) {
          setError(`${file.name}: Ukuran file melebihi 5MB`);
          continue;
        }

        // Convert to JPEG via canvas to ensure compatibility (handles HEIC, HEIF, etc.)
        const base64 = await convertToJpeg(file);

        const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        nextPending.push({ id, dataUrl: base64 });
      }

      if (nextPending.length > 0) {
        setPendingPhotos((prev) => [...prev, ...nextPending]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengupload foto");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
  };

  const removePendingPhoto = (id: string) => {
    setPendingPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label} ({totalCount}/{maxPhotos})</label>
        <div className="flex gap-2">
          {totalCount < maxPhotos && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCameraOpen(true)}
                disabled={cameraOpen || isUploading}
              >
                <Camera className="mr-1 h-3 w-3" />
                Kamera
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCapturing || isUploading}
              >
                <Upload className="mr-1 h-3 w-3" />
                Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}

      {/* Camera Popup */}
      <Dialog
        open={cameraOpen}
        onOpenChange={(open) => {
          setCameraOpen(open);
          if (!open) stopCamera();
        }}
      >
        <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Kamera</DialogTitle>
            <DialogDescription>Ambil foto lalu simpan ke preview sebelum upload.</DialogDescription>
          </DialogHeader>

          <div className="relative bg-black h-[80vh]">
            <video ref={videoRef} className="h-full w-full object-contain" autoPlay playsInline muted />
            {!isCapturing && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                {isStartingCamera ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Memuat kamera...
                  </div>
                ) : (
                  <div className="text-sm">Kamera tidak tersedia</div>
                )}
              </div>
            )}

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
              <Button
                type="button"
                onClick={capturePhoto}
                disabled={!isCapturing || !isVideoReady || isUploading}
                className="rounded-full h-16 w-16 bg-white hover:bg-gray-100"
              >
                <Camera className="h-7 w-7 text-black" />
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setCameraOpen(false);
                  stopCamera();
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Mengupload foto...
        </div>
      )}

      {/* Pending previews before upload */}
      {pendingPhotos.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Preview ({pendingPhotos.length})</p>
            <Button
              type="button"
              size="sm"
              onClick={uploadPending}
              disabled={isUploading || pendingPhotos.length === 0}
            >
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Upload
            </Button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {pendingPhotos.map((p, i) => (
              <div key={p.id} className="relative group aspect-square rounded-lg overflow-hidden border">
                <img src={p.dataUrl} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePendingPhoto(p.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {photos.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border">
              <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && pendingPhotos.length === 0 && !isCapturing && (
        <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">
          <ImageIcon className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm">Belum ada foto. Ambil dari kamera atau upload file.</p>
          <p className="text-xs mt-1">Maks. {maxPhotos} foto, masing-masing maks. 5MB</p>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
