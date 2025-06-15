
import puppeteer from "puppeteer";

        async function News() {
            const browser = await puppeteer.launch({headless:false, defaultViewport: null});
            const page = await browser.newPage();

            await page.goto("https://www.gov.nt.ca/en/public-safety/latest-updates",{waitUntil:"domcontentloaded"});
            const news = await page.evaluate(()=>{

                const updates = document.querySelectorAll(".field-items");
                console.log(updates);
            });
        }

export default News;
