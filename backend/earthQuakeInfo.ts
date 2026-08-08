const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
};

async function EarcthQuakeInfo(NOW: Date) {
    const startTime = new Date(NOW.getTime() - 60000).toISOString();
    const endTime = NOW.toISOString();
    const EQK_URL = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startTime}&endtime=${endTime}`;

try{
const data = await fetch(EQK_URL, { headers: HEADERS }).then(res => res.json());
return data
} catch (error) {
    console.error("Error fetching earthquake data:", error);
    return null;
}

}

export default EarcthQuakeInfo;
