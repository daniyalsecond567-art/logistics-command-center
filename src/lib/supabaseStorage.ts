const SUPABASE_URL = "https://mudnkztswqhhtlxuclcc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7CY6IlliUzoFDxmfhnIKxg_p1FaY7Vo";
const BUCKET = "audio";

export interface SupabaseUploadResult {
  secure_url: string;
  path: string;
  bytes: number;
}

/**
 * Direct streaming upload to Supabase Storage via XHR for real progress and
 * minimal overhead. Starts immediately, no client bootstrap wait.
 */
export async function uploadAudioToSupabase(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<SupabaseUploadResult> {
  const ext = file.name.split(".").pop() || "mp3";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(path)}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${SUPABASE_PUBLISHABLE_KEY}`);
    xhr.setRequestHeader("apikey", SUPABASE_PUBLISHABLE_KEY);
    xhr.setRequestHeader("Content-Type", file.type || "audio/mpeg");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Supabase upload failed (${xhr.status}): ${xhr.responseText}`));
    xhr.onerror = () => reject(new Error("Network error during Supabase upload"));
    xhr.send(file);
  });

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(path)}`;
  return { secure_url: publicUrl, path, bytes: file.size };
}
