"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const webscrapping_1 = __importDefault(require("./webscrapping"));
const cbcScrapping_1 = __importDefault(require("./cbcScrapping"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8088;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/home", (req, res) => {
    const file = path_1.default.join(__dirname, './content/about.txt');
    fs_1.default.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error('error parsing the file');
            res.status(500).json({ error: 'Failed to read file' });
        }
        else {
            res.send(data);
        }
    });
});
app.get("/firenews", async (req, res) => {
    try {
        const newsData = await (0, webscrapping_1.default)();
        res.send(newsData);
    }
    catch (error) {
        console.error("failed", error);
        res.status(500).json({ success: false, error: "Scraping failed" });
    }
});
app.get("/cbcnews", async (req, res) => {
    try {
        const newsData = await (0, cbcScrapping_1.default)();
        res.send(newsData);
    }
    catch (error) {
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
        const floodsData = await floodsRes.json();
        const stormsData = await stormsRes.json();
        const combined = [...(floodsData.events || []), ...(stormsData.events || [])];
        res.json(combined);
    }
    catch (error) {
        console.error("EONET flood fetch failed", error);
        res.status(500).json({ error: "Failed to fetch flood events" });
    }
});
app.get("/eonetevents", async (req, res) => {
    try {
        const response = await fetch("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=100");
        const data = await response.json();
        res.json(data.events || []);
    }
    catch (error) {
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
    }
    catch (error) {
        console.error("NASA FIRMS fetch failed", error);
        res.status(500).json({ error: "Failed to fetch fire data" });
    }
});
const buildPath = path_1.default.join(__dirname, "../../myapp/build");
const buildPathFallback = path_1.default.join(__dirname, "../myapp/build");
const resolvedBuild = require('fs').existsSync(path_1.default.join(buildPath, 'index.html')) ? buildPath : buildPathFallback;
app.use(express_1.default.static(resolvedBuild));
app.get("/{*path}", function (req, res) {
    res.sendFile(path_1.default.join(resolvedBuild, "index.html"), (err) => {
        if (err) {
            res.status(500).send(err);
        }
    });
});
app.listen(port, () => {
    console.log(`server is running on ${port}`);
});
