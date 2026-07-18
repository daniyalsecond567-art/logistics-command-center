import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mudnkztswqhhtlxuclcc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7CY6IlliUzoFDxmfhnIKxg_p1FaY7Vo";
const BUCKET = "audio";

let _client: ReturnType<typeof createClient> | null = null;
function client() {
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

export interface SupabaseUploadResult {
  secure_url: string;
  path: string;
  bytes: number;
}

export async function uploadAudioToSupabase(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<SupabaseUploadResult> {
  // supabase-js v2 doesn't emit progress; simulate start/end
  onProgress?.(5);
  const ext = file.name.split(".").pop() || "mp3";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await client()
    .storage.from(BUCKET)
    .upload(path, file, { contentType: file.type || "audio/mpeg", upsert: false });
  if (error) throw new Error(`Supabase upload failed: ${error.message}`);
  onProgress?.(100);
  const { data } = client().storage.from(BUCKET).getPublicUrl(path);
  return { secure_url: data.publicUrl, path, bytes: file.size };
}
