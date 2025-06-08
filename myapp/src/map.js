import React ,{useRef, useState} from "react";

import {MapContainer, TileLayer, Marker, Popup, useMapEvent} from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import { map } from "leaflet";

function SimpleMap() {
  const mapRef = useRef(null);
  const latitude = 49.8951;
  const longitude = -97.1384;

  function GettingInfo() {
    const form = document.getElementById("form");

    if (!form) {
      console.error("Form not found");
      return;
    }

    const button = form.querySelector("button");

    if (!button) {
      console.error("Button not found inside form");
      return;
    }

    // Add event listener to the button
    button.addEventListener("click", (event) => {
      event.preventDefault(); // prevent form from refreshing the page

      const input = form.querySelector("input");

      if (!input) {
        console.error("Input not found");
        return;
      }

      console.log("Input value:", input.value);
    });
  }

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
        <InitialLocation />
        <GettingInfo />
        {/* Additional map layers or components can be added here */}
      </MapContainer>
      <form id="form">
        <label>
          <input type="text" id="text" />
        </label>
        <button type="submit" id="button">
          {" "}
          search
        </button>
      </form>
    </div>
  );
}

export default SimpleMap;