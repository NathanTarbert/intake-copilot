import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ExternalLink, MapPin } from "lucide-react";

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
if (TOKEN) {
  mapboxgl.accessToken = TOKEN;
}

const BRAND = "#2849d6";
const EMERGENCY = "#e11d48";

/**
 * Interactive map pinned on the doctor's office. We intentionally do NOT
 * geocode the patient's spoken address or draw an in-app route — those steps
 * fail too often (incomplete transcripts, ambiguous addresses) for a UI
 * users rely on. Actual navigation deep-links out to Google Maps, which
 * handles fuzzy address parsing far better than we can.
 */
export function DoctorMap({
  doctorName,
  doctorLng,
  doctorLat,
  patientAddress,
  tone = "default",
}: {
  doctorName: string;
  doctorLng: number;
  doctorLat: number;
  patientAddress?: string;
  tone?: "default" | "emergency";
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const accent = tone === "emergency" ? EMERGENCY : BRAND;

  useEffect(() => {
    if (!TOKEN) return;
    if (!containerRef.current) return;
    if (!Number.isFinite(doctorLng) || !Number.isFinite(doctorLat)) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [doctorLng, doctorLat],
      zoom: 14,
      cooperativeGestures: true,
    });
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    new mapboxgl.Marker({ color: accent })
      .setLngLat([doctorLng, doctorLat])
      .setPopup(new mapboxgl.Popup({ offset: 24 }).setText(doctorName))
      .addTo(map);

    return () => {
      map.remove();
    };
  }, [doctorLng, doctorLat, doctorName, accent]);

  if (!TOKEN) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        <div className="flex items-center gap-2 font-medium text-slate-700 mb-1">
          <MapPin size={14} /> Map unavailable
        </div>
        Add <code>VITE_MAPBOX_TOKEN</code> to <code>client/.env</code> to show
        the office on a map.
      </div>
    );
  }

  // Google Maps deep link: prefer the patient's address as origin when we
  // have it, otherwise let Maps default to the user's current location.
  const destination = `${doctorLat},${doctorLng}`;
  const mapsHref = patientAddress
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
        patientAddress,
      )}&destination=${destination}`
    : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

  return (
    <div className="mt-4">
      <div className="overflow-hidden rounded-xl ring-1 ring-slate-200">
        <div ref={containerRef} className="h-64 w-full" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm text-slate-600">
          <MapPin size={13} className="inline mr-1 text-slate-400" />
          Office location
        </div>
        <a
          href={mapsHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Get directions <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
