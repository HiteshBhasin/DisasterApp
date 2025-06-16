import puppeteer from "puppeteer";

async function WebScrapping() {
    const browser = await puppeteer.launch({
    headless: "true", //A headless browser is essentially a browser without a graphical user interface, which allows for faster and more efficient automation.
    defaultViewport: null
});

const page = await browser.newPage();

await page.goto("https://www.manitoba.ca/wildfire/news.html",
    {waitUntil: "domcontentloaded",});

try {
    const contents = await page.evaluate(()=>{
    const content = document.querySelectorAll(".col-3-4");
    if (content){
    for(let i =0;i<content.length;i++){
        console.log(content[i]);
    }
    
    
    }
});
} catch (error) {
    console.log(error.message);
}
 


}
