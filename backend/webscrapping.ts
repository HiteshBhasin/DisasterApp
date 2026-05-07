import puppeteer from "puppeteer";

async function WebScrapping(): Promise<string[]> {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
        ],
    });

    const results: string[] = [];

    try {
        const page = await browser.newPage();

        // Step 1: Get bulletin links and banner image from the news index page
        await page.goto("https://www.manitoba.ca/wildfire/news.html", {
            waitUntil: "networkidle2",
        });

        const { bulletinLinks, bannerImage } = await page.evaluate(() => {
            const links: string[] = [];
            document.querySelectorAll(".col-3-4 a").forEach((a) => {
                const href = (a as HTMLAnchorElement).href;
                if (href && href.includes("news.gov.mb.ca")) {
                    links.push(href);
                }
            });
            const img = document.querySelector(".col-3-4 img") as HTMLImageElement | null;
            return { bulletinLinks: links, bannerImage: img ? img.src : "" };
        });

        console.log(`Found ${bulletinLinks.length} bulletin links, banner: ${bannerImage}`);

        // Step 2: Visit each bulletin and grab actual article content
        for (const link of bulletinLinks.slice(0, 5)) {
            try {
                await page.goto(link, { waitUntil: "networkidle2" });
                const content = await page.evaluate(() => {
                    const el = document.querySelector(".col-3-4");
                    return el ? el.innerHTML : "";
                });
                if (content) {
                    const withImage = bannerImage
                        ? `<img src="${bannerImage}" alt="Wildfire Information" style="width:100%;max-width:700px;border-radius:8px;margin-bottom:16px;" />${content}`
                        : content;
                    results.push(withImage);
                }
            } catch (err) {
                console.log(`Failed to fetch ${link}:`, err);
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        } else {
            console.log(error);
        }
    } finally {
        await browser.close();
    }

    return results;
}

export default WebScrapping;
