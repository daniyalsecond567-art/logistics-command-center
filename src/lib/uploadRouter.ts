import { uploadAudioToCloudinary } from "./cloudinary";
import { uploadAudioToSupabase } from "./supabaseStorage";

export interface RoutedUploadResult {
  audioUrl: string;
  duration: number;
  bytes: number;
}

/**
 * Routes uploads across Cloudinary and Supabase Storage using a round-robin
 * strategy based on the current item count. Falls over to the other provider
 * on failure. Only one provider stores the file; only one URL is returned.
 */
export async function uploadAudioBalanced(
  file: File,
  currentCount: number,
  onProgress?: (pct: number) => void,
): Promise<RoutedUploadResult> {
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
      return await run();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("All storage providers failed.");
}
