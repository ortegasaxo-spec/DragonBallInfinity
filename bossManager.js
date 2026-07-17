(function(global){
  const bossSequence = [
    {name:'Raditz',file:'raditz.png'},
    {name:'Nappa',file:'nappa.png'},
    {name:'VEGETA',file:'vegeta.png'},
    {name:'Ozaru',file:'ozaru.png'},
    {name:'Guldo',file:'Guldo.png'},
    {name:'Recoome',file:'Recoome.png'},
    {name:'Ginyu',file:'Ginyu.png'},
    {name:'Freezer',file:'Freezer.png'},
    {name:'FREEZER100%',file:'Freezer100%.png'},
    {name:'A-18',file:'A-18.png'},
    {name:'Cell',file:'Cell.png'},
    {name:'A-17',file:'A-17.png'},
    {name:'PERFECTCELL',file:'PerfectCell.png'},
    {name:'Dabra',file:'Dabra.png'},
    {name:'Majin Vegeta',file:'Majin Vegeta.png'},
    {name:'Buu',file:'Buu.png'},
    {name:'Buuhan',file:'Buuhan.png'},
    {name:'MAJIN BUU',file:'Majin Buu.png'},
    {name:'bills',file:'Bills.png'},
    {name:'wish',file:'Wish.png'},
    {name:'GOLDEN FREEZER',file:'GoldenFreezer.png'},
    {name:'hit',file:'Hit.png'},
    {name:'goku black',file:'GokuBlack.png'},
    {name:'goku rose',file:'GokuRose.png'},
    {name:'ZAMAS',file:'zamas.png'},
    {name:'Kefla',file:'Kefla.png'},
    {name:'Dyspo',file:'Dyspo.png'},
    {name:'Toppo',file:'Toppo.png'},
    {name:'JIREN',file:'jiren.png'}
  ];

  const bossColors = {
    'raditz.png':'#442222','nappa.png':'#d9c08a','vegeta.png':'#2244cc','ozaru.png':'#6b4a2b','Guldo.png':'#55ff55','Recoome.png':'#ff8800','Ginyu.png':'#8844cc','Freezer.png':'#bb99ff','Freezer100%.png':'#ffffff','A-18.png':'#ffee44','Cell.png':'#88cc22','A-17.png':'#44bbff','PerfectCell.png':'#66dd33','Dabra.png':'#cc3355','Majin Vegeta.png':'#2244cc','Buu.png':'#ff66cc','Buuhan.png':'#ff99cc','Majin Buu.png':'#ff77cc','Bills.png':'#aa66ff','Wish.png':'#66ccff','GoldenFreezer.png':'#ffd24a','Hit.png':'#7a44aa','GokuBlack.png':'#333333','GokuRose.png':'#ff66aa','zamas.png':'#aaffaa','Kefla.png':'#55ff88','Dyspo.png':'#cc66ff','Toppo.png':'#cc8844','jiren.png':'#ff3333'
  };

  const kameBossNames = new Set(['VEGETA','FREEZER100%','PERFECTCELL','MAJIN BUU','GOLDEN FREEZER','ZAMAS','JIREN']);
  const bossImages = {};
  bossSequence.forEach(b=>{
    const i = new Image();
    i.src = 'assets/bosses/' + b.file;
    bossImages[b.file] = i;
  });

  function getBossCycleForIndex(index){
    return Math.floor(index / bossSequence.length);
  }

  function getBossSequenceIndex(index){
    return ((index % bossSequence.length) + bossSequence.length) % bossSequence.length;
  }

 // Boss HP calculation constants
const BASE_RADITZ_HP = 600;

// Hasta A-17 (índice 11) se mantiene el escalado fuerte.
// Desde A-18 (índice 9) se reduce al 10%.
const MULTIPLIER_THRESHOLD = 8;

const SMALL_MULT = 1.10;
const LARGE_MULT = 1.10;

const CYCLE_HP_SCALE = 0.10;

function getStoryLoopMultiplier(){

    const loop = window.newGameManager
    ? window.newGameManager.getSelectedCycle()
    : 1;

if (loop <= 1)
    return 1;

return 1.10 + (loop - 2) * 0.05;

}

  function getBossHp(sequenceIndex, cycle){

    const effectiveIndex = sequenceIndex + cycle * bossSequence.length;

    let hp = BASE_RADITZ_HP;

    for(let i = 1; i <= effectiveIndex; i++){
        hp *= (i <= MULTIPLIER_THRESHOLD)
            ? SMALL_MULT
            : LARGE_MULT;
    }

    const loopMultiplier = getStoryLoopMultiplier();

    return Math.floor(hp * loopMultiplier);
}

  function getBossSpecialKey(bossName){
    const name = (bossName || '').toUpperCase();
    if (name.includes('VEGETA')) return 'vegeta';
    if (name.includes('FREEZER')) return name.includes('GOLDEN') ? 'goldenFreezer' : 'freezer';
    if (name.includes('CELL')) return 'cell';
    if (name.includes('BUU')) return 'buu';
    if (name.includes('ZAMAS')) return 'zamas';
    if (name.includes('JIREN')) return 'jiren';
    return null;
  }

  function getBossSpecialCooldown(key){
    switch(key){
      case 'vegeta': case 'freezer': case 'cell': case 'goldenFreezer': case 'zamas': return 10000;
      case 'buu': case 'jiren': return 5000;
      default: return 0;
    }
  }

  function getBossProjectileImage(e){
    const base = (e && e.bossSequenceIndex !== undefined)
      ? bossProjectileImages[(e.bossSequenceIndex) % bossProjectileImages.length]
      : bossProjectileImages[0];
    return (e && e.type === 'boss' && (e.specialKey || getBossSpecialKey(e.bossDisplayName || e.bossName || '')) === 'jiren')
      ? jirenProjectileImg
      : base;
  }

  function initializeBossSpecialState(e, now){
    if (!e || e.type !== 'boss') return;
    const key = getBossSpecialKey(e.bossDisplayName || e.bossName || '');
    e.specialKey = key;
    e.specialCooldownAt = now + getBossSpecialCooldown(key);
    e.specialActiveUntil = 0;
    e.meditationState = 1;
    e.meditationCycleAt = now + 5000;
    e.baseSpeed = e.speed;
  }

  function getOffscreenSpawnPosition(size, isBoss, shoot, bossName){
    const viewW = (typeof canvas !== 'undefined' && canvas && canvas.width) ? canvas.width : innerWidth;
    const viewH = (typeof canvas !== 'undefined' && canvas && canvas.height) ? canvas.height : innerHeight;
    const scale = isBoss
      ? (((bossName || '').toLowerCase().includes('ozaru')) ? 4.725 : 2.3625)
      : (shoot ? 6.75 : 1.125);
    const margin = Math.ceil(size * scale);
    const side = Math.floor(Math.random() * 4);
    const minX = margin;
    const minY = margin;
    const maxX = Math.max(minX, viewW - margin);
    const maxY = Math.max(minY, viewH - margin);
    const randomX = maxX > minX ? (minX + Math.random() * (maxX - minX)) : (viewW / 2);
    const randomY = maxY > minY ? (minY + Math.random() * (maxY - minY)) : (viewH / 2);
    if (side === 0) return { x: randomX, y: -margin };
    if (side === 1) return { x: randomX, y: viewH + margin };
    if (side === 2) return { x: -margin, y: randomY };
    return { x: viewW + margin, y: randomY };
  }

  function shouldSpawnBoss(now){
    if (global.StoryMode && global.StoryMode.isActive && global.StoryMode.isActive()) return false;
    return lvl >= 3 && now >= bossNextSpawnAt && !enemies.some(e => e.type === 'boss' && !e.dead);
  }

  function spawnStoryBossByName(bossName, options = {}){
    const bossData = bossSequence.find(b => b.name === bossName);
    if (!bossData) return null;
    const sequenceIndex = bossSequence.indexOf(bossData);
    let cycle = 0;

if (window.newGameManager) {
    cycle = window.newGameManager.getSelectedCycle() - 1;
}
    const bossCategory = kameBossNames.has(bossData.name) ? 'boss' : 'miniboss';
    const chapter = global.StoryMode && global.StoryMode.getCurrentChapter ? global.StoryMode.getCurrentChapter() : null;
    const hpMultiplier = bossCategory === 'boss'
      ? ((chapter && chapter.bossHpMultiplier) || 1)
      : ((chapter && chapter.miniBossHpMultiplier) || 1);
    const bossHp = Math.floor(getBossHp(sequenceIndex, cycle) * hpMultiplier);
    const e = acquireEnemy();
    const spawn = getOffscreenSpawnPosition(35, true, true, bossData.name);
    Object.assign(e, {
      x: spawn.x,
      y: spawn.y,
      hp: bossHp,
      maxHp: bossHp,
      size: 35,
      rot: 0,
      rs: (Math.random() - 0.5) * 0.15,
      speed: 0.5,
      vx: 0,
      vy: 0,
      type: 'boss',
      bossName: bossData.file,
      bossDisplayName: bossData.name,
      bossSequenceIndex: sequenceIndex,
      bossCategory,
      shoot: true,
      cd: 0,
      dead: false,
      rewardGiven: false,
      kameTriggered: false,
      dropType: bossCategory === 'boss' ? 'dragonball' : 'senzu',
      storyChapterBoss: true,
      storyChapterId: options.chapterId || null,
      storyFinalBoss: !!options.isFinalBoss
    });
    initializeBossSpecialState(e, getCurrentTime());
    enemies.push(e);
    return e;
  }

  function enemySpawn(now){
    let activeEnemies = 0;
    for (let i = 0; i < enemies.length; i++) if (!enemies[i].dead) activeEnemies++;
    if (activeEnemies >= 50) return;
    let boss = shouldSpawnBoss(now);
    let sequenceIndex = getBossSequenceIndex(bossIndex);
    let bossData = bossSequence[sequenceIndex];
    let cycle = getBossCycleForIndex(bossIndex);

if (window.newGameManager) {
    cycle += window.newGameManager.getSelectedCycle() - 1;
}
    if (boss) { bossCycle = cycle; bossSpawnedLevel = lvl; }
    let size = boss ? 35 : 10.5 + Math.random() * 14;
    let bossHp = boss ? getBossHp(sequenceIndex, cycle) : 0;
    let shoot = boss || Math.random() < (0.075 + Math.max(0, lvl - 10) * 0.0025);
    const spawn = getOffscreenSpawnPosition(size, boss, shoot, boss ? bossData.name : null);
    const e = acquireEnemy();
    Object.assign(e, {
      x: spawn.x,
      y: spawn.y,
      hp: boss ? bossHp : 3 + lvl * 0.3 + Math.max(0, lvl - 10) * 0.8,
      maxHp: boss ? bossHp : 3 + lvl * 0.3 + Math.max(0, lvl - 10) * 0.8,
      size,
      rot: 0,
      rs: (Math.random() - 0.5) * 0.15,
      speed: boss ? (0.5 + cycle * 0.08) : 0.4 + Math.random() * 0.7 + Math.max(0, lvl - 10) * 0.03,
      vx: 0,
      vy: 0,
      type: boss ? 'boss' : 'asteroid',
      bossName: boss ? bossData.file : null,
      bossDisplayName: boss ? bossData.name : null,
      bossSequenceIndex: sequenceIndex,
      bossCategory: boss && kameBossNames.has(bossData.name) ? 'boss' : 'miniboss',
      shoot,
      cd: 0,
      dead: false,
      rewardGiven: false,
      kameTriggered: false,
      dropType: boss && (kameBossNames.has(bossData.name) ? 'dragonball' : 'senzu')
    });
    if (boss) initializeBossSpecialState(e, now);
    enemies.push(e);
  }

  function updateSpawner(dt){
    if (typeof gameStarted !== 'undefined' && !gameStarted) return;
    if (typeof paused !== 'undefined' && paused) return;
    window.__spawnAcc = (window.__spawnAcc || 0) + dt;
    if (window.__spawnAcc < 1000) return;
    window.__spawnAcc -= 1000;
    const extra = Math.max(0, lvl - 10);
    const survival = Math.max(0, lvl - 10);
    let spawns = 1;
    if (extra >= 5) spawns++;
    if (extra >= 15 && Math.random() < 0.7) spawns++;
    if (extra >= 25) spawns++;
    spawns += Math.floor(survival * 0.04);
    if (Math.random() < (survival * 0.04) % 1) spawns++;
    for (let i = 0; i < spawns; i++) enemySpawn(getCurrentTime());
  }

  global.bossManager = {
    bossSequence,
    bossImages,
    bossColors,
    kameBossNames,
    getBossCycleForIndex,
    getBossSequenceIndex,
    getBossHp,
    getBossSpecialKey,
    getBossSpecialCooldown,
    getBossProjectileImage,
    initializeBossSpecialState,
    shouldSpawnBoss,
    spawnStoryBossByName,
    enemySpawn,
    updateSpawner
  };
})(window);
