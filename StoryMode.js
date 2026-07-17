(function(global){
  const DEFAULT_BOSS_HP_MULTIPLIER = 4;
  const DEFAULT_MINIBOSS_HP_MULTIPLIER = 1.5;
  const CHAPTER_FADE_MS = 1000;

  const chapters = [
    {
      id: 1,
      title: 'Capitulo 1',
      chapterImage: 'capitulos/cap1.png',
      sceneImage: 'scenes/ch1.png',
      music: 'chala.mp3',
      playerForm: 'Goku',
      bosses: ['Raditz'],
      bossHpMultiplier: DEFAULT_BOSS_HP_MULTIPLIER,
      miniBossHpMultiplier: DEFAULT_MINIBOSS_HP_MULTIPLIER
    },
    {
      id: 2,
      title: 'Capitulo 2',
      chapterImage: 'capitulos/cap2.png',
      sceneImage: 'scenes/ch2.png',
      music: 'chapters/ch2.mp3',
      playerForm: 'Goku',
      bosses: ['Nappa', 'VEGETA', 'Ozaru'],
      bossHpMultiplier: DEFAULT_BOSS_HP_MULTIPLIER,
      miniBossHpMultiplier: DEFAULT_MINIBOSS_HP_MULTIPLIER
    },
    {
      id: 3,
      title: 'Capitulo 3',
      chapterImage: 'capitulos/cap3.png',
      sceneImage: 'scenes/ch3.png',
      music: 'chapters/ch3.mp3',
      playerForm: 'Goku',
      bosses: ['Guldo', 'Recoome'],
      bossHpMultiplier: DEFAULT_BOSS_HP_MULTIPLIER,
      miniBossHpMultiplier: DEFAULT_MINIBOSS_HP_MULTIPLIER
    },
    {
      id: 4,
      title: 'Capitulo 4',
      chapterImage: 'capitulos/cap4.png',
      sceneImage: 'scenes/ch4.png',
      music: 'chapters/ch4.mp3',
      playerForm: 'SSJ',
      bosses: ['Ginyu', 'Freezer'],
      bossHpMultiplier: DEFAULT_BOSS_HP_MULTIPLIER,
      miniBossHpMultiplier: DEFAULT_MINIBOSS_HP_MULTIPLIER
    },
    {
      id: 5,
      title: 'Capitulo 5',
      chapterImage: 'capitulos/cap5.png',
      sceneImage: 'scenes/ch5.png',
      music: 'chapters/ch5.mp3',
      playerForm: 'SSJ',
      bosses: ['FREEZER100%'],
      bossHpMultiplier: DEFAULT_BOSS_HP_MULTIPLIER,
      miniBossHpMultiplier: DEFAULT_MINIBOSS_HP_MULTIPLIER
    },
    {
      id: 6,
      title: 'Capitulo 6',
      chapterImage: 'capitulos/cap6.png',
      sceneImage: 'scenes/ch6.png',
      music: 'chapters/ch6.mp3',
      playerForm: 'SSJ2',
      bosses: ['A-18', 'Cell', 'A-17'],
      bossHpMultiplier: DEFAULT_BOSS_HP_MULTIPLIER,
      miniBossHpMultiplier: DEFAULT_MINIBOSS_HP_MULTIPLIER
    },
    {
      id: 7,
      title: 'Capitulo 7',
      chapterImage: 'capitulos/cap7.png',
      sceneImage: 'scenes/ch7.png',
      music: 'chapters/ch7.mp3',
      playerForm: 'SSJ2',
      bosses: ['PERFECTCELL'],
      bossHpMultiplier: DEFAULT_BOSS_HP_MULTIPLIER,
      miniBossHpMultiplier: DEFAULT_MINIBOSS_HP_MULTIPLIER
    },
    {
      id: 8,
      title: 'Capitulo 8',
      chapterImage: 'capitulos/cap8.png',
      sceneImage: 'scenes/ch8.png',
      music: 'chapters/ch8.mp3',
      playerForm: 'SSJ2',
      bosses: ['Dabra', 'Majin Vegeta'],
      bossHpMultiplier: DEFAULT_BOSS_HP_MULTIPLIER,
      miniBossHpMultiplier: DEFAULT_MINIBOSS_HP_MULTIPLIER
    },
    {
      id: 9,
      title: 'Capitulo 9',
      chapterImage: 'capitulos/cap9.png',
      sceneImage: 'scenes/ch9.png',
      music: 'chapters/ch9.mp3',
      playerForm: 'SSJ3',
      bosses: ['Buu', 'Buuhan'],
      bossHpMultiplier: DEFAULT_BOSS_HP_MULTIPLIER,
      miniBossHpMultiplier: DEFAULT_MINIBOSS_HP_MULTIPLIER
    },
    {
      id: 10,
      title: 'Capitulo 10',
      chapterImage: 'capitulos/cap10.png',
      sceneImage: 'scenes/ch10.png',
      music: 'chapters/ch10.mp3',
      playerForm: 'SSJ3',
      bosses: ['MAJIN BUU'],
      bossHpMultiplier: DEFAULT_BOSS_HP_MULTIPLIER,
      miniBossHpMultiplier: DEFAULT_MINIBOSS_HP_MULTIPLIER
    },
    {
      id: 11,
      title: 'Capitulo 11',
      chapterImage: 'capitulos/cap11.png',
      sceneImage: 'scenes/ch11.png',
      music: 'chapters/ch11.mp3',
      playerForm: 'SSJGod',
      bosses: ['bills', 'wish'],
      bossHpMultiplier: DEFAULT_BOSS_HP_MULTIPLIER,
      miniBossHpMultiplier: DEFAULT_MINIBOSS_HP_MULTIPLIER
    },
    {
      id: 12,
      title: 'Capitulo 12',
      chapterImage: 'capitulos/cap12.png',
      sceneImage: 'scenes/ch12.png',
      music: 'chapters/ch12.mp3',
      playerForm: 'SSJBlue',
      bosses: ['GOLDEN FREEZER', 'hit'],
      bossHpMultiplier: DEFAULT_BOSS_HP_MULTIPLIER,
      miniBossHpMultiplier: DEFAULT_MINIBOSS_HP_MULTIPLIER
    },
    {
      id: 13,
      title: 'Capitulo 13',
      chapterImage: 'capitulos/cap13.png',
      sceneImage: 'scenes/ch13.png',
      music: 'chapters/ch13.mp3',
      playerForm: 'SSJBlueKaioken',
      bosses: ['goku black', 'goku rose', 'ZAMAS'],
      bossHpMultiplier: DEFAULT_BOSS_HP_MULTIPLIER,
      miniBossHpMultiplier: DEFAULT_MINIBOSS_HP_MULTIPLIER
    },
    {
      id: 14,
      title: 'Capitulo 14',
      chapterImage: 'capitulos/cap14.png',
      sceneImage: 'scenes/ch14.png',
      music: 'chapters/ch14.mp3',
      playerForm: 'Señal ultra instinto',
      bosses: ['Kefla', 'Dyspo', 'Toppo'],
      bossHpMultiplier: DEFAULT_BOSS_HP_MULTIPLIER,
      miniBossHpMultiplier: DEFAULT_MINIBOSS_HP_MULTIPLIER
    },
    {
      id: 15,
      title: 'Capitulo 15',
      chapterImage: 'capitulos/cap15.png',
      sceneImage: 'scenes/ch15.png',
      music: 'dbs1.mp3',
      playerForm: 'Ultra Instinto',
      bosses: ['JIREN'],
      bossHpMultiplier: DEFAULT_BOSS_HP_MULTIPLIER,
      miniBossHpMultiplier: DEFAULT_MINIBOSS_HP_MULTIPLIER
    }
  ];

  let active = false;
  let storyEndingCredits = false;
  let inPresentation = false;
  let currentChapterIndex = -1;
  let storyOverlay = null;
  let storyImage = null;
  let storyAudio = null;
  let storyFadeTimeoutId = 0;
  let storyResumeTimeoutId = 0;
  let pausedBeforeStory = false;
  let pausedStartMusic = false;
  let pausedBgm = false;
  let chapterRuntime = null;
  let presentationToken = 0;
  let hiddenPresentationElements = [];

  function ensureOverlay(){
    if(storyOverlay) return storyOverlay;
    const overlay = document.createElement('div');
    overlay.id = 'storyModeOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:#000 center/cover no-repeat;z-index:40000;overflow:hidden';
    const img = document.createElement('img');
    img.alt = 'Chapter scene';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;opacity:1;transition:opacity 1000ms linear';
    overlay.appendChild(img);
    document.body.appendChild(overlay);
    storyOverlay = overlay;
    storyImage = img;
    return overlay;
  }

  function resolveScenePath(sceneImage){
    return 'assets/' + sceneImage;
  }

  function resolveChapterPath(chapterImage){
    return 'assets/' + chapterImage;
  }

  function getAudioCandidates(chapter){
    if(!chapter) return [];
    return ['audio/capítulos.mp3', 'audio/capitulos.mp3'];
  }

  function startPresentationAudio(chapter){
    const candidates = getAudioCandidates(chapter);
    let candidateIndex = 0;
    const audio = new Audio();
    audio.preload = 'auto';
    if(global.soundSettings){ audio.volume = global.soundSettings.enabled ? global.soundSettings.volume : 0; }
    storyAudio = audio;

    const playCandidate = () => {
      if(candidateIndex >= candidates.length){
        finishPresentation();
        return;
      }
      audio.src = candidates[candidateIndex++];
      audio.onended = () => finishPresentation();

      // Seguridad: si por cualquier motivo no llega el evento "ended"
setTimeout(() => {
    if (chapterRuntime && chapterRuntime.inPresentation) {
        finishPresentation();
    }
}, 15000);
      audio.onerror = () => playCandidate();
      audio.play().catch(() => playCandidate());
    };

    playCandidate();
  }

  function stopStoryAudio(){
    if(!storyAudio) return;
    storyAudio.pause();
    storyAudio.currentTime = 0;
    storyAudio.onended = null;
    storyAudio.onerror = null;
    storyAudio = null;
  }

  function restoreGameControl(){
    for(let i=0;i<hiddenPresentationElements.length;i++){
      const item = hiddenPresentationElements[i];
      if(item && item.element) item.element.style.visibility = item.visibility;
    }
    hiddenPresentationElements = [];
    if(pausedStartMusic && global.audioManager && global.soundSettings && global.soundSettings.enabled){
      global.audioManager.playStartMusic();
    }
    if(pausedBgm && global.audioManager && global.soundSettings && global.soundSettings.enabled){
      global.audioManager.playBgm();
    }
    paused = pausedBeforeStory;
  }

  function clearPresentation(){
    if(storyFadeTimeoutId){ clearTimeout(storyFadeTimeoutId); storyFadeTimeoutId = 0; }
    if(storyResumeTimeoutId){ clearTimeout(storyResumeTimeoutId); storyResumeTimeoutId = 0; }
    stopStoryAudio();
    if(storyOverlay){
      storyOverlay.style.display = 'none';
    }
    if(storyImage){
      storyImage.style.transition = 'none';
      storyImage.style.opacity = '1';
      void storyImage.offsetWidth;
      storyImage.style.transition = 'opacity 1000ms linear';
    }
  }

function finishPresentation(){

if(!storyOverlay || !storyImage){
    inPresentation = false;
    restoreGameControl();
    return;
}    

    storyFadeTimeoutId = 0;
    storyImage.style.opacity = '0';

    storyResumeTimeoutId = setTimeout(() => {


        storyResumeTimeoutId = 0;

        if(storyOverlay) storyOverlay.style.display = 'none';
        if(storyImage) storyImage.style.opacity = '1';

        if(window.setPlayerSprite && chapterRuntime && chapterRuntime.chapter){
            window.setPlayerSprite(
                'assets/personajes/' + chapterRuntime.chapter.playerForm + '.png'
            );
        }

        if (window.gamepadManager) {
    window.gamepadManager.consume("accept");
    window.gamepadManager.consume("up");
    window.gamepadManager.consume("down");
    window.gamepadManager.consume("left");
    window.gamepadManager.consume("right");
    window.gamepadManager.consume("pause");
}

        inPresentation = false;
restoreGameControl();

        if(chapterRuntime){
            chapterRuntime.inPresentation = false;
            chapterRuntime.startedAt = performance.now();
        }

    }, CHAPTER_FADE_MS);
}

  function pauseGameForStory(){
    pausedBeforeStory = !!paused;
    paused = true;
    hiddenPresentationElements = [];
    ['gameCanvas','ui','v16hud','levelUp'].forEach(id => {
      const element = document.getElementById(id);
      if(!element) return;
      hiddenPresentationElements.push({ element, visibility: element.style.visibility || '' });
      element.style.visibility = 'hidden';
    });
    pausedStartMusic = !!(global.audioManager && global.audioManager.startMusic && !global.audioManager.startMusic.paused);
    pausedBgm = !!(global.audioManager && global.audioManager.bgm && !global.audioManager.bgm.paused);
    if(global.audioManager){
      if(pausedStartMusic) global.audioManager.pauseStartMusic();
      if(pausedBgm) global.audioManager.pauseBgm();
    }
  }

  function presentChapter(chapter){
     if (chapterRuntime && chapterRuntime.inPresentation) return;
    if(!chapter) return null;
    clearPresentation();
    ensureOverlay();
    pauseGameForStory();
    inPresentation = true;
    if(chapterRuntime) chapterRuntime.inPresentation = true;
    const token = ++presentationToken;
    const chapterPath = resolveChapterPath(chapter.chapterImage);
    storyOverlay.style.backgroundImage = 'none';
    storyImage.removeAttribute('src');
    storyImage.style.opacity = '1';
    storyOverlay.style.display = 'flex';

    const loader = new Image();
    const reveal = () => {
      if(token !== presentationToken) return;
      storyOverlay.style.backgroundImage = 'url("' + encodeURI(chapterPath) + '")';
      storyImage.src = chapterPath;
      startPresentationAudio(chapter);
    };
    loader.onload = reveal;
    loader.onerror = reveal;
    loader.src = chapterPath;
    return cloneChapter(chapter);
  }

  function cloneChapter(chapter){
    if(!chapter) return null;
    return {
      id: chapter.id,
      title: chapter.title,
      sceneImage: chapter.sceneImage,
      music: chapter.music,
      playerForm: chapter.playerForm,
      bosses: chapter.bosses.slice(),
      bossHpMultiplier: chapter.bossHpMultiplier,
      miniBossHpMultiplier: chapter.miniBossHpMultiplier
    };
  }

  function resetChapterRuntime(chapter){
chapterRuntime = {
    chapter: chapter,      chapterId: chapter.id,
      startedAt: 0,
      firstBossDelayMs: chapter.id === 1 ? 120000 : 10000,
      currentBossIndex: -1,
      pendingBossName: null,
      waitingForReward: false,
      rewardDeadlineAt: 0,
      awaitingMenuClose: false,
      inPresentation: false
    };
  }

  function beginChapter(chapter){
    if(!chapter) return null;
    if(typeof global.resetStoryChapterState === 'function') global.resetStoryChapterState();
    resetChapterRuntime(chapter);
    global.currentChapter = chapter.id;
    return presentChapter(chapter);
  }

  function queueBossSpawn(index){
    const chapter = chapters[currentChapterIndex];
    if(!chapter || !chapter.bosses[index]) return;
    chapterRuntime.currentBossIndex = index;
    chapterRuntime.pendingBossName = chapter.bosses[index];
  }

  function tick(now, state){
    if(!active || !chapterRuntime || chapterRuntime.inPresentation) return null;
    if(chapterRuntime.awaitingMenuClose){
      if(!state.menuOpen && !state.paused) {
        chapterRuntime.awaitingMenuClose = false;
        return { nextChapter: true };
      }
      return null;
    }
    if(chapterRuntime.waitingForReward){
      if(now >= chapterRuntime.rewardDeadlineAt){
        chapterRuntime.waitingForReward = false;
        return { nextChapter: true };
      }
      return null;
    }
    if(chapterRuntime.pendingBossName && !state.hasActiveStoryBoss){
      const spawnBossName = chapterRuntime.pendingBossName;
      chapterRuntime.pendingBossName = null;
      const chapter = chapters[currentChapterIndex];
      return {
        spawnBossName,
        chapterId: chapter ? chapter.id : null,
        isFinalBoss: chapter ? chapterRuntime.currentBossIndex === chapter.bosses.length - 1 : false
      };
    }
    if(chapterRuntime.startedAt > 0 && chapterRuntime.currentBossIndex < 0 && now - chapterRuntime.startedAt >= chapterRuntime.firstBossDelayMs){
      queueBossSpawn(0);
      return tick(now, state);
    }
    return null;
  }

  function handleEnemyDefeat(enemy, now){
    if(!active || !chapterRuntime || !enemy || !enemy.storyChapterBoss) return null;
    const chapter = chapters[currentChapterIndex];
    if(!chapter || enemy.storyChapterId !== chapter.id) return null;
    if(chapterRuntime.currentBossIndex < chapter.bosses.length - 1){
      queueBossSpawn(chapterRuntime.currentBossIndex + 1);
      return { suppressDefaultBossAdvance: true };
    }
    chapterRuntime.waitingForReward = true;
    chapterRuntime.rewardDeadlineAt = now + 10000;
  return {
  suppressDefaultBossAdvance: true,
  spawnDropType: enemy.dropType,
  storyReward: true,
  storyChapterId: chapter.id
};
  }

  function handleRewardCollected(drop){
    if(!active || !chapterRuntime || !drop || !drop.storyReward) return false;
    chapterRuntime.waitingForReward = false;
    chapterRuntime.awaitingMenuClose = true;
    return true;
  }

  function start(){
    active = true;
    currentChapterIndex = 0;
    return beginChapter(chapters[currentChapterIndex]);
  }

function showStoryCompletedScreen(){

  paused = true;


    const overlay = document.createElement("div");

    overlay.id = "storyCompletedOverlay";

    overlay.style.cssText = `
        position:fixed;
        inset:0;
        background:#000;
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:50000;
    `;

    overlay.innerHTML = `
        <div style="
            text-align:center;
            color:white;
            font-family:Arial;
        ">
            <h1>HAS COMPLETADO</h1>

            <h2>EL MODO HISTORIA</h2>

            <br>

            <p>¿Qué deseas hacer?</p>

            <br>

            <button id="newGamePlusBtn"
                style="font-size:28px;padding:18px 50px;margin:15px;">
                NEW GAME+
            </button>

            <br>

            <button id="returnTitleBtn"
                style="font-size:28px;padding:18px 50px;">
                MENÚ PRINCIPAL
            </button>

        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("newGamePlusBtn").onclick = () => {

    window.newGameManager.advanceCycle();

    overlay.remove();

    chapterManager.startNewGamePlus();

};

    document.getElementById("returnTitleBtn").onclick = () => {

    window.newGameManager.advanceCycle();

    overlay.remove();

    chapterManager.exitToTitle();

};

}

 function nextChapter(){

    if(!active) return null;

   if(currentChapterIndex >= chapters.length - 1){

    storyEndingCredits = true;

    window.storyEndingCredits = () => storyEndingCredits;
window.clearStoryEndingCredits = () => { storyEndingCredits = false; };

   CreditsScene.begin();

  
    return null;

}

    currentChapterIndex++;

    return beginChapter(chapters[currentChapterIndex]);

}

  function getCurrentChapter(){
    if(currentChapterIndex < 0 || currentChapterIndex >= chapters.length) return null;
    return cloneChapter(chapters[currentChapterIndex]);
  }

  function isActive(){
    return active;
  }

  window.showStoryCompletedScreen = showStoryCompletedScreen;

  global.StoryMode = {
    start,
    nextChapter,
    getCurrentChapter,
    isActive,
    tick,
    isInPresentation(){
    return inPresentation;
},
    handleEnemyDefeat,
    handleRewardCollected
  };
})(window);