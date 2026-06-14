import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "./db";
import { getPublicPhotoUrl, removeStorageFiles } from "./storage";
import { comments, memoryTags, memories, photos, places, tags } from "./schema";
import { makeId } from "@/lib/utils";
import type { Comment, DBSnapshot, Memory, MemoryTag, MemoryView, Photo, Place, Tag } from "@/lib/types";

export type CreateMemoryInput = {
  memory: Memory;
  place: Place | null;
  tags: Tag[];
  comments: string[];
};

export async function loadMemoryViewForUser(userId: string): Promise<MemoryView> {
  const database = getDb();
  const [memoryRows, placeRows, commentRows, tagRows, memoryTagRows, photoRows] = await Promise.all([
    database.select().from(memories).where(eq(memories.userId, userId)).orderBy(desc(memories.updatedAt)),
    database.select().from(places).where(eq(places.userId, userId)),
    database.select().from(comments).where(eq(comments.userId, userId)),
    database.select().from(tags).where(eq(tags.userId, userId)),
    database.select().from(memoryTags).where(eq(memoryTags.userId, userId)),
    database.select().from(photos).where(eq(photos.userId, userId))
  ]);

  return {
    memories: memoryRows,
    places: placeRows as Place[],
    comments: commentRows as Comment[],
    tags: tagRows as Tag[],
    memoryTags: memoryTagRows as MemoryTag[],
    photos: photoRows.map((photo) => ({ ...photo, url: getPublicPhotoUrl(photo.storagePath) }))
  };
}

export async function createMemoryForUser(userId: string, input: CreateMemoryInput) {
  const database = getDb();
  const now = Date.now();

  await database.transaction(async (tx) => {
    const place = input.place ? { ...input.place, userId } : null;
    if (place) {
      await tx
        .insert(places)
        .values(place)
        .onConflictDoUpdate({
          target: places.id,
          set: {
            name: place.name,
            lat: place.lat,
            lng: place.lng,
            address: place.address,
            source: place.source,
            updatedAt: place.updatedAt
          }
        });
    }

    await tx.insert(memories).values({
      ...input.memory,
      userId,
      placeId: place?.id ?? null
    });

    for (const tag of input.tags) {
      await tx
        .insert(tags)
        .values({ ...tag, userId })
        .onConflictDoUpdate({
          target: tags.id,
          set: {
            name: tag.name,
            color: tag.color,
            updatedAt: tag.updatedAt
          }
        });

      await tx
        .insert(memoryTags)
        .values({
          id: makeId("memoryTag"),
          userId,
          memoryId: input.memory.id,
          tagId: tag.id
        })
        .onConflictDoNothing();
    }

    for (const body of input.comments) {
      await tx.insert(comments).values({
        id: makeId("comment"),
        userId,
        memoryId: input.memory.id,
        author: "我",
        body,
        createdAt: now,
        updatedAt: now
      });
    }
  });
}

export async function updateMemoryFavoriteForUser(userId: string, memoryId: string, favorite: boolean) {
  const database = getDb();
  const [updated] = await database
    .update(memories)
    .set({ favorite, updatedAt: Date.now() })
    .where(and(eq(memories.id, memoryId), eq(memories.userId, userId)))
    .returning();

  return updated ?? null;
}

export async function deleteMemoryForUser(userId: string, memoryId: string) {
  const database = getDb();
  const photoRows = await database
    .select({ storagePath: photos.storagePath })
    .from(photos)
    .where(and(eq(photos.userId, userId), eq(photos.memoryId, memoryId)));

  await database.delete(memories).where(and(eq(memories.id, memoryId), eq(memories.userId, userId)));
  await removeStorageFiles(photoRows.map((photo) => photo.storagePath));
}

export async function importSnapshotForUser(userId: string, snapshot: DBSnapshot, uploadPhoto: (photo: DBSnapshot["photos"][number]) => Promise<Photo>) {
  const database = getDb();

  await database.transaction(async (tx) => {
    if (snapshot.places.length) {
      await tx
        .insert(places)
        .values(snapshot.places.map((place) => ({ ...place, userId })))
        .onConflictDoUpdate({
          target: places.id,
          set: {
            name: sql`excluded.name`,
            lat: sql`excluded.lat`,
            lng: sql`excluded.lng`,
            address: sql`excluded.address`,
            source: sql`excluded.source`,
            updatedAt: sql`excluded.updated_at`
          }
        });
    }

    if (snapshot.memories.length) {
      await tx
        .insert(memories)
        .values(snapshot.memories.map((memory) => ({ ...memory, userId })))
        .onConflictDoUpdate({
          target: memories.id,
          set: {
            title: sql`excluded.title`,
            note: sql`excluded.note`,
            visitDate: sql`excluded.visit_date`,
            placeId: sql`excluded.place_id`,
            favorite: sql`excluded.favorite`,
            updatedAt: sql`excluded.updated_at`
          }
        });
    }

    if (snapshot.tags.length) {
      await tx
        .insert(tags)
        .values(snapshot.tags.map((tag) => ({ ...tag, userId })))
        .onConflictDoUpdate({
          target: tags.id,
          set: {
            name: sql`excluded.name`,
            color: sql`excluded.color`,
            updatedAt: sql`excluded.updated_at`
          }
        });
    }

    if (snapshot.comments.length) {
      await tx
        .insert(comments)
        .values(snapshot.comments.map((comment) => ({ ...comment, userId })))
        .onConflictDoUpdate({
          target: comments.id,
          set: {
            body: sql`excluded.body`,
            author: sql`excluded.author`,
            updatedAt: sql`excluded.updated_at`
          }
        });
    }

    if (snapshot.memoryTags.length) {
      await tx
        .insert(memoryTags)
        .values(snapshot.memoryTags.map((memoryTag) => ({ ...memoryTag, userId })))
        .onConflictDoNothing();
    }
  });

  const uploadedPhotos = await Promise.all(snapshot.photos.map(uploadPhoto));

  if (uploadedPhotos.length) {
    await database
      .insert(photos)
      .values(uploadedPhotos.map(({ url, ...photo }) => ({ ...photo, userId })))
      .onConflictDoUpdate({
        target: photos.id,
        set: {
          name: sql`excluded.name`,
          mimeType: sql`excluded.mime_type`,
          storagePath: sql`excluded.storage_path`,
          width: sql`excluded.width`,
          height: sql`excluded.height`,
          lat: sql`excluded.lat`,
          lng: sql`excluded.lng`,
          updatedAt: sql`excluded.updated_at`
        }
      });
  }
}

export async function insertPhotoForUser(userId: string, photo: Omit<Photo, "url">) {
  const database = getDb();
  const [created] = await database
    .insert(photos)
    .values({ ...photo, userId })
    .onConflictDoUpdate({
      target: photos.id,
      set: {
        name: photo.name,
        mimeType: photo.mimeType,
        storagePath: photo.storagePath,
        width: photo.width,
        height: photo.height,
        lat: photo.lat,
        lng: photo.lng,
        updatedAt: photo.updatedAt
      }
    })
    .returning();

  return { ...created, url: getPublicPhotoUrl(created.storagePath) };
}

export async function getMemoryPhotoPaths(userId: string, memoryIds: string[]) {
  if (!memoryIds.length) return [];
  const database = getDb();
  return database
    .select({ storagePath: photos.storagePath })
    .from(photos)
    .where(and(eq(photos.userId, userId), inArray(photos.memoryId, memoryIds)));
}
