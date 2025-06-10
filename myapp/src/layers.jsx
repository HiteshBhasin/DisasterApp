import {useState, useEffect} from "react";
import L from 'leaflet';
import { Marker, Popup, useMapEvent, useMap} from 'react-leaflet';

nasaApi = "https://firms.modaps.eosdis.nasa.gov/api/area/json/<adde6368823b1c811de264a026f39f29>/MODIS_NRT/NorthAmerica/24h";

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

            } catch (error) {
                 console.error(error.message);
            }

            

        }
        fetchData();
    }, []);
}