"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
async function WebScrapping() {
    const browser = await puppeteer_1.default.launch({
        headless: true, // A headless browser has no GUI, allowing faster automation.
        defaultViewport: null,
    });
    const page = await browser.newPage();
    await page.goto("https://www.manitoba.ca/wildfire/news.html", {
        waitUntil: "domcontentloaded",
    });
    let text = [];
    try {
        // page.evaluate runs in the browser context — capture results via return value
        text = await page.evaluate(() => {
            // Try primary selector first, fall back to broader selectors
            let content = document.querySelectorAll(".col-3-4");
            if (content.length === 0)
                content = document.querySelectorAll("main article");
            if (content.length === 0)
                content = document.querySelectorAll(".content-area");
            if (content.length === 0)
                content = document.querySelectorAll("main");
            const results = [];
            content.forEach((el) => {
                results.push(el.innerHTML);
            });
            return results;
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        else {
            console.log(error);
        }
    }
    finally {
        await browser.close();
    }
    return text;
}
exports.default = WebScrapping;
