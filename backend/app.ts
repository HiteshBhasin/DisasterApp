
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import WebScrapping from './webscrapping';
import CBCScrapping from './cbcScrapping';

const app = express();
const port = process.env.PORT || 8088;

app.use(cors());
app.use(express.json());

app.get("/home", (req, res) => {
    const file = path.join(__dirname, './content/about.txt');
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error('error parsing the file');
            res.status(500).json({ error: 'Failed to read file' });
        } else {
            res.send(data);
        }
    });
});

app.get("/firenews", async (req, res) => {
    try {
        const newsData = await WebScrapping();
        res.send(newsData);
    } catch (error) {
        console.error("failed", error);
        res.status(500).json({ success: false, error: "Scraping failed" });
    }
});

app.get("/cbcnews", async (req, res) => {
    try {
        const newsData = await CBCScrapping();
        res.send(newsData);
    } catch (error) {
        console.error("CBC scrape failed", error);
        res.status(500).json({ success: false, error: "CBC scraping failed" });
    }
});

app.get("/floodevents", async (req, res) => {
    try {
        const [floodsRes, stormsRes] = await Promise.all([
            fetch("https://eonet.gsfc.nasa.gov/api/v3/events?category=floods&limit=50"),
            fetch("https://eonet.gsfc.nasa.gov/api/v3/events?category=severeStorms&limit=30")
        ]);
        const floodsData = await floodsRes.json() as { events: unknown[] };
        const stormsData = await stormsRes.json() as { events: unknown[] };
        const combined = [...(floodsData.events || []), ...(stormsData.events || [])];
        res.json(combined);
    } catch (error) {
        console.error("EONET flood fetch failed", error);
        res.status(500).json({ error: "Failed to fetch flood events" });
    }
});

app.get("/eonetevents", async (req, res) => {
    try {
        const response = await fetch("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=100");
        const data = await response.json() as { events: unknown[] };
        res.json(data.events || []);
    } catch (error) {
        console.error("EONET fetch failed", error);
        res.status(500).json({ error: "Failed to fetch EONET events" });
    }
});

app.get("/firespots", async (req, res) => {
    try {
        const response = await fetch("https://firms.modaps.eosdis.nasa.gov/api/area/json/a1531693fe55b8fce18f80c7f1417972/MODIS_NRT/NorthAmerica/24h");
        if (!response.ok) {
            res.status(response.status).json({ error: "NASA FIRMS request failed" });
            return;
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("NASA FIRMS fetch failed", error);
        res.status(500).json({ error: "Failed to fetch fire data" });
    }
});
app.get("/firespotsArcGIS", async (req, res) => {
    try {
        const url = "https://services.arcgis.com/txWDfZ2LIgzmw5Ts/arcgis/rest/services/cwfis_active_fires_updated_view/FeatureServer/0/query?where=1%3D1&outFields=lat%2Clon%2Cfirename%2Cstartdate%2Cstage_of_control%2Chectares&returnGeometry=false&f=json";
        const response = await fetch(url);
        if (!response.ok) {
            res.status(response.status).json({ error: "ArcGIS request failed" });
            return;
        }
        const data = await response.json() as { features?: { attributes: { lat: number | null, lon: number | null, firename: string | null, startdate: string | null, stage_of_control: string | null, hectares: number | null } }[] };
        const normalized = (data.features || [])
            .filter(f => f.attributes.lat != null && f.attributes.lon != null)
            .map(f => ({
                latitude: f.attributes.lat,
                longitude: f.attributes.lon,
                acq_date: f.attributes.startdate || "",
                acq_time: "",
                firename: f.attributes.firename || "",
                stage_of_control: f.attributes.stage_of_control || "",
                hectares: f.attributes.hectares,
            }));
        res.json(normalized);
    } catch (error) {
        console.error("ArcGIS fetch failed", error);
        res.status(500).json({ error: "Failed to fetch fire data" });
    }
});
const buildPath = path.join(__dirname, "../../myapp/build");
const buildPathFallback = path.join(__dirname, "../myapp/build");
const resolvedBuild = require('fs').existsSync(path.join(buildPath, 'index.html')) ? buildPath : buildPathFallback;

app.use(express.static(resolvedBuild));
app.get("/{*path}", function (req, res) {
    res.sendFile(
        path.join(resolvedBuild, "index.html"),
        (err) => {
            if (err) {
                res.status(500).send(err);
            }
        }
    );
});

app.listen(port, () => {
    console.log(`server is running on ${port}`);
});