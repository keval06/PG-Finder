"use client";
import { Map, Marker } from "@vis.gl/react-google-maps";

export default function PGLocationMap({ coordinate, address, city }) {
  // handle both flat [lng,lat] and GeoJSON
  let pos = null;
  if (coordinate?.coordinates?.length === 2) {
    pos = { lat: coordinate.coordinates[1], lng: coordinate.coordinates[0] };
  } else if (Array.isArray(coordinate) && coordinate.length === 2) {
    pos = { lat: coordinate[1], lng: coordinate[0] };
  }

  if (!pos) return null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold mb-1">Where you'll be</h2>
      <p className="text-sm text-gray-500 mb-4">
        {address}, {city}
      </p>

      <div className="w-full h-[340px] rounded-2xl overflow-hidden border border-gray-100">
        <Map
          defaultCenter={pos}
          defaultZoom={14}
          disableDefaultUI={true}
          gestureHandling="cooperative"
          style={{ width: "100%", height: "100%" }}
        >
          <Marker
            position={pos}
            icon={{
              path: "M 0,-30 C -16,-30 -28,-18 -28,-4 C -28,14 0,40 0,40 C 0,40 28,14 28,-4 C 28,-18 16,-30 0,-30 Z",
              fillColor: "#0f172a",
              fillOpacity: 1,
              strokeColor: "#fffeee",
              strokeWeight: 3,
              scale: 0.6,
              anchor: { x: 0, y: 40 },
            }}
            label={{
              text: "⌂",
              color: "#ffffff",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          />
        </Map>
      </div>
    </div>
  );
}
