import puppeteer from "puppeteer";

async function WebScrapping() {
    const browser = await puppeteer.launch({
    headless: true, //A headless browser is essentially a browser without a graphical user interface, which allows for faster and more efficient automation.
    defaultViewport: null
});

const page = await browser.newPage();

await page.goto("https://www.manitoba.ca/wildfire/news.html",
    {waitUntil: "domcontentloaded",});
   
 const text: string[] = [];

try {
    await page.evaluate(()=>{
    const content = document.querySelectorAll(".col-3-4");
    content.forEach((el)=>{
        text.push(el.innerHTML);
    });
});
} catch (error) {
    if (error instanceof Error) {
        console.log(error.message);
    } else {
        console.log(error);
    }
}
 return text ;
}

export default WebScrapping;
