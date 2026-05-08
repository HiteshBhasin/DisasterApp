import React, { useRef, useState, useEffect } from "react";
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

function InitialLocation() {
  const [position, setPosition] = useState(null);
  const map = useMap();

  useEffect(() => {
    const handleClick = () => map.locate();
    const handleLocationFound = (e) => {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    };

    map.on("click", handleClick);
    map.on("locationfound", handleLocationFound);
    return () => {
      map.off("click", handleClick);
      map.off("locationfound", handleLocationFound);
    };
  }, [map]);

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

function SimpleMap() {
  const mapRef = useRef(null);
  var latitude = 49.8951;
  var longitude = -97.1384;

  return (
    <div className="map" id="map">
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        ref={mapRef}
        style={{ height: "60vh", width: "100%" }}
      >
        <LayerReturn />
        <InitialLocation />
        <SearchInfo />
        {<MapPlacement />}
        <MapLegend />
      </MapContainer>

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
