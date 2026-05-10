import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import LayerReturn from "./layers";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import Resources from "./resources";
import Updates from "./webscrapping";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  useMap,
  useMapEvent,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { EmergencyShelteraddress, MapPlacement } from "./emergencyInfo";

function MapLegend() {
  const map = useMap();
  const [container] = useState(() => {
    const div = L.DomUtil.create('div', 'leaflet-legend-control');
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);
    return div;
  });

  useEffect(() => {
    const control = L.control({ position: 'bottomleft' });
    control.onAdd = () => container;
    control.addTo(map);
    return () => control.remove();
  }, [map, container]);

  return createPortal(
    <div className="map-legend">
      <div className="map-legend-title">Legend</div>
      <div className="map-legend-item">
        <img src="https://cdn-icons-png.flaticon.com/128/10760/10760625.png" alt="fire" />
        <span>Active Fire (MODIS)</span>
      </div>
      <div className="map-legend-item">
        <img src="https://cdn-icons-png.flaticon.com/128/3124/3124823.png" alt="flood" />
        <span>Flood Event (EONET)</span>
      </div>
      <div className="map-legend-item">
        <img src="https://cdn-icons-png.flaticon.com/128/18/18314.png" alt="shelter" />
        <span>Emergency Shelter</span>
      </div>
      <div className="map-legend-item">
        <img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" alt="location" style={{width:12, height:20}} />
        <span>Your Location</span>
      </div>
    </div>,
    container
  );
}

// delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

function RoutingControl({ userLocation, destination, color = "#3388ff" }) {
  const map = useMap();
  const [routePoints, setRoutePoints] = useState([]);

  useEffect(() => {
    if (!userLocation || !destination) {
      setRoutePoints([]);
      return;
    }

    let cancelled = false;
    const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRoutePoints(coords);
          if (coords.length > 0) {
            map.fitBounds(L.latLngBounds(coords), { padding: [50, 50] });
          }
        }
      })
      .catch((err) => console.error("Routing error:", err));

    return () => {
      cancelled = true;
      setRoutePoints([]);
    };
  }, [map, userLocation, destination]);

  if (routePoints.length === 0) return null;

  return (
    <Polyline
      positions={routePoints}
      pathOptions={{ color, weight: 6, opacity: 0.8 }}
    />
  );
}

function InitialLocation({ onLocationFound, active }) {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    if (!active) return;
    const handleClick = () => map.locate();
    const handleLocationFound = (e) => {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      if (onLocationFound) onLocationFound(e.latlng);
    };

    map.on("click", handleClick);
    map.on("locationfound", handleLocationFound);
    return () => {
      map.off("click", handleClick);
      map.off("locationfound", handleLocationFound);
    };
  }, [map, onLocationFound, active]);

  useEffect(() => {
    if (!position) return;
    const circle = L.circle([position.lat, position.lng], {
      radius: 10000,
      color: "#e63946",
      fillColor: "#e63946",
      fillOpacity: 0.1,
      weight: 2,
    }).addTo(map);
    return () => map.removeLayer(circle);
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

function SearchInfo() {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    const form = document.getElementById("form");
    if (!form) {
      console.error("Form not found");
      return;
    }

    const handleSubmit = async (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      if (!input) {
        console.error("Input not found");
        return;
      }
      const searchValue = input.value;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchValue
      )}`;
      let promise = await fetch(url);
      let json = await promise.json();
      if (json && json.length > 0) {
        const latitude = parseFloat(json[0].lat);
        const longitude = parseFloat(json[0].lon);
        setPosition([latitude, longitude]);
        map.flyTo([latitude, longitude], map.getZoom());
      } else {
        console.error("Location not found");
      }
    };

    form.addEventListener("submit", handleSubmit);

    // Cleanup event listener on unmount
    return () => {
      form.removeEventListener("submit", handleSubmit);
    };
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>here!</Popup>
    </Marker>
  );
}

function ThirdPersonLocation({ onLocationPicked, origin }) {
  const personIcon = L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:#f4a261;border:2px solid #fff;
      transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.4)
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });

  useMapEvent("click", (e) => {
    onLocationPicked(e.latlng);
  });

  if (!origin) return null;
  return (
    <Marker position={origin} icon={personIcon}>
      <Popup>Person's location</Popup>
    </Marker>
  );
}

function nearestShelter(userLoc, shelters) {
  if (!shelters || shelters.length === 0) return null;
  return shelters.reduce((closest, shelter) => {
    const dLat = shelter.lat - userLoc.lat;
    const dLng = shelter.lon - userLoc.lng;
    const dist = dLat * dLat + dLng * dLng;
    const cLat = closest.lat - userLoc.lat;
    const cLng = closest.lon - userLoc.lng;
    const cDist = cLat * cLat + cLng * cLng;
    return dist < cDist ? shelter : closest;
  });
}

function SimpleMap() {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [shelterPositions, setShelterPositions] = useState([]);
  const [routeDestination, setRouteDestination] = useState(null);
  const cancelledRef = useRef(false);

  // Third-person mode
  const [thirdPersonMode, setThirdPersonMode] = useState(false);
  const [thirdPersonOrigin, setThirdPersonOrigin] = useState(null);
  const [thirdPersonDest, setThirdPersonDest] = useState(null);

  var latitude = 49.8951;
  var longitude = -97.1384;

  const handleLocationFound = useCallback((latlng) => {
    cancelledRef.current = false;
    setUserLocation(latlng);
  }, []);

  const handleCancel = () => {
    cancelledRef.current = true;
    setRouteDestination(null);
    setUserLocation(null);
  };

  const handleThirdPersonCancel = () => {
    setThirdPersonOrigin(null);
    setThirdPersonDest(null);
  };

  const toggleThirdPersonMode = () => {
    setThirdPersonMode((prev) => {
      if (prev) {
        setThirdPersonOrigin(null);
        setThirdPersonDest(null);
      }
      return !prev;
    });
  };

  // GPS route: auto-route to nearest shelter when user location updates
  useEffect(() => {
    if (!userLocation || shelterPositions.length === 0 || cancelledRef.current) return;
    const nearest = nearestShelter(userLocation, shelterPositions);
    if (nearest) setRouteDestination({ lat: nearest.lat, lng: nearest.lon });
  }, [userLocation, shelterPositions]);

  // Third-person route: route to nearest shelter from clicked point
  useEffect(() => {
    if (!thirdPersonOrigin || shelterPositions.length === 0) return;
    const nearest = nearestShelter(thirdPersonOrigin, shelterPositions);
    if (nearest) setThirdPersonDest({ lat: nearest.lat, lng: nearest.lon });
  }, [thirdPersonOrigin, shelterPositions]);

  return (
    <div className="map" id="map">
      <div style={{ position: "relative" }}>
        {/* Mode toggle button */}
        <div style={{ padding: "8px 0", display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={toggleThirdPersonMode}
            style={{
              padding: "6px 14px",
              cursor: "pointer",
              background: thirdPersonMode ? "#f4a261" : "#fff",
              border: "2px solid " + (thirdPersonMode ? "#f4a261" : "rgba(0,0,0,0.2)"),
              borderRadius: "4px",
              fontWeight: "bold",
              color: thirdPersonMode ? "#fff" : "#333",
            }}
          >
            {thirdPersonMode ? "📍 Click map to place pin" : "🧭 Help Someone Else"}
          </button>
          {thirdPersonMode && (
            <span style={{ fontSize: "0.85rem", color: "#666" }}>
              Click anywhere on the map to route from that location to the nearest shelter.
            </span>
          )}
        </div>

        <MapContainer
          center={[latitude, longitude]}
          zoom={13}
          ref={mapRef}
          style={{ height: "60vh", width: "100%" }}
        >
          <LayerReturn />
          <InitialLocation onLocationFound={handleLocationFound} active={!thirdPersonMode} />
          {thirdPersonMode && (
            <ThirdPersonLocation
              onLocationPicked={setThirdPersonOrigin}
              origin={thirdPersonOrigin}
            />
          )}
          <SearchInfo />
          {<MapPlacement onPositionsLoaded={setShelterPositions} />}
          {/* GPS route */}
          {userLocation && routeDestination && !thirdPersonMode && (
            <RoutingControl userLocation={userLocation} destination={routeDestination} />
          )}
          {/* Third-person route */}
          {thirdPersonOrigin && thirdPersonDest && (
            <RoutingControl
              userLocation={thirdPersonOrigin}
              destination={thirdPersonDest}
              color="#f4a261"
            />
          )}
          <MapLegend />
        </MapContainer>

        {/* GPS route cancel */}
        {routeDestination && !thirdPersonMode && (
          <button
            onClick={handleCancel}
            style={{
              position: "absolute",
              top: "60px",
              left: "10px",
              zIndex: 1000,
              padding: "6px 12px",
              cursor: "pointer",
              background: "#fff",
              border: "2px solid rgba(0,0,0,0.2)",
              borderRadius: "4px",
              fontWeight: "bold",
              color: "#e63946",
            }}
          >
            ✕ Cancel Route
          </button>
        )}
        {/* Third-person route cancel */}
        {thirdPersonDest && (
          <button
            onClick={handleThirdPersonCancel}
            style={{
              position: "absolute",
              top: "60px",
              left: "10px",
              zIndex: 1000,
              padding: "6px 12px",
              cursor: "pointer",
              background: "#fff",
              border: "2px solid rgba(0,0,0,0.2)",
              borderRadius: "4px",
              fontWeight: "bold",
              color: "#f4a261",
            }}
          >
            ✕ Clear Pin & Route
          </button>
        )}
      </div>

      <div className="page-content">
        <form id="form" style={{ display: "none" }}>
          <input type="text" id="text" />
        </form>
        <div id="informationContainer">
          <div className="info-card">
            <h2>Emergency Address</h2>
            <EmergencyShelteraddress />
          </div>
          <div className="info-card">
            <h2>More Resources</h2>
            <Resources />
          </div>
        </div>

        <div id="updates">
          <h2>Latest Wildfire News</h2>
          <Updates />
        </div>
      </div>
    </div>
  );
}

export default SimpleMap;
