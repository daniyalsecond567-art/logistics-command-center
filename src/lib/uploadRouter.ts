import { uploadAudioToCloudinary } from "./cloudinary";
import { uploadAudioToSupabase } from "./supabaseStorage";

export interface RoutedUploadResult {
  audioUrl: string;
  duration: number;
  bytes: number;
}

/** Probe audio duration in the background using an object URL. Never throws. */
function probeDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const a = document.createElement("audio");
      a.preload = "metadata";
      a.src = url;
      const done = (d: number) => {
        URL.revokeObjectURL(url);
        resolve(Number.isFinite(d) ? d : 0);
      };
      a.onloadedmetadata = () => done(a.duration);
      a.onerror = () => done(0);
      setTimeout(() => done(a.duration || 0), 8000);
    } catch {
      resolve(0);
    }
  });
}

/**
 * Routes uploads across Cloudinary and Supabase Storage using round-robin.
 * Falls over to the other provider on failure. Duration is probed in
 * parallel with the upload so we never block the network on it.
 */
export async function uploadAudioBalanced(
  file: File,
  currentCount: number,
  onProgress?: (pct: number) => void,
): Promise<RoutedUploadResult> {
  const durationPromise = probeDuration(file);

  const providers = [
    async () => {
      const r = await uploadAudioToCloudinary(file, onProgress);
      return { audioUrl: r.secure_url, duration: r.duration ?? 0, bytes: r.bytes };
    },
    async () => {
      const r = await uploadAudioToSupabase(file, onProgress);
      return { audioUrl: r.secure_url, duration: 0, bytes: r.bytes };
    },
  ];

  const primaryIdx = currentCount % 2;
  const order = [providers[primaryIdx], providers[1 - primaryIdx]];

  let lastErr: unknown;
  for (const run of order) {
    try {
      const res = await run();
      if (!res.duration) res.duration = await durationPromise;
      return res;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("All storage providers failed.");
}
