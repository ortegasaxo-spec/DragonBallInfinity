(function(global){
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

    applySettings(soundSettings) {
      const v = soundSettings.enabled ? soundSettings.volume : 0;
      this.startMusic.volume = v;
      this.bgm.volume = v;
      this.kameSound.volume = v;
      this.boomSound.volume = v;
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

  global.AudioManager = AudioManager;
})(window);
