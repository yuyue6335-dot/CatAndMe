"use client";

import maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";
import { MapPinned } from "lucide-react";
import type { Place } from "@/lib/types";
import { Card } from "./ui";

type Props = {
  places: Place[];
  onPick?: (lat: number, lng: number) => void;
};

export function MapView({ places, onPick }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [116.4074, 39.9042],
      zoom: 3.2
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    if (onPick) {
      map.on("click", (event) => onPick(event.lngLat.lat, event.lngLat.lng));
    }

    mapRef.current = map;
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [onPick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateMarkers = () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = places.map((place) => {
        const markerElement = document.createElement("button");
        markerElement.title = place.name;
        markerElement.style.width = "16px";
        markerElement.style.height = "16px";
        markerElement.style.borderRadius = "999px";
        markerElement.style.border = "3px solid white";
        markerElement.style.background = "#3d8b58";
        markerElement.style.boxShadow = "0 8px 22px rgba(33, 85, 56, 0.28)";
        return new maplibregl.Marker({ element: markerElement, anchor: "center" })
          .setLngLat([place.lng, place.lat])
          .addTo(map);
      });

      if (places.length) {
        map.fitBounds(
          places.reduce(
            (bounds, place) => bounds.extend([place.lng, place.lat]),
            new maplibregl.LngLatBounds([places[0].lng, places[0].lat], [places[0].lng, places[0].lat])
          ),
          { padding: 70, maxZoom: 12, duration: 600 }
        );
      }
    };

    if (map.isStyleLoaded()) {
      updateMarkers();
    } else {
      map.once("load", updateMarkers);
    }
  }, [places]);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-line/70 px-5 py-4">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e4f4e6] text-[#3e7d50]">
            <MapPinned className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">回忆地图</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              {onPick ? "点击地图可把坐标填入新增回忆。" : "地图会展示所有带地点的回忆。"}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[#edf8ef] px-2.5 py-1 text-xs font-medium text-[#356844]">
          {places.length} 个地点
        </span>
      </div>
      <div ref={containerRef} className="h-[360px] w-full" />
    </Card>
  );
}
