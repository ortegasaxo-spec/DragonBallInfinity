(function(global){
  const settingsKey = 'dbzInfinitySettingsV1';

  function loadSettings(){
    try { return JSON.parse(localStorage.getItem(settingsKey) || '{}'); }
    catch(e){ return {}; }
  }

  const soundSettings = Object.assign({ enabled:true, volume:0.5 }, loadSettings());

  class AudioManager {
    constructor() {
      this.startMusic = new Audio('audio/db1.mp3');
      this.bgm = new Audio('audio/db2.mp3');
      this.kameSound = new Audio('assets/kame-volando.mpeg');
      this.boomSound = new Audio('assets/boom.mp3');
      this.startMusic.volume = 0.5;
      this.bgm.loop = true;
      this.bgm.volume = 0.5;
      this.startIndex = 0;
      this.startPlaylist = ['audio/db1.mp3'];
      this.startMusic.addEventListener('ended', () => {
        this.startIndex = (this.startIndex + 1) % this.startPlaylist.length;
        this.startMusic.src = this.startPlaylist[this.startIndex];
        this.startMusic.play().catch(() => {});
      });
    }

    applySettings(settings) {
      const volume = settings.enabled ? settings.volume : 0;
      this.startMusic.volume = volume;
      this.bgm.volume = volume;
      this.kameSound.volume = volume;
      this.boomSound.volume = volume;
    }

    playStartMusic() {
      if (this.startMusic.paused) this.startMusic.play().catch(() => {});
    }

    pauseStartMusic() {
      this.startMusic.pause();
      this.startMusic.currentTime = 0;
    }

    playBgm() {
      this.bgm.play().catch(() => {});
    }

    pauseBgm() {
      this.bgm.pause();
      this.bgm.currentTime = 0;
    }
  }

  function applySoundSettings(){
    if (global.audioManagerInstance) global.audioManagerInstance.applySettings(soundSettings);
  }

  function saveSoundSettings(){
    localStorage.setItem(settingsKey, JSON.stringify(soundSettings));
    applySoundSettings();
  }

  document.addEventListener('click', () => {
    applySoundSettings();
    if (soundSettings.enabled && global.audioManagerInstance && global.audioManagerInstance.startMusic.paused) {
      global.audioManagerInstance.startMusic.play().catch(() => {});
    }
  }, { once:true });

  global.AudioManager = AudioManager;
  global.soundSettings = soundSettings;
  global.applySoundSettings = applySoundSettings;
  global.saveSoundSettings = saveSoundSettings;
  global.loadSoundSettings = loadSettings;
  const audioManagerInstance = new AudioManager();
  global.audioManagerInstance = audioManagerInstance;
  global.audioManager = audioManagerInstance;
  applySoundSettings();
})(window);
