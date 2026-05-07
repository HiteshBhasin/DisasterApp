import { useState, useEffect } from "react";

const BASE_URL = "https://www.gov.mb.ca";

function fixRelativeUrls(html) {
    return html
        .replace(/src="(?!http)(\.\.\/|\/)?/g, `src="${BASE_URL}/`)
        .replace(/href="(?!http)(\.\.\/|\/)?/g, `href="${BASE_URL}/`);
}

function Updates() {
    const [activeTab, setActiveTab] = useState("manitoba");
    const [manitobaData, setManitobaData] = useState([]);
    const [cbcData, setCbcData] = useState([]);
    const [floodData, setFloodData] = useState([]);
    const [loadingManitoba, setLoadingManitoba] = useState(true);
    const [loadingCbc, setLoadingCbc] = useState(true);
    const [loadingFlood, setLoadingFlood] = useState(true);

    useEffect(() => {
        fetch("/firenews")
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => setManitobaData(data))
            .catch(() => setManitobaData([]))
            .finally(() => setLoadingManitoba(false));

        fetch("/cbcnews")
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => setCbcData(data))
            .catch(() => setCbcData([]))
            .finally(() => setLoadingCbc(false));

        fetch("/floodevents")
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(data => setFloodData(data))
            .catch(() => setFloodData([]))
            .finally(() => setLoadingFlood(false));
    }, []);

    return (
        <div id="updates">
            <div className="news-tabs">
                <button className={`news-tab ${activeTab === "manitoba" ? "active" : ""}`} onClick={() => setActiveTab("manitoba")}>
                    🌲 Manitoba Wildfire
                </button>
                <button className={`news-tab ${activeTab === "cbc" ? "active" : ""}`} onClick={() => setActiveTab("cbc")}>
                    📰 Global News
                </button>
                <button className={`news-tab ${activeTab === "flood" ? "active" : ""}`} onClick={() => setActiveTab("flood")}>
                    🌊 Flood Events
                </button>
            </div>

            {activeTab === "manitoba" && (
                <div className="news-content">
                    {loadingManitoba ? <p className="news-loading">Loading Manitoba wildfire news...</p> :
                        manitobaData.length > 0 ? (
                            <ul>{manitobaData.map((item, idx) => (
                                <li key={idx} dangerouslySetInnerHTML={{ __html: fixRelativeUrls(item) }} />
                            ))}</ul>
                        ) : <p className="news-empty">No updates available.</p>
                    }
                </div>
            )}

            {activeTab === "cbc" && (
                <div className="news-content">
                    {loadingCbc ? <p className="news-loading">Loading news...</p> :
                        cbcData.length > 0 ? (
                            <div className="news-cards">
                                {cbcData.map((item, idx) => (
                                    <a key={idx} href={item.link} target="_blank" rel="noreferrer" className="news-card">
                                        {item.image && <img src={item.image} alt={item.title} className="news-card-img" />}
                                        <div className="news-card-body">
                                            <div className="news-card-title">{item.title}</div>
                                            {item.date && <div className="news-date">{new Date(item.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</div>}
                                            {item.description && <p className="news-desc">{item.description}</p>}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : <p className="news-empty">No articles found.</p>
                    }
                </div>
            )}

            {activeTab === "flood" && (
                <div className="news-content">
                    {loadingFlood ? <p className="news-loading">Loading flood events from NASA EONET...</p> :
                        floodData.length > 0 ? (
                            <ul>{floodData.map((event, idx) => (
                                <li key={idx}>
                                    <strong>🌊 {event.title}</strong>
                                    {event.geometry?.[0]?.date && (
                                        <span className="news-date"> — {event.geometry[0].date.slice(0, 10)}</span>
                                    )}
                                    {event.sources?.[0]?.url && (
                                        <> · <a href={event.sources[0].url} target="_blank" rel="noreferrer">Source</a></>
                                    )}
                                </li>
                            ))}</ul>
                        ) : <p className="news-empty">No active flood events found.</p>
                    }
                </div>
            )}
        </div>
    );
}

export default Updates;
