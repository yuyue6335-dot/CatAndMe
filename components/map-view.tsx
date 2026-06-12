"use client";

import maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";
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
        markerElement.style.width = "14px";
        markerElement.style.height = "14px";
        markerElement.style.borderRadius = "999px";
        markerElement.style.border = "2px solid white";
        markerElement.style.background = "#4f9d66";
        markerElement.style.boxShadow = "0 4px 16px rgba(0,0,0,0.18)";
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
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <p className="text-sm font-semibold">回忆地图</p>
          <p className="text-xs text-muted">
            {onPick ? "点击地图可把坐标填入新增回忆" : "地图会展示所有带地点的回忆"}
          </p>
        </div>
        <span className="rounded-full bg-[#edf8ef] px-2.5 py-1 text-xs text-[#356844]">
          {places.length} 个地点
        </span>
      </div>
      <div ref={containerRef} className="h-[360px] w-full" />
    </Card>
  );
}
