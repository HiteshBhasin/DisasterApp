import  { useState, useEffect } from "react";

function Updates() {
    const [updatedData, getUpdatedData] = useState(" ");

    useEffect(()=>{

        async function getUpdates( ) {
            try {
                url="";
                const fetchData = await fetch(url);
                if(fetchData){
                const jsonData = fetchData.json();
                console.log(jsonData);
                getUpdatedData(jsonData);   
            }
                else{
                    console.error("We didnt get any Data", jsonData);
                }
            } catch (error) {
                console.log(error.message);
            }
        }



    });
}