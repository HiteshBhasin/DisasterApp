import {useState} from "react";
import L from 'leaflet';
import { Marker, Popup, useMapEvent, useMap} from 'react-leaflet';

const add1 = "709 Keewatin Street, Winnipeg, Manitoba";
const add2 = "146 Selkirk Avenue, Thompson";


async function mapPlacement() {
   const fireIcon = L.icon({
     url: 'https://www.flaticon.com/free-icons/shelter',
     iconSize: [25,25],
     iconAnchor: [12,41],
    popupAnchor:[0,-32]
   
   }); 
   const [positions, setPosition] = useState([]);
   const map = useMap();

   var addArr = [add1,add2]

   for (const add of addArr){
     const url = `http://nominatim.openstreetmap.org/search?format=json&q=${add}`;
     console.log(url);
     var marker = [];
     let promise = await fetch(url);
            let json = await promise.json();
            if (json && json.length > 0) {
                for (let i=0; i<json.length;i++){
                var latitude = parseFloat(json[i].lat);
                var longitude = parseFloat(json[i].lon);
                marker.push({latitude,longitude, name:json.display_name});
                }
            } else {
                console.error("Location not found");
            }
            setPosition(marker);

             return(
              <>
              {positions.map((pos,index)=>(
                <Marker key={index} position={pos} icon={fireIcon}>
                  <Popup>
                      {positions.name}
                  </Popup>
                </Marker>
              ))}
              
              </>
             )
   }
}

function EmergencyShelteraddress() {
    // const [info, getInfo] = useState([]);
    var informations = [add1,add2];

    return(
        <div id="emergencyAdd">
           <ul>
            {informations.map((information, index) => (
                <Emergency key={index} address={information} />
            ))}
           </ul>
        </div>
    )
}
export { EmergencyShelteraddress, mapPlacement };

