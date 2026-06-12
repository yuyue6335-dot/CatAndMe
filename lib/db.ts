import Dexie, { type Table } from "dexie";
import type { Comment, ExportBundle, Memory, MemoryTag, Photo, Place, Tag } from "./types";

class MemoryDB extends Dexie {
  memories!: Table<Memory, string>;
  places!: Table<Place, string>;
  comments!: Table<Comment, string>;
  tags!: Table<Tag, string>;
  memoryTags!: Table<MemoryTag, string>;
  photos!: Table<Photo, string>;
  exportBundles!: Table<ExportBundle, string>;

  constructor() {
    super("cats-memory-lodge");
    this.version(1).stores({
      memories: "id, visitDate, updatedAt, placeId, favorite",
      places: "id, updatedAt, lat, lng",
      comments: "id, memoryId, updatedAt, createdAt",
      tags: "id, name, updatedAt",
      memoryTags: "id, memoryId, tagId",
      photos: "id, memoryId, createdAt, updatedAt",
      exportBundles: "id, createdAt"
    });
  }
}

export const db = new MemoryDB();
