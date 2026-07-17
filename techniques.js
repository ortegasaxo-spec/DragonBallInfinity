(function(global){
  function canUpgrade(key){
    return upgradeLevels[key] < upgradeMax[key];
  }

  function applyUpgrade(key, fn){
    if (!canUpgrade(key)) return false;
    upgradeLevels[key]++;
    fn();
    return true;
  }

  const SUPER_TECH_PER_MAX = { dragonDash: 1, muten: 1, kamehameha: 3 };

  function getSuperTechLabel(key){
    switch(key){
      case 'shield': return 'Círculo protector';
      case 'kienzan': return 'Kienzan';
      case 'kiExplosion': return 'Explosión de ki';
      case 'dodonpa': return 'Dodonpa';
      case 'absorbki': return 'Absorbeki';
      case 'dragonDash': return 'Acometida del Dragón';
      case 'muten': return 'Concentración de Muten Roshi';
      case 'kamehameha': return 'Kamehameha';
      default: return key;
    }
  }

  function getSuperTechOptions(){
    const poolKeys = ['shield','kienzan','kiExplosion','dodonpa','absorbki','dragonDash','muten','kamehameha'];
    const pool = poolKeys.filter(k => superTechLevels[k] < (SUPER_TECH_PER_MAX[k] || superTechMax));
    const options = [];
    while (options.length < 3 && pool.length) {
      const idx = (Math.random() * pool.length) | 0;
      options.push(pool.splice(idx, 1)[0]);
    }
    return options;
  }

  function triggerSuperTechFeedback(key, now){
        const damageBonus = player.damage - 1;
    switch(key){
      case 'shield':
        shieldOrbs = [];
        const shieldCount = superTechLevels.shield === 1 ? 3 : superTechLevels.shield === 2 ? 4 : 5;
        for (let i = 0; i < shieldCount; i++) {
  shieldOrbs.push({
    angle: (i / shieldCount) * Math.PI * 2,
    x: player.x,
    y: player.y,
    radius: TARGET_PLAYER_H * 0.42,
    angularSpeed: 0.05
  });
}
        for (let i = 0; i < 18; i++) addParticle(player.x, player.y, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, 28, '#ffd166');
        break;
      case 'kienzan':
        const target = window.playerManager.findNearestEnemy();
if (target){
  const angle = Math.atan2(target.y - player.y, target.x - player.x);
  kienzanShots.push({

    x: player.x,
    y: player.y,

    vx: Math.cos(angle) * 16,
    vy: Math.sin(angle) * 16,

    damage:
        (superTechLevels.kienzan===1 ? 1 :
         superTechLevels.kienzan===2 ? 2 : 4)
         + damageBonus,

    hit:new Set(),

    dead:false

});
}
        for (let i = 0; i < 12; i++) addParticle(player.x, player.y, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, 24, '#ffffff');
        break;
      case 'kiExplosion':
        kiExplosionEffect = { x: player.x + (playerFacingLeft ? -34 : 34), y: player.y, radius: 18, maxRadius: Math.max(canvas.width, canvas.height) * 0.62,damage: (superTechLevels.kiExplosion === 1 ? 1 : superTechLevels.kiExplosion === 2 ? 2 : 4) + (damageBonus * 5), createdAt: now };
        kiExplosionCooldownAt = now + 1000;
        break;
      case 'dodonpa':{

    const dodonTarget = findNearestEnemy();

    if(dodonTarget){

        const dx = dodonTarget.x - player.x;
        const dy = dodonTarget.y - player.y;
        const len = Math.hypot(dx,dy) || 1;

        dodonpaShots.push({

            fromX: player.x,
            fromY: player.y,

            toX: player.x + (dx/len)*3000,
            toY: player.y + (dy/len)*3000,

            damage: 3 + damageBonus,

            born: performance.now(),

            duration:500,

            hit:new Set()

        });

        for(let i=0;i<10;i++)
            addParticle(
                player.x,
                player.y,
                (Math.random()-0.5)*4,
                (Math.random()-0.5)*4,
                16,
                '#fff3a0'
            );
    }

    break;
}
      case 'absorbki':
        absorbkiShieldUntil = now + 5000;
        absorbkiTriggerReady = false;
        for (let i = 0; i < 20; i++) addParticle(player.x, player.y, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, 26, '#66ccff');
        break;
      case 'dragonDash':
        for (let i = 0; i < 18; i++) addParticle(player.x, player.y, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, 30, '#ffcc33');
        window.chapterManager.showMenuMessage('Acometida del Dragón lista');
        break;
      case 'muten':
        for (let i = 0; i < 14; i++) addParticle(player.x, player.y, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, 22, '#ffd6ff');
        window.chapterManager.showMenuMessage('Concentración de Muten Roshi lista');
        break;
        
    }
  }

  function openSuperiorTechniqueMenu(){
    const options = getSuperTechOptions();
    if (!options.length){
      window.chapterManager.showMenuMessage('Todas las técnicas están al máximo');
      paused = false;
      return;
    }
    paused = true;
    const div = levelUpEl;
    div.innerHTML = '';
    div.innerHTML = '<h1>Técnicas superiores</h1><p>Elige una mejora</p>';
    div.style.display = 'flex';
    options.forEach(key => {
      const b = document.createElement('button');
      const maxForKey = SUPER_TECH_PER_MAX[key] || superTechMax;
      b.textContent = getSuperTechLabel(key) + ' (' + (superTechLevels[key] || 0) + '/' + maxForKey + ')';
      b.onclick = () => {
        superTechLevels[key] = (superTechLevels[key] || 0) + 1;
        triggerSuperTechFeedback(key, getCurrentTime());
        div.style.display = 'none';
        paused = false;
        window.chapterManager.showMenuMessage(getSuperTechLabel(key) + ' activada');
        window.__spawnAcc = 0;
      };
      div.appendChild(b);

      if(window.speed10){
    const autoBtn = b;
    setTimeout(() => autoBtn.click(), 50);
   
}
    });

 ui.setMenu([
        ...div.querySelectorAll('button')
    ]);

  }

  function levelUp(){
    paused = true;
    lvl++;
    xp = 0;
    xpNeed = lvl >= 10 ? Math.floor(xpNeed * 1.10) : Math.floor(xpNeed * 1.4);
    const div = levelUpEl;
    div.innerHTML = '<h1>Elige mejora</h1>';
    div.style.display = 'flex';

    const opts = [
      { label: '+Daño', key:'damage', apply:()=>player.damage++ },
      { label: '+Velocidad', key:'speed', apply:()=>player.speed += 0.4 },
      { label: '+Vida', key:'hp', apply:()=>{ player.maxHp += 20; player.hp += 20; } },
      { label: '+Disparo', key:'bullets', apply:()=>player.bullets++ }
    ].filter(o => canUpgrade(o.key));

    if (!opts.length){
      div.style.display = 'none';
      paused = false;
      window.__spawnAcc = 0;
      return;
    }

    for (let i = 0; i < 3 && opts.length; i++){
      let idx = (Math.random() * opts.length) | 0;
      let o = opts.splice(idx, 1)[0];
      const b = document.createElement('button');
      b.textContent = o.label + ' (' + upgradeLevels[o.key] + '/' + upgradeMax[o.key] + ')';
      b.onclick = () => { applyUpgrade(o.key, o.apply); div.style.display = 'none'; paused = false; window.__spawnAcc = 0; };
      div.appendChild(b);

      if(window.speed10){
      const autoBtn = b;
      setTimeout(() => autoBtn.click(), 50);
      break;
}

    }

ui.setMenu([
    ...levelUpEl.querySelectorAll('button')
]);

  }

  global.techniquesManager = {
    canUpgrade,
    applyUpgrade,
    getSuperTechLabel,
    getSuperTechOptions,
    triggerSuperTechFeedback,
    openSuperiorTechniqueMenu,
    levelUp
  };
})(window);
