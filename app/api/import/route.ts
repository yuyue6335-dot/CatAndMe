import { NextResponse } from "next/server";
import { getCurrentUserId, isAuthenticationError } from "@/lib/server/auth";
import { importSnapshotForUser, loadMemoryViewForUser } from "@/lib/server/data";
import { buildPhotoPath, getAdminSupabase, getStorageBucket } from "@/lib/server/storage";
import type { DBSnapshot } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const snapshot = (await request.json()) as DBSnapshot;

    if (snapshot.version !== 1) {
      return NextResponse.json({ error: "Unsupported import version." }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    await importSnapshotForUser(userId, snapshot, async ({ fileBase64, ...photo }) => {
      const storagePath = buildPhotoPath(userId, photo.memoryId, photo.id, photo.name);
      const bytes = Buffer.from(fileBase64, "base64");
      const { error } = await supabase.storage.from(getStorageBucket()).upload(storagePath, bytes, {
        contentType: photo.mimeType || "image/jpeg",
        upsert: true
      });

      if (error) throw error;

      return {
        ...photo,
        storagePath,
        url: ""
      };
    });

    return NextResponse.json(await loadMemoryViewForUser(userId), { status: 201 });
  } catch (error) {
    if (isAuthenticationError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to import snapshot." }, { status: 500 });
  }
}
