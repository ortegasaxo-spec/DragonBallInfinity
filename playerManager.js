(function(global){
  function findNearestEnemy(){
  let best = null;
  let bestD = Infinity;
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (!e || e.dead) continue;
    const dx = e.x - player.x;
    const dy = e.y - player.y;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      best = e;
      bestD = d;
    }
  }
  return best;
}

  function findNearestBoss(){
  let best = null;
  let bestD = Infinity;

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (!e || e.dead || e.type !== 'boss') continue;

    const dx = e.x - player.x;
    const dy = e.y - player.y;
    const d = dx * dx + dy * dy;

    if (d < bestD) {
      best = e;
      bestD = d;
    }
  }

  return best;
}

  function getHitbox(e){
    return playerController.getHitbox(e);
  }

  function aabbHit(px, py, e){
    return collisionSystem.aabbHit(px, py, e, (target) => playerController.getHitbox(target));
  }

  function isFarFromPlayer(o, limitSq = DESPAWN_DISTANCE_SQ){
    const dx = o.x - player.x;
    const dy = o.y - player.y;
    return dx * dx + dy * dy > limitSq;
  }

  function trimArray(arr, max, release){
    if (arr.length > max) {
      const removeCount = arr.length - max;
      if (release) {
        for (let i = 0; i < removeCount; i++) {
          const item = arr[i];
          if (item) release(item);
        }
      }
      arr.splice(0, removeCount);
    }
  }

  function compactArrays(){
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      if (!b || b.dead || isFarFromPlayer(b)) { if (b) releaseBullet(b); bullets.splice(i, 1); }
    }
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (!e || e.dead || (e.type !== 'boss' && isFarFromPlayer(e, DESPAWN_DISTANCE_SQ * 2))) { if (e) releaseEnemy(e); enemies.splice(i, 1); }
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (!p || p.dead || isFarFromPlayer(p)) { if (p) releaseParticle(p); particles.splice(i, 1); }
    }
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const b = enemyBullets[i];
      if (!b || b.dead || isFarFromPlayer(b)) { if (b) releaseEnemyBullet(b); enemyBullets.splice(i, 1); }
    }
    for (let i = powerUps.length - 1; i >= 0; i--) {
      const p = powerUps[i];
      if (!p || isFarFromPlayer(p, DESPAWN_DISTANCE_SQ * 2)) { powerUps.splice(i, 1); }
    }
    trimArray(bullets, MAX_PLAYER_BULLETS, releaseBullet);
    trimArray(enemyBullets, MAX_ENEMY_BULLETS, releaseEnemyBullet);
    trimArray(particles, MAX_PARTICLES, releaseParticle);
    trimArray(powerUps, MAX_POWERUPS);
  }

  global.playerManager = {
    findNearestEnemy,
    findNearestBoss,
    getHitbox,
    aabbHit,
    isFarFromPlayer,
    trimArray,
    compactArrays
};
})(window);
