import React, { useRef, useState, useEffect } from "react";
import LayerReturn from "./layers";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import Resources from "./resources";
import WebbData from "./webScrapping";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvent,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { EmergencyShelteraddress, MapPlacement } from "./emergencyInfo";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

function InitialLocation() {
  const [position, setPostion] = useState(null);
  const map = useMapEvent({
    click() {
      map.locate();
    },
    locationfound(e) {
      setPostion(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

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
        style={{ height: "50vh", width: "100vw" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LayerReturn />
        <InitialLocation />
        <SearchInfo />
        {<MapPlacement />}
      </MapContainer>

      <form id="form" style={{ marginTop: "1em" }}>
        <input type="text" id="text" placeholder="Search location..." />
        <button type="submit">Search</button>
      </form>

      <div id="information Container"
        style={{
          display: "flex",
          flexDirection:"column",
          justifyContent: "left",
          alignItems: "left",
          marginRight: "1000px", 
          border: "1px solid #ccc"
        }}
      >
      <h2>Emergency Address</h2>
      <EmergencyShelteraddress />
      <h2>More Resources</h2>
      <Resources />
      </div>
      <div>
      < WebbData />
      </div>
    </div>
  );
}

export default SimpleMap;
