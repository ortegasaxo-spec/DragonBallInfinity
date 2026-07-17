(function(global){
  function isLevelUpOpen(){
    return levelUpEl && levelUpEl.style.display === 'flex';
  }

  function setPauseMenu(open){
    pauseMenuOpen = open;
    paused = open;
    if (open) {
      ui.renderPauseMenu(pauseOverlay, levelUpEl, getSuperTechLabel, getRunTime);
      pauseOverlay.style.display = 'flex';
    } else {
      pauseOverlay.style.display = 'none';
      window.__spawnAcc = 0;
    }
  }

  function togglePauseMenu(){
    if (!gameStarted || gameOver || isLevelUpOpen() || kameActive) return;
    setPauseMenu(!pauseMenuOpen);
  }

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' || e.code === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (!e.repeat) togglePauseMenu();
    }
  }, true);

  function pollGamepadPause(){

    if(window.gamepadManager &&
       window.gamepadManager.consume("pause")){

        togglePauseMenu();

    }

    requestAnimationFrame(pollGamepadPause);
}

pollGamepadPause();

  global.sceneManager = {
    isLevelUpOpen,
    setPauseMenu,
    togglePauseMenu
  };
})(window);
