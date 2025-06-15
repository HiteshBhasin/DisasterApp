import React ,{useState, useEffect} from "react";

const WebbData = ()=>{
    const [data, getData] = useState(" ");

    useEffect(()=>
    {
        async function News() {
           try {

            const url = "https://www.gov.nt.ca/en/public-safety/latest-updates";
            const response = await fetch(url);
            const jsonData = await response.json();
            console.log(jsonData);
            getData(jsonData);            
           } catch (error) {
            console.log(error.message);
           }
        } News(); 
        
    },[]);



    return (
        <div>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};
export default WebbData;