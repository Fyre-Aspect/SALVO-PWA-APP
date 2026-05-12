"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import type { Incident } from "@/types";
import { Crosshair } from "lucide-react";

// Fix Leaflet's default icon path issues with Next.js
import L from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

interface MapComponentProps {
  incident: Incident;
}

export default function MapComponent({ incident }: MapComponentProps) {
  // Use incident location if available, otherwise fallback to a default
  const incidentLoc: [number, number] = incident.location 
    ? [incident.location.lat, incident.location.lng] 
    : [34.0522, -118.2437]; // Los Angeles as fallback
  
  // Simulate responder location slightly offset from the incident
  const responderLoc: [number, number] = incident.location 
    ? [incident.location.lat - 0.015, incident.location.lng - 0.015] 
    : [34.0372, -118.2587];

  return (
    <div className="relative w-full h-full tactical-grid" style={{ background: "var(--color-surface-2)" }}>
      {/* HUD overlays */}
      <div className="absolute top-4 left-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[var(--color-text-secondary)] z-[1000] pointer-events-none drop-shadow-md bg-black/40 px-2 py-1 rounded backdrop-blur-sm border border-[rgba(0,229,255,0.2)]">
        <Crosshair size={14} style={{ color: "var(--color-ocean-cyan)" }} />
        <span className="text-[var(--color-text-primary)]">Tactical Overlay (Live)</span>
      </div>
      <div className="absolute top-4 right-4 font-mono text-[11px] uppercase tracking-widest text-[var(--color-text-secondary)] z-[1000] pointer-events-none drop-shadow-md bg-black/40 px-2 py-1 rounded backdrop-blur-sm border border-[rgba(0,229,255,0.2)]">
        {incident.location
          ? `${incident.location.lat.toFixed(4)}, ${incident.location.lng.toFixed(4)}`
          : "GPS · Sim mode"}
      </div>

      <MapContainer
        center={incidentLoc}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={responderLoc}>
          <Popup className="font-mono text-xs text-gray-800">
            <strong>Responder Unit</strong>
            <br />
            En route
          </Popup>
        </Marker>

        <Marker position={incidentLoc}>
          <Popup className="font-mono text-xs text-gray-800">
            <strong>{incident.zone}</strong>
            <br />
            <span style={{ color: "red" }}>{incident.severity.toUpperCase()} ALERT</span>
          </Popup>
        </Marker>

        <Polyline
          positions={[responderLoc, incidentLoc]}
          color="var(--color-critical)"
          dashArray="8, 8"
          weight={3}
          className="animate-pulse"
        />
      </MapContainer>
    </div>
  );
}
