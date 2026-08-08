import {useState, useEffect} from "react";
import L from 'leaflet';
import { Marker, Popup, LayersControl, TileLayer, LayerGroup} from 'react-leaflet';

const nasaApi = "/firespots";
const firespotsArcGIS = "/firespotsArcGIS";
const canadaFiresApi = "/fetchActiveFires";

function LayerReturn() {
       const fireIcon = L.icon({
         iconUrl: 'https://cdn-icons-png.flaticon.com/128/10760/10760625.png',
         iconSize: [30,30],
         iconAnchor: [15,30],
        popupAnchor:[0,-30],
       });

       const floodIcon = L.icon({
         iconUrl: 'https://cdn-icons-png.flaticon.com/128/3124/3124823.png',
         iconSize: [30,30],
         iconAnchor: [15,30],
         popupAnchor:[0,-30],
       });

    const [fireData, getData] = useState([]);
    const [floodData, setFloodData] = useState([]);
    const [arcGisData, setArcGisData] = useState([]);
    const [canadaFireData, setCanadaFireData] = useState([]);
    
    useEffect(() => {
        async function fetchData() {
            try {
                const data = await fetch(nasaApi);
                if (!data.ok) return;
                const jsonData = await data.json();
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
                 console.log(error.message, "fire data not coming");
            }
        }
        async function fetchArgisData() {
            try {
                const data = await fetch(firespotsArcGIS);
                if (!data.ok) return;
                const jsonData = await data.json();
                var newData = [];
                if (jsonData && jsonData.length>0){
                    for (const jData of jsonData ){
                        var lat = parseFloat(jData.latitude);
                        var lon = parseFloat(jData.longitude);
                        var date = jData.acq_date;
                        var firename = jData.firename;
                        var stage_of_control = jData.stage_of_control;
                        var hectares = jData.hectares;
                        newData.push({lat, lon, date, firename, stage_of_control, hectares});
                    }
                }
                setArcGisData(newData);
            } catch (error) {
                 console.log(error.message, "arcgis fire data not coming");
            }
        }
        async function fetchFloodData() {
            try {
                const res = await fetch("/floodevents");
                if (!res.ok) return;
                const events = await res.json();
                const markers = [];
                for (const event of events) {
                    if (event.geometry && event.geometry.length > 0) {
                        const geo = event.geometry[event.geometry.length - 1];
                        if (geo.type === "Point") {
                            markers.push({
                                lat: geo.coordinates[1],
                                lon: geo.coordinates[0],
                                title: event.title,
                                date: geo.date ? geo.date.slice(0, 10) : "",
                                link: event.sources?.[0]?.url || "",
                            });
                        }
                    }
                }
                setFloodData(markers);
            } catch (error) {
                console.log(error.message, "flood data not coming");
            }
        }

        async function fetchCanadaFires() {
            try {
                const data = await fetch(canadaFiresApi);
                if (!data.ok) return;
                const jsonData = await data.json();
                const newData = [];
                if (jsonData && jsonData.length > 0) {
                    for (const jData of jsonData) {
                        const lat = parseFloat(jData.latitude);
                        const lon = parseFloat(jData.longitude);
                        if (!isNaN(lat) && !isNaN(lon)) {
                            newData.push({
                                lat,
                                lon,
                                fireId: jData.fireId,
                                agency: jData.agency,
                                sizeHectares: jData.sizeHectares,
                                stageOfControl: jData.stageOfControl,
                                reportDate: jData.reportDate,
                            });
                        }
                    }
                }
                setCanadaFireData(newData);
            } catch (error) {
                console.log(error.message, "canada fire data not coming");
            }
        }

        fetchData();
        fetchFloodData();
        fetchArgisData();
        fetchCanadaFires();

        const interval = setInterval(() => {
            fetchData();
            fetchFloodData();
            fetchArgisData();
            fetchCanadaFires();
        }, 5 * 60 * 1000); // refresh every 5 minutes

        return () => clearInterval(interval);
    }, []);

    return (
        <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
            </LayersControl.BaseLayer>
            <LayersControl.Overlay checked name="🔥 Fires (MODIS)">
                <LayerGroup>
                    {fireData.map((fire, idx)=>(
                        <Marker key={idx} position={[fire.lat, fire.lon]} icon={fireIcon}>
                            <Popup>
                                <strong>Active Fire</strong><br />
                                Date: {fire.date}<br />
                                Time: {fire.time}
                            </Popup>
                        </Marker>
                    ))}
                </LayerGroup>
                
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="🌊 Flood Events (EONET)">
                <LayerGroup>
                    {floodData.map((flood, idx)=>(
                        <Marker key={idx} position={[flood.lat, flood.lon]} icon={floodIcon}>
                            <Popup>
                                <strong>{flood.title}</strong><br />
                                {flood.date && <>Date: {flood.date}<br /></>}
                                {flood.link && <a href={flood.link} target="_blank" rel="noreferrer">More info</a>}
                            </Popup>
                        </Marker>
                    ))}
                </LayerGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="🔥 Fires (ArcGIS)">
                <LayerGroup>
                    {arcGisData.map((fire, idx)=>(
                        <Marker key={idx} position={[fire.lat, fire.lon]} icon={fireIcon}>
                            <Popup>
                                <strong>{fire.firename || "Active Fire (ArcGIS)"}</strong><br />
                                {fire.date && <>Start Date: {fire.date}<br /></>}
                                {fire.stage_of_control && <>Stage: {fire.stage_of_control}<br /></>}
                                {fire.hectares != null && <>Size: {fire.hectares} ha</>}
                            </Popup>
                        </Marker>
                    ))}
                </LayerGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="🔥 Fires (Canada CWFIS)">
                <LayerGroup>
                    {canadaFireData.map((fire, idx) => (
                        <Marker key={idx} position={[fire.lat, fire.lon]} icon={fireIcon}>
                            <Popup>
                                <strong>{fire.fireId || "Canadian Active Fire"}</strong><br />
                                {fire.agency && <>Agency: {fire.agency}<br /></>}
                                {fire.stageOfControl && <>Stage: {fire.stageOfControl}<br /></>}
                                {fire.sizeHectares != null && <>Size: {fire.sizeHectares} ha<br /></>}
                                {fire.reportDate && <>Report Date: {fire.reportDate}</>}
                            </Popup>
                        </Marker>
                    ))}
                </LayerGroup>
            </LayersControl.Overlay>
        </LayersControl>
    );
}
export default LayerReturn;