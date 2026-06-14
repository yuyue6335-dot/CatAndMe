import { createClient } from "@supabase/supabase-js";

export function getStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || "memory-photos";
}

export function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service role storage credentials are required.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function buildPhotoPath(userId: string, memoryId: string, photoId: string, fileName: string) {
  const extension = fileName.includes(".") ? fileName.split(".").pop() : "jpg";
  const safeExtension = extension?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
  return `${userId}/${memoryId}/${photoId}.${safeExtension.toLowerCase()}`;
}

export function getPublicPhotoUrl(storagePath: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return "";

  const baseUrl = supabaseUrl.replace(/\/$/, "");
  return `${baseUrl}/storage/v1/object/public/${getStorageBucket()}/${storagePath}`;
}

export async function removeStorageFiles(paths: string[]) {
  if (!paths.length) return;

  const supabase = getAdminSupabase();
  const { error } = await supabase.storage.from(getStorageBucket()).remove(paths);
  if (error) throw error;
}
