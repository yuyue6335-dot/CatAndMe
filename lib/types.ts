export type Memory = {
  id: string;
  title: string;
  note: string;
  visitDate: string;
  placeId: string | null;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
};

export type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  source: "manual" | "photo";
  createdAt: number;
  updatedAt: number;
};

export type Comment = {
  id: string;
  memoryId: string;
  author: string;
  body: string;
  createdAt: number;
  updatedAt: number;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
  createdAt: number;
  updatedAt: number;
};

export type MemoryTag = {
  id: string;
  memoryId: string;
  tagId: string;
};

export type Photo = {
  id: string;
  memoryId: string;
  name: string;
  mimeType: string;
  storagePath: string;
  url: string;
  width: number | null;
  height: number | null;
  lat: number | null;
  lng: number | null;
  createdAt: number;
  updatedAt: number;
};

export type PhotoDraft = Omit<Photo, "storagePath" | "url"> & {
  file: File | Blob;
};

export type ExportBundle = {
  id: string;
  label: string;
  createdAt: number;
  size: number;
};

export type DBSnapshotPhoto = Omit<Photo, "url"> & { fileBase64: string };

export type DBSnapshot = {
  version: 1;
  exportedAt: string;
  memories: Memory[];
  places: Place[];
  comments: Comment[];
  tags: Tag[];
  memoryTags: MemoryTag[];
  photos: DBSnapshotPhoto[];
};

export type MemoryView = {
  memories: Memory[];
  places: Place[];
  comments: Comment[];
  tags: Tag[];
  memoryTags: MemoryTag[];
  photos: Photo[];
};
