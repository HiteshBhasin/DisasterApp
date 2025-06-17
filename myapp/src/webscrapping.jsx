import  { useState, useEffect } from "react";

function Updates() {
    const [updatedData, getUpdatedData] = useState(" ");

    useEffect(()=>{

        async function getUpdates( ) {
            try {
                url="";
                const fetchData =fetch(url);
                if(fetchData){
                const jsonData = (await fetchData).json()}
                else{
                    console.error("We didnt get any Data", jsonData);
                }
            } catch (error) {
                
            }
        }



    });
}