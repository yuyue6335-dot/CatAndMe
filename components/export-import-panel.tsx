"use client";

import { useState } from "react";
import { ArchiveRestore, Lock, ShieldCheck } from "lucide-react";
import { Button, Card, Input } from "./ui";
import { decryptJSON, encryptJSON } from "@/lib/crypto";
import { hydratePhotos, jsonToSnapshot, snapshotToJSON } from "@/lib/bundle";
import type { Comment, Memory, MemoryTag, Photo, Place, Tag } from "@/lib/types";

type Snapshot = {
  memories: Memory[];
  places: Place[];
  comments: Comment[];
  tags: Tag[];
  memoryTags: MemoryTag[];
  photos: Photo[];
};

export function ExportImportPanel({
  snapshot,
  onImport
}: {
  snapshot: Snapshot;
  onImport: (snapshot: Snapshot) => Promise<void> | void;
}) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("支持加密导出和恢复导入。");

  const handleExport = async () => {
    const json = await snapshotToJSON(snapshot);
    const payload = password ? await encryptJSON(json, password) : { encrypted: false, payload: json };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `memory-bundle-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("已导出备份。");
  };

  const handleImport = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    const raw = JSON.parse(text) as
      | { encrypted: false; payload: string }
      | { encrypted: true; payload: string; salt: string; iv: string };

    if (raw.encrypted && !password) {
      setStatus("请输入导出时使用的密码。");
      return;
    }

    const json = raw.encrypted ? await decryptJSON(raw.payload, password, raw.salt, raw.iv) : raw.payload;
    const parsed = jsonToSnapshot(json);
    await onImport({
      memories: parsed.memories,
      places: parsed.places,
      comments: parsed.comments,
      tags: parsed.tags,
      memoryTags: parsed.memoryTags,
      photos: hydratePhotos(parsed.photos) as Photo[]
    });
    setStatus("已导入备份。");
  };

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e4f4e6] text-[#3e7d50]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold">加密备份</h2>
          <p className="text-xs text-muted">导出成一个文件，发给另一台设备也能恢复</p>
        </div>
      </div>

      <div className="grid gap-3">
        <Input
          placeholder="导出/导入密码（可选）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleExport}>
            <Lock className="h-4 w-4" />
            导出备份
          </Button>
          <label className="inline-flex cursor-pointer">
            <span className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white/70 px-4 text-sm font-medium transition hover:bg-white">
              <ArchiveRestore className="h-4 w-4" />
              导入备份
            </span>
            <input
              className="hidden"
              type="file"
              accept="application/json"
              onChange={(e) => void handleImport(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <p className="text-xs text-muted">{status}</p>
      </div>
    </Card>
  );
}
