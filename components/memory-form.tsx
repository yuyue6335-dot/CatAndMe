"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import * as exifr from "exifr";
import { ImagePlus, MapPinned, MessageSquarePlus, Sparkles } from "lucide-react";
import { Button, Card, Input, Textarea } from "./ui";
import { makeId } from "@/lib/utils";
import type { Memory, Place, Photo, Tag } from "@/lib/types";

type Draft = {
  title: string;
  note: string;
  visitDate: string;
  placeName: string;
  placeAddress: string;
  lat: string;
  lng: string;
  tag: string;
  comment: string;
};

const createEmptyDraft = (): Draft => ({
  title: "",
  note: "",
  visitDate: new Date().toISOString().slice(0, 10),
  placeName: "",
  placeAddress: "",
  lat: "",
  lng: "",
  tag: "",
  comment: ""
});

export function MemoryForm({
  onCreate,
  pickedLocation
}: {
  onCreate: (input: {
    memory: Memory;
    place: Place | null;
    tags: Tag[];
    comments: string[];
    photos: Photo[];
  }) => Promise<void> | void;
  pickedLocation: { lat: number; lng: number } | null;
}) {
  const [draft, setDraft] = useState<Draft>(() => createEmptyDraft());
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoHint, setGeoHint] = useState("支持从照片读取 GPS，也可以手动输入地点坐标。");

  const hasLocation = useMemo(() => Boolean(draft.lat && draft.lng), [draft.lat, draft.lng]);

  useEffect(() => {
    if (!pickedLocation) return;
    setDraft((prev) => ({
      ...prev,
      lat: pickedLocation.lat.toFixed(6),
      lng: pickedLocation.lng.toFixed(6),
      placeName: prev.placeName || "地图选点"
    }));
    setGeoHint("已使用地图选点位置。");
  }, [pickedLocation]);

  const handleFiles = async (nextFiles: File[]) => {
    setFiles(nextFiles);
    const first = nextFiles[0];
    if (!first) {
      setGeoHint("支持从照片读取 GPS，也可以手动输入地点坐标。");
      return;
    }

    try {
      const gps = await exifr.gps(first);
      if (gps?.latitude && gps?.longitude) {
        setDraft((prev) => ({
          ...prev,
          lat: String(gps.latitude),
          lng: String(gps.longitude)
        }));
        setGeoHint("已从第一张照片读取到位置信息。");
      } else {
        setGeoHint("这张照片没有 GPS 信息，可手动输入坐标。");
      }
    } catch {
      setGeoHint("未读取到照片位置，可手动输入坐标。");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const now = Date.now();
      const memory: Memory = {
        id: makeId("memory"),
        title: draft.title.trim() || "未命名回忆",
        note: draft.note.trim(),
        visitDate: draft.visitDate,
        placeId: null,
        favorite: false,
        createdAt: now,
        updatedAt: now
      };

      const place =
        hasLocation || draft.placeName.trim()
          ? {
              id: makeId("place"),
              name: draft.placeName.trim() || "未命名地点",
              lat: Number(draft.lat || 0),
              lng: Number(draft.lng || 0),
              address: draft.placeAddress.trim(),
              source: hasLocation ? ("manual" as const) : ("photo" as const),
              createdAt: now,
              updatedAt: now
            }
          : null;

      const tags = draft.tag.trim()
        ? [
            {
              id: makeId("tag"),
              name: draft.tag.trim(),
              color: "#7cbf84",
              createdAt: now,
              updatedAt: now
            }
          ]
        : [];

      const photos: Photo[] = files.map((file) => ({
        id: makeId("photo"),
        memoryId: memory.id,
        name: file.name,
        mimeType: file.type || "image/jpeg",
        file,
        width: null,
        height: null,
        lat: place?.lat ?? null,
        lng: place?.lng ?? null,
        createdAt: now,
        updatedAt: now
      }));

      await onCreate({
        memory,
        place,
        tags,
        comments: draft.comment.trim() ? [draft.comment.trim()] : [],
        photos
      });
      setDraft(createEmptyDraft());
      setFiles([]);
      setGeoHint("支持从照片读取 GPS，也可以手动输入地点坐标。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e4f4e6] text-[#3e7d50]">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold">新增一段回忆</h2>
          <p className="text-xs text-muted">照片、评论、地点和标签都可以一次记下</p>
        </div>
      </div>

      <form className="grid gap-3" onSubmit={handleSubmit}>
        <Input
          placeholder="回忆标题，比如：春天的公园散步"
          value={draft.title}
          onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
        />
        <Textarea
          placeholder="写一点你们当时的感觉"
          value={draft.note}
          onChange={(e) => setDraft((prev) => ({ ...prev, note: e.target.value }))}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            type="date"
            value={draft.visitDate}
            onChange={(e) => setDraft((prev) => ({ ...prev, visitDate: e.target.value }))}
          />
          <Input
            placeholder="标签，比如：旅行 / 周末 / 纪念日"
            value={draft.tag}
            onChange={(e) => setDraft((prev) => ({ ...prev, tag: e.target.value }))}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="地点名称"
            value={draft.placeName}
            onChange={(e) => setDraft((prev) => ({ ...prev, placeName: e.target.value }))}
          />
          <Input
            placeholder="地点地址"
            value={draft.placeAddress}
            onChange={(e) => setDraft((prev) => ({ ...prev, placeAddress: e.target.value }))}
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            placeholder="纬度"
            inputMode="decimal"
            value={draft.lat}
            onChange={(e) => setDraft((prev) => ({ ...prev, lat: e.target.value }))}
          />
          <Input
            placeholder="经度"
            inputMode="decimal"
            value={draft.lng}
            onChange={(e) => setDraft((prev) => ({ ...prev, lng: e.target.value }))}
          />
        </div>
        <Textarea
          placeholder="评论，比如：这一天的天空也很好看"
          value={draft.comment}
          onChange={(e) => setDraft((prev) => ({ ...prev, comment: e.target.value }))}
        />

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line bg-white/60 px-4 py-3 text-sm">
          <ImagePlus className="h-4 w-4 text-[#47895c]" />
          <span className="flex-1">添加照片</span>
          <input
            className="hidden"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => void handleFiles(Array.from(e.target.files || []))}
          />
          <span className="text-xs text-muted">{files.length} 张</span>
        </label>
        <p className="text-xs text-muted">{geoHint}</p>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={loading}>
            <MessageSquarePlus className="h-4 w-4" />
            {loading ? "保存中" : "保存回忆"}
          </Button>
          <Button type="button" variant="outline">
            <MapPinned className="h-4 w-4" />
            右侧地图选点
          </Button>
        </div>
      </form>
    </Card>
  );
}
