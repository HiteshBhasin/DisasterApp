"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function CBCScrapping() {
    const response = await fetch('https://www.cbc.ca/cmlink/rss-canada-manitoba');
    const xml = await response.text();
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    const parsed = items.map(item => {
        const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
            item.match(/<title>(.*?)<\/title>/))?.[1]?.trim() || '';
        const link = (item.match(/<guid[^>]*>(.*?)<\/guid>/) ||
            item.match(/<link>(.*?)<\/link>/))?.[1]?.trim() || '';
        const date = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim() || '';
        const description = (item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) ||
            item.match(/<description>(.*?)<\/description>/))?.[1]?.replace(/<[^>]+>/g, '').trim().slice(0, 200) || '';
        return { title, link, date, description };
    });
    const keywords = ['wildfire', 'fire', 'flood', 'evacuat', 'emergency', 'disaster', 'drought'];
    return parsed
        .filter(item => keywords.some(k => item.title.toLowerCase().includes(k)))
        .slice(0, 15);
}
exports.default = CBCScrapping;
