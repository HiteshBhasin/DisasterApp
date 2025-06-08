import React ,{useRef, useState} from "react";

import {MapContainer, TileLayer, Marker, Popup, useMapEvent} from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import { map } from "leaflet";

function SimpleMap(){
    const mapRef= useRef(null);
    const latitude = 49.8951;
    const longitude = -97.1384;

    const [info, setInfo] = useState(" "); // we initialzed this. 
   
   }

    const [position, setPostion] = useState(" "); 

    if (position) {
    const initialPosition = useMapEvent({
        click(){
            initialPosition.locate()
        }, 
        locationFound(e){
            setPostion(e.latlng)
           initialPosition.flyTo(e.latlng, initialPosition.getZoom())
        }
    });

    return position == null ? null : (
        <Marker position={position}>
            <Popup>You are here</Popup>
        </Marker>
    );
    }
    else{
    return (
        <div className="map" id="map">
            <MapContainer center={[latitude, longitude]} zoom={13} ref={mapRef} style={{ height: "50vh", width: "100vw" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Additional map layers or components can be added here */}
            </MapContainer>
            <form id="form">
                <label>
                    <input type="text" value={info} onChange={setInfo} />
                </label>
            </form>
            <script>
                var info = document.
            </script>
        </div>
    );
    }
}

export default SimpleMap;