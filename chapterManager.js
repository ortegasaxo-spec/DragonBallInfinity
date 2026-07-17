(function(global){
  const saveKey = 'dbzInfinitySaveV1';
  const rankKey = 'survivorRanksV2';
  let selectedGameMode = null;
  window.selectedDifficulty = 'normal';
  let selectedCharacter = null;
  let availableCharacters = [];
  let characterLoadPromise = null;
  let characterFiles = [];
  let uiElement = null;
  const DEFAULT_CHARACTER_FILES = [
    'Goku.png',
    'SSJ.png',
    'SSJ2.png',
    'SSJ3.png',
    'SSJBlue.png',
    'SSJBlueKaioken.png',
    'SSJGod.png',
    'Señal ultra instinto.png',
    'Ultra Instinto.png'
  ];
  const DEFAULT_UNLOCKED_CHARACTERS = DEFAULT_CHARACTER_FILES.map(fileName => fileName.replace(/\.[^/.]+$/, ''));
  characterFiles = DEFAULT_CHARACTER_FILES.slice();

  function parseCharacterLabel(fileName){
    return fileName.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();
  }

  function buildCharacterEntry(fileName){
    return {
      label: parseCharacterLabel(fileName),
      src: encodeURI('assets/personajes/' + fileName)
    };
  }

  function getCharacterFileName(file){
    if (typeof file === 'string') return file;
    if (file && typeof file.name === 'string') return file.name;
    return null;
  }

  function buildSkinCharacterEntry(id){
    return {
      label: parseCharacterLabel(id),
      src: encodeURI('assets/skins/' + id + '.png')
    };
  }

  function buildUnlockedCharacterList(files){
    const defaultById = {};
    DEFAULT_CHARACTER_FILES.forEach(fileName => {
      defaultById[fileName.replace(/\.[^/.]+$/, '')] = fileName;
    });
    (Array.isArray(files) ? files : []).forEach(file => {
      const fileName = getCharacterFileName(file);
      if (fileName) defaultById[fileName.replace(/\.[^/.]+$/, '')] = fileName;
    });

    const skinIds = ((window.shopData && window.shopData.skins) || []).map(item => item.id);
    const unlockedCharacters = getPermanentSaveFields(readSaveData()).unlockedCharacters;
    return unlockedCharacters.map(id => {
      if (defaultById[id]) return buildCharacterEntry(defaultById[id]);
      if (skinIds.includes(id)) return buildSkinCharacterEntry(id);
      return null;
    }).filter(Boolean);
  }

  function setAvailableCharactersFromUnlocked(){
    availableCharacters = buildUnlockedCharacterList(characterFiles);
    if (!selectedCharacter || !availableCharacters.some(ch => ch.src === selectedCharacter.src)) {
      selectedCharacter = availableCharacters[0] || null;
      window.selectedCharacter = selectedCharacter;
    }
    return availableCharacters;
  }

  function loadCharacterList(){

    if(characterLoadPromise)
        return characterLoadPromise.then(setAvailableCharactersFromUnlocked);

    // Si se ejecuta desde file:// no intentamos hacer fetch.
    if(location.protocol === "file:"){

        characterFiles = DEFAULT_CHARACTER_FILES.slice();

        characterLoadPromise = Promise.resolve(characterFiles);

        return characterLoadPromise.then(setAvailableCharactersFromUnlocked);

    }

    const timeout = new Promise((_, reject)=>
        setTimeout(()=>reject(new Error("timeout")),2500)
    );

    const validateResponse = response=>{
        if(!response.ok)
            throw new Error("No se pudo cargar la lista de personajes");
        return response.json();
    };

    const manifestUrl="./assets/personajes/manifest.json";
    const apiUrl="./api/personajes";

    const loadFromManifest=Promise.race([
        fetch(manifestUrl),
        timeout
    ]).then(validateResponse);

    characterLoadPromise=loadFromManifest
        .catch(()=>fetch(apiUrl).then(validateResponse))
        .then(files=>{
            characterFiles=Array.isArray(files)
                ? files
                : DEFAULT_CHARACTER_FILES.slice();
            return characterFiles;
        })
        .catch(()=>{
            characterFiles=DEFAULT_CHARACTER_FILES.slice();
            return characterFiles;
        });

    return characterLoadPromise.then(setAvailableCharactersFromUnlocked);

}

  function formatTime(sec){
    sec = Math.max(0, sec | 0);
    const m = Math.floor(sec / 60);
    const ss = sec % 60;
    return m + ':' + String(ss).padStart(2, '0');
  }

  function renderRanksHtml(){
    let ranks = [];
    try { ranks = JSON.parse(localStorage.getItem(rankKey) || '[]'); }
    catch(e) { ranks = []; }
    if (!ranks.length) return '<div class="menu-empty">Sin ranks guardados</div>';
    return ranks.slice(0, 8).map((r, i) =>
      '<div class="rank-row"><b>' + (i + 1) + '. ' + (r.name || 'AAA') + '</b><span>NV ' + (r.lvl || r.level || 1) + ' | ' + (r.kills || 0) + ' kills | ' + formatTime(r.time || 0) + '</span><em>' + (r.build || 'Build sin registrar') + '</em></div>'
    ).join('');
  }

  function hasSavedGame(){
    const data = readSaveData();
    return !!(data && data.player);
  }

  function readSaveData(){
    try { return JSON.parse(localStorage.getItem(saveKey) || 'null'); }
    catch(e) { return null; }
  }

  function normalizeTechniqueLevels(unlockedTechniques){
    if (Array.isArray(unlockedTechniques)) {
      return unlockedTechniques.reduce((levels, id) => {
        levels[id] = 1;
        return levels;
      }, {});
    }
    if (unlockedTechniques && typeof unlockedTechniques === 'object') {
      return Object.keys(unlockedTechniques).reduce((levels, id) => {
        levels[id] = Math.max(0, Number(unlockedTechniques[id]) || 0);
        return levels;
      }, {});
    }
    return {};
  }

  function getPermanentSaveFields(data){
    data = data || {};
    const unlockedCharacters = Array.isArray(data.unlockedCharacters) ? data.unlockedCharacters.slice() : [];
    DEFAULT_UNLOCKED_CHARACTERS.forEach(id => {
      if (!unlockedCharacters.includes(id)) unlockedCharacters.push(id);
    });
    return {
      zenis: Number(data.zenis) || 0,
      permanentUpgrades: data.permanentUpgrades || {},
      unlockedCharacters,
      unlockedTechniques: normalizeTechniqueLevels(data.unlockedTechniques)
    };
  }

  function getPermanentZenis(){
    return getPermanentSaveFields(readSaveData()).zenis;
  }

  function addPermanentZenis(amount){
    amount = Number(amount) || 0;
    if (amount <= 0) return getPermanentZenis();
    const data = readSaveData() || { version: 2 };
    const permanentFields = getPermanentSaveFields(data);
    data.version = data.version || 2;
    data.zenis = permanentFields.zenis + amount;
    data.permanentUpgrades = permanentFields.permanentUpgrades;
    data.unlockedCharacters = permanentFields.unlockedCharacters;
    data.unlockedTechniques = permanentFields.unlockedTechniques;
    localStorage.setItem(saveKey, JSON.stringify(data));
    return data.zenis;
  }

  function buySkin(item){
    if (!item || item.categoria !== 'skins') return false;
    const data = readSaveData() || { version: 2 };
    const permanentFields = getPermanentSaveFields(data);
    if (permanentFields.unlockedCharacters.includes(item.id)) return false;
    if (permanentFields.zenis < item.precio) {
      showMenuMessage('Zenis insuficientes');
      return false;
    }
    data.version = data.version || 2;
    data.zenis = permanentFields.zenis - item.precio;
    data.permanentUpgrades = permanentFields.permanentUpgrades;
    data.unlockedCharacters = permanentFields.unlockedCharacters.concat(item.id);
    data.unlockedTechniques = permanentFields.unlockedTechniques;
    localStorage.setItem(saveKey, JSON.stringify(data));
    renderStartMenu('shop');
    showMenuMessage('Skin comprada');
    return true;
  }

  function getPermanentUpgradeLevel(item){
    const permanentUpgrades = getPermanentSaveFields(readSaveData()).permanentUpgrades;
    return Math.max(0, Number(permanentUpgrades[item.id]) || 0);
  }

  function getNextUpgradePrice(item, currentLevel){
    if (!item || !Array.isArray(item.preciosPorNivel) || !item.preciosPorNivel.length) return 0;
    return item.preciosPorNivel[Math.min(currentLevel, item.preciosPorNivel.length - 1)];
  }

  function buyPermanentUpgrade(item){
    if (!item || item.categoria !== 'upgrades') return false;
    const data = readSaveData() || { version: 2 };
    const permanentFields = getPermanentSaveFields(data);
    const currentLevel = Math.max(0, Number(permanentFields.permanentUpgrades[item.id]) || 0);
    if (currentLevel >= item.nivelMaximo) return false;
    const price = getNextUpgradePrice(item, currentLevel);
    if (permanentFields.zenis < price) {
      showMenuMessage('Zenis insuficientes');
      return false;
    }
    data.version = data.version || 2;
    data.zenis = permanentFields.zenis - price;
    data.permanentUpgrades = Object.assign({}, permanentFields.permanentUpgrades, {
      [item.id]: currentLevel + 1
    });
    data.unlockedCharacters = permanentFields.unlockedCharacters;
    data.unlockedTechniques = permanentFields.unlockedTechniques;
    localStorage.setItem(saveKey, JSON.stringify(data));
    renderStartMenu('shop');
    showMenuMessage('Mejora comprada');
    return true;
  }

  function getPermanentTechniqueLevel(item){
    const unlockedTechniques = getPermanentSaveFields(readSaveData()).unlockedTechniques;
    return Math.max(0, Number(unlockedTechniques[item.id]) || 0);
  }

  function getNextTechniquePrice(item, currentLevel){
    if (!item) return 0;
    if (Array.isArray(item.preciosPorNivel) && item.preciosPorNivel.length) {
      return item.preciosPorNivel[Math.min(currentLevel, item.preciosPorNivel.length - 1)];
    }
    return Number(item.precio) || 0;
  }

  function buyPermanentTechnique(item){
    if (!item || item.categoria !== 'techniques') return false;
    const data = readSaveData() || { version: 2 };
    const permanentFields = getPermanentSaveFields(data);
    const currentLevel = Math.max(0, Number(permanentFields.unlockedTechniques[item.id]) || 0);
    if (currentLevel >= item.nivelMaximo) return false;
    const price = getNextTechniquePrice(item, currentLevel);
    if (permanentFields.zenis < price) {
      showMenuMessage('Zenis insuficientes');
      return false;
    }
    data.version = data.version || 2;
    data.zenis = permanentFields.zenis - price;
    data.permanentUpgrades = permanentFields.permanentUpgrades;
    data.unlockedCharacters = permanentFields.unlockedCharacters;
    data.unlockedTechniques = Object.assign({}, permanentFields.unlockedTechniques, {
      [item.id]: currentLevel + 1
    });
    localStorage.setItem(saveKey, JSON.stringify(data));
    renderStartMenu('shop');
    showMenuMessage('Técnica comprada');
    return true;
  }

  function getSaveData(){
    const permanentFields = getPermanentSaveFields(readSaveData());
    return {
      version: 2,
      zenis: permanentFields.zenis,
      permanentUpgrades: permanentFields.permanentUpgrades,
      unlockedCharacters: permanentFields.unlockedCharacters,
      unlockedTechniques: permanentFields.unlockedTechniques,
      player: {
        hp: player.hp,
        maxHp: player.maxHp,
        speed: player.speed,
        damage: player.damage,
        bullets: player.bullets,
        fireRate: player.fireRate,
        armor: player.armor
      },
      upgradeLevels: Object.assign({}, upgradeLevels),
      superTechLevels: Object.assign({}, superTechLevels),
      xp, lvl, xpNeed, kills, storyLoop, bossSpawnedLevel, bossCycle, bossIndex,
      bossNextSpawnDelay: Math.max(0, bossNextSpawnAt - getCurrentTime()),
      time: getRunTime(),
      savedAt: getCurrentTime(),
      dragonballCount,
      extraLives
    };
  }

  function saveGame(){
    localStorage.setItem(saveKey, JSON.stringify(getSaveData()));
    showMenuMessage('Partida guardada');
  }

  function loadGame(){
    let data = readSaveData();
    if (!data) return false;
    Object.assign(data, getPermanentSaveFields(data));
    resetGameState();
    Object.assign(player, data.player || {});
    Object.keys(upgradeLevels).forEach(k => upgradeLevels[k] = (data.upgradeLevels && data.upgradeLevels[k]) || 0);
    Object.keys(superTechLevels).forEach(k => superTechLevels[k] = (data.superTechLevels && data.superTechLevels[k]) || 0);
    xp = data.xp || 0;
    lvl = data.lvl || 1;
    xpNeed = data.xpNeed || 10;
    kills = data.kills || 0;
    storyLoop = data.storyLoop || 1;
    bossSpawnedLevel = data.bossSpawnedLevel || 0;
    bossIndex = data.bossIndex || 0;
    bossCycle = getBossCycleForIndex(bossIndex);
    bossNextSpawnAt = getCurrentTime() + Math.max(0, data.bossNextSpawnDelay || 0);
    dragonballCount = data.dragonballCount || 0;
    extraLives = data.extraLives || 0;
    survivalStart = getCurrentTime() - Math.max(0, (data.time || 0) * 1000);
    gameStarted = true;
    gameOver = false;
    paused = false;
    pauseMenuOpen = false;
    if (startOverlay) startOverlay.style.display = 'none';
    if (pauseOverlay) pauseOverlay.style.display = 'none';
    if (uiElement) uiElement.style.display = 'block';
    audioManager.pauseStartMusic();
    audioManager.applySettings(soundSettings);
    if (soundSettings.enabled) audioManager.playBgm();
    return true;
  }

  function applyPermanentUpgradesToNewGame(){
    const permanentUpgrades = getPermanentSaveFields(readSaveData()).permanentUpgrades;
    Object.keys(upgradeLevels).forEach(key => {
      const max = upgradeMax[key] || 0;
      const level = Math.max(0, Math.min(Number(permanentUpgrades[key]) || 0, max));
      upgradeLevels[key] = level;
    });

    player.damage += upgradeLevels.damage;
    player.speed += upgradeLevels.speed * 0.4;
    player.maxHp += upgradeLevels.hp * 20;
    player.hp += upgradeLevels.hp * 20;
    player.bullets += upgradeLevels.bullets;
  }

  function applyPermanentTechniquesToNewGame(){
    const unlockedTechniques = getPermanentSaveFields(readSaveData()).unlockedTechniques;
    const techniqueDataById = {};
    ((window.shopData && window.shopData.techniques) || []).forEach(item => {
      techniqueDataById[item.id] = item;
    });
    Object.keys(superTechLevels).forEach(key => {
      const item = techniqueDataById[key];
      const max = item ? item.nivelMaximo : superTechMax;
      superTechLevels[key] = Math.max(0, Math.min(Number(unlockedTechniques[key]) || 0, max));
    });
  }

  function startNewGame(){
    if (selectedGameMode === 'story') {
      window.gameMode = 'story';
      window.currentChapter = 1;
    } else if (selectedGameMode === 'infinity') {
      window.gameMode = 'infinity';
      window.currentChapter = null;
    } else {
      window.gameMode = 'story';
      window.currentChapter = 1;
      selectedGameMode = 'story';
    }
    if (!selectedCharacter) selectedCharacter = availableCharacters[0] || { label: 'Goku', src: 'assets/personajes/Goku.png' };
    window.selectedCharacter = selectedCharacter;
    if (window.setPlayerSprite) window.setPlayerSprite(selectedCharacter.src);
    resetGameState();
    
    applyPermanentUpgradesToNewGame();
    applyPermanentTechniquesToNewGame();
    gameStarted = true;
    if (startOverlay) startOverlay.style.display = 'none';
    if (uiElement) uiElement.style.display = 'block';
    audioManager.pauseStartMusic();
    audioManager.applySettings(soundSettings);
    if (soundSettings.enabled) audioManager.playBgm();
    if (selectedGameMode === 'story' && window.StoryMode) window.StoryMode.start();
    if (window.newGameManager) {
    storyLoop = window.newGameManager.getSelectedCycle();
}
  }

  function startNewGamePlus(){

    storyLoop++;

    if(window.currentChapter !== undefined)
        window.currentChapter = 1;

    resetRunState();

    // Muy importante: limpiar cualquier pausa heredada
    paused = false;
    pauseMenuOpen = false;

    if(window.StoryMode && window.StoryMode.start){
        window.StoryMode.start();
    }

    gameStarted = true;
    gameOver = false;
    paused = false;
    pauseMenuOpen = false;

    if(startOverlay)
        startOverlay.style.display = "none";

    if(uiElement)
        uiElement.style.display = "block";

    audioManager.pauseStartMusic();
    audioManager.applySettings(soundSettings);

    if(soundSettings.enabled)
        audioManager.playBgm();

}

  function exitToTitle(){
    if (uiElement) uiElement.style.display = 'none';

    paused = false;
pauseMenuOpen = false;
if (pauseOverlay) pauseOverlay.style.display = 'none';

    selectedGameMode = null;
    selectedCharacter = null;
    renderStartMenu('mode');
  }

  function showMenuMessage(text){
    const el = (pauseMenuOpen ? document.getElementById('pauseMsg') : null) || document.getElementById('menuMsg') || document.getElementById('pauseMsg');
    if (el) {
      el.textContent = text;
      setTimeout(() => { if (el.textContent === text) el.textContent = ''; }, 1800);
    }
  }

  function renderShopItems(category){
    let data = (window.shopData && window.shopData[category]) || [];
    if (!data.length) return '<div class="menu-empty">Sin elementos disponibles</div>';
    const unlockedCharacters = getPermanentSaveFields(readSaveData()).unlockedCharacters;
    if (category === 'skins') {
      data = data.map((item, index) => ({ item, index }))
        .sort((a, b) => (a.item.precio - b.item.precio) || (a.index - b.index))
        .map(entry => entry.item);
    }
    return data.map(item => {
      const isSkin = category === 'skins';
      const isUpgrade = category === 'upgrades';
      const isTechnique = category === 'techniques';
      const bought = isSkin && unlockedCharacters.includes(item.id);
      const currentLevel = isUpgrade ? getPermanentUpgradeLevel(item) : 0;
      const techniqueLevel = isTechnique ? getPermanentTechniqueLevel(item) : 0;
      const isMax = isUpgrade && currentLevel >= item.nivelMaximo;
      const isTechniqueMax = isTechnique && techniqueLevel >= item.nivelMaximo;
      const priceText = isUpgrade
        ? (isMax ? 'MAX' : getNextUpgradePrice(item, currentLevel) + ' Zenis')
        : isTechnique
          ? (isTechniqueMax ? (item.nivelMaximo === 1 ? 'Comprado' : 'MAX') : getNextTechniquePrice(item, techniqueLevel) + ' Zenis')
          : (bought ? 'Comprado' : (item.precio || 0) + ' Zenis');
      const levelText = isUpgrade ? '<em>Nivel ' + currentLevel + '/' + item.nivelMaximo + '</em>' : '';
      const techniqueLevelText = isTechnique ? '<em>Nivel ' + techniqueLevel + '/' + item.nivelMaximo + '</em>' : '';
      return '<div class="shop-item' + (bought || isMax || isTechniqueMax ? ' bought' : '') + '" data-shop-category="' + category + '" data-shop-id="' + item.id + '">' +
        '<div class="shop-item-head"><b>' + item.nombre + '</b><span>' + priceText + '</span></div>' +
        levelText +
        techniqueLevelText +
        '<p>' + item.descripcion + '</p>' +
      '</div>';
    }).join('');
  }

  function initMenus(){
    uiElement = document.getElementById('ui');
    if (uiElement) uiElement.style.display = 'none';
    const start = document.createElement('div');
    start.id = 'startOverlay';
    start.style.cssText = 'position:fixed;inset:0;display:flex;align-items:flex-end;justify-content:flex-end;z-index:9999;background:#000;padding:0 36px 34px 0;box-sizing:border-box';
    document.body.appendChild(start);
    const pause = document.createElement('div');
    pause.id = 'pauseOverlay';
    pause.style.cssText = 'position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:15000;background:rgba(0,0,0,.72)';
    document.body.appendChild(pause);
    window.startOverlay = start;
    window.pauseOverlay = pause;
    // ===== Pantalla DMP =====
const dmp = document.createElement('div');
dmp.id = 'dmpOverlay';
window.dmpOverlay = dmp;
dmp.style.cssText = `
position:fixed;
inset:0;
z-index:20000;
background:#000;
display:flex;
align-items:center;
justify-content:center;
cursor:pointer;
`;

const dmpImg = document.createElement('img');
dmpImg.src = 'assets/dmp.png';
dmpImg.style.maxWidth = '100%';
dmpImg.style.maxHeight = '100%';

dmp.appendChild(dmpImg);
document.body.appendChild(dmp);

start.style.display = 'none';

const showDmp = !sessionStorage.getItem('dmpShown');

if (!showDmp) {
    dmp.remove();
    start.style.display = 'flex';
    loadCharacterList();
    return;
}

sessionStorage.setItem('dmpShown','1');

let dmpClosed = false;

function closeDmp(){

    if(dmpClosed) return;

    dmpClosed = true;

    dmp.remove();

    start.style.display = 'flex';
}

setTimeout(closeDmp,6000);

dmp.addEventListener('click',closeDmp);

document.addEventListener('keydown',closeDmp,{once:true});
    loadCharacterList();
  }

  function renderStartMenu(view='mode'){

    if (!startOverlay) return;
    startOverlay.style.display = 'flex';
    startOverlay.style.alignItems = 'flex-end';
    startOverlay.style.justifyContent = 'flex-end';
    startOverlay.style.background = '#000';
    startOverlay.style.padding = '0 36px 34px 0';
    const canContinue = hasSavedGame();
    const zenisBalance = getPermanentZenis();
    if (uiElement) uiElement.style.display = 'none';

    if (view === 'character') {
      startOverlay.style.alignItems = 'stretch';
      startOverlay.style.justifyContent = 'stretch';
      startOverlay.style.padding = '0';
      startOverlay.style.background = '#000';
      const characters = setAvailableCharactersFromUnlocked();
      const characterButtons = characters.length ? characters.map(ch =>
        '<button class="char-card' + (selectedCharacter && selectedCharacter.src === ch.src ? ' selected' : '') + '" data-src="' + ch.src + '" data-label="' + ch.label + '"><div class="char-img-wrap"><img src="' + ch.src + '" alt="' + ch.label + '"></div><span>' + ch.label + '</span></button>'
      ).join('') : '';
      const menuMessage = characters.length ? 'Elige tu guerrero' : 'Cargando personajes...';
      startOverlay.innerHTML =
        '<div class="title-menu"><h1>Modo Infinity</h1><p>Selecciona un personaje para comenzar</p><div id="menuMsg" class="menu-msg">' + menuMessage + '</div><div class="character-grid">' + characterButtons + '</div><button id="backBtn">Volver</button><label class="volume-row">Volumen <input id="volumeSlider" type="range" min="0" max="100" value="' + Math.round(soundSettings.volume * 100) + '"></label></div>';
      document.getElementById('backBtn').onclick = () => renderStartMenu('mode');
      document.getElementById('volumeSlider').oninput = e => { soundSettings.volume = Number(e.target.value) / 100; window.saveSoundSettings(); };

      ui.setMenu([
    ...document.querySelectorAll('.char-card'),
    document.getElementById('backBtn')
]);

      if (!characters.length) {
        loadCharacterList().then(() => renderStartMenu('character')).catch(() => renderStartMenu('character'));
        return;
      }
  

      
   
  
    

      document.querySelectorAll('.char-card').forEach(button => {
      button.onclick = () => {
  selectedCharacter = { label: button.dataset.label || 'Personaje', src: button.dataset.src };
  window.selectedCharacter = selectedCharacter;
  if (window.setPlayerSprite) window.setPlayerSprite(selectedCharacter.src);

  if (
    window.newGameManager &&
    window.newGameManager.shouldShowCycleSelector('infinity')
) {

    renderStartMenu('cycle');

} else {

    renderStartMenu('difficulty');

}
};  
      });
      return;
    }

    
 if (view === 'difficulty') {

  startOverlay.style.alignItems = 'stretch';
  startOverlay.style.justifyContent = 'stretch';
  startOverlay.style.padding = '0';
  startOverlay.style.background = '#000';

  startOverlay.innerHTML =
  '<div class="title-menu">' +

    '<h1>Selecciona dificultad</h1>' +

    '<button id="normalBtn">' +
    '<div style="font-size:26px;font-weight:bold;">NORMAL</div>' +
    '<div style="font-size:13px;color:#888;">+0% Z</div>' +
    '</button>' +

    '<button id="hardBtn">' +
    '<div style="font-size:26px;font-weight:bold;">DIFÍCIL</div>' +
    '<div style="font-size:13px;color:#ff9a00;font-weight:bold;">+20% Z</div>' +
    '</button>' +

    '<button id="hardcoreBtn">' +
    '<div style="font-size:26px;font-weight:bold;">HARDCORE</div>' +
    '<div style="font-size:13px;color:#ff9a00;font-weight:bold;">+50% Z</div>' +
    '</button>' +

    '<button id="backBtn">Volver</button>' +

    '<label class="volume-row">Volumen <input id="volumeSlider" type="range" min="0" max="100" value="' +
      Math.round(soundSettings.volume * 100) +
    '"></label>' +

  '</div>';

  document.getElementById('volumeSlider').oninput = e => {
    soundSettings.volume = Number(e.target.value) / 100;
    window.saveSoundSettings();
  };

  document.getElementById('backBtn').onclick = () => renderStartMenu('character');

  document.getElementById('normalBtn').onclick = () => {
    window.selectedDifficulty = 'normal';
    startNewGame();
  };

  document.getElementById('hardBtn').onclick = () => {
    window.selectedDifficulty = 'hard';
    startNewGame();
  };

  document.getElementById('hardcoreBtn').onclick = () => {
    window.selectedDifficulty = 'hardcore';
    startNewGame();
  };

  ui.setMenu([
    document.getElementById('normalBtn'),
    document.getElementById('hardBtn'),
    document.getElementById('hardcoreBtn'),
    document.getElementById('backBtn')
  ]);

  return;
}

   if (view === 'ranking') {

      

      startOverlay.style.alignItems = 'stretch';
      startOverlay.style.justifyContent = 'stretch';
      startOverlay.style.padding = '0';
      startOverlay.style.background = '#000';

      startOverlay.innerHTML =
        '<div class="title-menu" style="width:100vw;height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;">' +

          '<h1>Ranking Mundial</h1>' +

          '<div style="display:flex;align-items:center;justify-content:center;gap:40px;">' +

            '<img src="assets/roshi.png" style="height:340px;image-rendering:pixelated;">' +

            '<div class="ranking-list">' +
              renderRanksHtml() +
            '</div>' +

            '<img src="assets/roshi.png" style="height:340px;transform:scaleX(-1);image-rendering:pixelated;">' +

          '</div>' +

          '<button id="backBtn">Volver</button>' +

        '</div>';

      document.getElementById('backBtn').onclick = () => renderStartMenu('mode');

      return;
    }  

    if (view === 'cycle') {

    startOverlay.style.alignItems = 'stretch';
    startOverlay.style.justifyContent = 'stretch';
    startOverlay.style.padding = '0';
    startOverlay.style.background = '#000';

    const cycles = window.newGameManager.getAvailableCycles();

    const buttons = cycles.map(cycle => {

        const bonus = (cycle - 1) * 10;

        return '<button class="cycleBtn" data-cycle="' + cycle + '">' +
            '<div style="font-size:26px;font-weight:bold;">' +
window.newGameManager.getCycleName(cycle) +
'</div>' +
            '<div style="font-size:13px;color:#ff9a00;font-weight:bold;">+' + bonus + '% Z</div>' +
        '</button>';

    }).join('');

    startOverlay.innerHTML =
        '<div class="title-menu">' +
            '<h1>Selecciona ciclo</h1>' +

            buttons +

            '<button id="backBtn">Volver</button>' +

        '</div>';

    document.querySelectorAll('.cycleBtn').forEach(btn => {

        btn.onclick = () => {

    window.newGameManager.setSelectedCycle(
        Number(btn.dataset.cycle)
    );

    renderStartMenu('difficulty');

};

    });

    document.getElementById('backBtn').onclick = () => {

    if (selectedGameMode === 'infinity') {

        renderStartMenu('character');

    } else {

        renderStartMenu();

    }

};
    ui.setMenu([
        ...document.querySelectorAll('.cycleBtn'),
        document.getElementById('backBtn')
    ]);

    return;

}

  if (view === 'shop') {
      const activeShopCategory = window.activeShopCategory || 'upgrades';
      startOverlay.style.alignItems = 'stretch';
      startOverlay.style.justifyContent = 'stretch';
      startOverlay.style.padding = '0';
      startOverlay.style.background = '#000';
      startOverlay.innerHTML =
        '<div class="title-menu shop-menu">' +
          '<h1>Tienda</h1>' +
          '<div class="menu-msg">Zenis: ' + zenisBalance + '</div>' +
          '<div id="menuMsg" class="menu-msg"></div>' +
          '<div class="shop-tabs">' +
            '<button id="shopUpgradesBtn" class="' + (activeShopCategory === 'upgrades' ? 'active' : '') + '">Mejoras</button>' +
            '<button id="shopTechniquesBtn" class="' + (activeShopCategory === 'techniques' ? 'active' : '') + '">Técnicas</button>' +
            '<button id="shopSkinsBtn" class="' + (activeShopCategory === 'skins' ? 'active' : '') + '">Skins</button>' +
          '</div>' +
          '<div class="shop-list">' + renderShopItems(activeShopCategory) + '</div>' +
          '<button id="backBtn">Volver</button>' +
        '</div>';

      document.getElementById('shopUpgradesBtn').onclick = () => { window.activeShopCategory = 'upgrades'; renderStartMenu('shop'); };
      document.getElementById('shopTechniquesBtn').onclick = () => { window.activeShopCategory = 'techniques'; renderStartMenu('shop'); };
      document.getElementById('shopSkinsBtn').onclick = () => { window.activeShopCategory = 'skins'; renderStartMenu('shop'); };
      document.getElementById('backBtn').onclick = () => renderStartMenu('mode');
      if (activeShopCategory === 'upgrades') {
        document.querySelectorAll('.shop-item[data-shop-category="upgrades"]').forEach(card => {
          card.onclick = () => {
            if (card.classList.contains('bought')) return;
            const item = ((window.shopData && window.shopData.upgrades) || []).find(upgrade => upgrade.id === card.dataset.shopId);
            buyPermanentUpgrade(item);
          };
        });
      }
      if (activeShopCategory === 'techniques') {
        document.querySelectorAll('.shop-item[data-shop-category="techniques"]').forEach(card => {
          card.onclick = () => {
            if (card.classList.contains('bought')) return;
            const item = ((window.shopData && window.shopData.techniques) || []).find(technique => technique.id === card.dataset.shopId);
            buyPermanentTechnique(item);
          };
        });
      }
      if (activeShopCategory === 'skins') {
        document.querySelectorAll('.shop-item[data-shop-category="skins"]').forEach(card => {
          card.onclick = () => {
            const item = ((window.shopData && window.shopData.skins) || []).find(skin => skin.id === card.dataset.shopId);
            buySkin(item);
          };
        });
      }

      ui.setMenu([

    document.getElementById('shopUpgradesBtn'),
    document.getElementById('shopTechniquesBtn'),
    document.getElementById('shopSkinsBtn'),

    ...document.querySelectorAll('.shop-item'),

    document.getElementById('backBtn')

]);

      return;
  }

const modeButtons =
  '<div class="mode-section"><h2>Modo de juego</h2><div class="menu-actions"><button id="historyBtn">Historia</button><button id="infinityBtn">Infinity</button></div></div>';

startOverlay.innerHTML =
  '<img src="assets/start_background.png" class="menu-bg"><div class="title-menu"><h1>DBZ Infinity</h1>' +
  modeButtons +
  '<div class="menu-msg">Zenis: ' + zenisBalance + '</div>' +
  '<div id="menuMsg" class="menu-msg"></div>' +
  '<div class="menu-actions">' +
    '<button id="continueBtn" ' + (canContinue ? '' : 'disabled') + '>Continuar partida</button>' +
    '<button id="shopBtn">Tienda</button>' +
    '<button id="ranksBtn">Ver ranks</button>' +
    '<button id="creditsBtn">Créditos</button>' +
    '<button id="soundBtn">Sonido: ' + (soundSettings.enabled ? 'ON' : 'OFF') + '</button>' +
  '</div>' +
  '<label class="volume-row">Volumen <input id="volumeSlider" type="range" min="0" max="100" value="' +
    Math.round(soundSettings.volume * 100) +
  '"></label></div>';

document.getElementById('historyBtn').onclick = () => {

    selectedGameMode = 'story';

    setAvailableCharactersFromUnlocked();

if (!selectedCharacter) {
    selectedCharacter = availableCharacters[0] || null;
    window.selectedCharacter = selectedCharacter;
}

    if (
        window.newGameManager &&
        window.newGameManager.shouldShowCycleSelector('story')
    ) {

        renderStartMenu('cycle');

    } else {

        renderStartMenu('difficulty');

    }

};

document.getElementById('infinityBtn').onclick = () => {

    selectedGameMode = 'infinity';
    renderStartMenu('character');

};
 


document.getElementById('continueBtn').onclick = () => {
  if (!loadGame()) showMenuMessage('No hay partida guardada');
};

document.getElementById('shopBtn').onclick = () => {
  window.activeShopCategory = 'upgrades';
  renderStartMenu('shop');
};

document.getElementById('ranksBtn').onclick = () =>
  renderStartMenu('ranking');

document.getElementById('creditsBtn').onclick = () => {

  startOverlay.style.display = "none";

  CreditsScene.begin();

};

document.getElementById('soundBtn').onclick = () => {
  
  soundSettings.enabled = !soundSettings.enabled;
  window.saveSoundSettings();
  renderStartMenu(view);
};

document.getElementById('volumeSlider').oninput = e => {
  soundSettings.volume = Number(e.target.value) / 100;
  window.saveSoundSettings();
};

ui.setMenu([
    document.getElementById('historyBtn'),
    document.getElementById('infinityBtn'),
    document.getElementById('continueBtn'),
    document.getElementById('shopBtn'),
    document.getElementById('ranksBtn'),
    document.getElementById('creditsBtn'),
    document.getElementById('soundBtn')
]);

}

  global.chapterManager = {
    initMenus,
    renderStartMenu,
    startNewGame,
    startNewGamePlus,
    exitToTitle,
    saveGame,
    addPermanentZenis,
    getPermanentZenis,
    loadGame,
    hasSavedGame,
    renderRanksHtml,
    showMenuMessage,
    formatTime
  };
})(window);
