"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { isValidLocationProofPayload, LOCATION_QR_BONUS_XP } from "@/lib/location-qr";

type Props = {
  verified: boolean;
  onVerifiedChange: (next: boolean) => void;
};

export function LocationQrProof({ verified, onVerifiedChange }: Props) {
  const [scanning, setScanning] = useState(false);
  const [pasteValue, setPasteValue] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const stopStream = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  const applyPayload = useCallback(
    (raw: string) => {
      const t = raw.trim();
      if (!t) {
        setPasteError("Paste a check-in link or scan a QR.");
        return;
      }
      if (isValidLocationProofPayload(t)) {
        setPasteError(null);
        onVerifiedChange(true);
        setScanning(false);
        stopStream();
        setPasteValue("");
      } else {
        setPasteError("That doesn’t look like a campus check-in code. Ask staff for the location QR.");
      }
    },
    [onVerifiedChange, stopStream]
  );

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setPasteError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera isn’t available here — use “Paste check-in link” below.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      setScanning(true);

      const tick = () => {
        const v = videoRef.current;
        const canvas = canvasRef.current;
        if (!v || !canvas || !streamRef.current) return;
        if (v.readyState >= v.HAVE_ENOUGH_DATA) {
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) return;
          const w = v.videoWidth;
          const h = v.videoHeight;
          if (w > 0 && h > 0) {
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(v, 0, 0, w, h);
            const imageData = ctx.getImageData(0, 0, w, h);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert"
            });
            if (code?.data && isValidLocationProofPayload(code.data)) {
              stopStream();
              onVerifiedChange(true);
              setScanning(false);
              return;
            }
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setCameraError("Could not open camera. Try pasting the check-in link instead.");
    }
  }, [onVerifiedChange, stopStream]);

  const stopScanning = useCallback(() => {
    stopStream();
    setScanning(false);
  }, [stopStream]);

  const onFileFromGallery = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) return;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth"
          });
          if (code?.data && isValidLocationProofPayload(code.data)) {
            setPasteError(null);
            onVerifiedChange(true);
          } else {
            setPasteError("No campus check-in QR found in that image.");
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    },
    [onVerifiedChange]
  );

  if (verified) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-50/90 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-emerald-900">
            Campus check-in verified · +{LOCATION_QR_BONUS_XP} XP bonus applies
          </p>
          <button
            type="button"
            className="shrink-0 rounded-full border border-emerald-600/40 bg-white px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-600/10"
            onClick={() => onVerifiedChange(false)}
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-cq-keaney/40 bg-cq-keaneyIce/50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-cq-keaney">Campus proof (optional)</p>
      <p className="mt-1 text-sm text-ig-secondary">
        Scan a location check-in QR at an event or verified spot for{" "}
        <span className="font-semibold text-cq-navy">+{LOCATION_QR_BONUS_XP} bonus XP</span>.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full border border-cq-keaney/50 bg-white px-4 py-2 text-sm font-semibold text-cq-navy hover:bg-cq-keaneyIce"
          onClick={scanning ? stopScanning : startCamera}
        >
          {scanning ? "Stop camera" : "Scan QR code"}
        </button>
        <label className="cursor-pointer rounded-full border border-cq-keaney/50 bg-white px-4 py-2 text-sm font-semibold text-cq-navy hover:bg-cq-keaneyIce">
          Upload QR photo
          <input type="file" accept="image/*" className="sr-only" onChange={onFileFromGallery} />
        </label>
      </div>

      {cameraError ? <p className="mt-2 text-xs text-amber-800">{cameraError}</p> : null}

      {scanning ? (
        <div className="relative mt-3 overflow-hidden rounded-xl bg-black ring-1 ring-cq-keaney/30">
          <video ref={videoRef} className="aspect-[4/3] w-full object-cover" playsInline muted />
          <canvas ref={canvasRef} className="hidden" aria-hidden />
          <p className="absolute bottom-0 left-0 right-0 bg-black/55 px-2 py-1.5 text-center text-[11px] text-white">
            Point at the campus check-in QR
          </p>
        </div>
      ) : null}

      <div className="mt-3 border-t border-cq-keaney/25 pt-3">
        <label className="grid gap-1.5 text-sm font-medium text-cq-navy">
          Or paste check-in link
          <textarea
            className="min-h-16 rounded-xl border border-cq-keaney/40 bg-white px-3 py-2 text-sm text-cq-navy placeholder:text-ig-secondary/70"
            placeholder="e.g. campusquest://checkin/uri-event or a https://…/checkin/… link"
            value={pasteValue}
            onChange={(e) => {
              setPasteValue(e.target.value);
              setPasteError(null);
            }}
          />
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-full bg-cq-keaney/20 px-4 py-2 text-sm font-semibold text-cq-navy hover:bg-cq-keaney/30"
            onClick={() => applyPayload(pasteValue)}
          >
            Verify pasted link
          </button>
        </div>
        {pasteError ? <p className="mt-2 text-xs text-amber-800">{pasteError}</p> : null}
      </div>
    </div>
  );
}
