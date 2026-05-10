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

function RoutingControl({ userLocation, destination }) {
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
      pathOptions={{ color: "#3388ff", weight: 6, opacity: 0.8 }}
    />
  );
}

function InitialLocation({ onLocationFound }) {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
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
  }, [map, onLocationFound]);

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

  useEffect(() => {
    if (!userLocation || shelterPositions.length === 0 || cancelledRef.current) return;
    const nearest = nearestShelter(userLocation, shelterPositions);
    if (nearest) setRouteDestination({ lat: nearest.lat, lng: nearest.lon });
  }, [userLocation, shelterPositions]);

  return (
    <div className="map" id="map">
      <div style={{ position: "relative" }}>
        <MapContainer
          center={[latitude, longitude]}
          zoom={13}
          ref={mapRef}
          style={{ height: "60vh", width: "100%" }}
        >
          <LayerReturn />
          <InitialLocation onLocationFound={handleLocationFound} />
          <SearchInfo />
          {<MapPlacement onPositionsLoaded={setShelterPositions} />}
          {userLocation && routeDestination && (
            <RoutingControl userLocation={userLocation} destination={routeDestination} />
          )}
          <MapLegend />
        </MapContainer>
        {routeDestination && (
          <button
            onClick={handleCancel}
            style={{
              position: "absolute",
              top: "10px",
              left: "60px",
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
