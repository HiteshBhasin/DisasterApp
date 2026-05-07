async function CBCScrapping(): Promise<{ title: string; link: string; date: string; description: string; image: string }[]> {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    };

    const feeds = [
        'https://globalnews.ca/winnipeg/feed/',
        'https://globalnews.ca/canada/feed/',
        'https://globalnews.ca/feed/',
    ];

    const results = await Promise.allSettled(feeds.map(url => fetch(url, { headers })));

    const allItems: { title: string; link: string; date: string; description: string; image: string }[] = [];

    for (const result of results) {
        if (result.status !== 'fulfilled' || !result.value.ok) continue;
        const xml = await result.value.text();
        const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

        for (const item of items) {
            const title = (
                item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                item.match(/<title>(.*?)<\/title>/)
            )?.[1]?.trim() || '';

            const link = (
                item.match(/<link>(https?:\/\/[^<]+)<\/link>/) ||
                item.match(/<guid[^>]*isPermaLink="true"[^>]*>(.*?)<\/guid>/) ||
                item.match(/<guid[^>]*>(.*?)<\/guid>/)
            )?.[1]?.trim() || '';

            const date = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim() || '';

            const description = (
                item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) ||
                item.match(/<description>(.*?)<\/description>/)
            )?.[1]?.replace(/<[^>]+>/g, '').trim().slice(0, 220) || '';

            const image = (
                item.match(/<media:thumbnail[^>]+url="([^"]+)"/) ||
                item.match(/<enclosure[^>]+url="([^"]+)"[^>]+type="image/)
            )?.[1]?.trim() || '';

            if (title && link) {
                allItems.push({ title, link, date, description, image });
            }
        }
    }

    const seen = new Set<string>();
    const unique = allItems.filter(item => {
        if (seen.has(item.link)) return false;
        seen.add(item.link);
        return true;
    });

    return unique.slice(0, 20);
}

export default CBCScrapping;
