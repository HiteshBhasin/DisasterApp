import  { useState, useEffect } from "react";

function Updates() {
    const [updatedData, getUpdatedData] = useState([]);

    useEffect(() => {
        async function getUpdates() {
            try {
                const url = "/firenews";
                const fetchData = await fetch(url);
                if (fetchData.ok) {
                    const jsonData = await fetchData.json();
                    console.log(jsonData);
                    getUpdatedData(jsonData);
                } else {
                    console.error("We didn't get any Data");
                }
            } catch (error) {
                console.log(error.message);
            }
        }
        getUpdates();
    }, []);

    return(
        <div id="updates">
            
            <ul  style={{ listStyleType: "none", padding: 0 }}>
                {Array.isArray(updatedData) && updatedData.length > 0 ? (
                    updatedData.map((item, idx) => (
                        <li key={idx}> {JSON.stringify(item)} </li>
                    ))
                ) : (
                    <li>No updates available.</li>
                )}
            </ul>
            </div>

    );

}
export default Updates;