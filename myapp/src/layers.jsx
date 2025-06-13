import {useState, useEffect} from "react";
import L from 'leaflet';
import { Marker, Popup, LayersControl, TileLayer, LayerGroup} from 'react-leaflet';

const nasaApi = "https://firms.modaps.eosdis.nasa.gov/api/area/json/a1531693fe55b8fce18f80c7f1417972/MODIS_NRT/NorthAmerica/24h";

function LayerReturn() {
       const fireIcon = L.icon({
         iconUrl: 'https://cdn-icons-png.flaticon.com/128/10760/10760625.png',
         iconSize: [30,30],
         iconAnchor: [15,30],
        popupAnchor:[0,-30],
    
       
       }); 
    const [fireData, getData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await fetch(nasaApi);
                 console.log("FIRMS API Response Status:", data.status, data.statusText);
                console.log("FIRMS API Response Headers:", data.headers);
                console.log(data.text());
                
                if(!data){
                    const errorRes = await data.text();
                    console.log(`no data came through ${errorRes}`);
                }
                const jsonData = await data.json();
                console.log(jsonData, "jsondata");
                var newData = [];
                if (jsonData && jsonData.length>0){
                    for (const jData of jsonData ){
                        var lat = parseFloat(jData.latitude);
                        var lon = parseFloat(jData.longitude);
                        var date = jData.acq_date;
                        var time = jData.acq_time;
                        newData.push({lat, lon, date:date, time:time});
                    }
                }
                getData(newData);
            } catch (error) {
                 console.log(error.message, "data not coming");
            }
        }
        fetchData();
    }, []);

    return(

        <LayersControl.BaseLayer name = "baseMap">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"></TileLayer>
        </LayersControl.BaseLayer>,

        <LayersControl.Overlay name = "fires in Canada">
            <LayerGroup>
                {fireData.map((fire, idx)=>(
                    <Marker key={idx} position={[fire.lat, fire.lon]} icon={fireIcon}>
                        <Popup>
                            Date: {fire.date}<br />
                            Time: {fire.time}<br />
                        </Popup>
                    </Marker>
                ))}
            </LayerGroup>
        </LayersControl.Overlay>
    );
}
export default LayerReturn;