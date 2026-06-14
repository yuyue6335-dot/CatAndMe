"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Search } from "lucide-react";
import { MemoryList } from "@/components/memory-list";
import { Button, Card } from "@/components/ui";
import { AuthenticationRequiredError, loadMemoryView, requestMemoryView } from "@/lib/queries";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { Memory, MemoryView } from "@/lib/types";

const emptySnapshot: MemoryView = {
  memories: [],
  places: [],
  comments: [],
  tags: [],
  memoryTags: [],
  photos: []
};

export default function MemoriesPage() {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<MemoryView>(emptySnapshot);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const redirectToLogin = () => {
    router.replace("/login?next=/memories");
  };

  const goBack = () => {
    const referrer = document.referrer ? new URL(document.referrer) : null;
    const canReturnToPreviousPage =
      referrer?.origin === window.location.origin && referrer.pathname !== "/login" && referrer.pathname !== window.location.pathname;

    if (window.history.length > 1 && canReturnToPreviousPage) {
      router.back();
      return;
    }

    router.replace("/");
  };

  const load = async () => {
    try {
      setError("");
      setSnapshot(await loadMemoryView());
    } catch (loadError) {
      if (loadError instanceof AuthenticationRequiredError) {
        redirectToLogin();
        return;
      }
      setError(loadError instanceof Error ? loadError.message : "加载回忆失败。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

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
    } catch (actionError) {
      if (actionError instanceof AuthenticationRequiredError) {
        redirectToLogin();
        return;
      }
      setError(actionError instanceof Error ? actionError.message : "更新回忆失败。");
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
    } catch (actionError) {
      if (actionError instanceof AuthenticationRequiredError) {
        redirectToLogin();
        return;
      }
      setError(actionError instanceof Error ? actionError.message : "删除回忆失败。");
    }
  };

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login?next=/memories");
  };

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-5 md:px-6 md:py-8">
      <header className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Button type="button" variant="ghost" className="px-0 text-muted hover:text-text" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-text md:text-4xl">我的回忆</h1>
          <p className="mt-2 text-sm leading-6 text-muted">查看这个账号已经创建的全部回忆。</p>
        </div>
        <Button type="button" variant="outline" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          退出登录
        </Button>
      </header>

      <div className="mb-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <Card className="p-3">
          <div className="flex h-12 items-center gap-3 rounded-xl bg-[#f4f7f6] px-3 transition focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10">
            <Search className="h-4 w-4 shrink-0 text-[#4b8258]" />
            <input
              className="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted/70"
              placeholder="搜索标题、备注或日期"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </Card>
        <Card className="px-5 py-4 text-sm text-muted">
          <span className="font-semibold text-text">{snapshot.memories.length}</span> 条回忆
        </Card>
      </div>

      {error ? <Card className="mb-5 p-5 text-sm text-muted">{error}</Card> : null}

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
    </main>
  );
}
