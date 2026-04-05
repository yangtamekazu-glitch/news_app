from flask import Flask, render_template, request
import feedparser
import requests
import re
import time
import urllib.parse

app = Flask(__name__)

CACHE = {
    "trending": {"timestamp": 0, "data": []},
    "search": {}
}
CACHE_DURATION = 600

def clean_html(text):
    if not text: return ""
    clean = re.sub('<.*?>', '', text)
    return clean[:120]

def fetch_news(query=None):
    if query:
        safe_query = urllib.parse.quote(query)
        url = f"https://news.google.com/rss/search?q={safe_query}&hl=ja&gl=JP&ceid=JP:ja"
    else:
        url = "https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        feed = feedparser.parse(response.text)
        return feed.entries
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        return []

def parse_entries(entries):
    articles = []
    for entry in entries:
        source = "不明"
        if hasattr(entry, 'source'):
            source = entry.source.get('title', '不明')
        elif 'title' in entry and ' - ' in entry.title:
            source = entry.title.split(' - ')[-1]

        articles.append({
            "title": entry.get("title", "無題").split(' - ')[0],
            "summary": clean_html(entry.get("summary", "")),
            "author": source,
            "link": entry.get("link", "#")
        })
    return articles

@app.route("/", methods=["GET", "POST"])
def home():
    query = request.form.get("query", "").strip() if request.method == "POST" else None
    now = time.time()
    
    if now - CACHE["trending"]["timestamp"] > CACHE_DURATION or not CACHE["trending"]["data"]:
        raw_trends = fetch_news()
        if raw_trends:
            CACHE["trending"]["data"] = parse_entries(raw_trends)
            CACHE["trending"]["timestamp"] = now
    
    trend_articles = CACHE["trending"]["data"]

    search_articles = []
    if query:
        cache_hit = CACHE["search"].get(query)
        if cache_hit and (now - cache_hit["timestamp"] <= CACHE_DURATION):
            search_articles = cache_hit["data"]
        else:
            raw_search = fetch_news(query)
            if raw_search:
                search_articles = parse_entries(raw_search)
                CACHE["search"][query] = {"timestamp": now, "data": search_articles}
            elif cache_hit:
                search_articles = cache_hit["data"]

    return render_template("index.html", articles=search_articles, trend_articles=trend_articles, query=query)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000, debug=True)