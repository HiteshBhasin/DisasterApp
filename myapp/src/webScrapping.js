import React ,{useState, useEffect} from "react";
import puppeteer, { Page } from "puppeteer";
const WebbData = ()=>{
    const [data, getData] = useState([]);

    useEffect(()=>
    {
        async function News() {
            const browser = await puppeteer.launch({headless:false, defaultViewport: null});
            const page = await browser.newPage();

            await page.goto("https://www.gov.nt.ca/en/public-safety/latest-updates",{waitUntil:"domcontentloaded"});
            const news = await page.evaluate(()=>{

                const updates = document.querySelectorAll(".field-items");
                getData(updates);
            });
        } News(); 
        
    },[]);



};