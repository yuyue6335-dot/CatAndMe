import { NextResponse } from "next/server";
import { getCurrentUserId, isAuthenticationError } from "@/lib/server/auth";
import { insertPhotoForUser, loadMemoryViewForUser } from "@/lib/server/data";
import { buildPhotoPath, getAdminSupabase, getStorageBucket } from "@/lib/server/storage";
import { makeId } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const formData = await request.formData();
    const file = formData.get("file");
    const memoryId = formData.get("memoryId");
    const photoId = (formData.get("photoId") as string | null) || makeId("photo");

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "file is required." }, { status: 400 });
    }

    if (typeof memoryId !== "string" || !memoryId) {
      return NextResponse.json({ error: "memoryId is required." }, { status: 400 });
    }

    const now = Date.now();
    const fileName = "name" in file && typeof file.name === "string" ? file.name : `${photoId}.jpg`;
    const storagePath = buildPhotoPath(userId, memoryId, photoId, fileName);
    const supabase = getAdminSupabase();
    const { error } = await supabase.storage.from(getStorageBucket()).upload(storagePath, file, {
      contentType: file.type || "image/jpeg",
      upsert: true
    });

    if (error) throw error;

    await insertPhotoForUser(userId, {
      id: photoId,
      memoryId,
      name: fileName,
      mimeType: file.type || "image/jpeg",
      storagePath,
      width: null,
      height: null,
      lat: numberFromForm(formData.get("lat")),
      lng: numberFromForm(formData.get("lng")),
      createdAt: numberFromForm(formData.get("createdAt")) ?? now,
      updatedAt: numberFromForm(formData.get("updatedAt")) ?? now
    });

    return NextResponse.json(await loadMemoryViewForUser(userId), { status: 201 });
  } catch (error) {
    if (isAuthenticationError(error)) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to upload photo." }, { status: 500 });
  }
}

function numberFromForm(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
