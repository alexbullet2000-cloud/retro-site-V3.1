const audio = document.getElementById('bg-audio');
const nowPlaying = document.getElementById('now-playing');
const musicGameLabel = document.getElementById('music-game-label');
const musicCover = document.getElementById('music-cover');
const musicCoverFallback = document.getElementById('music-cover-fallback');
const playerStatus = document.getElementById('player-status');
const prevButton = document.getElementById('music-prev');
const startButton = document.getElementById('music-start');
const pauseButton = document.getElementById('music-pause');
const restartButton = document.getElementById('music-restart');
const nextButton = document.getElementById('music-next');
const progressInput = document.getElementById('music-progress');
const currentTimeEl = document.getElementById('music-current-time');
const durationEl = document.getElementById('music-duration');
const volumeInput = document.getElementById('music-volume');
const soundtrackTabs = document.getElementById('soundtrack-tabs');
const soundtrackList = document.getElementById('soundtrack-list');
const themeButtons = Array.from(document.querySelectorAll('[data-theme-choice]'));
const blurbLanguageButtons = Array.from(document.querySelectorAll('[data-blurb-language]'));
const THEME_STORAGE_KEY = 'personal-home-theme';
const MUSIC_STORAGE_KEY = 'fighting-soundtrack-track';
let SOUNDTRACKS = [
  {
    id: 'tekken-3',
    title: 'Tekken 3',
    shortTitle: 'T3',
    folder: 'tekken-3',
    tracks: [
      { title: 'Jin Kazama', file: 'jin-kazama.mp3' },
      { title: 'Hwoarang', file: 'hwoarang.mp3' },
      { title: 'King', file: 'king.mp3' },
      { title: 'Eddy Gordo', file: 'eddy-gordo.mp3' }
    ]
  },
  {
    id: 'tekken-4',
    title: 'Tekken 4',
    shortTitle: 'T4',
    folder: 'tekken-4',
    tracks: [
      { title: 'Authentic Sky', file: 'authentic-sky.mp3' },
      { title: 'Touch and Go', file: 'touch-and-go.mp3' },
      { title: 'Kitsch', file: 'kitsch.mp3' },
      { title: 'Bit Crusher', file: 'bit-crusher.mp3' }
    ]
  },
  {
    id: 'tekken-5',
    title: 'Tekken 5',
    shortTitle: 'T5',
    folder: 'tekken-5',
    tracks: [
      { title: 'Moonlit Wilderness', file: 'moonlit-wilderness.mp3' },
      { title: 'Ground Zero Funk', file: 'ground-zero-funk.mp3' },
      { title: 'Poolside', file: 'poolside.mp3' },
      { title: 'Sparking', file: 'sparking.mp3' }
    ]
  },
  {
    id: 'tekken-7',
    title: 'Tekken 7',
    shortTitle: 'T7',
    folder: 'tekken-7',
    tracks: [
      { title: 'Heat Haze Shadow', file: 'heat-haze-shadow.mp3' },
      { title: 'Infinite Azure', file: 'infinite-azure.mp3' },
      { title: 'Vermilion Gates', file: 'vermilion-gates.mp3' },
      { title: 'Devil Kazumi', file: 'devil-kazumi.mp3' }
    ]
  },
  {
    id: 'tekken-8',
    title: 'Tekken 8',
    shortTitle: 'T8',
    folder: 'tekken-8',
    tracks: [
      { title: 'My Last Stand', file: 'my-last-stand.mp3' },
      { title: 'Neo City', file: 'neo-city.mp3' },
      { title: 'Fallen Destiny', file: 'fallen-destiny.mp3' },
      { title: 'Storm Rising', file: 'storm-rising.mp3' }
    ]
  },
  {
    id: 'street-fighter-2',
    title: 'Street Fighter II',
    shortTitle: 'SF2',
    folder: 'street-fighter-2',
    tracks: [
      { title: 'Ryu Theme', file: 'ryu-theme.mp3' },
      { title: 'Ken Theme', file: 'ken-theme.mp3' },
      { title: 'Guile Theme', file: 'guile-theme.mp3' },
      { title: 'Chun-Li Theme', file: 'chun-li-theme.mp3' }
    ]
  },
  {
    id: 'street-fighter-3',
    title: 'Street Fighter III',
    shortTitle: 'SF3',
    folder: 'street-fighter-3',
    tracks: [
      { title: 'Jazzy NYC', file: 'jazzy-nyc.mp3' },
      { title: 'The Longshoreman', file: 'the-longshoreman.mp3' },
      { title: 'Beats in My Head', file: 'beats-in-my-head.mp3' },
      { title: 'Killing Moon', file: 'killing-moon.mp3' }
    ]
  },
  {
    id: 'street-fighter-4',
    title: 'Street Fighter IV',
    shortTitle: 'SF4',
    folder: 'street-fighter-4',
    tracks: [
      { title: 'Indestructible', file: 'indestructible.mp3' },
      { title: 'Theme of Ryu', file: 'theme-of-ryu.mp3' },
      { title: 'Theme of Ken', file: 'theme-of-ken.mp3' },
      { title: 'Theme of Juri', file: 'theme-of-juri.mp3' }
    ]
  },
  {
    id: 'super-street-fighter-4',
    title: 'Super Street Fighter IV',
    shortTitle: 'SSF4',
    folder: 'super-street-fighter-4',
    tracks: [
      { title: 'Character Select', file: 'character-select.mp3' },
      { title: 'Theme of Juri', file: 'theme-of-juri.mp3' },
      { title: 'Theme of Cody', file: 'theme-of-cody.mp3' },
      { title: 'Theme of Guy', file: 'theme-of-guy.mp3' }
    ]
  },
  {
    id: 'street-fighter-5',
    title: 'Street Fighter V',
    shortTitle: 'SF5',
    folder: 'street-fighter-5',
    tracks: [
      { title: 'Theme of Rashid', file: 'theme-of-rashid.mp3' },
      { title: 'Theme of Ryu', file: 'theme-of-ryu.mp3' },
      { title: 'Ring of Destiny', file: 'ring-of-destiny.mp3' },
      { title: 'Kanzuki Estate', file: 'kanzuki-estate.mp3' }
    ]
  },
  {
    id: 'street-fighter-5-arcade-edition',
    title: 'Street Fighter V Arcade Edition',
    shortTitle: 'SFVAE',
    folder: 'street-fighter-5-arcade-edition',
    tracks: [
      { title: 'Street Fighter V Arcade Edition Opening', file: '01-street-fighter-v-arcade-edition-opening.mp3' },
      { title: 'Main Menu Arcade Edition', file: '02-main-menu-arcade-edition.mp3' },
      { title: 'Character Select Arcade Edition', file: '03-character-select-arcade-edition.mp3' },
      { title: 'Versus Arcade Edition', file: '04-versus-arcade-edition.mp3' }
    ]
  },
  {
    id: 'sfxtekken',
    title: 'Street Fighter X Tekken',
    shortTitle: 'SFXT',
    folder: 'sfxtekken',
    tracks: [
      { title: 'Main Menu', file: 'main-menu.mp3' },
      { title: 'Character Select', file: 'character-select.mp3' },
      { title: 'Antarctica', file: 'antarctica.mp3' },
      { title: 'Final Fight', file: 'final-fight.mp3' }
    ]
  }
];
const OPTIMIZED_SOUNDTRACKS = [
  {
    id: 'tekken-3',
    title: 'Tekken 3',
    shortTitle: 'T3',
    folder: 'tekken-3',
    cover: 'assets/soundtracks/tekken-3/title.png',
    tracks: [
      { title: 'Game Over', file: 'slus-00402-118-nobuyoshi-sano-game-over.mp3' }
    ]
  },
  {
    id: 'tekken-4',
    title: 'Tekken 4',
    shortTitle: 'T4',
    folder: 'tekken-4',
    cover: 'assets/soundtracks/tekken-4/title.jpg',
    tracks: [
      { title: 'Quadra Introduction', file: 'quadra-introduction.mp3' }
    ]
  },
  {
    id: 'tekken-5',
    title: 'Tekken 5',
    shortTitle: 'T5',
    folder: 'tekken-5',
    cover: 'assets/soundtracks/tekken-5/title.jpg',
    tracks: [
      { title: 'Tekken 3 BGM18', file: 'tekken-3-bgm18.mp3' }
    ]
  },
  {
    id: 'tekken-7',
    title: 'Tekken 7',
    shortTitle: 'T7',
    folder: 'tekken-7',
    cover: 'assets/soundtracks/tekken-7/title.jpg',
    tracks: [
      { title: "Nina's Ending", file: '34-nina-s-ending.flac' }
    ]
  },
  {
    id: 'tekken-8',
    title: 'Tekken 8',
    shortTitle: 'T8',
    folder: 'tekken-8',
    cover: 'assets/soundtracks/tekken-8/title.jpg',
    tracks: [
      { title: 'My Last Stand', file: 'my-last-stand.mp3' }
    ]
  },
  {
    id: 'street-fighter-2',
    title: 'Street Fighter II',
    shortTitle: 'SF2',
    folder: 'street-fighter-2',
    cover: 'assets/soundtracks/street-fighter-2/title.png',
    tracks: [
      { title: 'Fight!', file: 'fight.mp3' }
    ]
  },
  {
    id: 'street-fighter-3',
    title: 'Street Fighter III',
    shortTitle: 'SF3',
    folder: 'street-fighter-3',
    cover: 'assets/soundtracks/street-fighter-3/title.webp',
    tracks: [
      { title: 'VS', file: 'o51-vs.mp3' }
    ]
  },
  {
    id: 'street-fighter-4',
    title: 'Street Fighter IV',
    shortTitle: 'SF4',
    folder: 'street-fighter-4',
    cover: 'assets/soundtracks/street-fighter-4/title.png',
    tracks: [
      { title: 'VS Screen Normal', file: 'hideyuki-fukasawa-vs-screen-normal.mp3' }
    ]
  },
  {
    id: 'super-street-fighter-4',
    title: 'Super Street Fighter IV',
    shortTitle: 'SSF4',
    folder: 'super-street-fighter-4',
    cover: 'assets/soundtracks/super-street-fighter-4/title.webp',
    tracks: [
      { title: 'Synth BGM 8FR', file: 'synth-s-bgm-8fr-wav.mp3' }
    ]
  },
  {
    id: 'street-fighter-5',
    title: 'Street Fighter V',
    shortTitle: 'SF5',
    folder: 'street-fighter-5',
    cover: 'assets/soundtracks/street-fighter-5/title.jpg',
    tracks: [
      { title: 'Game Over', file: '25-game-over.mp3' }
    ]
  },
  {
    id: 'street-fighter-5-arcade-edition',
    title: 'Street Fighter V Arcade Edition',
    shortTitle: 'SFVAE',
    folder: 'street-fighter-5-arcade-edition',
    cover: 'assets/soundtracks/street-fighter-5-arcade-edition/title.svg',
    tracks: [
      { title: 'Versus Arcade Edition', file: '04-versus-arcade-edition.mp3' }
    ]
  },
  {
    id: 'sfxtekken',
    title: 'Street Fighter X Tekken',
    shortTitle: 'SFXT',
    folder: 'sfxtekken',
    cover: 'assets/soundtracks/sfxtekken/title.jpg',
    tracks: [
      { title: 'VS Screen', file: '04-vs-screen.mp3' }
    ]
  }
];
let ALL_TRACKS = buildAllTracks(SOUNDTRACKS);
let activeGameId = SOUNDTRACKS[0]?.id || '';
let currentTrackIndex = 0;
const VALID_THEMES = [
  'default',
  'dark-aero',
  'orange-aero',
  'green-aero',
  'bubble-pop',
  'galaxy',
  'steam-2004',
  'win-vista'
];
const BLURB_TRANSLATIONS = {
  pt: 'Olá! Gosto de criar sites, ouvir música, jogar na Steam e ficar online até de madrugada. Se quiseres trocar ideias, diz olá no Discord ou entra para jogarmos alguma coisa juntos.',
  en: 'Hi! I like making websites, listening to music, playing games on Steam, and staying online until way too late. If you want to trade ideas, say hi on Discord or join me for a game.',
  ja: 'こんにちは！ウェブサイトを作ったり、音楽を聴いたり、Steamでゲームをしたり、夜明けまでオンラインで過ごすのが好きです。話したいときはDiscordで声をかけてください。一緒にゲームもしましょう。'
};

const isFileMode = window.location.protocol === 'file:';
const API_BASE = isFileMode ? 'http://localhost:3000' : '';

function apiUrl(path) {
  return API_BASE ? `${API_BASE}${path}` : path.replace(/^\//, '');
}

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    // The theme still changes for the current page even if storage is blocked.
  }
}

function applyTheme(theme, shouldStore = true) {
  const activeTheme = VALID_THEMES.includes(theme) ? theme : 'default';

  if (activeTheme === 'default') {
    document.body.removeAttribute('data-theme');
  } else {
    document.body.dataset.theme = activeTheme;
  }

  themeButtons.forEach((button) => {
    const isActive = button.dataset.themeChoice === activeTheme;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  if (shouldStore) {
    storeTheme(activeTheme);
  }
}

function setupThemes() {
  const initialTheme = getStoredTheme() || 'default';
  applyTheme(initialTheme, false);

  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      applyTheme(button.dataset.themeChoice);
    });
  });
}

function setupBlurbTranslation() {
  const blurbText = document.getElementById('blurb-text');
  if (!blurbText || blurbLanguageButtons.length === 0) return;

  blurbLanguageButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const language = button.dataset.blurbLanguage || 'pt';
      blurbText.textContent = BLURB_TRANSLATIONS[language] || BLURB_TRANSLATIONS.pt;

      blurbLanguageButtons.forEach((option) => {
        const isActive = option === button;
        option.classList.toggle('is-active', isActive);
        option.setAttribute('aria-pressed', String(isActive));
      });
    });
  });
}

function setupRyuEasterEgg() {
  const ryuButton = document.getElementById('ryu-easter-egg');
  const ryuShout = document.getElementById('ryu-shout');
  if (!ryuButton || !ryuShout) return;

  let hideTimeout;

  ryuButton.addEventListener('click', () => {
    clearTimeout(hideTimeout);
    ryuShout.classList.remove('is-active');
    void ryuShout.offsetWidth;
    ryuShout.classList.add('is-active');

    hideTimeout = window.setTimeout(() => {
      ryuShout.classList.remove('is-active');
    }, 950);
  });
}

function setAudioState(isPlaying) {
  document.body.classList.toggle('audio-playing', isPlaying);
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function setPlayerStatus(text) {
  if (playerStatus) {
    playerStatus.textContent = text;
  }
}

function buildAllTracks(games) {
  return games.flatMap((game) => (game.tracks || []).map((track, index) => ({
    ...track,
    id: `${game.id}-${index}`,
    gameId: game.id,
    gameTitle: game.title,
    gameShortTitle: game.shortTitle,
    gameFolder: game.folder,
    gameImage: game.cover || `assets/soundtracks/${game.folder}/title.png`,
    src: `assets/soundtracks/${game.folder}/audio/${track.file}`
  })));
}

async function loadSoundtrackManifest() {
  try {
    const response = await fetch(apiUrl('/assets/soundtracks/manifest.json'), { cache: 'no-store' });
    if (!response.ok) throw new Error('Manifest unavailable');
    const manifest = await response.json();
    if (!Array.isArray(manifest) || manifest.length === 0) throw new Error('Manifest empty');

    SOUNDTRACKS = manifest
      .filter((game) => game && game.id && game.title && game.folder && Array.isArray(game.tracks))
      .map((game) => ({
        id: game.id,
        title: game.title,
        shortTitle: game.shortTitle || game.title,
        folder: game.folder,
        cover: game.cover,
        tracks: game.tracks.filter((track) => track && track.title && track.file)
      }))
      .filter((game) => game.tracks.length > 0);

    ALL_TRACKS = buildAllTracks(SOUNDTRACKS);
    activeGameId = SOUNDTRACKS[0]?.id || '';
  } catch (error) {
    console.warn('Using fallback soundtrack list:', error);
  }
}

function syncProgress() {
  if (!audio || !progressInput || !currentTimeEl || !durationEl) return;

  const duration = audio.duration || 0;
  const currentTime = audio.currentTime || 0;
  progressInput.value = duration ? String((currentTime / duration) * 100) : '0';
  currentTimeEl.textContent = formatTime(currentTime);
  durationEl.textContent = formatTime(duration);
}

function getTrackUrl(track) {
  if (!track) return '';
  return isFileMode ? `${API_BASE}/${track.src}` : track.src;
}

function getCurrentTrack() {
  return ALL_TRACKS[currentTrackIndex] || ALL_TRACKS[0];
}

function storeCurrentTrack() {
  try {
    localStorage.setItem(MUSIC_STORAGE_KEY, getCurrentTrack()?.id || '');
  } catch (error) {
    // The player still works when storage is unavailable.
  }
}

function getStoredTrackIndex() {
  try {
    const storedId = localStorage.getItem(MUSIC_STORAGE_KEY);
    const index = ALL_TRACKS.findIndex((track) => track.id === storedId);
    return index >= 0 ? index : 0;
  } catch (error) {
    return 0;
  }
}

function setCover(track) {
  if (!musicCover || !musicCoverFallback || !track) return;

  musicCoverFallback.textContent = track.gameShortTitle;
  musicCover.classList.remove('is-loaded');
  musicCover.alt = `${track.gameTitle} title`;
  musicCover.src = isFileMode ? `${API_BASE}/${track.gameImage}` : track.gameImage;
}

function updateSoundtrackUi() {
  const track = getCurrentTrack();
  if (!track) return;

  activeGameId = track.gameId;

  if (nowPlaying) {
    nowPlaying.textContent = track.title;
  }

  if (musicGameLabel) {
    musicGameLabel.textContent = track.gameTitle;
  }

  setCover(track);

  document.querySelectorAll('[data-soundtrack-game]').forEach((button) => {
    const isActive = button.dataset.soundtrackGame === activeGameId;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  document.querySelectorAll('[data-track-id]').forEach((button) => {
    const isActive = button.dataset.trackId === track.id;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function loadTrack(index, shouldPlay = false) {
  if (!audio || ALL_TRACKS.length === 0) return;

  currentTrackIndex = (index + ALL_TRACKS.length) % ALL_TRACKS.length;
  const track = getCurrentTrack();
  audio.src = getTrackUrl(track);
  audio.load();
  syncProgress();
  updateSoundtrackUi();
  storeCurrentTrack();
  setPlayerStatus(`Pronto: ${track.gameTitle}`);

  if (shouldPlay) {
    audio.play()
      .then(() => {
        setAudioState(true);
        setPlayerStatus('A tocar');
      })
      .catch(() => setPlayerStatus('Clique em Start para ativar'));
  }
}

function selectGame(gameId) {
  const firstTrackIndex = ALL_TRACKS.findIndex((track) => track.gameId === gameId);
  if (firstTrackIndex >= 0) {
    loadTrack(firstTrackIndex);
  }
}

function selectTrack(trackId, shouldPlay = true) {
  const index = ALL_TRACKS.findIndex((track) => track.id === trackId);
  if (index >= 0) {
    loadTrack(index, shouldPlay);
  }
}

function playNextTrack() {
  loadTrack(currentTrackIndex + 1, true);
}

function playPrevTrack() {
  loadTrack(currentTrackIndex - 1, true);
}

function renderSoundtrackLibrary() {
  if (!soundtrackTabs || !soundtrackList) return;

  soundtrackTabs.innerHTML = SOUNDTRACKS.map((game) => `
    <button class="soundtrack-tab" type="button" data-soundtrack-game="${escapeHtml(game.id)}">
      ${escapeHtml(game.shortTitle)}
    </button>
  `).join('');

  soundtrackList.innerHTML = SOUNDTRACKS.map((game) => `
    <section class="soundtrack-group" data-soundtrack-group="${escapeHtml(game.id)}">
      <div class="soundtrack-heading">
        <span>${escapeHtml(game.title)}</span>
        <span>${game.tracks.length} tracks</span>
      </div>
      <div class="track-grid">
        ${ALL_TRACKS.filter((track) => track.gameId === game.id).map((track) => `
          <button class="track-card" type="button" data-track-id="${escapeHtml(track.id)}">
            <span class="track-thumb">
              <img src="${escapeHtml(track.gameImage)}" alt="" loading="lazy" onerror="this.remove()" />
              <span>${escapeHtml(track.gameShortTitle)}</span>
            </span>
            <span class="track-copy">
              <span class="track-name">${escapeHtml(track.title)}</span>
              <span class="track-game">${escapeHtml(track.gameTitle)}</span>
            </span>
          </button>
        `).join('')}
      </div>
    </section>
  `).join('');

  soundtrackTabs.addEventListener('click', (event) => {
    const button = event.target.closest('[data-soundtrack-game]');
    if (button) {
      selectGame(button.dataset.soundtrackGame);
    }
  });

  soundtrackList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-track-id]');
    if (button) {
      selectTrack(button.dataset.trackId, true);
    }
  });
}

async function setupAudio() {
  if (!audio) return;

  await loadSoundtrackManifest();
  renderSoundtrackLibrary();
  currentTrackIndex = getStoredTrackIndex();
  audio.volume = Number(volumeInput?.value || 0.75);
  loadTrack(currentTrackIndex);

  audio.addEventListener('play', () => setAudioState(true));
  audio.addEventListener('pause', () => setAudioState(false));
  audio.addEventListener('loadedmetadata', syncProgress);
  audio.addEventListener('timeupdate', syncProgress);
  audio.addEventListener('ended', () => {
    setAudioState(false);
    playNextTrack();
  });
  audio.addEventListener('error', () => {
    setAudioState(false);
    const track = getCurrentTrack();
    setPlayerStatus(`Falta o ficheiro: ${track.src}`);
  });

  musicCover?.addEventListener('load', () => {
    musicCover.classList.add('is-loaded');
  });

  musicCover?.addEventListener('error', () => {
    musicCover.classList.remove('is-loaded');
  });

  startButton?.addEventListener('click', () => {
    audio.play()
      .then(() => {
        setAudioState(true);
        setPlayerStatus('A tocar');
      })
      .catch(() => {
        setAudioState(false);
        setPlayerStatus('Clique em Start para ativar');
      });
  });

  pauseButton?.addEventListener('click', () => {
    audio.pause();
    setPlayerStatus('Em pausa');
  });

  prevButton?.addEventListener('click', playPrevTrack);
  nextButton?.addEventListener('click', playNextTrack);

  restartButton?.addEventListener('click', () => {
    audio.currentTime = 0;
    syncProgress();
    audio.play()
      .then(() => {
        setAudioState(true);
        setPlayerStatus('A tocar desde o inicio');
      })
      .catch(() => setPlayerStatus('Clique em Start para ativar'));
  });

  progressInput?.addEventListener('input', () => {
    if (!audio.duration) return;
    audio.currentTime = (Number(progressInput.value) / 100) * audio.duration;
    syncProgress();
  });

  volumeInput?.addEventListener('input', () => {
    audio.volume = Number(volumeInput.value);
  });

  syncProgress();
}

const LANYARD_USER_ID = '1230904398742294660';
const REQUEST_TIMEOUT_MS = 8000;
const STEAM_REFRESH_MS = 15000;

function formatHours(minutes) {
  const hours = Number(minutes || 0) / 60;
  if (hours === 0) return '0h';
  if (hours < 10 && hours % 1 !== 0) return `${hours.toFixed(1)}h`;
  return `${Math.round(hours)}h`;
}

function renderSteamGameImage(game) {
  const coverUrl = game.coverUrl || game.headerUrl || game.iconUrl || '';
  const fallbackUrl = game.headerUrl || game.iconUrl || '';
  if (!coverUrl) return '<span class="steam-game-cover is-empty"></span>';

  return `
    <img
      class="steam-game-cover"
      src="${escapeHtml(coverUrl)}"
      alt=""
      loading="lazy"
      onerror="this.onerror=null;${fallbackUrl ? `this.src='${escapeHtml(fallbackUrl)}';` : "this.style.visibility='hidden';"}"
    />
  `;
}

function renderSteamAvatar(player) {
  if (player.avatarfull) {
    return `<img class="steam-avatar" src="${escapeHtml(player.avatarfull)}" alt="Steam avatar" />`;
  }

  return '<div class="steam-avatar steam-avatar-fallback" aria-hidden="true">ST</div>';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatClock(timestamp) {
  const date = new Date(timestamp || Date.now());
  return date.toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function formatDiscordStatus(status) {
  const states = {
    online: { label: 'Online', className: 'online' },
    idle: { label: 'Ausente', className: 'idle' },
    dnd: { label: 'Nao incomodar', className: 'dnd' },
    offline: { label: 'Offline', className: 'offline' }
  };
  return states[status] || states.offline;
}

function formatDiscordActivity(activities) {
  if (!Array.isArray(activities) || activities.length === 0) {
    return 'Apenas existindo';
  }

  const spotify = activities.find((activity) => activity.name === 'Spotify' || activity.type === 2);
  if (spotify && spotify.details && spotify.state) {
    return `A ouvir Spotify: ${spotify.details} - ${spotify.state}`;
  }

  const playing = activities.find((activity) => activity.type === 0 && activity.name !== 'Custom Status');
  if (playing && playing.name) {
    return `A jogar: ${playing.name}`;
  }

  const custom = activities.find((activity) => activity.type === 4 && activity.state);
  if (custom) {
    return custom.state;
  }

  return 'Apenas existindo';
}

async function loadVisitorCount() {
  const counter = document.getElementById('visitor-count');
  if (!counter) return;

  try {
    const response = await fetchWithTimeout(apiUrl('/api/visitor-counter'), { cache: 'no-store' });
    if (!response.ok) throw new Error('Visitor API failed');
    const data = await response.json();
    counter.textContent = data.count ?? '0';
  } catch (error) {
    console.error('Visitor counter failed:', error);
    counter.textContent = '0';
  }
}

async function loadDiscord() {
  const statusEl = document.getElementById('discord-status');
  const activityEl = document.getElementById('discord-activity');
  const avatarEl = document.getElementById('profile-avatar');
  const nameEl = document.getElementById('profile-name');

  if (!statusEl || !activityEl || !avatarEl || !nameEl) {
    return;
  }

  statusEl.textContent = 'A carregar status...';
  activityEl.textContent = 'A carregar presenca...';

  try {
    const response = await fetchWithTimeout(apiUrl('/api/discord'), { cache: 'no-store' });
    if (!response.ok) throw new Error('Discord API failed');
    const result = await response.json();
    if (!result.success || !result.data) throw new Error('No Discord data');

    const data = result.data;
    const statusMeta = formatDiscordStatus(data.discord_status);
    const user = data.discord_user || {};
    const avatarHash = user.avatar;
    const displayName = user.global_name || user.username || 'Discord User';

    statusEl.textContent = statusMeta.label;
    statusEl.classList.remove('online', 'idle', 'dnd', 'offline');
    statusEl.classList.add(statusMeta.className);
    activityEl.textContent = result.offline ? 'Modo offline - Discord indisponivel' : formatDiscordActivity(data.activities);

    if (avatarHash) {
      avatarEl.src = `https://cdn.discordapp.com/avatars/${LANYARD_USER_ID}/${avatarHash}.png?size=256`;
      avatarEl.alt = `${user.username || 'Discord'} avatar`;
    }

    nameEl.textContent = displayName;
  } catch (error) {
    console.error('Discord lookup failed:', error);
    statusEl.textContent = 'Offline';
    activityEl.textContent = 'Presenca indisponivel';
    statusEl.classList.remove('online', 'idle', 'dnd', 'offline');
    statusEl.classList.add('offline');
  }
}

async function loadSteam() {
  const el = document.getElementById('steam-card');
  if (!el) return;

  const isFirstLoad = !el.dataset.loaded;
  if (isFirstLoad) {
    el.innerHTML = '<span class="loading">A carregar Steam...</span>';
  }

  try {
    const response = await fetchWithTimeout(apiUrl(`/api/steam?t=${Date.now()}`), { cache: 'no-store' });
    if (!response.ok) throw new Error('Steam API failed');
    const data = await response.json();

    if (!data.success || !data.data) {
      el.innerHTML = '<span class="loading">Steam indisponivel</span>';
      return;
    }

    const steamData = data.data;
    const player = steamData.profile || {};
    const recentGames = steamData.recentGames || [];
    const ownedGames = steamData.ownedGames || [];
    const topGames = (steamData.topGames || ownedGames)
      .filter((game) => Number(game.playtime_forever || 0) > 0)
      .sort((a, b) => Number(b.playtime_forever || 0) - Number(a.playtime_forever || 0));
    const currentGame = player.gameextrainfo;
    const statusText = data.offline ? 'Modo offline' : (currentGame ? 'A jogar agora' : (player.personastate === 1 ? 'Online' : 'Offline'));
    const hours = steamData.totalHoursPlayed || 0;
    const liveClass = currentGame ? ' is-live' : '';
    const realtimeText = `Atualizado ${formatClock(steamData.updatedAt)}`;

    el.dataset.loaded = 'true';
    el.innerHTML = `
      <div class="steam-profile">
        ${renderSteamAvatar(player)}
        <div>
          <div class="steam-name">${escapeHtml(player.personaname || 'Steam User')}</div>
          <div class="steam-status${liveClass}">${escapeHtml(statusText)}</div>
        </div>
      </div>
      <div class="steam-current-game${liveClass}">${escapeHtml(currentGame || 'Sem jogo ativo neste momento')}</div>
      <div class="steam-hours">Horas jogadas: ${hours}h</div>
      <div class="steam-updated">${escapeHtml(realtimeText)}</div>
      <div class="steam-section-title">Ultimos 4 jogos:</div>
      <ul class="steam-recent-list">
        ${recentGames.slice(0, 4).map((game) => `
          <li class="${game.is_current ? 'is-current' : ''}">
            <span>${escapeHtml(game.name || 'Jogo')}</span>
            <span>${game.is_current ? 'agora' : formatHours(game.playtime_forever)}</span>
          </li>
        `).join('')}
      </ul>
      <div class="steam-section-title">Mais horas na Steam:</div>
      <ol class="steam-owned-list steam-top-list">
        ${topGames.slice(0, 8).map((game, index) => `
          <li>
            <span class="steam-rank">${index + 1}</span>
            ${renderSteamGameImage(game)}
            <span class="steam-game-name">${escapeHtml(game.name || 'Jogo')}</span>
            <span class="steam-game-hours">${formatHours(game.playtime_forever)}</span>
          </li>
        `).join('')}
      </ol>
    `;
  } catch (error) {
    console.error('Steam lookup failed:', error);
    el.innerHTML = '<span class="loading">Nao foi possivel carregar o Steam</span>';
  }
}

function initSite() {
  setupThemes();
  setupBlurbTranslation();
  setupRyuEasterEgg();
  setupAudio();
  loadVisitorCount();
  loadDiscord();
  loadSteam();

  setTimeout(() => {
    loadDiscord();
    loadSteam();
  }, 1000);

  window.setInterval(() => {
    loadDiscord();
  }, 45000);

  window.setInterval(loadSteam, STEAM_REFRESH_MS);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSite, { once: true });
} else {
  initSite();
}

window.addEventListener('load', () => {
  setTimeout(() => {
    loadDiscord();
    loadSteam();
  }, 500);
});
