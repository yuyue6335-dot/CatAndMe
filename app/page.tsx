"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { CalendarHeart, Home, Leaf, MapPinned, Search } from "lucide-react";
import { CatIllustration } from "@/components/cat-illustration";
import { ExportImportPanel } from "@/components/export-import-panel";
import { MapView } from "@/components/map-view";
import { MemoryForm } from "@/components/memory-form";
import { MemoryList } from "@/components/memory-list";
import { Badge, Button, Card } from "@/components/ui";
import { db } from "@/lib/db";
import { loadMemoryView } from "@/lib/queries";
import type { Comment, Memory, MemoryTag, Photo, Place, Tag } from "@/lib/types";
import { makeId } from "@/lib/utils";

type Snapshot = {
  memories: Memory[];
  places: Place[];
  comments: Comment[];
  tags: Tag[];
  memoryTags: MemoryTag[];
  photos: Photo[];
};

const emptySnapshot: Snapshot = {
  memories: [],
  places: [],
  comments: [],
  tags: [],
  memoryTags: [],
  photos: []
};

export default function HomePage() {
  const data = useLiveQuery(loadMemoryView);
  const [query, setQuery] = useState("");
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const snapshot = data ?? emptySnapshot;
  const placeMap = useMemo(() => new Map(snapshot.places.map((place) => [place.id, place])), [snapshot.places]);

  const visibleMemories = useMemo(() => {
    const lower = query.trim().toLowerCase();
    if (!lower) return snapshot.memories;
    return snapshot.memories.filter(
      (memory) =>
        memory.title.toLowerCase().includes(lower) ||
        memory.note.toLowerCase().includes(lower) ||
        memory.visitDate.includes(lower)
    );
  }, [query, snapshot.memories]);

  const createFromForm = async (input: {
    memory: Memory;
    place: Place | null;
    tags: Tag[];
    comments: string[];
    photos: Photo[];
  }) => {
    await db.transaction(
      "rw",
      [db.memories, db.places, db.tags, db.comments, db.memoryTags, db.photos],
      async () => {
        const memory = { ...input.memory, placeId: input.place?.id ?? null };
        await db.memories.add(memory);
        if (input.place) await db.places.add(input.place);

        for (const tag of input.tags) {
          await db.tags.put(tag);
          await db.memoryTags.put({ id: makeId("memoryTag"), memoryId: memory.id, tagId: tag.id });
        }

        for (const body of input.comments) {
          await db.comments.add({
            id: makeId("comment"),
            memoryId: memory.id,
            author: "我",
            body,
            createdAt: Date.now(),
            updatedAt: Date.now()
          });
        }

        for (const photo of input.photos) {
          await db.photos.add(photo);
        }
      }
    );
  };

  const handleImport = async (input: Snapshot) => {
    await db.transaction("rw", [db.memories, db.places, db.comments, db.tags, db.memoryTags, db.photos], async () => {
      await Promise.all([
        db.memories.bulkPut(input.memories),
        db.places.bulkPut(input.places),
        db.comments.bulkPut(input.comments),
        db.tags.bulkPut(input.tags),
        db.memoryTags.bulkPut(input.memoryTags),
        db.photos.bulkPut(input.photos)
      ]);
    });
  };

  const toggleFavorite = async (memory: Memory) => {
    await db.memories.update(memory.id, { favorite: !memory.favorite, updatedAt: Date.now() });
  };

  const deleteMemory = async (memory: Memory) => {
    if (!window.confirm(`删除《${memory.title}》吗？`)) return;
    await db.transaction("rw", [db.memories, db.comments, db.memoryTags, db.photos], async () => {
      await Promise.all([
        db.memories.delete(memory.id),
        db.comments.where("memoryId").equals(memory.id).delete(),
        db.memoryTags.where("memoryId").equals(memory.id).delete(),
        db.photos.where("memoryId").equals(memory.id).delete()
      ]);
    });
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-5 md:px-6 md:py-8">
      <section className="grid gap-4 lg:grid-cols-[1.45fr_0.75fr]">
        <Card className="relative min-h-[260px] overflow-hidden p-6 md:p-8">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#dff2e5]" />
          <div className="absolute right-8 top-8 hidden h-24 w-24 rounded-full bg-[#f1d8d1]/45 blur-2xl md:block" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#edf8ef] px-3 py-1 text-sm font-medium text-[#3f7d52]">
              <Leaf className="h-4 w-4" />
              <span>离线优先 · 两个人的回忆地图</span>
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-text md:text-5xl">猫与回忆</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted md:text-base">
              把照片、评论、地点和日期放在同一条时间线上，再用地图把它们连起来。轻轻记录，慢慢长成属于你们的地方。
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge>
                <CalendarHeart className="mr-1 h-3.5 w-3.5" />
                时间线 + 地图
              </Badge>
              <Badge>
                <MapPinned className="mr-1 h-3.5 w-3.5" />
                本地加密备份
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="relative flex min-h-[260px] flex-col justify-between overflow-hidden p-6">
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#e9f4ef] to-transparent" />
          <div className="relative">
            <p className="text-sm font-semibold text-text">今日记录</p>
            <p className="mt-2 text-sm leading-6 text-muted">离线保存，本地备份，之后可以导出给另一台设备。</p>
          </div>
          <CatIllustration className="relative mx-auto mt-4 h-40 w-full max-w-[240px]" />
        </Card>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
        <div className="grid gap-5">
          <Card className="p-3">
            <div className="flex h-12 items-center gap-3 rounded-xl bg-[#f4f7f6] px-3 transition focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10">
              <Search className="h-4 w-4 shrink-0 text-[#4b8258]" />
              <input
                className="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted/70"
                placeholder="搜索标题、备注或日期"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </Card>

          <MemoryForm onCreate={createFromForm} pickedLocation={pickedLocation} />
          <MemoryList
            memories={visibleMemories}
            places={snapshot.places}
            tags={snapshot.tags}
            memoryTags={snapshot.memoryTags}
            comments={snapshot.comments}
            photos={snapshot.photos}
            onDelete={deleteMemory}
            onToggleFavorite={toggleFavorite}
          />
        </div>

        <aside className="grid gap-5 lg:sticky lg:top-6">
          <MapView places={snapshot.places} onPick={(lat, lng) => setPickedLocation({ lat, lng })} />
          <ExportImportPanel snapshot={snapshot} onImport={handleImport} />
          <Card className="p-5 text-sm leading-6 text-muted">
            <p className="text-base font-semibold text-text">当前状态</p>
            <p className="mt-3">
              {snapshot.memories.length} 条回忆，{snapshot.places.length} 个地点，{snapshot.photos.length} 张照片。
            </p>
            <p className="mt-2">
              {placeMap.size ? "地图已连接到本地点位数据。" : "还没有地点，先添加第一段回忆吧。"}
            </p>
          </Card>
          <Button className="justify-start" variant="secondary">
            <Home className="h-4 w-4" />
            <span>主页</span>
          </Button>
        </aside>
      </section>
    </main>
  );
}
