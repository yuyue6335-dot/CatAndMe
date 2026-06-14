import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  doublePrecision,
  integer,
  pgTable,
  primaryKey,
  text,
  uniqueIndex
} from "drizzle-orm/pg-core";

const timestampMs = (name: string) => bigint(name, { mode: "number" }).notNull();

export const places = pgTable("places", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  address: text("address").notNull().default(""),
  source: text("source").notNull(),
  createdAt: timestampMs("created_at"),
  updatedAt: timestampMs("updated_at")
});

export const memories = pgTable("memories", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  note: text("note").notNull().default(""),
  visitDate: text("visit_date").notNull(),
  placeId: text("place_id").references(() => places.id, { onDelete: "set null" }),
  favorite: boolean("favorite").notNull().default(false),
  createdAt: timestampMs("created_at"),
  updatedAt: timestampMs("updated_at")
});

export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  memoryId: text("memory_id")
    .notNull()
    .references(() => memories.id, { onDelete: "cascade" }),
  author: text("author").notNull(),
  body: text("body").notNull(),
  createdAt: timestampMs("created_at"),
  updatedAt: timestampMs("updated_at")
});

export const tags = pgTable(
  "tags",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    color: text("color").notNull(),
    createdAt: timestampMs("created_at"),
    updatedAt: timestampMs("updated_at")
  },
  (table) => [uniqueIndex("tags_user_name_idx").on(table.userId, table.name)]
);

export const memoryTags = pgTable(
  "memory_tags",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    memoryId: text("memory_id")
      .notNull()
      .references(() => memories.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" })
  },
  (table) => [uniqueIndex("memory_tags_memory_tag_idx").on(table.memoryId, table.tagId)]
);

export const photos = pgTable("photos", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  memoryId: text("memory_id")
    .notNull()
    .references(() => memories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  mimeType: text("mime_type").notNull(),
  storagePath: text("storage_path").notNull(),
  width: integer("width"),
  height: integer("height"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  createdAt: timestampMs("created_at"),
  updatedAt: timestampMs("updated_at")
});

export const exportBundles = pgTable("export_bundles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  label: text("label").notNull(),
  createdAt: timestampMs("created_at"),
  size: integer("size").notNull()
});

export const memoriesRelations = relations(memories, ({ one, many }) => ({
  place: one(places, {
    fields: [memories.placeId],
    references: [places.id]
  }),
  comments: many(comments),
  memoryTags: many(memoryTags),
  photos: many(photos)
}));

export const placesRelations = relations(places, ({ many }) => ({
  memories: many(memories)
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  memory: one(memories, {
    fields: [comments.memoryId],
    references: [memories.id]
  })
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  memoryTags: many(memoryTags)
}));

export const memoryTagsRelations = relations(memoryTags, ({ one }) => ({
  memory: one(memories, {
    fields: [memoryTags.memoryId],
    references: [memories.id]
  }),
  tag: one(tags, {
    fields: [memoryTags.tagId],
    references: [tags.id]
  })
}));

export const photosRelations = relations(photos, ({ one }) => ({
  memory: one(memories, {
    fields: [photos.memoryId],
    references: [memories.id]
  })
}));
