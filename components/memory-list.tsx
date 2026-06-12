"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, ImageIcon, MapPin, MessageCircle, Star, Trash2 } from "lucide-react";
import { CatIllustration } from "./cat-illustration";
import { Badge, Button, Card } from "./ui";
import type { Comment, Memory, MemoryTag, Photo, Place, Tag } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type Props = {
  memories: Memory[];
  places: Place[];
  tags: Tag[];
  memoryTags: MemoryTag[];
  comments: Comment[];
  photos: Photo[];
  onDelete: (memory: Memory) => void;
  onToggleFavorite: (memory: Memory) => void;
};

function PhotoStrip({ photos }: { photos: Photo[] }) {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    const nextUrls = photos.slice(0, 3).map((photo) => URL.createObjectURL(photo.file));
    setUrls(nextUrls);
    return () => {
      nextUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photos]);

  if (!photos.length) {
    return (
      <div className="mt-4 flex h-28 items-center justify-center rounded-xl bg-[#f5fbf6] text-sm text-muted">
        <ImageIcon className="mr-2 h-4 w-4" />
        还没有照片
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {urls.map((url, index) => (
        <img
          key={url}
          src={url}
          alt={`回忆照片 ${index + 1}`}
          className="h-24 w-full rounded-xl object-cover"
        />
      ))}
    </div>
  );
}

export function MemoryList({
  memories,
  places,
  tags,
  memoryTags,
  comments,
  photos,
  onDelete,
  onToggleFavorite
}: Props) {
  const placeMap = useMemo(() => new Map(places.map((place) => [place.id, place])), [places]);
  const tagMap = useMemo(() => new Map(tags.map((tag) => [tag.id, tag])), [tags]);

  if (!memories.length) {
    return (
      <Card className="flex h-full min-h-[320px] items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <CatIllustration className="mx-auto mb-4 h-28 w-full" />
          <h3 className="text-base font-semibold">还没有回忆</h3>
          <p className="mt-2 text-sm text-muted">先从一张照片、一句评论或一个地点开始。</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {memories.map((memory) => {
        const place = memory.placeId ? placeMap.get(memory.placeId) : null;
        const currentTags = memoryTags
          .filter((item) => item.memoryId === memory.id)
          .map((item) => tagMap.get(item.tagId))
          .filter((tag): tag is Tag => Boolean(tag));
        const currentComments = comments.filter((comment) => comment.memoryId === memory.id);
        const currentPhotos = photos.filter((photo) => photo.memoryId === memory.id);

        return (
          <Card key={memory.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-base font-semibold">{memory.title}</h3>
                  {memory.favorite ? <Heart className="h-4 w-4 fill-[#4a8a55] text-[#4a8a55]" /> : null}
                </div>
                <p className="mt-1 text-sm text-muted">{memory.note || "没有备注"}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#edf8ef] px-2.5 py-1 text-xs text-[#356844]">
                {formatDate(memory.visitDate)}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                aria-label={memory.favorite ? "取消收藏" : "收藏"}
                onClick={() => onToggleFavorite(memory)}
              >
                <Star className={memory.favorite ? "h-4 w-4 fill-[#4a8a55]" : "h-4 w-4"} />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                aria-label="删除回忆"
                onClick={() => onDelete(memory)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <PhotoStrip photos={currentPhotos} />

            <div className="mt-4 flex flex-wrap gap-2">
              {currentTags.map((tag) => (
                <Badge key={tag.id}>{tag.name}</Badge>
              ))}
            </div>

            {currentComments.length ? (
              <div className="mt-4 grid gap-2">
                {currentComments.slice(0, 2).map((comment) => (
                  <p
                    key={comment.id}
                    className="flex gap-2 rounded-xl bg-[#f5fbf6] px-3 py-2 text-sm text-[#356844]"
                  >
                    <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      <strong>{comment.author}</strong>：{comment.body}
                    </span>
                  </p>
                ))}
              </div>
            ) : null}

            {place ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-[#f4faf4] px-3 py-2 text-sm text-[#356844]">
                <MapPin className="h-4 w-4" />
                <span>{place.name}</span>
                <span className="text-xs text-muted">
                  {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                </span>
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
