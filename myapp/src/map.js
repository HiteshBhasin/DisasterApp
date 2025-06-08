import React ,{useRef, useState} from "react";

import {MapContainer, TileLayer, Marker, Popup, useMapEvent, useMap} from 'react-leaflet';
import "leaflet/dist/leaflet.css";

function SimpleMap() {
  const mapRef = useRef(null);
  var latitude = 49.8951;
  var longitude = -97.1384;
  
function SearchInfo() {
    const map = useMap();
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
    button.addEventListener("click", async (event) => {
      event.preventDefault(); // prevent form from refreshing the page

      const input = form.querySelector("input");

      if (!input) {
        console.error("Input not found");
        return;
      }
      const searchValue = input.value;
      console.log("Input value:", input.value);
      const url = `http://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchValue)}`;

      let promise = await fetch(url);
      let json = await promise.json();
      latitude = json[0].lat;
      longitude = json[0].lon;

      map.setView([latitude, longitude]);
      map.flyTo([latitude,longitude],map.getZoom())
      
    
    });
    return(
    <Marker position={[latitude,longitude]}>
        <Popup>
            you are here!
        </Popup>
    </Marker>);
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
        <SearchInfo />
        
       
        {/* Additional map layers or components can be added here */}
      </MapContainer>
     <form id="form" style={{ marginTop: "1em" }}>
        <input type="text" id="text" placeholder="Search location..." />
        <button type="submit">Search</button>
      </form>
    </div>
    
  );
}
export default SimpleMap;