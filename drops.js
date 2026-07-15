(function(global){
  function spawnPower(x, y) {
    // placeholder for future drop spawning logic
  }

  function spawnEnemyDrop(e) {
    if (e.dropType) {
      powerUps.push({ x: e.x, y: e.y, type: e.dropType });
    }
  }

  function updatePowerUps(){
    for (let i = powerUps.length - 1; i >= 0; i--) {
      const p = powerUps[i];
      const dx = player.x - p.x;
      const dy = player.y - p.y;
      if (dx * dx + dy * dy < 900) {
        if (p.type === 'storyReward') {
          if (window.StoryMode && window.StoryMode.handleRewardCollected && window.StoryMode.handleRewardCollected(p)) {
            window.techniquesManager.openSuperiorTechniqueMenu();
          }
          powerUps.splice(i, 1);
          continue;
        }
        if (p.type === 'heal') player.hp = Math.min(player.maxHp, player.hp + 25);
        if (p.type === 'damage') window.techniquesManager.applyUpgrade('damage', () => player.damage++);
        if (p.type === 'speed') window.techniquesManager.applyUpgrade('speed', () => player.speed += 0.2);
        if (p.type === 'rate') {}
        if (p.type === 'multi') window.techniquesManager.applyUpgrade('bullets', () => player.bullets++);
        if (p.type === 'senzu') {
    if (window.selectedDifficulty === 'normal') {
        player.hp = player.maxHp;
    }
    xp = xpNeed;
    window.techniquesManager.levelUp();
}
        if (p.type === 'dragonball') {

    if (window.selectedDifficulty !== 'hardcore') {
        player.hp = player.maxHp;
    }

    dragonballCount++;

    if (dragonballCount >= 7) {
        extraLives++;
        window.chapterManager.showMenuMessage('¡Vida extra concedida!');
    }

    window.techniquesManager.openSuperiorTechniqueMenu();
}
        powerUps.splice(i, 1);
      }
    }
  }

  global.dropsManager = {
    spawnPower,
    spawnEnemyDrop,
    updatePowerUps
  };
})(window);
