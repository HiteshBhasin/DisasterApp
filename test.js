import { Marker, Popup } from "leaflet";
import React ,{useRef, useState, useEffect} from "react";
function name() {
    const [position, setPostion] = useState(" ");
    const map = useMap();

    useEffect(()=>{
        const form = document.getElementById("form");
        if(!form){
              console.error("Form not found");
              return;
        }else {
            const button = form.querySelector("button");

            const inputHandle= async(e)=>{
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
                     latitude = json[0].lat;
                     longitude = json[0].lon;

                    setPostion([latitude, longitude]);
                     map.flyTo([latitude,longitude],map.getZoom());
                     button.addEventListener("click",inputHandle);
                     
                     return(
                        <Marker position={position}>
                            <Popup>
                                here!
                            </Popup>
                        </Marker>
                     )
             };
        }
    });
}
//onst form = document.getElementById("form");
//   const form = document.getElementById("form");
//     if (!form) {
//       console.error("Form not found");
//       return;
//     }
//     const button = form.querySelector("button");
//     if (!button) {
//       console.error("Button not found inside form");
//       return;
//     }
//     button.addEventListener("click", async (event) => {
//       event.preventDefault(); // prevent form from refreshing the page

//       const input = form.querySelector("input");

//       if (!input) {
//         console.error("Input not found");
//         return;
//       }
//       const searchValue = input.value;
//       console.log("Input value:", input.value);
//       const url = `http://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchValue)}`;

//       let promise = await fetch(url);
//       let json = await promise.json();
//       latitude = json[0].lat;
//       longitude = json[0].lon;

//       map.setView([latitude, longitude]);
//       map.flyTo([latitude,longitude],map.getZoom())
      
    
//     });
//     return(
//     <Marker position={[latitude,longitude]}>
//         <Popup>
//             you are here!
//         </Popup>
//     </Marker>);