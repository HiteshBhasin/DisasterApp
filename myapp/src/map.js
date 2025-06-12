import React ,{useRef, useState, useEffect} from "react";
import { EmergencyShelteraddress, mapPlacement } from "./emergencyInfo";
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import {MapContainer, TileLayer, Marker, Popup, useMapEvent, useMap} from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import { EmergencyShelteraddress, mapPlacement } from "./emergencyInfo";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

//---fire icon-----//

//<a href="https://www.flaticon.com/free-icons/fire" title="fire icons">Fire icons created by Freepik - Flaticon</a>

const fireIcon = L.icon({
  url: '//www.flaticon.com/free-icons/fire',
  iconSize: []

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
            const url = `http://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchValue)}`;
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
            <Popup>
                here!
            </Popup>
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
        <InitialLocation />
        <SearchInfo />
        <mapPlacement/>
        {/* Additional map layers or components can be added here */}
      </MapContainer>
      <form id="form" style={{ marginTop: "1em" }}>
        <input type="text" id="text" placeholder="Search location..." />
        <button type="submit">Search</button>
      </form>
      <h2>Emergency Address</h2>
      <EmergencyShelteraddress />
      
      <div id="information container">
       <ul>
        <a></a>
       </ul>
      </div>

    </div>
  );
}

export default SimpleMap;