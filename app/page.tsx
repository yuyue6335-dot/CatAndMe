"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarHeart, Home, Leaf, LogIn, LogOut, MapPinned, Search } from "lucide-react";
import { CatIllustration } from "@/components/cat-illustration";
import { ExportImportPanel } from "@/components/export-import-panel";
import { MapView } from "@/components/map-view";
import { MemoryForm } from "@/components/memory-form";
import { MemoryList } from "@/components/memory-list";
import { Badge, Button, Card } from "@/components/ui";
import { AuthenticationRequiredError, loadMemoryView, requestMemoryView } from "@/lib/queries";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { DBSnapshot, Memory, MemoryView, PhotoDraft, Place, Tag } from "@/lib/types";

const emptySnapshot: MemoryView = {
  memories: [],
  places: [],
  comments: [],
  tags: [],
  memoryTags: [],
  photos: []
};

export default function HomePage() {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<MemoryView>(emptySnapshot);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const reload = async () => {
    try {
      setError("");
      setSnapshot(await loadMemoryView());
      setSignedIn(true);
    } catch (loadError) {
      if (loadError instanceof AuthenticationRequiredError) {
        setSignedIn(false);
        setSnapshot(emptySnapshot);
        return;
      }
      setError(loadError instanceof Error ? loadError.message : "加载回忆失败。");
    }
  };

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    void (async () => {
      const { data } = await supabase.auth.getUser();
      setSignedIn(Boolean(data.user));
    })();
    void reload().finally(() => setLoading(false));
  }, []);

  const redirectToLogin = () => {
    router.push("/login?next=/");
  };

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
    photos: PhotoDraft[];
  }) => {
    try {
      const created = await requestMemoryView("/api/memories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          memory: input.memory,
          place: input.place,
          tags: input.tags,
          comments: input.comments
        })
      });

      setSnapshot(created);
      setSignedIn(true);

      let nextSnapshot = created;
      for (const photo of input.photos) {
        const formData = new FormData();
        formData.append("memoryId", input.memory.id);
        formData.append("photoId", photo.id);
        formData.append("file", photo.file, photo.name);
        if (photo.lat !== null) formData.append("lat", String(photo.lat));
        if (photo.lng !== null) formData.append("lng", String(photo.lng));
        formData.append("createdAt", String(photo.createdAt));
        formData.append("updatedAt", String(photo.updatedAt));

        nextSnapshot = await requestMemoryView("/api/photos/upload", {
          method: "POST",
          body: formData
        });
      }

      setSnapshot(nextSnapshot);
    } catch (createError) {
      if (createError instanceof AuthenticationRequiredError) {
        redirectToLogin();
        return;
      }
      setError(createError instanceof Error ? createError.message : "保存回忆失败。");
    }
  };

  const handleImport = async (input: DBSnapshot) => {
    try {
      setSnapshot(
        await requestMemoryView("/api/import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(input)
        })
      );
      setSignedIn(true);
    } catch (importError) {
      if (importError instanceof AuthenticationRequiredError) {
        redirectToLogin();
        return;
      }
      setError(importError instanceof Error ? importError.message : "导入回忆失败。");
    }
  };

  const toggleFavorite = async (memory: Memory) => {
    try {
      setSnapshot(
        await requestMemoryView(`/api/memories/${memory.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ favorite: !memory.favorite })
        })
      );
    } catch (favoriteError) {
      if (favoriteError instanceof AuthenticationRequiredError) {
        redirectToLogin();
        return;
      }
      setError(favoriteError instanceof Error ? favoriteError.message : "更新回忆失败。");
    }
  };

  const deleteMemory = async (memory: Memory) => {
    if (!window.confirm(`删除「${memory.title}」吗？`)) return;
    try {
      setSnapshot(
        await requestMemoryView(`/api/memories/${memory.id}`, {
          method: "DELETE"
        })
      );
    } catch (deleteError) {
      if (deleteError instanceof AuthenticationRequiredError) {
        redirectToLogin();
        return;
      }
      setError(deleteError instanceof Error ? deleteError.message : "删除回忆失败。");
    }
  };

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setSignedIn(false);
    setSnapshot(emptySnapshot);
    router.replace("/login?next=/");
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
              <span>云端同步 · 两个人的回忆地图</span>
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
                云端备份
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="relative flex min-h-[260px] flex-col justify-between overflow-hidden p-6">
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#e9f4ef] to-transparent" />
          <div className="relative">
            <p className="text-sm font-semibold text-text">今日记录</p>
            <p className="mt-2 text-sm leading-6 text-muted">数据保存到 Supabase，照片存入 Storage，并保留加密导入导出。</p>
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
          {error ? <Card className="p-5 text-sm text-muted">{error}</Card> : null}
          {loading ? (
            <Card className="p-6 text-sm text-muted">正在加载回忆...</Card>
          ) : (
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
          )}
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
              {placeMap.size ? "地图已连接到云端地点数据。" : "还没有地点，先添加第一段回忆吧。"}
            </p>
          </Card>
          <Link href={signedIn ? "/memories" : "/login?next=/memories"}>
            <Button className="w-full justify-start" variant="secondary">
              {signedIn ? <Home className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              <span>{signedIn ? "我的回忆" : "登录查看回忆"}</span>
            </Button>
          </Link>
          {signedIn ? (
            <Button className="justify-start" type="button" variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              <span>退出登录</span>
            </Button>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
