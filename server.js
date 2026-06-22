const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const COUNTER_FILE = path.join(__dirname, 'data', 'visitor-count.json');
const STATIC_DIR = __dirname;
const REQUEST_TIMEOUT_MS = 7000;
const FALLBACK_DISCORD_USER = {
  username: 'KazamaKIRA',
  global_name: 'KazamaKIRA',
  avatar: null
};
const FALLBACK_STEAM_GAMES = [
  { appid: 1778820, name: 'TEKKEN 8', playtime_forever: 0 },
  { appid: 389730, name: 'TEKKEN 7', playtime_forever: 0 },
  { appid: 1364780, name: 'Street Fighter 6', playtime_forever: 0 },
  { appid: 310950, name: 'Street Fighter V', playtime_forever: 0 }
].map(withSteamImages);

const noStoreHeaders = (res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
};

function ensureCounterFile() {
  if (!fs.existsSync(path.dirname(COUNTER_FILE))) {
    fs.mkdirSync(path.dirname(COUNTER_FILE), { recursive: true });
  }
  if (!fs.existsSync(COUNTER_FILE)) {
    fs.writeFileSync(COUNTER_FILE, JSON.stringify({ count: 0 }, null, 2));
  }
}

function readCounter() {
  ensureCounterFile();
  return JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf8')).count || 0;
}

function writeCounter(count) {
  ensureCounterFile();
  fs.writeFileSync(COUNTER_FILE, JSON.stringify({ count }, null, 2));
}

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  if (
    req.path.startsWith('/api/')
    || req.path === '/'
    || /\.(html|json)$/i.test(req.path)
  ) {
    noStoreHeaders(res);
  }
  next();
});
app.use(express.static(STATIC_DIR, {
  etag: true,
  maxAge: '1d'
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API running' });
});

app.get('/api/visitor-counter', (req, res) => {
  const current = readCounter();
  const next = current + 1;
  writeCounter(next);
  res.json({ count: next });
});

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      cache: 'no-store',
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url) {
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`Steam request failed: ${response.status}`);
  }
  return response.json();
}

function cleanSteamText(value) {
  if (!value) return null;

  return String(value)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\bIn-Game\b/i, '')
    .replace(/\s+/g, ' ')
    .trim() || null;
}

function getSteamImageUrls(appid) {
  const numericAppId = Number(appid || 0);
  if (!numericAppId) {
    return {
      coverUrl: null,
      headerUrl: null,
      iconUrl: null
    };
  }

  return {
    coverUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${numericAppId}/library_600x900.jpg`,
    headerUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${numericAppId}/header.jpg`,
    iconUrl: `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${numericAppId}/icon.jpg`
  };
}

function withSteamImages(game) {
  const imageUrls = getSteamImageUrls(game.appid);
  const logoUrl = game.img_logo_url
    ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_logo_url}.jpg`
    : null;
  const iconUrl = game.img_icon_url
    ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
    : null;

  return {
    ...game,
    coverUrl: game.coverUrl || imageUrls.coverUrl,
    headerUrl: game.headerUrl || logoUrl || imageUrls.headerUrl,
    iconUrl: game.iconUrl || iconUrl || imageUrls.iconUrl
  };
}

function parseSteamHours(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  const normalized = String(value)
    .replace(',', '.')
    .replace(/[^\d.]/g, '');

  return Number(normalized || 0);
}

async function fetchPublicSteamGamesPage(steamId) {
  const response = await fetchWithTimeout(`https://steamcommunity.com/profiles/${steamId}/games/?tab=all`);
  const html = await response.text();

  if (!response.ok || /<title>\s*Sign In\s*<\/title>/i.test(html)) {
    return [];
  }

  const match = html.match(/var\s+rgGames\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) {
    return [];
  }

  try {
    const games = JSON.parse(match[1]);
    return games
      .map((game) => {
        const appid = Number(game.appid || game.appID || 0);
        const playtimeHours = parseSteamHours(game.hours_forever || game.hoursOnRecord || game.playtime_forever);

        return {
          appid,
          name: cleanSteamText(game.name),
          playtime_forever: Math.round(playtimeHours * 60),
          headerUrl: game.logo || game.img_logo_url || null,
          iconUrl: game.icon || game.img_icon_url || null
        };
      })
      .filter((game) => game.appid && game.name);
  } catch (error) {
    console.error('Could not parse public Steam games page:', error);
    return [];
  }
}

app.get('/api/steam', async (req, res) => {
  const steamApiKey = process.env.STEAM_API_KEY;
  const steamId = req.query.steamId || process.env.STEAM_ID || '76561199145094521';

  try {
    const profileResponse = await fetchWithTimeout(`https://steamcommunity.com/profiles/${steamId}?xml=1`);
    const profileText = await profileResponse.text();

    const getXmlValue = (tag) => {
      const patterns = [
        new RegExp(`<${tag}><!\\[CDATA\\[(.*?)\\]\\]></${tag}>`, 's'),
        new RegExp(`<${tag}>(.*?)</${tag}>`, 's')
      ];

      for (const pattern of patterns) {
        const match = profileText.match(pattern);
        if (match) {
          const cleaned = match[1]
            .replace(/<!\[CDATA\[/g, '')
            .replace(/\]\]>/g, '')
            .trim();
          return cleaned;
        }
      }

      return null;
    };

    const getXmlValueFromBlock = (block, tag) => {
      const patterns = [
        new RegExp(`<${tag}><!\\[CDATA\\[(.*?)\\]\\]></${tag}>`, 's'),
        new RegExp(`<${tag}>(.*?)</${tag}>`, 's')
      ];

      for (const pattern of patterns) {
        const match = block.match(pattern);
        if (match) {
          return match[1]
            .replace(/<!\[CDATA\[/g, '')
            .replace(/\]\]>/g, '')
            .trim();
        }
      }

      return null;
    };

    const publicGames = Array.from(profileText.matchAll(/<mostPlayedGame>(.*?)<\/mostPlayedGame>/gs))
      .map((match) => {
        const block = match[1];
        const name = getXmlValueFromBlock(block, 'gameName');
        const playtimeHours = Number(getXmlValueFromBlock(block, 'hoursOnRecord') || getXmlValueFromBlock(block, 'hoursPlayed') || 0);
        const appid = Number(getXmlValueFromBlock(block, 'statsName') || 0);

        return {
          appid,
          name,
          playtime_forever: Math.round(playtimeHours * 60),
          headerUrl: getXmlValueFromBlock(block, 'gameLogo'),
          iconUrl: getXmlValueFromBlock(block, 'gameIcon')
        };
      })
      .filter((game) => game.name);

    let profileName = getXmlValue('steamID') || 'Steam User';
    let avatar = getXmlValue('avatarFull');
    let onlineState = getXmlValue('onlineState') || 'offline';
    const stateMessage = getXmlValue('stateMessage') || '';
    const mostPlayed = profileText.match(/<gameName><!\[CDATA\[(.*?)\]\]><\/gameName>/s)
      || profileText.match(/<gameName>(.*?)<\/gameName>/s);

    if (!avatar) {
      return res.json({ success: false, message: 'Steam profile not found' });
    }

    let recentGames = [];
    let ownedGames = [];
    let totalHoursPlayed = Math.round(
      publicGames.reduce((sum, game) => sum + (game.playtime_forever || 0), 0) / 60
    );
    let currentGame = cleanSteamText(stateMessage) || cleanSteamText(mostPlayed ? mostPlayed[1] : null);
    let currentGameAppId = null;
    let profileUpdatedAt = Date.now();
    let source = 'public-profile';

    if (steamApiKey) {
      const params = `key=${encodeURIComponent(steamApiKey)}&steamid=${encodeURIComponent(steamId)}`;
      const [summaryJson, recentJson, ownedJson] = await Promise.all([
        fetchJson(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?${params}`),
        fetchJson(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?${params}&count=6`),
        fetchJson(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?${params}&include_appinfo=true&include_played_free_games=true`)
      ]);

      const player = summaryJson.response?.players?.[0] || {};
      profileName = player.personaname || profileName;
      avatar = player.avatarfull || avatar;
      onlineState = Number(player.personastate || 0) > 0 ? 'online' : 'offline';
      currentGame = cleanSteamText(player.gameextrainfo);
      currentGameAppId = player.gameid ? Number(player.gameid) : null;
      profileUpdatedAt = Number(player.lastlogoff || 0) ? Number(player.lastlogoff) * 1000 : Date.now();
      source = 'steam-web-api';

      recentGames = recentJson.response?.games || [];
      ownedGames = ownedJson.response?.games || [];
      totalHoursPlayed = Math.round(
        ownedGames.reduce((sum, game) => sum + (game.playtime_forever || 0), 0) / 60
      );

      if (currentGame && !recentGames.some((game) => Number(game.appid) === currentGameAppId)) {
        const ownedCurrent = ownedGames.find((game) => Number(game.appid) === currentGameAppId);
        recentGames.unshift({
          appid: currentGameAppId,
          name: currentGame,
          playtime_forever: ownedCurrent?.playtime_forever || 0,
          playtime_2weeks: ownedCurrent?.playtime_2weeks || 0,
          is_current: true
        });
      }
    } else {
      const gamesPage = await fetchPublicSteamGamesPage(steamId);
      if (gamesPage.length > publicGames.length) {
        ownedGames = gamesPage;
        totalHoursPlayed = Math.round(
          ownedGames.reduce((sum, game) => sum + (game.playtime_forever || 0), 0) / 60
        );
        source = 'public-games-page';
      }
    }

    if (recentGames.length === 0) {
      recentGames = publicGames.slice(0, 4);
    }

    if (ownedGames.length === 0) {
      ownedGames = publicGames;
    }

    recentGames = recentGames.map(withSteamImages);
    ownedGames = ownedGames.map(withSteamImages);

    const topGames = ownedGames
      .filter((game) => game.name && Number(game.playtime_forever || 0) > 0)
      .sort((a, b) => Number(b.playtime_forever || 0) - Number(a.playtime_forever || 0));

    res.json({
      success: true,
      data: {
        profile: {
          personaname: profileName,
          avatarfull: avatar,
          personastate: onlineState === 'online' ? 1 : 0,
          gameextrainfo: currentGame,
          gameid: currentGameAppId
        },
        recentGames,
        ownedGames,
        topGames,
        totalHoursPlayed,
        updatedAt: Date.now(),
        profileUpdatedAt,
        source,
        realtime: Boolean(steamApiKey)
      }
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: true,
      offline: true,
      message: 'Steam offline fallback',
      data: {
        profile: {
          personaname: 'KazamaKIRA',
          avatarfull: '',
          personastate: 0,
          gameextrainfo: null,
          gameid: null
        },
        recentGames: FALLBACK_STEAM_GAMES,
        ownedGames: FALLBACK_STEAM_GAMES,
        topGames: FALLBACK_STEAM_GAMES,
        totalHoursPlayed: 0,
        updatedAt: Date.now(),
        profileUpdatedAt: Date.now(),
        source: 'offline-fallback',
        realtime: false
      }
    });
  }
});

app.get('/api/discord', async (req, res) => {
  const userId = req.query.userId || process.env.DISCORD_USER_ID || '1230904398742294660';

  try {
    const response = await fetchWithTimeout(`https://api.lanyard.rest/v1/users/${userId}`);
    const json = await response.json();
    if (!json.success) {
      return res.json({
        success: true,
        offline: true,
        message: 'Discord offline fallback',
        data: {
          discord_status: 'offline',
          discord_user: FALLBACK_DISCORD_USER,
          activities: []
        }
      });
    }
    res.json({ success: true, data: json.data });
  } catch (error) {
    console.error(error);
    res.json({
      success: true,
      offline: true,
      message: 'Discord offline fallback',
      data: {
        discord_status: 'offline',
        discord_user: FALLBACK_DISCORD_USER,
        activities: []
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
