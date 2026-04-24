import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { Fragment, memo, useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import CategoryIcon from "./CategoryIcon.jsx";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const defaultCenter = [20.5937, 78.9629];

const MapViewport = ({ points, routeGeometry, selectedPlace }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedPlace?.latitude && selectedPlace?.longitude) {
      map.flyTo([selectedPlace.latitude, selectedPlace.longitude], 14, {
        duration: 0.8
      });
      return;
    }

    if (routeGeometry.length > 0) {
      map.fitBounds(routeGeometry, { padding: [30, 30] });
      return;
    }

    if (points.length > 1) {
      map.fitBounds(points, { padding: [30, 30] });
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 12);
    }
  }, [map, points, routeGeometry, selectedPlace]);

  return null;
};

const PlacesMap = ({ places, routeGeometry = [], selectedPlaceId, onMarkerSelect }) => {
  const validPlaces = useMemo(
    () =>
      places.filter(
        (place) => typeof place.latitude === "number" && typeof place.longitude === "number"
      ),
    [places]
  );
  const markerPoints = useMemo(
    () => validPlaces.map((place) => [place.latitude, place.longitude]),
    [validPlaces]
  );
  const selectedPlace = useMemo(
    () => validPlaces.find((place) => place.id === selectedPlaceId) || null,
    [validPlaces, selectedPlaceId]
  );

  const center = validPlaces[0]
    ? [validPlaces[0].latitude, validPlaces[0].longitude]
    : defaultCenter;

  return (
    <div className="overflow-hidden rounded-[30px] border border-white/45 bg-[rgba(255,255,255,0.62)] shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-[26px]">
      <div className="border-b border-white/45 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Map View</h2>
            <p className="mt-2 text-sm text-slate-500">
              Explore your recommended stops on OpenStreetMap.
            </p>
          </div>
          <span className="rounded-full border border-sky-200/80 bg-[rgba(236,251,255,0.8)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700">
            Live Route
          </span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        className="h-[520px] w-full sm:h-[580px] xl:h-[min(68vh,720px)]"
      >
        <MapViewport points={markerPoints} routeGeometry={routeGeometry} selectedPlace={selectedPlace} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routeGeometry.length > 1 && (
          <Polyline
            positions={routeGeometry}
            pathOptions={{
              color: "#0f172a",
              weight: 5,
              opacity: 0.8
            }}
          />
        )}

        {validPlaces.map((place) => (
          <Fragment key={place.id || `${place.name}-${place.latitude}-${place.longitude}`}>
            {place.id === selectedPlaceId && (
              <CircleMarker
                center={[place.latitude, place.longitude]}
                radius={16}
                pathOptions={{
                  color: "#1ec7f3",
                  weight: 2,
                  fillColor: "#8edcff",
                  fillOpacity: 0.3
                }}
              />
            )}
            <Marker
              position={[place.latitude, place.longitude]}
              eventHandlers={{
                click: () => onMarkerSelect?.(place)
              }}
            >
              <Popup>
                <div className="min-w-[180px] space-y-2">
                  <div className="flex items-center gap-2 text-slate-900">
                    <CategoryIcon interest={place.interest} category={place.category} />
                    <span className="font-semibold">{place.name}</span>
                  </div>
                  <p className="text-sm text-slate-600">{place.category}</p>
                  <p className="text-xs text-slate-500">{place.address}</p>
                  {place.rating && <p className="text-xs font-medium text-sky-600">Rating: {place.rating}/10</p>}
                </div>
              </Popup>
            </Marker>
          </Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default memo(PlacesMap);
