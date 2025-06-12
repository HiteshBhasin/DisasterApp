import {useState, useEffect} from "react";
import L from 'leaflet';
import { Marker, Popup} from 'react-leaflet';

const add1 = "709 Keewatin Street, Winnipeg, Manitoba";
const add2 = "146 Selkirk Avenue, Thompson, Manitoba";
const addObject = [
  { name: "Billy Monsieko Arena", address: add1 },
  { name: "Burntwood Hotel", address: add2 }
];

 function MapPlacement() {
   const fireIcon = L.icon({
     url: 'https://cdn-icons-png.flaticon.com/512/483/483361.png',
     iconSize: [25,25],
     iconAnchor: [12,41],
    popupAnchor:[0,-32]
   
   }); 
   const [positions, setPosition] = useState([]);
  


   useEffect(() => {
    async function fetchData() {
      const addArr = [add1, add2];
      const markers = [];

      for (const add of addArr) {
        const url = `http://nominatim.openstreetmap.org/search?format=json&q=${add}`;
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data && data.length > 0) {
            const { lat, lon, display_name } = data[0];
            markers.push({
              lat: parseFloat(lat),
              lon: parseFloat(lon),
              name: display_name,
            });
          }
        } catch (err) {
          console.error("Error fetching location for:", add);
        }
      }

      setPosition(markers);
    }

    fetchData();
  }, []);

  return (
    <>
      {positions.map((pos, index) => (
        <Marker key={index} position={[pos.lat, pos.lon]} icon={fireIcon}>
          <Popup>{pos.name}</Popup>
        </Marker>
      ))}
    </>
  );
}

function EmergencyShelteraddress() {
    // const [info, getInfo] = useState([]);
    

    return(
        <div id="emergencyAdd">
           <ul>
            {addObject.map((information, index) => (
                <li key={index}>{information.name},{information.address}</li>
            ))}
           </ul>
        </div>
    )
}
export { EmergencyShelteraddress, MapPlacement };

