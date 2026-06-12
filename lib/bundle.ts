import type { Comment, DBSnapshot, Memory, MemoryTag, Photo, Place, Tag } from "./types";
import { bytesToBase64, base64ToBytes } from "./utils";

export async function snapshotToJSON(snapshot: {
  memories: Memory[];
  places: Place[];
  comments: Comment[];
  tags: Tag[];
  memoryTags: MemoryTag[];
  photos: Photo[];
}) {
  const photos = await Promise.all(
    snapshot.photos.map(async (photo) => ({
      ...photo,
      fileBase64: bytesToBase64(new Uint8Array(await photo.file.arrayBuffer()))
    }))
  );

  const json: DBSnapshot = {
    version: 1,
    exportedAt: new Date().toISOString(),
    memories: snapshot.memories,
    places: snapshot.places,
    comments: snapshot.comments,
    tags: snapshot.tags,
    memoryTags: snapshot.memoryTags,
    photos
  };

  return JSON.stringify(json);
}

export function jsonToSnapshot(json: string): DBSnapshot {
  return JSON.parse(json) as DBSnapshot;
}

export function hydratePhotos(photos: DBSnapshot["photos"]) {
  return photos.map(({ fileBase64, ...photo }) => ({
    ...photo,
    file: new Blob([base64ToBytes(fileBase64)], { type: photo.mimeType })
  }));
}
