import puppeteer from "puppeteer";

async function WebScrapping(): Promise<string[]> {
    const browser = await puppeteer.launch({
        headless: true, // A headless browser has no GUI, allowing faster automation.
        defaultViewport: null,
    });

    const page = await browser.newPage();

    await page.goto("https://www.manitoba.ca/wildfire/news.html", {
        waitUntil: "domcontentloaded",
    });

    let text: string[] = [];

    try {
        // page.evaluate runs in the browser context — capture results via return value
        text = await page.evaluate(() => {
            const content = document.querySelectorAll(".col-3-4");
            const results: string[] = [];
            content.forEach((el) => {
                results.push(el.innerHTML);
            });
            return results;
        });
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        } else {
            console.log(error);
        }
    } finally {
        await browser.close();
    }

    return text;
}

export default WebScrapping;
