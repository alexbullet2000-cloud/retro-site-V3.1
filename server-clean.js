const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const COUNTER_FILE = path.join(__dirname, 'data', 'visitor-count.json');
const STATIC_DIR = __dirname;

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
  if (req.path.startsWith('/api/') || req.path === '/' || req.path.endsWith('.html') || req.path.endsWith('.js') || req.path.endsWith('.css') || req.path.endsWith('.mp3')) {
    noStoreHeaders(res);
  }
  next();
});
app.use(express.static(STATIC_DIR));

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

app.get('/api/steam', async (req, res) => {
  const steamApiKey = process.env.STEAM_API_KEY;
  const steamId = req.query.steamId || process.env.STEAM_ID || '76561199145094521';

  try {
    const profileResponse = await fetch(`https://steamcommunity.com/profiles/${steamId}?xml=1`);
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
            .replace(/<!\\[CDATA\\[/g, '')
            .replace(/\\]\\]>/g, '')
            .trim();
          return cleaned;
        }
      }

      return null;
    };

    const profileName = getXmlValue('steamID') || 'Steam User';
    const avatar = getXmlValue('avatarFull');
    const onlineState = getXmlValue('onlineState') || 'offline';
    const mostPlayed = profileText.match(/<gameName><!\\[CDATA\\[(.*?)\\]\\]><\\/gameName>/s)
      || profileText.match(/<gameName>(.*?)<\\/gameName>/s);

    if (!avatar) {
      return res.json({ success: false, message: 'Steam profile not found' });
    }

    let recentGames = [];
    let ownedGames = [];
    let totalHoursPlayed = 0;

    if (steamApiKey) {
      const [recentResponse, ownedResponse] = await Promise.all([
        fetch(`https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=${steamApiKey}&steamid=${steamId}&count=6`),
        fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${steamApiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`)
      ]);
      const recentJson = await recentResponse.json();
      const ownedJson = await ownedResponse.json();
      recentGames = recentJson.response?.games || [];
      ownedGames = ownedJson.response?.games || [];
      totalHoursPlayed = Math.round(
        ownedGames.reduce((sum, game) => sum + (game.playtime_forever || 0), 0) / 60
      );
    }

    res.json({
      success: true,
      data: {
        profile: {
          personaname: profileName,
          avatarfull: avatar,
          personastate: onlineState === 'online' ? 1 : 0,
          gameextrainfo: mostPlayed ? mostPlayed[1] : null
        },
        recentGames,
        ownedGames,
        totalHoursPlayed
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Steam API request failed' });
  }
});

app.get('/api/discord', async (req, res) => {
  const userId = req.query.userId || process.env.DISCORD_USER_ID || '1230904398742294660';

  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
    const json = await response.json();
    if (!json.success) {
      return res.status(404).json({ success: false, message: 'Discord profile not found' });
    }
    res.json({ success: true, data: json.data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Discord API request failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
