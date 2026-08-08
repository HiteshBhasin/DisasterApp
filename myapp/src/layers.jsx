import {useState, useEffect, useRef} from "react";
import L from 'leaflet';
import { Marker, Popup, LayersControl, TileLayer, LayerGroup} from 'react-leaflet';

const nasaApi = "/firespots";
const firespotsArcGIS = "/firespotsArcGIS";
const canadaFiresApi = "/fetchActiveFires";

// ── AEF helpers ──────────────────────────────────────────────────────────────
const STEP_LABELS = {
    assess_route:  "Assessing route…",
    clear_zone:    "Zone cleared ✓",
    dispatch:      "Units dispatched ✓",
    complete:      "Incident resolved ✓",
};

async function submitIncidentToAEF(fire) {
    const description =
        `Wildfire detected at lat ${fire.lat}, lon ${fire.lon}. ` +
        `Agency: ${fire.agency || "unknown"}. ` +
        `Size: ${fire.sizeHectares != null ? fire.sizeHectares + " ha" : "unknown"}. ` +
        `Reported: ${fire.reportDate || "now"}.`;
    try {
        const res = await fetch("/aef/incident", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description, location: { lat: fire.lat, lon: fire.lon } }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.goal_id ?? data.id ?? null;
    } catch {
        return null;
    }
}

async function pollAEFStatus(goalId) {
    try {
        const res = await fetch(`/aef/status/${goalId}`);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}
// ─────────────────────────────────────────────────────────────────────────────

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
    // AEF: map of fireId → { goalId, tasks: [], currentStep }
    const [aefIncidents, setAefIncidents] = useState({});
    const submittedFireIds = useRef(new Set());
    
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
                            const fire = {
                                lat,
                                lon,
                                fireId: jData.fireId,
                                agency: jData.agency,
                                sizeHectares: jData.sizeHectares,
                                stageOfControl: jData.stageOfControl,
                                reportDate: jData.reportDate,
                            };
                            newData.push(fire);

                            // Auto-submit new fires to AEF (deduplicated by fireId)
                            const key = String(jData.fireId ?? `${lat}_${lon}`);
                            if (!submittedFireIds.current.has(key)) {
                                submittedFireIds.current.add(key);
                                submitIncidentToAEF(fire).then(goalId => {
                                    if (goalId) {
                                        setAefIncidents(prev => ({
                                            ...prev,
                                            [key]: { goalId, lat, lon, tasks: [], currentStep: "assess_route" }
                                        }));
                                    }
                                });
                            }
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

    // Poll AEF every 30s for status updates on submitted incidents
    useEffect(() => {
        const pollInterval = setInterval(async () => {
            setAefIncidents(prev => {
                const entries = Object.entries(prev);
                if (entries.length === 0) return prev;
                entries.forEach(([key, incident]) => {
                    if (incident.currentStep === "complete") return;
                    pollAEFStatus(incident.goalId).then(tasks => {
                        if (!tasks) return;
                        const taskList = Array.isArray(tasks) ? tasks : tasks.tasks ?? [];
                        const lastDone = [...taskList].reverse().find(t => t.status === "completed" || t.status === "done");
                        const currentStep = lastDone?.name ?? incident.currentStep;
                        setAefIncidents(p => ({ ...p, [key]: { ...p[key], tasks: taskList, currentStep } }));
                    });
                });
                return prev;
            });
        }, 30 * 1000);
        return () => clearInterval(pollInterval);
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
            <LayersControl.Overlay checked name="🚨 AEF Incidents">
                <LayerGroup>
                    {Object.values(aefIncidents).map((incident, idx) => {
                        const label = STEP_LABELS[incident.currentStep] ?? incident.currentStep ?? "Submitted to AEF";
                        return (
                            <Marker key={idx} position={[incident.lat, incident.lon]} icon={fireIcon}>
                                <Popup>
                                    <strong>AEF Incident</strong><br />
                                    Status: <em>{label}</em><br />
                                    Goal ID: {incident.goalId}<br />
                                    {incident.tasks.length > 0 && (
                                        <ol style={{margin:"4px 0 0 16px", padding:0, fontSize:"0.85em"}}>
                                            {incident.tasks.map((t, i) => (
                                                <li key={i} style={{color: t.status === "completed" ? "green" : t.status === "in_progress" ? "orange" : "#555"}}>
                                                    {STEP_LABELS[t.name] ?? t.name} — {t.status}
                                                </li>
                                            ))}
                                        </ol>
                                    )}
                                </Popup>
                            </Marker>
                        );
                    })}
                </LayerGroup>
            </LayersControl.Overlay>
        </LayersControl>
    );
}
export default LayerReturn;