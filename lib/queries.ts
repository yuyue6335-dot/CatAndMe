import { db } from "./db";

export async function loadMemoryView() {
  const [memories, places, comments, tags, memoryTags, photos] = await Promise.all([
    db.memories.orderBy("updatedAt").reverse().toArray(),
    db.places.toArray(),
    db.comments.toArray(),
    db.tags.toArray(),
    db.memoryTags.toArray(),
    db.photos.toArray()
  ]);

  return { memories, places, comments, tags, memoryTags, photos };
}

