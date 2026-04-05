import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Linking, ActivityIndicator, SafeAreaView, StatusBar, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [articles, setArticles] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [sortType, setSortType] = useState('default');
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavs = await AsyncStorage.getItem('favorites');
        if (storedFavs) {
          setFavorites(JSON.parse(storedFavs));
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadFavorites();
    fetchNews('');
  }, []);

  const toggleFavorite = async (article) => {
    let newFavs = [...favorites];
    const index = newFavs.findIndex(fav => fav.link === article.link);

    if (index !== -1) {
      newFavs.splice(index, 1);
    } else {
      newFavs.push(article);
    }

    setFavorites(newFavs);
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavs));
    } catch (e) {
      console.error(e);
    }
  };

  const parseXML = (xmlText) => {
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemXml = match[1];
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
      const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/);
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);

      const titleRaw = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : '無題';
      const title = titleRaw.split(' - ')[0];
      const link = linkMatch ? linkMatch[1] : '#';
      const source = sourceMatch ? sourceMatch[1] : '不明';
      const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

      let summary = '';
      if (descMatch) {
        let rawDesc = descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
        summary = rawDesc.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
      }

      items.push({ id: link + Math.random(), title, link, source, pubDate, summary });
    }
    return items;
  };

  const fetchNews = async (searchQuery) => {
    Keyboard.dismiss();
    setLoading(true);
    setQuery(searchQuery);
    setSortType('default');

    let targetUrl = searchQuery
      ? `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=ja&gl=JP&ceid=JP:ja`
      : `https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja`;

    try {
      const response = await fetch(targetUrl);
      const xmlText = await response.text();
      const parsedItems = parseXML(xmlText);
      setArticles(parsedItems);
    } catch (error) {
      console.error(error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      setShowFavorites(false);
      fetchNews(searchInput.trim());
    }
  };

  const formatDate = (dateInput) => {
    const date = new Date(dateInput);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}/${m}/${d} ${h}:${min}`;
  };

  const getSortedArticles = () => {
    let source = showFavorites ? favorites : articles;
    let sorted = [...source];
    if (sortType === 'newest') {
      sorted.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    } else if (sortType === 'oldest') {
      sorted.sort((a, b) => new Date(a.pubDate) - new Date(b.pubDate));
    }
    return sorted;
  };

  const theme = isDark ? darkTheme : lightTheme;

  const renderItem = ({ item }) => {
    const isFav = favorites.some(fav => fav.link === item.link);
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card }]}
        onPress={() => Linking.openURL(item.link)}
        activeOpacity={0.7}
      >
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[styles.summary, { color: theme.secondaryText }]} numberOfLines={3}>{item.summary}</Text>
        <View style={styles.metaInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.author, { color: theme.accent }]}>🏢 {item.source}</Text>
            <Text style={[styles.date, { color: theme.secondaryText, marginLeft: 10 }]}>🕒 {formatDate(item.pubDate)}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleFavorite(item)} style={styles.favBtn}>
            <Text style={{ fontSize: 22, color: isFav ? '#f4b400' : theme.secondaryText }}>
              {isFav ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.card }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.card} />

      <View style={[styles.topbar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => { setSearchInput(''); setShowFavorites(false); fetchNews(''); }}>
          <Text style={[styles.logo, { color: theme.accent }]}>📰 News Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.themeBtn, { borderColor: theme.secondaryText }]} onPress={() => setIsDark(!isDark)}>
          <Text style={styles.themeBtnText}>{isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.mainBg, { backgroundColor: theme.bg }]}>

        <View style={[styles.tabContainer, { borderBottomColor: theme.border, backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[styles.tab, !showFavorites && { borderBottomWidth: 3, borderBottomColor: theme.accent }]}
            onPress={() => setShowFavorites(false)}
          >
            <Text style={{ color: !showFavorites ? theme.accent : theme.secondaryText, fontWeight: 'bold' }}>ニュース</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, showFavorites && { borderBottomWidth: 3, borderBottomColor: theme.accent }]}
            onPress={() => setShowFavorites(true)}
          >
            <Text style={{ color: showFavorites ? theme.accent : theme.secondaryText, fontWeight: 'bold' }}>お気に入り ({favorites.length})</Text>
          </TouchableOpacity>
        </View>

        {!showFavorites && (
          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              placeholder="キーワードでニュースを検索..."
              placeholderTextColor={theme.secondaryText}
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={[styles.searchBtn, { backgroundColor: theme.accent }]} onPress={handleSearch}>
              <Text style={styles.searchBtnText}>検索</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.headerContainer, { borderBottomColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text, borderLeftColor: theme.accent }]}>
            {showFavorites ? '⭐ お気に入り記事' : (query ? `🔍 「${query}」の検索結果` : '🔥 今日のトレンド')}
          </Text>
        </View>

        {((query && !showFavorites) || showFavorites) && !loading && getSortedArticles().length > 0 && (
          <View style={styles.sortContainer}>
            <TouchableOpacity onPress={() => setSortType('default')} style={styles.sortTab}>
              <Text style={[styles.sortText, { color: sortType === 'default' ? theme.accent : theme.secondaryText, fontWeight: sortType === 'default' ? 'bold' : 'normal' }]}>
                {showFavorites ? '保存順' : '関連度順'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSortType('newest')} style={styles.sortTab}>
              <Text style={[styles.sortText, { color: sortType === 'newest' ? theme.accent : theme.secondaryText, fontWeight: sortType === 'newest' ? 'bold' : 'normal' }]}>新着順</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSortType('oldest')} style={styles.sortTab}>
              <Text style={[styles.sortText, { color: sortType === 'oldest' ? theme.accent : theme.secondaryText, fontWeight: sortType === 'oldest' ? 'bold' : 'normal' }]}>古い順</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={{ color: theme.secondaryText, marginTop: 10 }}>読み込み中...</Text>
          </View>
        ) : getSortedArticles().length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={{ color: theme.text }}>記事が見つかりませんでした。</Text>
          </View>
        ) : (
          <FlatList
            data={getSortedArticles()}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const lightTheme = {
  bg: '#f5f5f5',
  text: '#333333',
  card: '#ffffff',
  accent: '#4285f4',
  secondaryText: '#666666',
  border: '#dddddd'
};

const darkTheme = {
  bg: '#121212',
  text: '#e0e0e0',
  card: '#1e1e1e',
  accent: '#4285f4',
  secondaryText: '#aaaaaa',
  border: '#333333'
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  mainBg: { flex: 1 },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, elevation: 3 },
  logo: { fontSize: 20, fontWeight: 'bold' },
  themeBtn: { borderWidth: 1, borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  themeBtnText: { fontSize: 18 },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  searchContainer: { flexDirection: 'row', padding: 20, justifyContent: 'center' },
  searchInput: { flex: 1, borderWidth: 1, borderTopLeftRadius: 25, borderBottomLeftRadius: 25, paddingHorizontal: 20, height: 50, fontSize: 16 },
  searchBtn: { justifyContent: 'center', paddingHorizontal: 25, borderTopRightRadius: 25, borderBottomRightRadius: 25, height: 50 },
  searchBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  headerContainer: { paddingHorizontal: 20, paddingBottom: 10, borderBottomWidth: 2, marginBottom: 10, paddingTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', borderLeftWidth: 5, paddingLeft: 10 },
  sortContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15 },
  sortTab: { marginRight: 20 },
  sortText: { fontSize: 14 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { borderRadius: 12, padding: 20, marginBottom: 15, elevation: 2 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, lineHeight: 22 },
  summary: { fontSize: 14, marginBottom: 15, lineHeight: 20 },
  metaInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  author: { fontSize: 12, fontWeight: 'bold' },
  date: { fontSize: 12 },
  favBtn: { paddingHorizontal: 10 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }
});