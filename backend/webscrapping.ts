import * as cheerio from "cheerio";

const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
};

async function WebScrapping(): Promise<string[]> {
    const results: string[] = [];

    try {
        // Step 1: Fetch the wildfire news index page
        const indexRes = await fetch("https://www.manitoba.ca/wildfire/news.html", { headers: HEADERS });
        if (!indexRes.ok) throw new Error(`Index page fetch failed: ${indexRes.status}`);
        const indexHtml = await indexRes.text();
        const $ = cheerio.load(indexHtml);

        // Get banner image and bulletin links from .col-3-4
        const bannerImage = $(".col-3-4 img").first().attr("src") || "";
        const fullBanner = bannerImage.startsWith("http") ? bannerImage : `https://www.manitoba.ca${bannerImage}`;

        const bulletinLinks: string[] = [];
        $(".col-3-4 a").each((_, el) => {
            const href = $(el).attr("href") || "";
            if (href.includes("news.gov.mb.ca")) {
                bulletinLinks.push(href);
            }
        });

        console.log(`Found ${bulletinLinks.length} bulletin links, banner: ${fullBanner}`);

        // Step 2: Fetch each bulletin page and extract content
        for (const link of bulletinLinks.slice(0, 5)) {
            try {
                const res = await fetch(link, { headers: HEADERS });
                if (!res.ok) continue;
                const html = await res.text();
                const $$ = cheerio.load(html);
                const content = $$(".col-3-4").html();
                if (content) {
                    const withImage = fullBanner
                        ? `<img src="${fullBanner}" alt="Wildfire Information" style="width:100%;max-width:700px;border-radius:8px;margin-bottom:16px;" />${content}`
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
    }

    return results;
}

export default WebScrapping;
