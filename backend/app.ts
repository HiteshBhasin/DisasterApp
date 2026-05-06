
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import WebScrapping from './webscrapping';

const app = express();
const port = process.env.PORT || 8080;

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

app.use(express.static(path.join(__dirname, "../Client/build")));
app.get("/*", function (req, res) {
    res.sendFile(
        path.join(__dirname, "../Client/build/index.html"),
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