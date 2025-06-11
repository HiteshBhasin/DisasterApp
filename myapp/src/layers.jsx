import {useState, useEffect} from "react";
import L from 'leaflet';
import { Marker, Popup, useMapEvent, useMap, LayersControl, WMSTileLayer, TileLayer, LayerGroup} from 'react-leaflet';

const nasaApi = "https://firms.modaps.eosdis.nasa.gov/api/area/json/<adde6368823b1c811de264a026f39f29>/MODIS_NRT/NorthAmerica/24h";

function layerReturn(params) {
    const [fireData, getData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await fetch(nasaApi);
                if(!data){
                    console.log("no data came through");
                }
                const jsonData = await data.json();
                console.log(jsonData);
                var newData = [];
                if (jsonData && jsonData.length>0){
                    var lat = parseFloat(jsonData.latitude);
                    var lat = parseFloat(jsonData.longitude);
                    var lon = jsonData.longitude;
                    var date = jsonData.acq_date;
                    var time = jsonData.acq_time;
                    newData.push({lat, lon, date:date, time:time});
                }
                getData(newData);
            } catch (error) {
                 console.error(error.message);
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
                {fireData.map(()=>{})}
            </LayerGroup>
        </LayersControl.Overlay>
    );
}
export default layerReturn;