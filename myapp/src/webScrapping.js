import React ,{useState, useEffect} from "react";

const WebbData = ()=>{
    const [data, getData] = useState(" ");

    useEffect(()=>
    {
        async function News() {
           try {

            const url = "https://www.gov.nt.ca/en/public-safety/latest-updates";
            const data = await fetch(url);
            const jsonData = data.json();

            getData(jsonData);            
           } catch (error) {
            console.log(error.message);
           }
        } News(); 
        
    },[]);



};