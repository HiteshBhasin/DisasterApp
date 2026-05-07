
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

app.use(express.static(path.join(__dirname, "../myapp/build")));
app.get("/{*path}", function (req, res) {
    res.sendFile(
        path.join(__dirname, "../myapp/build/index.html"),
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