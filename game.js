
const audioManager = window.audioManager;
const kameSound = audioManager.kameSound;
const boomSound = audioManager.boomSound;
const bossImages = window.bossManager.bossImages;
const bossColors = window.bossManager.bossColors;

// Global debug flag - set to `true` to enable all instrumentation
const DEBUG = false;

// Lightweight spawn accumulator used by the spawner. Kept intentionally
// minimal (a single number) so game pacing works even when DEBUG instrumentation
// is disabled. Do NOT use this for profiling data.
window.__spawnAcc = window.__spawnAcc || 0;
let gameOver=false;
// Enable temporary stress test mode for automated long-run stability tests
const DEBUG_STRESS_TEST = false;
let pauseMenuOpen=false;
let initials="";
document.addEventListener("keydown",e=>{

console.log("TECLA", e.key, gameOver, initials);

 if(gameOver && initials.length<3 && /^[a-zA-Z]$/.test(e.key)){
   initials+=e.key.toUpperCase();
 }
});

let kills=0;
let bossKills=0;

// Número de vuelta del Modo Historia (New Game+)
let storyLoop = 1;

let gameStarted=false;
let selectedUpgrade=0;
window.gameSpeed = 1;

let gameTimeOrigin = performance.now();
let realTimeOrigin = performance.now();

function getCurrentTime(){

    const realNow = performance.now();

    return gameTimeOrigin + (realNow - realTimeOrigin) * window.gameSpeed;

}

const LONG_RUN_AUDIT_INTERVAL_MS = 30000;
function recordLongRunPhase(name, duration){
 if(window.__longRunAudit && window.__longRunAudit.enabled){
  window.__longRunAudit.recordPhase(name, duration);
 }
}

window.__longRunAudit = window.__longRunAudit || {
 enabled: false,
 startedAt: 0,
 lastSampleAt: 0,
 samples: [],
 frameCount: 0,
 frameTimeSum: 0,
 projectileMs: 0,
 enemyMs: 0,
 renderMs: 0,
 projectileMoveMs: 0,
 projectileQueryMs: 0,
 projectileCandidatesMs: 0,
 projectileAabbMs: 0,
 projectileDamageMs: 0,
 projectileRemovalMs: 0,
 projectileKiExplosionMs: 0,
 projectileSpecialTechniquesMs: 0,
 projectileCompactMs: 0,
 queryEnemiesNearCalls: 0,
 queryEnemiesNearCandidatesTotal: 0,
 queryEnemiesNearMaxCandidates: 0,
 projectileUpdateQueryCalls: 0,
 projectileUpdateCandidatesTotal: 0,
 projectileUpdateMaxCandidates: 0,
 shieldOrbQueryCalls: 0,
 shieldOrbCandidatesTotal: 0,
 shieldOrbMaxCandidates: 0,
 kienzanQueryCalls: 0,
 kienzanCandidatesTotal: 0,
 kienzanMaxCandidates: 0,
 dodonpaQueryCalls: 0,
 dodonpaCandidatesTotal: 0,
 dodonpaMaxCandidates: 0,
 kiExplosionQueryCalls: 0,
 kiExplosionCandidatesTotal: 0,
 kiExplosionMaxCandidates: 0,
 specialTechniquesQueryCalls: 0,
 specialTechniquesCandidatesTotal: 0,
 specialTechniquesMaxCandidates: 0,
 projectilesUpdated: 0,
 projectilesCreated: 0,
 projectilesDestroyed: 0,
 aabbTests: 0,
 aabbHits: 0,
 damageApplications: 0,
 kiExplosionExecutions: 0,
 kiExplosionAffectedEnemies: 0,
 specialTechniqueExecutions: 0,
 projectilesActualizados: 0,
 proyectilesDestruidos: 0,
 proyectilesCreados: 0,
 chapterStartAt: 0,
 chapterRef: null,
 reset(){
  this.enabled = false;
  this.startedAt = 0;
  this.lastSampleAt = 0;
  this.samples = [];
  this.frameCount = 0;
  this.frameTimeSum = 0;
  this.projectileMs = 0;
  this.enemyMs = 0;
  this.renderMs = 0;
  this.projectileMoveMs = 0;
  this.projectileQueryMs = 0;
  this.projectileCandidatesMs = 0;
  this.projectileAabbMs = 0;
  this.projectileDamageMs = 0;
  this.projectileRemovalMs = 0;
  this.projectileKiExplosionMs = 0;
  this.projectileSpecialTechniquesMs = 0;
  this.projectileCompactMs = 0;
  this.queryEnemiesNearCalls = 0;
  this.queryEnemiesNearCandidatesTotal = 0;
  this.queryEnemiesNearMaxCandidates = 0;
  this.projectileUpdateQueryCalls = 0;
  this.projectileUpdateCandidatesTotal = 0;
  this.projectileUpdateMaxCandidates = 0;
  this.shieldOrbQueryCalls = 0;
  this.shieldOrbCandidatesTotal = 0;
  this.shieldOrbMaxCandidates = 0;
  this.kienzanQueryCalls = 0;
  this.kienzanCandidatesTotal = 0;
  this.kienzanMaxCandidates = 0;
  this.dodonpaQueryCalls = 0;
  this.dodonpaCandidatesTotal = 0;
  this.dodonpaMaxCandidates = 0;
  this.kiExplosionQueryCalls = 0;
  this.kiExplosionCandidatesTotal = 0;
  this.kiExplosionMaxCandidates = 0;
  this.specialTechniquesQueryCalls = 0;
  this.specialTechniquesCandidatesTotal = 0;
  this.specialTechniquesMaxCandidates = 0;
  this.projectilesUpdated = 0;
  this.projectilesCreated = 0;
  this.projectilesDestroyed = 0;
  this.aabbTests = 0;
  this.aabbHits = 0;
  this.damageApplications = 0;
  this.kiExplosionExecutions = 0;
  this.kiExplosionAffectedEnemies = 0;
  this.specialTechniqueExecutions = 0;
  this.projectilesActualizados = 0;
  this.proyectilesDestruidos = 0;
  this.proyectilesCreados = 0;
  this.chapterStartAt = 0;
  this.chapterRef = null;
 },
 start(now = performance.now()){
  this.reset();
  this.enabled = true;
  this.startedAt = now;
  this.lastSampleAt = now;
  this.chapterStartAt = now;
  this.chapterRef = (window.gameMode === 'story') ? (window.currentChapter || 1) : null;
 },
 stop(){
  this.enabled = false;
 },
 maybeStart(gameRunning, now = performance.now()){
  if(gameRunning && !this.enabled && this.startedAt === 0){
   this.start(now);
  }
 },
 getElapsedChapterOrRunSeconds(now = performance.now()){
  const storyMode = window.gameMode === 'story';
  if(storyMode){
   const chapterNow = window.currentChapter || 1;
   if(this.chapterRef !== chapterNow){
    this.chapterRef = chapterNow;
    this.chapterStartAt = now;
   }
   return Math.max(0, Math.floor((now - (this.chapterStartAt || now)) / 1000));
  }
  return getRunTime();
 },
 noteFrame(dt){
  if(!this.enabled) return;
  this.frameCount++;
  this.frameTimeSum += dt;
 },
 recordPhase(name, duration){
  if(!this.enabled) return;
  if(name === 'Projectile Update') this.projectileMs += duration;
  else if(name === 'Enemy Update') this.enemyMs += duration;
  else if(name === 'draw') this.renderMs += duration;
  else if(name === 'compactArrays') this.projectileCompactMs += duration;
 },
 recordProjectileDetail(name, duration){
  if(!this.enabled) return;
  if(name === 'movement') this.projectileMoveMs += duration;
  else if(name === 'queryEnemiesNear') this.projectileQueryMs += duration;
  else if(name === 'candidateIteration') this.projectileCandidatesMs += duration;
  else if(name === 'aabbHit') this.projectileAabbMs += duration;
  else if(name === 'damageApply') this.projectileDamageMs += duration;
  else if(name === 'projectileRemoval') this.projectileRemovalMs += duration;
  else if(name === 'kiExplosion') this.projectileKiExplosionMs += duration;
  else if(name === 'specialTechniques') this.projectileSpecialTechniquesMs += duration;
 },
   recordQueryOrigin(source, candidates){
    if(!this.enabled) return;
    const c = Number(candidates) || 0;
    if(source === 'projectileUpdate'){
     this.projectileUpdateQueryCalls++;
     this.projectileUpdateCandidatesTotal += c;
     if(c > this.projectileUpdateMaxCandidates) this.projectileUpdateMaxCandidates = c;
    } else if(source === 'shieldOrb'){
     this.shieldOrbQueryCalls++;
     this.shieldOrbCandidatesTotal += c;
     if(c > this.shieldOrbMaxCandidates) this.shieldOrbMaxCandidates = c;
    } else if(source === 'kienzan'){
     this.kienzanQueryCalls++;
     this.kienzanCandidatesTotal += c;
     if(c > this.kienzanMaxCandidates) this.kienzanMaxCandidates = c;
     this.specialTechniquesQueryCalls++;
     this.specialTechniquesCandidatesTotal += c;
     if(c > this.specialTechniquesMaxCandidates) this.specialTechniquesMaxCandidates = c;
    } else if(source === 'dodonpa'){
     this.dodonpaQueryCalls++;
     this.dodonpaCandidatesTotal += c;
     if(c > this.dodonpaMaxCandidates) this.dodonpaMaxCandidates = c;
     this.specialTechniquesQueryCalls++;
     this.specialTechniquesCandidatesTotal += c;
     if(c > this.specialTechniquesMaxCandidates) this.specialTechniquesMaxCandidates = c;
    } else if(source === 'kiExplosion'){
     this.kiExplosionQueryCalls++;
     this.kiExplosionCandidatesTotal += c;
     if(c > this.kiExplosionMaxCandidates) this.kiExplosionMaxCandidates = c;
    } else if(source === 'specialTechniques'){
     this.specialTechniquesQueryCalls++;
     this.specialTechniquesCandidatesTotal += c;
     if(c > this.specialTechniquesMaxCandidates) this.specialTechniquesMaxCandidates = c;
    }
   },
 countAliveEnemies(){
  let count = 0;
  for(let i=0;i<enemies.length;i++){
   const enemy = enemies[i];
   if(enemy && !enemy.dead) count++;
  }
  return count;
 },
 countActiveEffects(now = performance.now()){
  let count = 0;
  if(kameActive) count++;
  if(kameExplosion > 0) count++;
  if(typeof absorbkiShieldUntil !== 'undefined' && now < absorbkiShieldUntil) count++;
  for(let i=0;i<enemies.length;i++){
   const enemy = enemies[i];
   if(!enemy || enemy.dead || enemy.type !== 'boss') continue;
   if(enemy.zamasHalo && enemy.zamasHalo.size) count++;
   if(enemy.goldenFreezerBurst) count++;
  }
  for(let i=0;i<enemyBullets.length;i++){
   const bullet = enemyBullets[i];
   if(!bullet || bullet.dead) continue;
   if(bullet.type === 'beam' || bullet.type === 'cross' || bullet.type === 'goldenFreezerRay') count++;
  }
  return count;
 },
 captureSample(now = performance.now()){
  if(!this.enabled) return null;
  const intervalMs = Math.max(1, now - this.lastSampleAt);
  const frameCount = this.frameCount;
  const sample = {
   time: getRunTime(),
    timeFromChapterOrRunStart: this.getElapsedChapterOrRunSeconds(now),
    level: lvl,
   enemies: this.countAliveEnemies(),
   enemiesKilled: kills,
   bossesKilled: bossKills,
   enemyBullets: enemyBullets.length,
   playerBullets: bullets.length,
   particles: particles.length,
   effects: this.countActiveEffects(now),
   projectileMs: Number(this.projectileMs.toFixed(2)),
  projectileMovementMs: Number(this.projectileMoveMs.toFixed(2)),
  projectileQueryEnemiesNearMs: Number(this.projectileQueryMs.toFixed(2)),
  projectileCandidateIterationMs: Number(this.projectileCandidatesMs.toFixed(2)),
  projectileAabbHitMs: Number(this.projectileAabbMs.toFixed(2)),
  projectileDamageApplyMs: Number(this.projectileDamageMs.toFixed(2)),
  projectileKiExplosionMs: Number(this.projectileKiExplosionMs.toFixed(2)),
  projectileSpecialTechniquesMs: Number(this.projectileSpecialTechniquesMs.toFixed(2)),
  projectileRemovalMs: Number(this.projectileRemovalMs.toFixed(2)),
  projectileCompactationMs: Number(this.projectileCompactMs.toFixed(2)),
  queryEnemiesNearCalls: this.queryEnemiesNearCalls,
  queryEnemiesNearCandidatesTotal: this.queryEnemiesNearCandidatesTotal,
  queryEnemiesNearAverageCandidates: this.queryEnemiesNearCalls > 0 ? Number((this.queryEnemiesNearCandidatesTotal / this.queryEnemiesNearCalls).toFixed(2)) : 0,
  queryEnemiesNearMaxCandidates: this.queryEnemiesNearMaxCandidates,
  ProjectileUpdateAverageCandidates: this.projectileUpdateQueryCalls > 0 ? Number((this.projectileUpdateCandidatesTotal / this.projectileUpdateQueryCalls).toFixed(2)) : 0,
  ProjectileUpdateMaxCandidates: this.projectileUpdateMaxCandidates,
  ShieldOrbAverageCandidates: this.shieldOrbQueryCalls > 0 ? Number((this.shieldOrbCandidatesTotal / this.shieldOrbQueryCalls).toFixed(2)) : 0,
  ShieldOrbMaxCandidates: this.shieldOrbMaxCandidates,
  KienzanAverageCandidates: this.kienzanQueryCalls > 0 ? Number((this.kienzanCandidatesTotal / this.kienzanQueryCalls).toFixed(2)) : 0,
  KienzanMaxCandidates: this.kienzanMaxCandidates,
  DodonpaAverageCandidates: this.dodonpaQueryCalls > 0 ? Number((this.dodonpaCandidatesTotal / this.dodonpaQueryCalls).toFixed(2)) : 0,
  DodonpaMaxCandidates: this.dodonpaMaxCandidates,
  KiExplosionAverageCandidates: this.kiExplosionQueryCalls > 0 ? Number((this.kiExplosionCandidatesTotal / this.kiExplosionQueryCalls).toFixed(2)) : 0,
  KiExplosionMaxCandidates: this.kiExplosionMaxCandidates,
  SpecialTechniquesAverageCandidates: this.specialTechniquesQueryCalls > 0 ? Number((this.specialTechniquesCandidatesTotal / this.specialTechniquesQueryCalls).toFixed(2)) : 0,
  SpecialTechniquesMaxCandidates: this.specialTechniquesMaxCandidates,
  projectilesUpdated: this.projectilesUpdated,
  projectilesCreated: this.projectilesCreated,
  projectilesDestroyed: this.projectilesDestroyed,
  aabbTests: this.aabbTests,
  aabbHits: this.aabbHits,
  damageApplications: this.damageApplications,
  kiExplosionExecutions: this.kiExplosionExecutions,
  kiExplosionAffectedEnemies: this.kiExplosionAffectedEnemies,
  specialTechniqueExecutions: this.specialTechniqueExecutions,
  projectilesActualizados: this.projectilesActualizados,
  proyectilesDestruidos: this.proyectilesDestruidos,
  proyectilesCreados: this.proyectilesCreados,
  projectileOtherMs: 0,
   enemyMs: Number(this.enemyMs.toFixed(2)),
   renderMs: Number(this.renderMs.toFixed(2)),
   fps: frameCount > 0 ? Number(((frameCount * 1000) / intervalMs).toFixed(1)) : 0,
   frameMs: frameCount > 0 ? Number((this.frameTimeSum / frameCount).toFixed(2)) : 0
  };
  const knownProjectileMs = sample.projectileMovementMs + sample.projectileQueryEnemiesNearMs + sample.projectileCandidateIterationMs + sample.projectileAabbHitMs + sample.projectileDamageApplyMs + sample.projectileRemovalMs;
  sample.projectileOtherMs = Number(Math.max(0, sample.projectileMs - knownProjectileMs).toFixed(2));
  this.samples.push(sample);
  this.lastSampleAt = now;
  this.frameCount = 0;
  this.frameTimeSum = 0;
  this.projectileMs = 0;
  this.enemyMs = 0;
  this.renderMs = 0;
  this.projectileMoveMs = 0;
  this.projectileQueryMs = 0;
  this.projectileCandidatesMs = 0;
  this.projectileAabbMs = 0;
  this.projectileDamageMs = 0;
  this.projectileRemovalMs = 0;
  this.projectileKiExplosionMs = 0;
  this.projectileSpecialTechniquesMs = 0;
  this.projectileCompactMs = 0;
  this.queryEnemiesNearCalls = 0;
  this.queryEnemiesNearCandidatesTotal = 0;
  this.queryEnemiesNearMaxCandidates = 0;
  this.projectileUpdateQueryCalls = 0;
  this.projectileUpdateCandidatesTotal = 0;
  this.projectileUpdateMaxCandidates = 0;
  this.shieldOrbQueryCalls = 0;
  this.shieldOrbCandidatesTotal = 0;
  this.shieldOrbMaxCandidates = 0;
  this.kienzanQueryCalls = 0;
  this.kienzanCandidatesTotal = 0;
  this.kienzanMaxCandidates = 0;
  this.dodonpaQueryCalls = 0;
  this.dodonpaCandidatesTotal = 0;
  this.dodonpaMaxCandidates = 0;
  this.kiExplosionQueryCalls = 0;
  this.kiExplosionCandidatesTotal = 0;
  this.kiExplosionMaxCandidates = 0;
  this.specialTechniquesQueryCalls = 0;
  this.specialTechniquesCandidatesTotal = 0;
  this.specialTechniquesMaxCandidates = 0;
  this.projectilesUpdated = 0;
  this.projectilesCreated = 0;
  this.projectilesDestroyed = 0;
  this.aabbTests = 0;
  this.aabbHits = 0;
  this.damageApplications = 0;
  this.kiExplosionExecutions = 0;
  this.kiExplosionAffectedEnemies = 0;
  this.specialTechniqueExecutions = 0;
  this.projectilesActualizados = 0;
  this.proyectilesDestruidos = 0;
  this.proyectilesCreados = 0;
  return sample;
 },
 maybeSample(now = performance.now()){
  if(!this.enabled) return null;
  if(now - this.lastSampleAt < LONG_RUN_AUDIT_INTERVAL_MS) return null;
  return this.captureSample(now);
 },
 analyzeGrowth(){
  const samples = this.samples;
  const metrics = ['enemies', 'enemyBullets', 'playerBullets', 'particles', 'effects', 'projectileMs', 'enemyMs', 'renderMs'];
  const suspicious = [];
  for(const metric of metrics){
   if(samples.length < 3) continue;
   const values = samples.map(sample => Number(sample[metric]) || 0);
   const first = values[0];
   const last = values[values.length - 1];
   const mid = values[Math.floor(values.length / 2)];
   const lastThree = values.slice(-3);
   const growth = last > first && last >= mid;
   const sustainedTail = lastThree.every((value, index, array) => index === 0 || value >= array[index - 1]);
   if(growth && sustainedTail && (last > first * 1.2 || last - first > 5)){
    suspicious.push(metric);
   }
  }
  return suspicious;
 },
 print(){
  const rows = this.samples.map(sample => ({
   Tiempo: sample.time,
    'Tiempo desde inicio capítulo/partida': sample.timeFromChapterOrRunStart,
    Nivel: sample.level,
   Enemigos: sample.enemies,
   'Enemigos derrotados': sample.enemiesKilled,
   'Bosses derrotados': sample.bossesKilled,
   EnemyBullets: sample.enemyBullets,
   PlayerBullets: sample.playerBullets,
   Partículas: sample.particles,
   Efectos: sample.effects,
   'Projectile ms': sample.projectileMs,
  'Projectile movimiento ms': sample.projectileMovementMs,
  'Projectile queryEnemiesNear ms': sample.projectileQueryEnemiesNearMs,
  'Projectile iteración candidatos ms': sample.projectileCandidateIterationMs,
  'Projectile aabbHit ms': sample.projectileAabbHitMs,
  'Projectile daño ms': sample.projectileDamageApplyMs,
  'Projectile ki explosion ms': sample.projectileKiExplosionMs,
  'Projectile técnicas especiales ms': sample.projectileSpecialTechniquesMs,
  'Projectile eliminación ms': sample.projectileRemovalMs,
  'Projectile compactación ms': sample.projectileCompactationMs,
  queryEnemiesNearCalls: sample.queryEnemiesNearCalls,
  queryEnemiesNearCandidatesTotal: sample.queryEnemiesNearCandidatesTotal,
  queryEnemiesNearAverageCandidates: sample.queryEnemiesNearAverageCandidates,
  queryEnemiesNearMaxCandidates: sample.queryEnemiesNearMaxCandidates,
  ProjectileUpdateAverageCandidates: sample.ProjectileUpdateAverageCandidates,
  ProjectileUpdateMaxCandidates: sample.ProjectileUpdateMaxCandidates,
  ShieldOrbAverageCandidates: sample.ShieldOrbAverageCandidates,
  ShieldOrbMaxCandidates: sample.ShieldOrbMaxCandidates,
  KienzanAverageCandidates: sample.KienzanAverageCandidates,
  KienzanMaxCandidates: sample.KienzanMaxCandidates,
  DodonpaAverageCandidates: sample.DodonpaAverageCandidates,
  DodonpaMaxCandidates: sample.DodonpaMaxCandidates,
  KiExplosionAverageCandidates: sample.KiExplosionAverageCandidates,
  KiExplosionMaxCandidates: sample.KiExplosionMaxCandidates,
  SpecialTechniquesAverageCandidates: sample.SpecialTechniquesAverageCandidates,
  SpecialTechniquesMaxCandidates: sample.SpecialTechniquesMaxCandidates,
  projectilesUpdated: sample.projectilesUpdated,
  projectilesCreated: sample.projectilesCreated,
  projectilesDestroyed: sample.projectilesDestroyed,
  aabbTests: sample.aabbTests,
  aabbHits: sample.aabbHits,
  damageApplications: sample.damageApplications,
  kiExplosionExecutions: sample.kiExplosionExecutions,
  kiExplosionAffectedEnemies: sample.kiExplosionAffectedEnemies,
  specialTechniqueExecutions: sample.specialTechniqueExecutions,
  projectilesActualizados: sample.projectilesActualizados,
  proyectilesDestruidos: sample.proyectilesDestruidos,
  proyectilesCreados: sample.proyectilesCreados,
  'Projectile otras subfases ms': sample.projectileOtherMs,
   'Enemy ms': sample.enemyMs,
   'Render ms': sample.renderMs,
   FPS: sample.fps,
   'Frame ms': sample.frameMs
  }));
  console.table(rows);
  const suspicious = this.analyzeGrowth();
  if(suspicious.length){
   console.info('Métricas con crecimiento sostenido:', suspicious.join(', '));
  } else {
   console.info('No se observó crecimiento sostenido sin estabilización en las métricas auditadas.');
  }
  return { samples: this.samples.slice(), suspicious };
 }
};
window.printLongRunAudit = function(){
 return window.__longRunAudit ? window.__longRunAudit.print() : null;
};

// --- DEBUG: Stress test instrumentation and driver (active only when DEBUG===true) ---
if (DEBUG) {
  window.__stress = window.__stress || {
    enabled: false,
    intervalMs: 60000,
    durationMs: 30*60*1000,
    timerId: null,
    startedAt: 0,
    history: [],
    // counters per pool/type
    counters: {
      bulletCreated:0, bulletReused:0, bulletReleased:0,
      enemyCreated:0, enemyReused:0, enemyReleased:0,
      enemyBulletCreated:0, enemyBulletReused:0, enemyBulletReleased:0,
      particleCreated:0, particleReused:0, particleReleased:0
    },
    // aggregated counters (legacy)
    agg: { created:0, reused:0, released:0 },
    frameTimes: [],
    accUpdateTime: 0,
    accRenderTime: 0,
    gcPauses: [],
    peaks: { enemies:0, bullets:0, particles:0, bosses:0, powerUps:0 },
    start(){ if(this.enabled) return; this.enabled=true; this.startedAt=performance.now(); this.timerId = setInterval(()=>this.record(), this.intervalMs); console.log('[Stress] started'); },
    stop(){ if(!this.enabled) return; this.enabled=false; if(this.timerId) clearInterval(this.timerId); this.timerId=null; this.finalizeReport(); console.log('[Stress] stopped'); },
    computePercentile(arr,p){ if(!arr||!arr.length) return 0; const a=arr.slice().sort((x,y)=>x-y); const idx=Math.min(a.length-1, Math.floor((p/100)*(a.length-1))); return a[idx]; },
    record(){ const now=performance.now(); const sample={ts:now,elapsed:now-this.startedAt, enemies:enemies.length, bullets:bullets.length, enemyBullets:enemyBullets.length, particles:particles.length, powerUps:powerUps.length, bosses:enemies.filter(e=>e&&e.type==='boss').length, shieldOrbs:shieldOrbs.length, dodonpaShots:dodonpaShots.length, pools:{bulletPool:bulletPool.length,particlePool:particlePool.length,enemyPool:enemyPool.length,enemyBulletPool:enemyBulletPool.length}, counters:Object.assign({},this.counters), agg:Object.assign({},this.agg), frameAvg:this.frameTimes.length?this.frameTimes.reduce((a,b)=>a+b,0)/this.frameTimes.length:0, frameMin:this.frameTimes.length?Math.min(...this.frameTimes):0, frameMax:this.frameTimes.length?Math.max(...this.frameTimes):0, frameP95:this.computePercentile(this.frameTimes,95), frameP99:this.computePercentile(this.frameTimes,99), updateTime:this.accUpdateTime, renderTime:this.accRenderTime, memory:(performance.memory?{used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize,limit:performance.memory.jsHeapSizeLimit}:null), gcPauses:this.gcPauses.slice(), peaks:Object.assign({},this.peaks)}; this.history.push(sample); // reset interval accumulators
      this.frameTimes.length=0; this.accUpdateTime=0; this.accRenderTime=0; this.gcPauses.length=0; // peaks persist across run
      if(now - this.startedAt >= this.durationMs){ this.stop(); }
    },
    registerGcPause(dt){ const now=performance.now(); this.gcPauses.push({ts:now,duration:dt,enemies:enemies.length, bullets:bullets.length, particles:particles.length, bosses:enemies.filter(e=>e&&e.type==='boss').length, memory:(performance.memory?performance.memory.usedJSHeapSize:null)}); },
    updatePeaks(){ this.peaks.enemies = Math.max(this.peaks.enemies, enemies.length); this.peaks.bullets = Math.max(this.peaks.bullets, bullets.length); this.peaks.particles = Math.max(this.peaks.particles, particles.length); this.peaks.bosses = Math.max(this.peaks.bosses, enemies.filter(e=>e&&e.type==='boss').length); this.peaks.powerUps = Math.max(this.peaks.powerUps, powerUps.length); },
    finalizeReport(){ // compute stability and classification
      const history = this.history; if(!history.length){ console.log('[Stress] no snapshots'); return; }
      // frame stability: use p99 and variance across snapshots
      const p99s = history.map(s=>s.frameP99||0); const avgP99 = p99s.reduce((a,b)=>a+b,0)/p99s.length;
      const mems = history.map(s=>s.memory && s.memory.used ? s.memory.used : 0); const memGrowth = mems[mems.length-1] - mems[0];
      // pool reuse rates
      const bc = this.counters.bulletCreated, br = this.counters.bulletReused; const bulletReusePct = (bc+br)>0? (br/(bc+br))*100:0;
      const ec = this.counters.enemyCreated, er = this.counters.enemyReused; const enemyReusePct = (ec+er)>0? (er/(ec+er))*100:0;
      const pc = this.counters.particleCreated, pr = this.counters.particleReused; const particleReusePct = (pc+pr)>0? (pr/(pc+pr))*100:0;
      // simple classification rules
      let score=100; if(avgP99>100) score-=50; else if(avgP99>50) score-=20; if(memGrowth>50*1024*1024) score-=30; // >50MB
      if(this.peaks.enemies>2000) score-=20; if(bulletReusePct<20) score-=20;
      let classification='EXCELENTE'; if(score<20) classification='CRÍTICO'; else if(score<40) classification='MEJORABLE'; else if(score<60) classification='ACEPTABLE'; else if(score<80) classification='BUENO';
      const report={history:this.history, peaks:this.peaks, gcPauses:this.gcPauses, poolStats:{bullet:{created:bc,reused:br,reusePct:bulletReusePct},enemy:{created:ec,reused:er,reusePct:enemyReusePct},particle:{created:pc,reused:pr,reusePct:particleReusePct}}, memGrowth, avgP99, classification};
      console.group('[Stress Report]'); console.log(report); console.groupEnd(); return report;
    },
    getReport(){ return this.finalizeReport(); }
  };
  if(DEBUG_STRESS_TEST){ window.__stress.start(); }
}
// --- DEBUG: Audit instrumentation (active only when DEBUG===true) ---
if (DEBUG) {
  window.__audit = window.__audit || {
    enabled: false,
    intervalMs: 30000,
    timerId: null,
    counters: {
      bulletCreated:0, bulletReused:0, bulletReleased:0,
      enemyCreated:0, enemyReused:0, enemyReleased:0,
      enemyBulletCreated:0, enemyBulletReused:0, enemyBulletReleased:0,
      particleCreated:0, particleReused:0, particleReleased:0,
      overlaysCreated:0,
      rafCalls:0,
      intervalsCreated:0, timeoutsCreated:0,
    },
    frameTimes: [],
    history: [],
    installHooks(){
      if(this._hooksInstalled) return; this._hooksInstalled=true;
      this._orig = {
        rAF: window.requestAnimationFrame,
        setInterval: window.setInterval,
        setTimeout: window.setTimeout,
        createElement: document.createElement.bind(document),
        addEventListener: EventTarget.prototype.addEventListener
      };
      const self = this;
      window.requestAnimationFrame = function(cb){ if(self.enabled) self.counters.rafCalls++; return self._orig.rAF.call(window, cb); };
      window.setInterval = function(cb,t){ const id = self._orig.setInterval.call(window, cb, t); if(self.enabled) self.counters.intervalsCreated++; return id; };
      window.setTimeout = function(cb,t){ const id = self._orig.setTimeout.call(window, cb, t); if(self.enabled) self.counters.timeoutsCreated++; return id; };
      document.createElement = function(tag){ if(self.enabled && (tag||'').toLowerCase()==='canvas') self.counters.overlaysCreated++; return self._orig.createElement(tag); };
      EventTarget.prototype.addEventListener = function(type, listener, opts){ if(self.enabled) { self._lastListenerType = type; } return self._orig.addEventListener.call(this, type, listener, opts); };
    },
    removeHooks(){ if(!this._hooksInstalled) return; this._hooksInstalled=false; const o=this._orig||{}; if(o.rAF) window.requestAnimationFrame=o.rAF; if(o.setInterval) window.setInterval=o.setInterval; if(o.setTimeout) window.setTimeout=o.setTimeout; if(o.createElement) document.createElement=o.createElement; if(o.addEventListener) EventTarget.prototype.addEventListener=o.addEventListener; },
    start(){ if(this.enabled) return; this.enabled=true; this.installHooks(); const self=this; this._lastSnapshotAt = performance.now(); this.timerId = this._orig.setInterval.call(window, ()=>self.recordSnapshot(), this.intervalMs); },
    stop(){ if(!this.enabled) return; this.enabled=false; if(this.timerId) window.clearInterval(this.timerId); this.timerId=null; this.removeHooks(); },
    recordSnapshot(){ const now=performance.now(); const sample={ts:now,elapsed:now-(this._lastSnapshotAt||now)}; this._lastSnapshotAt=now; sample.enemies=enemies.length; sample.bullets=bullets.length; sample.enemyBullets=enemyBullets.length; sample.particles=particles.length; sample.powerUps=powerUps.length; sample.bosses=enemies.filter(e=>e&&e.type==='boss').length; sample.shieldOrbs=shieldOrbs.length; sample.dodonpaShots=dodonpaShots.length; sample.pools={bulletPool:bulletPool.length,particlePool:particlePool.length,enemyPool:enemyPool.length,enemyBulletPool:enemyBulletPool.length}; sample.counters=Object.assign({},this.counters); sample.frameAvg = this.frameTimes.length? (this.frameTimes.reduce((a,b)=>a+b,0)/this.frameTimes.length) : 0; sample.frameMin = this.frameTimes.length? Math.min(...this.frameTimes):0; sample.frameMax = this.frameTimes.length? Math.max(...this.frameTimes):0; if(window.performance && performance.memory) sample.memory = {used:performance.memory.usedJSHeapSize,total:performance.memory.totalJSHeapSize,limit:performance.memory.jsHeapSizeLimit}; else sample.memory=null; this.history.push(sample); this.frameTimes.length=0; // reset per-interval frame samples
    },
    getReport(){ return {history:this.history,counters:this.counters}; }
  };
}
let survivalStart=getCurrentTime();

const canvas = document.getElementById("gameCanvas");
const ctx=canvas.getContext('2d');
canvas.width=innerWidth; canvas.height=innerHeight;
const hpEl=document.getElementById('hp');
const lvlEl=document.getElementById('lvl');
const xpEl=document.getElementById('xp');
const levelUpEl=document.getElementById("levelUp");

const playerImg=new Image(); playerImg.src='assets/personajes/Goku.png';
// Use a fixed target render size (pixels) that matches the original UI expectation
const TARGET_PLAYER_W = 119;
const TARGET_PLAYER_H = 158;
let ssjTargetSize = { w: TARGET_PLAYER_W, h: TARGET_PLAYER_H };
function getDefaultPlayerRadius(){
  return Math.max(ssjTargetSize.w, ssjTargetSize.h) * 0.060952; // calibrated to original r for SSJ
}

function setPlayerSprite(src){
  if(!src) return;
  // clear any previous cache for this image object so new src is processed
  try{ cleanedSprites.delete(playerImg); }catch(e){}
  playerImg.src = src;
  // Normalize loaded sprite to SSJ target size so all characters share same visual size and hitbox base
  const onLoaded = ()=>{
    try{
      const cs = getCleanSprite(playerImg);
      if(!cs) return;
      if(ssjTargetSize){
        const out = document.createElement('canvas');
        out.width = ssjTargetSize.w; out.height = ssjTargetSize.h;
        const octx = out.getContext('2d');
        octx.clearRect(0,0,out.width,out.height);
        const dw = (cs.width||cs.naturalWidth||cs.w||out.width);
        const dh = (cs.height||cs.naturalHeight||cs.h||out.height);
        // scale to fit target while preserving aspect ratio (no cropping)
        const scale = Math.min(out.width / dw, out.height / dh);
        const scaledW = Math.round(dw * scale);
        const scaledH = Math.round(dh * scale);
        const dx = Math.round((out.width - scaledW) / 2);
        const dy = Math.round((out.height - scaledH) / 2);
        octx.drawImage(cs, 0, 0, dw, dh, dx, dy, scaledW, scaledH);
        cleanedSprites.set(playerImg, out);
        // update player radius to match SSJ-derived sizing
        player.r = getDefaultPlayerRadius();
      } else {
        // fallback: ensure cleaned sprite is cached
        cleanedSprites.set(playerImg, cs);
        player.r = getDefaultPlayerRadius();
      }
    }catch(e){ /* ignore */ }
  };
  if (playerImg.complete) onLoaded();
  else playerImg.addEventListener('load', onLoaded, { once: true });
}
window.setPlayerSprite = setPlayerSprite;
const asteroidImg=new Image(); asteroidImg.src='assets/asteroid.png';
const shooterAsteroidImg=new Image(); shooterAsteroidImg.src='assets/comet-1782248712754-85rtugu.png';
const capsuleImg=new Image(); capsuleImg.src='assets/senzu.png';
const kameImg=new Image(); kameImg.src='assets/genkidama.png';
const cargaKameImg=new Image(); cargaKameImg.src='assets/cargagenki.png';
const kamehamehaImg = new Image(); kamehamehaImg.src = 'assets/kame.png';
const gokuShotImg=new Image(); gokuShotImg.src='assets/Goku_projectile.png';
const garlicImg=new Image(); garlicImg.src='assets/garlic.png';
const deathBallImg=new Image(); deathBallImg.src='assets/bola muerte golden.png';
const jirenProjectileImg=new Image(); jirenProjectileImg.src='assets/bolamuerte.png';
const rayOfFreezerImg=new Image(); rayOfFreezerImg.src='assets/rayofreezer.png';
const halozamasImg=new Image(); halozamasImg.src='assets/halozamas.png';
const dragonBallDropImg=new Image(); dragonBallDropImg.src='assets/dragonball.png.png';
const barrierImg=new Image(); barrierImg.src='assets/barrera.png';
const destructorImg=new Image(); destructorImg.src='assets/destructor.png';
const discoImg=new Image(); discoImg.src='assets/disco.png';
const babaImg=new Image(); babaImg.src='assets/Baba.png';
const shenronImg=new Image(); shenronImg.src='assets/Shenron.png';
const bossProjectileImgA=new Image(); bossProjectileImgA.src='assets/Broly 65.png';
const bossProjectileImgB=new Image(); bossProjectileImgB.src='assets/Bills_92.png.png';
const bossProjectileImages=[bossProjectileImgA,bossProjectileImgB];
const KAMEHAMEHA_DAMAGE_MULTIPLIER = 20;
const KAMEHAMEHA_COOLDOWN = 20000;
let kameActive=false,kamePhase=0,kameProjectile=null,kameExplosion=0,kameExplosionTarget=null;
let kamehamehaCooldownUntil = 0;
let kamehamehaProjectile = null;

let damageFlash=0;
let playerFacingLeft=false;
// Scene backgrounds (Infinity Mode) - load scenes from assets/scenes/ch1..ch15
const sceneImages = [];
const SCENE_MAX = 15;
for (let i = 1; i <= SCENE_MAX; i++){
  const si = new Image(); si.src = `assets/scenes/ch${i}.png`; sceneImages.push(si);
}
const storySceneCache = {};

function getSceneImage(scenePath){
  if(!scenePath) return null;

  let img = storySceneCache[scenePath];
  if(!img){
    img = new Image();
    img.src = 'assets/' + scenePath;
    storySceneCache[scenePath] = img;
  }

  return img.complete && img.naturalWidth ? img : null;
}
let currentSceneIndex = 0;
const SCENE_DURATION_MS = 90000; // 90s per scene
let sceneSwitchAt = getCurrentTime() + SCENE_DURATION_MS;

const player={
    x:canvas.width/2,
    y:canvas.height/2,
    r:getDefaultPlayerRadius(),
    hp:100,
    maxHp:100,
    speed:3,
    baseSpeed:3,
    damage:1,
    bullets:1,
    fireRate:350,
    armor:0
};
const playerController=new window.PlayerController(player,canvas);
const enemyManager=new window.EnemyManager();
const projectileManager=new window.ProjectileManager();
const collisionSystem=new window.CollisionSystem();
const renderer=new window.Renderer(canvas,ctx);
const ui=new window.UI(document,{get player(){return player;},get lvl(){return lvl;},get xp(){return xp;},get xpNeed(){return xpNeed;},get upgradeLevels(){return upgradeLevels;},get upgradeMax(){return upgradeMax;},get superTechLevels(){return superTechLevels;},get dragonballCount(){return dragonballCount;},get extraLives(){return extraLives;},get kills(){return kills;},togglePauseMenu,saveGame,exitToTitle});
// Ensure initial player sprite is normalized to SSJ box (if already loaded, do it now)
if(playerImg.complete){
  try{
    const cs=getCleanSprite(playerImg);
    if(cs){
      if(ssjTargetSize){
        const out=document.createElement('canvas'); out.width=ssjTargetSize.w; out.height=ssjTargetSize.h;
        const octx=out.getContext('2d'); octx.clearRect(0,0,out.width,out.height);
        const dw=(cs.width||cs.naturalWidth||cs.w||out.width);
        const dh=(cs.height||cs.naturalHeight||cs.h||out.height);
        const scale=Math.min(out.width/dw, out.height/dh);
        const scaledW=Math.round(dw*scale), scaledH=Math.round(dh*scale);
        const dx=Math.round((out.width-scaledW)/2), dy=Math.round((out.height-scaledH)/2);
        octx.drawImage(cs,0,0,dw,dh,dx,dy,scaledW,scaledH);
        cleanedSprites.set(playerImg,out);
      } else cleanedSprites.set(playerImg,cs);
      player.r = getDefaultPlayerRadius();
    }
  }catch(e){}
} else {
  setPlayerSprite(playerImg.src);
}
const upgradeLevels={damage:0,speed:0,hp:0,bullets:0,rate:0};
const upgradeMax={damage:999999,speed:5,hp:10,bullets:2,rate:5};
const superTechLevels={shield:0,kienzan:0,kiExplosion:0,dodonpa:0,absorbki:0,dragonDash:0,muten:0,kamehameha:0};
const superTechMax=3;
let enemies=[],bullets=[],enemyBullets=[],particles=[],powerUps=[];
let dragonballCount=0;
let extraLives=0;
let shieldOrbs=[];
let kienzanShots=[];
let kienzanCooldownAt=0;
let kiExplosionEffect=null;
let dodonpaShots=[];
let dodonpaCooldownAt=0;
let kiExplosionCooldownAt=0;
let absorbkiShieldUntil=0;
let absorbkiTriggerReady=true;
let absorbkiTriggeredCount=0;
let absorbkiAbsorbedDamage=0;
// Dragon dash / Muten technique state
let dragonDashCooldownAt=0;
const DRAGON_DASH_COOLDOWN = 20000;
const DRAGON_DASH_DISTANCE_PCT = 0.25;
const DRAGON_DASH_DURATION = 320; // ms
let lastTapTime={left:0,right:0};
const DOUBLE_TAP_THRESHOLD = 280;
const MAX_ENEMIES=85;
const MAX_PLAYER_BULLETS=90;
const MAX_ENEMY_BULLETS=220;
const MAX_PARTICLES=260;
const MAX_POWERUPS=12;
const DESPAWN_DISTANCE=1700;
const DESPAWN_DISTANCE_SQ=DESPAWN_DISTANCE*DESPAWN_DISTANCE;
const HUD_UPDATE_INTERVAL_MS = 1000 / 30;
const COMPACT_ARRAYS_INTERVAL_MS = 100;
const BOSS_UPDATE_FRAME_INTERVAL = 4;
let bossUpdateFrameCounter = 0;
const ENEMY_AI_FRAME_INTERVAL = 4;
let enemyAiFrameCounter = 0;
// profiler hooks: default no-op implementations
let profilePhase = function(name, fn){
 const start = performance.now();
 try { return fn(); }
 finally { recordLongRunPhase(name, performance.now() - start); }
};
let recordProfileFrame = function(frameTotal) { /* no-op */ };
// ensure profilerFramePhases exists so the main loop can reset it safely
let profilerFramePhases = [];
if (DEBUG) {
  window.__perf = { spawnAcc:0, hudAcc:0 };
  const PROFILE_SAMPLE_FRAMES = 300;
  let profilerFrameSamples = 0;
  const profilerPhaseStats = {};
  profilePhase = function(name, fn){
    const start = performance.now();
    try { return fn(); }
    finally {
      const duration = performance.now() - start;
      profilerFramePhases.push({name, duration});
      recordLongRunPhase(name, duration);
    }
  };
  recordProfileFrame = function(frameTotal){
    profilerFramePhases.forEach(({name,duration})=>{
      const stat = profilerPhaseStats[name] || (profilerPhaseStats[name] = {count:0,total:0,max:0,percentTotal:0});
      stat.count++;
      stat.total += duration;
      stat.max = Math.max(stat.max, duration);
      stat.percentTotal += frameTotal>0 ? (duration/frameTotal)*100 : 0;
    });
    profilerFramePhases = [];
    profilerFrameSamples++;
    if(profilerFrameSamples >= PROFILE_SAMPLE_FRAMES){
      const totalTime = Object.values(profilerPhaseStats).reduce((sum, stat) => sum + stat.total, 0);
      const report = Object.keys(profilerPhaseStats).map(name => {
        const stat = profilerPhaseStats[name];
        return { name, totalMs: stat.total, avgMs: stat.total / stat.count, pct: totalTime > 0 ? (stat.total / totalTime) * 100 : 0 };
      }).sort((a,b) => b.avgMs - a.avgMs);
      console.group(`[Profiler] ${PROFILE_SAMPLE_FRAMES} frames`);
      console.table(report, ['name','totalMs','avgMs','pct']);
      console.groupEnd();
      profilerFrameSamples = 0;
      Object.keys(profilerPhaseStats).forEach(name => { profilerPhaseStats[name] = {count:0,total:0,max:0,percentTotal:0}; });
    }
  };
}
let xp=0,lvl=1,xpNeed=10,lastShot=0,paused=false,bossSpawnedLevel=0; let rankSaved=false; let bossCycle=0; let currentBoss=null;
let bossIndex=0,bossNextSpawnAt=0;
const basePlayer={hp:100,maxHp:100,speed:3,damage:1,bullets:1,fireRate:350,armor:0};


/* === PERFORMANCE POOLS === */
const bulletPool=[];
const particlePool=[];
const enemyPool=[];
const enemyBulletPool=[];

function acquireBullet(){ const b = bulletPool.pop(); if(window.__audit && window.__audit.enabled){ if(b) window.__audit.counters.bulletReused++; else window.__audit.counters.bulletCreated++; } if(window.__stress && window.__stress.enabled){ if(b) window.__stress.counters.bulletReused++; else window.__stress.counters.bulletCreated++; window.__stress.agg.reused += b?1:0; window.__stress.agg.created += b?0:1; } return b || {}; }
function releaseBullet(b){ for(const k in b) delete b[k]; if(window.__audit && window.__audit.enabled) window.__audit.counters.bulletReleased++; if(window.__stress && window.__stress.enabled){ window.__stress.counters.bulletReleased++; window.__stress.agg.released++; } if(bulletPool.length<800) bulletPool.push(b); }

function acquireEnemy(){ const e = enemyPool.pop(); if(window.__audit && window.__audit.enabled){ if(e) window.__audit.counters.enemyReused++; else window.__audit.counters.enemyCreated++; } if(window.__stress && window.__stress.enabled){ if(e) window.__stress.counters.enemyReused++; else window.__stress.counters.enemyCreated++; window.__stress.agg.reused += e?1:0; window.__stress.agg.created += e?0:1; } return e || {}; }
function releaseEnemy(e){ for(const k in e) delete e[k]; if(window.__audit && window.__audit.enabled) window.__audit.counters.enemyReleased++; if(window.__stress && window.__stress.enabled){ window.__stress.counters.enemyReleased++; window.__stress.agg.released++; } if(enemyPool.length<300) enemyPool.push(e); }

function acquireEnemyBullet(){ const b = enemyBulletPool.pop(); if(window.__audit && window.__audit.enabled){ if(b) window.__audit.counters.enemyBulletReused++; else window.__audit.counters.enemyBulletCreated++; } if(window.__stress && window.__stress.enabled){ if(b) window.__stress.counters.enemyBulletReused++; else window.__stress.counters.enemyBulletCreated++; window.__stress.agg.reused += b?1:0; window.__stress.agg.created += b?0:1; } return b || {}; }
function releaseEnemyBullet(b){ for(const k in b) delete b[k]; if(window.__audit && window.__audit.enabled) window.__audit.counters.enemyBulletReleased++; if(window.__stress && window.__stress.enabled){ window.__stress.counters.enemyBulletReleased++; window.__stress.agg.released++; } if(enemyBulletPool.length<500) enemyBulletPool.push(b); }

function acquireParticle(){ const p = particlePool.pop(); if(window.__audit && window.__audit.enabled){ if(p) window.__audit.counters.particleReused++; else window.__audit.counters.particleCreated++; } if(window.__stress && window.__stress.enabled){ if(p) window.__stress.counters.particleReused++; else window.__stress.counters.particleCreated++; window.__stress.agg.reused += p?1:0; window.__stress.agg.created += p?0:1; } return p || {}; }
function releaseParticle(p){ for(const k in p) delete p[k]; if(window.__audit && window.__audit.enabled) window.__audit.counters.particleReleased++; if(window.__stress && window.__stress.enabled){ window.__stress.counters.particleReleased++; window.__stress.agg.released++; } if(particlePool.length<1500) particlePool.push(p); }

function isFarFromPlayer(o,limitSq=DESPAWN_DISTANCE_SQ){
  return window.playerManager.isFarFromPlayer(o,limitSq);
}

function trimArray(arr,max,release){
  return window.playerManager.trimArray(arr,max,release);
}

const COLLISION_CELL_SIZE=96;
function getCollisionCellKey(x,y){
  return `${(x/COLLISION_CELL_SIZE)|0},${(y/COLLISION_CELL_SIZE)|0}`;
}
function addToCollisionGrid(grid,obj){
  const ix = (obj.x / COLLISION_CELL_SIZE) | 0;
  const iy = (obj.y / COLLISION_CELL_SIZE) | 0;

  let column = grid[ix];
  if(!column){
    column = [];
    grid[ix] = column;
  }

  let cell = column[iy];
if(!cell){
    cell = [];
    column[iy] = cell;
}

if(cell.length === 0){
    activeEnemyGridKeys.push([ix, iy]);
}

cell.push(obj);
}
function buildEnemyCollisionGrid(){
  const grid = activeEnemyGrid;

  // Vaciar las celdas utilizadas el frame anterior
  for(let i = 0, len = activeEnemyGridKeys.length; i < len; i++){
    const [ix, iy] = activeEnemyGridKeys[i];
    const column = grid[ix];
    if(!column) continue;
    const cell = column[iy];
    if(cell) cell.length = 0;
  }

  // Reiniciar la lista de celdas activas
  activeEnemyGridKeys.length = 0;

  // Volver a insertar todos los enemigos
  for(let i = 0; i < enemies.length; i++){
    const e = enemies[i];
    if(!e || e.dead) continue;
    addToCollisionGrid(grid, e);
  }
console.log(
    "Grid rebuilt",
    enemies.length,
    activeEnemyGridKeys.length
);
  return grid;
}
let activeEnemyGrid={};
const activeEnemyGridKeys=[];
const COLLISION_GRID_FRAME_INTERVAL = 2;
let collisionGridFrameCounter = 0;
function queryEnemiesNear(x,y,radius,callback,source){
  const grid=activeEnemyGrid;
  if(!grid || typeof callback!=='function') return;
  const audit = (window.__longRunAudit && window.__longRunAudit.enabled) ? window.__longRunAudit : null;
  if(audit) audit.queryEnemiesNearCalls++;
  let candidates = 0;
  let shouldStop = false;
  const ix=(x/COLLISION_CELL_SIZE)|0;
  const iy=(y/COLLISION_CELL_SIZE)|0;
  const range=Math.max(0,Math.ceil((radius||0)/COLLISION_CELL_SIZE));
  for(let oy=-range;oy<=range && !shouldStop;oy++){
    const cellY=iy+oy;
    for(let ox=-range;ox<=range && !shouldStop;ox++){
      const column = grid[ix + ox];
if(!column) continue;

const cell = column[cellY];
if(!cell) continue;
      for(let i=0, len=cell.length;i<len;i++){
        const enemy=cell[i];
        candidates++;
        if(enemy && callback(enemy)===true){
          shouldStop = true;
          break;
        }
      }
    }
  }
  if(audit){
    audit.queryEnemiesNearCandidatesTotal += candidates;
    if(candidates > audit.queryEnemiesNearMaxCandidates) audit.queryEnemiesNearMaxCandidates = candidates;
    audit.recordQueryOrigin(source, candidates);
  }
}

const cleanedSprites=new WeakMap();
function isBackgroundLikePixel(data,idx){
 const r=data[idx],g=data[idx+1],b=data[idx+2],a=data[idx+3];
 if(a<16) return true;
 const max=Math.max(r,g,b),min=Math.min(r,g,b);
 return max>220 && (max-min)<50;
}
function getCleanSprite(img){
 if(!img || !img.complete || !img.naturalWidth) return img;
 if(cleanedSprites.has(img)) return cleanedSprites.get(img);
 try{
   const src=document.createElement('canvas');
   src.width=img.naturalWidth; src.height=img.naturalHeight;
   const sctx=src.getContext('2d',{willReadFrequently:true});
   sctx.drawImage(img,0,0);
   const data=sctx.getImageData(0,0,src.width,src.height);
   const w=src.width,h=src.height,px=data.data,seen=new Uint8Array(w*h),queue=[];
   const enqueue=(x,y)=>{ if(x<0||y<0||x>=w||y>=h) return; const p=y*w+x; if(seen[p]) return; const idx=p*4; if(!isBackgroundLikePixel(px,idx)) return; seen[p]=1; queue.push(p); };
   for(let x=0;x<w;x++){ enqueue(x,0); enqueue(x,h-1); }
   for(let y=0;y<h;y++){ enqueue(0,y); enqueue(w-1,y); }
   for(let qi=0;qi<queue.length;qi++){
     const p=queue[qi],x=p%w,y=(p/w)|0,idx=p*4;
     px[idx+3]=0;
     enqueue(x+1,y); enqueue(x-1,y); enqueue(x,y+1); enqueue(x,y-1);
   }
   let minX=w,minY=h,maxX=-1,maxY=-1;
   for(let y=0;y<h;y++) for(let x=0;x<w;x++){
     const idx=(y*w+x)*4;
     if(px[idx+3]>12){ if(x<minX)minX=x; if(y<minY)minY=y; if(x>maxX)maxX=x; if(y>maxY)maxY=y; }
   }
   if(maxX<minX || maxY<minY){ cleanedSprites.set(img,img); return img; }
   sctx.putImageData(data,0,0);
   const pad=2;
   minX=Math.max(0,minX-pad); minY=Math.max(0,minY-pad); maxX=Math.min(w-1,maxX+pad); maxY=Math.min(h-1,maxY+pad);
   const out=document.createElement('canvas');
   out.width=maxX-minX+1; out.height=maxY-minY+1;
   out.getContext('2d').drawImage(src,minX,minY,out.width,out.height,0,0,out.width,out.height);
   cleanedSprites.set(img,out);
   return out;
 }catch(e){ cleanedSprites.set(img,img); return img; }
}
function drawCleanSprite(img,x,y,w,h){
 ctx.drawImage(getCleanSprite(img),x,y,w,h);
}

const mirroredSprites=new WeakMap();
function getMirroredSprite(img){
 const clean=getCleanSprite(img);
 if(!clean || clean.complete===false) return clean;
 if(mirroredSprites.has(clean)) return mirroredSprites.get(clean);
 const c=document.createElement('canvas');
 c.width=clean.naturalWidth||clean.width;
 c.height=clean.naturalHeight||clean.height;
 const cctx=c.getContext('2d');
 cctx.translate(c.width,0);
 cctx.scale(-1,1);
 cctx.drawImage(clean,0,0);
 mirroredSprites.set(clean,c);
 return c;
}

function drawSpriteFacing(img,x,y,w,h,faceLeft){
 const clean=getCleanSprite(img);
 const sprite=faceLeft?getMirroredSprite(clean):clean;
 ctx.drawImage(sprite,x,y,w,h);
}

function warmMirroredSprite(img){
 if(!img) return;
 if(img.complete && img.naturalWidth){ getMirroredSprite(img); return; }
 img.addEventListener('load',()=>getMirroredSprite(img),{once:true});
}

function getBossProjectileImage(e){
 const base=(e&&e.bossSequenceIndex!==undefined)?bossProjectileImages[(e.bossSequenceIndex)%bossProjectileImages.length]:bossProjectileImages[0];
 return (e&&e.type==='boss' && (e.specialKey||getBossSpecialKey(e.bossDisplayName||e.bossName||''))==='jiren')?jirenProjectileImg:base;
}

function primeMirroredSprites(){
 const imgs=[asteroidImg,shooterAsteroidImg];
 let i=0;
 const step=()=>{
   for(let n=0;n<3 && i<imgs.length;n++,i++) warmMirroredSprite(imgs[i]);
   if(i<imgs.length) setTimeout(step,0);
 };
 step();
}

setTimeout(primeMirroredSprites,0);

function compactArrays(){
  return window.playerManager.compactArrays();
}


const bulletGlow=document.createElement('canvas');
bulletGlow.width=36; bulletGlow.height=36;
const bulletGlowCtx=bulletGlow.getContext('2d');
const bulletGlowGrad=bulletGlowCtx.createRadialGradient(18,18,2,18,18,18);
bulletGlowGrad.addColorStop(0,'rgba(255,255,255,1)');
bulletGlowGrad.addColorStop(0.35,'rgba(120,220,255,1)');
bulletGlowGrad.addColorStop(1,'rgba(0,120,255,0)');
bulletGlowCtx.fillStyle=bulletGlowGrad;
bulletGlowCtx.beginPath();
bulletGlowCtx.arc(18,18,18,0,Math.PI*2);
bulletGlowCtx.fill();
bulletGlowCtx.strokeStyle='rgba(150,255,255,0.8)';
bulletGlowCtx.lineWidth=2;
bulletGlowCtx.beginPath();
bulletGlowCtx.arc(18,18,10,0,Math.PI*2);
bulletGlowCtx.stroke();


const keys={};
onkeydown=e=>keys[e.key.toLowerCase()]=true;
onkeyup=e=>keys[e.key.toLowerCase()]=false;

// double-tap detection for dragon dash (left/right)
document.addEventListener('keydown', e => {
  const now = getCurrentTime();
  const k = e.key.toLowerCase();
  if ((k === 'a' || k === 'arrowleft')){
    if (now - lastTapTime.left < DOUBLE_TAP_THRESHOLD && superTechLevels.dragonDash>0 && now>=dragonDashCooldownAt){
      // trigger left dash
      const dist = Math.round(canvas.width * DRAGON_DASH_DISTANCE_PCT);
      const toX = Math.max(player.r, player.x - dist);
      player.dashFromX = player.x; player.dashToX = toX; player.dashStartAt = now; player.dashUntil = now + DRAGON_DASH_DURATION;
      player.invulnerableUntil = player.dashUntil;
      dragonDashCooldownAt = now + DRAGON_DASH_COOLDOWN;
      playerFacingLeft = true;
    }
    lastTapTime.left = now;
  }
  if ((k === 'd' || k === 'arrowright')){
    if (now - lastTapTime.right < DOUBLE_TAP_THRESHOLD && superTechLevels.dragonDash>0 && now>=dragonDashCooldownAt){
      const dist = Math.round(canvas.width * DRAGON_DASH_DISTANCE_PCT);
      const toX = Math.min(canvas.width - player.r, player.x + dist);
      player.dashFromX = player.x; player.dashToX = toX; player.dashStartAt = now; player.dashUntil = now + DRAGON_DASH_DURATION;
      player.invulnerableUntil = player.dashUntil;
      dragonDashCooldownAt = now + DRAGON_DASH_COOLDOWN;
      playerFacingLeft = false;
    }
    lastTapTime.right = now;
  }
});

function getBossCycleForIndex(index){
 return window.bossManager.getBossCycleForIndex(index);
}

function getBossSequenceIndex(index){
 return window.bossManager.getBossSequenceIndex(index);
}

function getBossHp(sequenceIndex,cycle){
 return window.bossManager.getBossHp(sequenceIndex,cycle);
}

function shouldSpawnBoss(now){
 return window.bossManager.shouldSpawnBoss(now);
}

function getBossSpecialKey(bossName){
 return window.bossManager.getBossSpecialKey(bossName);
}

function getBossSpecialCooldown(key){
 return window.bossManager.getBossSpecialCooldown(key);
}

function getGoldenFreezerFanOffset(index){
 const fanOffsets=[0,-1,1,-2,2,-3,3,-4,4,0];
 return (fanOffsets[index] || 0) * 0.12;
}

function findNearestEnemy(){
 return window.playerManager.findNearestEnemy();
}


function shoot(){
 if(!enemies.length) return;
 const shotCount = Math.max(1, Math.min(3, player.bullets|0));
 let bestBoss=null,bestBossDist=Infinity,bestEnemy=null,bestEnemyDist=Infinity;
 for(let i=0;i<enemies.length;i++){
   const e=enemies[i];
   if(!e || e.dead) continue;
   const dx=e.x-player.x, dy=e.y-player.y, dist=dx*dx+dy*dy;
   if(e.type==='boss'){
     if(dist<bestBossDist){ bestBoss=e; bestBossDist=dist; }
   }else if(dist<bestEnemyDist){
     bestEnemy=e; bestEnemyDist=dist;
   }
 }
 let t=bestBoss||bestEnemy;
 if(!t) return;
 const futureX=t.x+((t.vx)||0)*12;
 const futureY=t.y+((t.vy)||0)*12;
 let a=Math.atan2(futureY-player.y,futureX-player.x);
 const spread=0.18;
 // if Muten concentration technique active, try to assign distinct targets per projectile
  if (superTechLevels.muten>0){
    const used = new Set();
     for(let i=0;i<shotCount;i++){
      // find first unused boss
      let target = null;
      for(let j=0;j<enemies.length;j++){ const e=enemies[j]; if(e && !e.dead && e.type==='boss' && !used.has(e)){ target=e; break; } }
      // if no boss, find nearest unused enemy
      if(!target){
        let best=null, bestD=Infinity;
        for(let j=0;j<enemies.length;j++){ const e=enemies[j]; if(!e||e.dead||used.has(e)) continue; const dx=e.x-player.x, dy=e.y-player.y, d=dx*dx+dy*dy; if(d<bestD){ best=e; bestD=d; } }
        if(best) target=best;
      }
      if(target) used.add(target);
      const nb=acquireBullet();
      nb.x=player.x; nb.y=player.y; nb.d=player.damage; nb.dead=false; nb.target=target||t; nb.vx=0; nb.vy=0;
      bullets.push(nb);
      if(window.__longRunAudit && window.__longRunAudit.enabled){
        window.__longRunAudit.projectilesCreated++;
        window.__longRunAudit.proyectilesCreados++;
      }
    }
  } else {
   for(let i=0;i<shotCount;i++){
     const offset=(i-(shotCount-1)/2)*spread;
     const nb=acquireBullet();
     nb.x=player.x; nb.y=player.y; nb.vx=Math.cos(a+offset)*8; nb.vy=Math.sin(a+offset)*8; nb.d=player.damage; nb.dead=false;
     bullets.push(nb);
     if(window.__longRunAudit && window.__longRunAudit.enabled){
      window.__longRunAudit.projectilesCreated++;
      window.__longRunAudit.proyectilesCreados++;
     }
   }
 }
}

function spawnEnemyBullet(x,y,vx,vy,color,opts={}){
 if(enemyBullets.length>=MAX_ENEMY_BULLETS) return;
 const b=acquireEnemyBullet();
 Object.assign(b,{x,y,vx,vy,color,dead:false},opts);
 enemyBullets.push(b);
}

function launchKamehameha(target){

  if(!target) return;
  if(kamehamehaProjectile) return;

  const dx = target.x - player.x;
  const dy = target.y - player.y;

  const dist = Math.hypot(dx,dy) || 1;

  kamehamehaProjectile = {
    x: player.x,
    y: player.y,
    vx: dx / dist,
    vy: dy / dist,
    damage: player.damage * [20,25,30][superTechLevels.kamehameha-1],
    r:24,
    dead:false
  };

  console.log("KAME CREADO", kamehamehaProjectile);

}

function addParticle(x,y,vx,vy,life,color){
 if(particles.length>=MAX_PARTICLES) return;
 const p=acquireParticle();
 p.x=x;p.y=y;p.vx=vx;p.vy=vy;p.life=life;p.color=color;p.dead=false;
 particles.push(p);
}

function explosion(x,y){
 for(let i=0;i<4;i++){
   addParticle(x,y,(Math.random()-.5)*6,(Math.random()-.5)*6,42,Math.random()>0.5?'orange':'yellow');
 }
}

function hitSpark(x,y,isBoss){
 const count=isBoss?2:3;
 for(let i=0;i<count;i++){
   addParticle(x,y,(Math.random()-.5)*4,(Math.random()-.5)*4,14,'#66ccff');
 }
}

function spawnPower(x,y){
 return window.dropsManager.spawnPower(x,y);
}
function bossImpact(x,y){
 for(let i=0;i<5;i++){
  addParticle(x,y,(Math.random()-.5)*8,(Math.random()-.5)*8,26,'#66ccff');
 }
}

function canUpgrade(key){
 return window.techniquesManager.canUpgrade(key);
}
function applyUpgrade(key,fn){
 return window.techniquesManager.applyUpgrade(key,fn);
}
function getSuperTechLabel(key){
 return window.techniquesManager.getSuperTechLabel(key);
}
function getSuperTechOptions(){
 return window.techniquesManager.getSuperTechOptions();
}
function triggerSuperTechFeedback(key, now){
 return window.techniquesManager.triggerSuperTechFeedback(key, now);
}
function openSuperiorTechniqueMenu(){
 return window.techniquesManager.openSuperiorTechniqueMenu();
}
function triggerExtraLife(){
 if(extraLives<=0){ player.hp=0; gameOver=true; return; }
 extraLives--;
 paused=true;
 player.hp=player.maxHp;
 player.x=canvas.width/2; player.y=canvas.height/2;
 player.invulnerableUntil=getCurrentTime()+2200;
 const ov=document.createElement('canvas');
 ov.id='shenronOverlay';
 ov.width=innerWidth; ov.height=innerHeight;
 ov.style.cssText='position:fixed;inset:0;background:black;width:100%;height:100%;z-index:21000';
 document.body.appendChild(ov);
 const octx=ov.getContext('2d');
 const start=getCurrentTime();
 const duration=2200;
 const render=()=>{
   const t=getCurrentTime()-start;
  drawSceneOnContext(octx,ov.width,ov.height);
   if(shenronImg && shenronImg.complete!==false){
     const maxW=ov.width*0.7, maxH=ov.height*0.7;
     const iw=shenronImg.naturalWidth||shenronImg.width||1, ih=shenronImg.naturalHeight||shenronImg.height||1;
     const sc=Math.min(maxW/iw,maxH/ih);
     const w=iw*sc, h=ih*sc;
     octx.drawImage(shenronImg,(ov.width-w)/2,(ov.height-h)/2,w,h);
   }
   if(t<duration) requestAnimationFrame(render);
  else { ov.style.transition='opacity 0.8s ease'; ov.style.opacity='0'; setTimeout(()=>{ if(ov.parentNode) ov.remove(); },800); paused=false; window.__spawnAcc = 0; }
 };
 render();
}

function levelUp(){
 return window.techniquesManager.levelUp();
}


function getHitbox(e){
    return window.playerManager.getHitbox(e);
}

function bulletHitEnemy(b, e){

    const hb = getHitbox(e);

    return (
        Math.abs(b.x - e.x) < hb.w / 2 &&
        Math.abs(b.y - e.y) < hb.h / 2
    );
}

function aabbHit(player, e){

    const hit = collisionSystem.aabbHit(
        player,
        e,
        target => playerController.getHitbox(target)
    );

    if(window.__longRunAudit && window.__longRunAudit.enabled){
        window.__longRunAudit.aabbTests++;
        if(hit) window.__longRunAudit.aabbHits++;
    }

    return hit;
}


function defeatEnemy(e){
 if(e.dead) return;
 e.dead=true;
 xp+=e.type==="boss"?50:1;
 if(e.type==="boss") bossKills++;
 explosion(e.x,e.y);
 const storyDefeatResult=(window.StoryMode&&window.StoryMode.handleEnemyDefeat)?window.StoryMode.handleEnemyDefeat(e,getCurrentTime()):null;
 if(!e.rewardGiven){
   e.rewardGiven=true;
   if(storyDefeatResult&&storyDefeatResult.spawnDropType){ powerUps.push({x:e.x,y:e.y,type:storyDefeatResult.spawnDropType,storyReward:!!storyDefeatResult.storyReward,storyChapterId:storyDefeatResult.storyChapterId||null}); }
   else if(e.dropType){ powerUps.push({x:e.x,y:e.y,type:e.dropType}); }
   if(e.type==='boss' && !(storyDefeatResult&&storyDefeatResult.suppressDefaultBossAdvance)){ bossIndex++; bossNextSpawnAt=getCurrentTime()+3000; }
 }
 kills++;
}

function drawSceneOnContext(targetCtx,w,h){
  // draw current scene image stretched to cover target context
  const img = sceneImages[currentSceneIndex];
  if(img && img.complete && img.naturalWidth){
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const sc = Math.max(w/iw, h/ih);
    const dw = iw*sc, dh = ih*sc;
    targetCtx.drawImage(img, (w-dw)/2, (h-dh)/2, dw, dh);
  } else {
    targetCtx.fillStyle='black'; targetCtx.fillRect(0,0,w,h);
  }
}

function startKamehameha(boss){
 if(kameActive || boss.kameTriggered) return; boss.kameTriggered=true;
 kameActive=true; paused=true;
 const ov=document.createElement('canvas'); ov.id='kameOverlay';
 ov.width=innerWidth; ov.height=innerHeight;
 ov.style.cssText='position:fixed;inset:0;background:black;width:100%;height:100%;z-index:20000';
 document.body.appendChild(ov);
 const octx=ov.getContext('2d');
 const start=getCurrentTime();
 const duration=2000;
 const renderCharge=()=>{
   const t=getCurrentTime()-start;
  drawSceneOnContext(octx,ov.width,ov.height);
   const img=getCleanSprite(cargaKameImg);
   if(img && img.complete!==false){
     const maxW=ov.width*0.82, maxH=ov.height*0.82;
     const iw=img.naturalWidth||img.width||1, ih=img.naturalHeight||img.height||1;
     const sc=Math.min(maxW/iw,maxH/ih);
     const w=iw*sc, h=ih*sc;
     octx.drawImage(img,(ov.width-w)/2,(ov.height-h)/2,w,h);
   }
   if(t<duration) requestAnimationFrame(renderCharge);
   else finish();
 };
 const finish=()=>{
   ov.style.transition='opacity 0.8s ease';
   ov.style.opacity='0';
   setTimeout(()=>{ if(ov.parentNode) ov.remove(); },800);
   paused=false; if(window.__perf) window.__perf.spawnAcc=0;
   kamePhase=1;
   kameProjectile={x:player.x,y:player.y,target:boss};
   try{kameSound.currentTime=0;kameSound.play();}catch(e){}
 };
 renderCharge();
}

function update(){
 if(paused) return;

  // Stress test driver behaviors
  if(window.__stress && window.__stress.enabled){
    // ensure player can't die
    player.invulnerableUntil = 1e18;
    // disable pause
    paused = false; pauseMenuOpen = false;
    // auto-collect powerups
    if(powerUps && powerUps.length){
      for(let i=powerUps.length-1;i>=0;i--){ const p=powerUps[i]; if(!p) continue; // apply effects same as dropsManager
        if(p.type==='heal') player.hp = Math.min(player.maxHp, player.hp + 25);
        if(p.type==='damage') window.techniquesManager.applyUpgrade('damage', () => player.damage++);
        if(p.type==='speed') window.techniquesManager.applyUpgrade('speed', () => player.speed += 0.2);
        if(p.type==='rate') {}
        if(p.type==='multi') window.techniquesManager.applyUpgrade('bullets', () => player.bullets++);
        if(p.type==='senzu') { player.hp = player.maxHp; xp = xpNeed; window.techniquesManager.levelUp(); }
        if(p.type==='dragonball'){ player.hp = player.maxHp; dragonballCount++; if(dragonballCount>=7){ extraLives++; window.chapterManager.showMenuMessage('¡Vida extra concedida!'); } window.techniquesManager.openSuperiorTechniqueMenu(); }
        powerUps.splice(i,1);
      }
    }
    // auto-fire every frame
    if(typeof shoot === 'function') shoot();
    // spawn many enemies until reach a high cap
    const stressCap = 1000;
    if(enemies.length < stressCap){
      // create both normal enemies and bosses periodically
      for(let k=0;k<6 && enemies.length < stressCap;k++){
        const e = acquireEnemy();
        const isBoss = Math.random() < 0.06; // ~6% bosses
        const sequenceIndex = Math.floor(Math.random()* (window.bossManager.bossSequence.length||1));
        const cycle = window.bossManager.getBossCycleForIndex(bossIndex + Math.floor(Math.random()*5));
        Object.assign(e, {
          x: player.x + (Math.random()-0.5)*800,
          y: player.y + (Math.random()-0.5)*800,
          hp: isBoss? window.bossManager.getBossHp(sequenceIndex, cycle) : 3 + lvl * 0.3,
          maxHp: isBoss? window.bossManager.getBossHp(sequenceIndex, cycle) : 3 + lvl * 0.3,
          size: isBoss? 35 : 10.5 + Math.random()*14,
          rot:0, rs:0, speed: isBoss?(0.5+cycle*0.08):(0.4+Math.random()*0.7), type: isBoss? 'boss':'asteroid', bossName: isBoss? window.bossManager.bossSequence[sequenceIndex].file : null, bossDisplayName: isBoss? window.bossManager.bossSequence[sequenceIndex].name : null, bossSequenceIndex: isBoss? sequenceIndex : null, bossCategory: isBoss?'boss':'miniboss', shoot: Math.random() < 0.25, cd:0, dead:false, rewardGiven:false, kameTriggered:false, dropType: isBoss? 'dragonball':'senzu'
        });
        if(isBoss) window.bossManager.initializeBossSpecialState(e, getCurrentTime());
        enemies.push(e);
      }
    }
  }

 const now=getCurrentTime();
 const storyAction=(window.StoryMode&&window.StoryMode.tick)?window.StoryMode.tick(now,{paused,menuOpen:!!(levelUpEl&&levelUpEl.style.display==='flex'),hasActiveStoryBoss:enemies.some(e=>e&&!e.dead&&e.storyChapterBoss)}):null;
 if(storyAction){
  if(storyAction.spawnBossName){ window.bossManager.spawnStoryBossByName(storyAction.spawnBossName,{isFinalBoss:storyAction.isFinalBoss,chapterId:storyAction.chapterId}); }
  if(storyAction.nextChapter){ window.StoryMode.nextChapter(); }
 }
 profilePhase('Player Update',()=>{
  // handle dash movement override
  if (player.dashUntil && now < player.dashUntil){
    const t = Math.min(1, Math.max(0, (now - (player.dashStartAt||0)) / DRAGON_DASH_DURATION));
    player.x = (player.dashFromX || player.x) + ((player.dashToX || player.x) - (player.dashFromX || player.x)) * t;
  } else {
    let moveX=0, moveY=0;
    if(keys.w||keys['arrowup']) moveY-=1;
    if(keys.s||keys['arrowdown']) moveY+=1;
    if(keys.a||keys['arrowleft']) moveX-=1;
    if(keys.d||keys['arrowright']) moveX+=1;
    if(moveX||moveY){
      const len=Math.hypot(moveX,moveY)||1;
      player.x+=moveX/len*player.speed;
      player.y+=moveY/len*player.speed;
      if(moveX!==0) playerFacingLeft=moveX<0;
    }
  }
   if(now-lastShot>player.fireRate){ shoot(); lastShot=now; }
 });

   if((collisionGridFrameCounter++ % COLLISION_GRID_FRAME_INTERVAL) === 0){
    // The collision grid is reused for one frame, so spatial queries can lag by at most one frame.
    const enemyGrid=profilePhase('buildEnemyCollisionGrid',()=>buildEnemyCollisionGrid());
    activeEnemyGrid=enemyGrid;
   }
 const nearestEnemyForFrame = (superTechLevels.kienzan>0 || superTechLevels.dodonpa>0) ? findNearestEnemy() : null;
 profilePhase('Collision',()=>{
 const damageBonus = player.damage - 1; 
 if(superTechLevels.shield>0){
   const count=superTechLevels.shield===1?3:superTechLevels.shield===2?4:5;
   const damageMul=superTechLevels.shield===1?1:superTechLevels.shield===2?2:4;
   while(shieldOrbs.length<count)
    shieldOrbs.push({
        angle:Math.random()*Math.PI*2,
        radius:TARGET_PLAYER_H * 0.42,
        angularSpeed:0.05
    });
   while(shieldOrbs.length>count) shieldOrbs.pop();
   shieldOrbs.forEach((orb,idx)=>{
     orb.angle+=(orb.angularSpeed||0.05);
     orb.x = player.x + Math.cos(orb.angle) * orb.radius;
     orb.y = player.y + Math.sin(orb.angle) * orb.radius;
    queryEnemiesNear(orb.x,orb.y,36,(e)=>{
       if(!e||e.dead) return false;
       const dx=orb.x-e.x, dy=orb.y-e.y;
       if(dx*dx+dy*dy<=(e.size+8)*(e.size+8)){
         e.hp-=damageMul;
         if(window.__longRunAudit && window.__longRunAudit.enabled) window.__longRunAudit.damageApplications++;
         hitSpark(orb.x,orb.y,e.type==='boss');
         if(e.type==='boss') bossImpact(orb.x,orb.y);
         if(e.hp<=0) defeatEnemy(e);
         return true;
       }
       return false;
    },'shieldOrb');
     for(let bi=0;bi<enemyBullets.length;bi++){
       const b=enemyBullets[bi];
       if(!b||b.dead) continue;
       const dx=orb.x-b.x, dy=orb.y-b.y;
       if(dx*dx+dy*dy<=(b.radius||10)*(b.radius||10)+36){
         b.dead=true;
         addParticle(orb.x,orb.y,0,0,16,'#ffd166');
       }
     }
   });
 }
 if(superTechLevels.kienzan>0){
   const specialStart=performance.now();
   const cooldown=2000;
   if(now>=kienzanCooldownAt){
     kienzanCooldownAt=now+cooldown;
     if(window.__longRunAudit && window.__longRunAudit.enabled) window.__longRunAudit.specialTechniqueExecutions++;
     const count=superTechLevels.kienzan===1?1:superTechLevels.kienzan===2?2:3;
     for(let i=0;i<count;i++){
       const target=nearestEnemyForFrame;
       const angle=target?Math.atan2(target.y-player.y,target.x-player.x):Math.atan2(Math.sin(now*0.001+i),Math.cos(now*0.001+i));
       const disc={
    x:player.x,
    y:player.y,
    vx:Math.cos(angle)*10,
    vy:Math.sin(angle)*10,
    damage:(superTechLevels.kienzan===1?1:superTechLevels.kienzan===2?2:4)+damageBonus,
    hit:new Set(),
    rotation:0,
    dead:false
};
       kienzanShots.push(disc);
     }
   }
   for(let i=kienzanShots.length-1;i>=0;i--){
     const disc=kienzanShots[i];
     if(!disc||disc.dead){ kienzanShots.splice(i,1); continue; }
     disc.x += disc.vx;
disc.y += disc.vy;

disc.rotation += 0.45;

const margin = 300;

if(
    disc.x < -margin ||
    disc.x > canvas.width + margin ||
    disc.y < -margin ||
    disc.y > canvas.height + margin
){
    disc.dead = true;
    continue;
}
    queryEnemiesNear(disc.x,disc.y,24,(e)=>{
       if(!e||e.dead) return false;
       const dx=disc.x-e.x, dy=disc.y-e.y;
       
       if(disc.hit && disc.hit.has(e))
    return false;

    if(dx*dx+dy*dy<=(e.size+12)*(e.size+12)){

    if(disc.hit)
    disc.hit.add(e);
         
         e.hp-=disc.damage;
         if(window.__longRunAudit && window.__longRunAudit.enabled) window.__longRunAudit.damageApplications++;
         hitSpark(disc.x,disc.y,e.type==='boss');
         if(e.hp<=0) defeatEnemy(e);
         return true;
       }
       return false;
    },'kienzan');
   }
   recordLongRunPhase('specialTechniques', performance.now()-specialStart);
   if(window.__longRunAudit && window.__longRunAudit.enabled){
    window.__longRunAudit.recordProjectileDetail('specialTechniques', performance.now()-specialStart);
   }
 }

if(superTechLevels.kamehameha > 0){

    if(now >= kamehamehaCooldownUntil){

        kamehamehaCooldownUntil = now + KAMEHAMEHA_COOLDOWN;

        const target =
    window.playerManager.findNearestBoss() ||
    nearestEnemyForFrame ||
    window.playerManager.findNearestEnemy();

        if(target){

          console.log("INTENTO LANZAR KAME", target);

            launchKamehameha(target);

        }
    }

}

 if(superTechLevels.kiExplosion>0){
   const kiExplosionStart=performance.now();
   const cooldown=superTechLevels.kiExplosion===1?60000:superTechLevels.kiExplosion===2?45000:30000;
   if(now>=kiExplosionCooldownAt){
     kiExplosionCooldownAt=now+cooldown;
     kiExplosionEffect={x:player.x+(playerFacingLeft?-34:34),y:player.y,radius:10,maxRadius:Math.max(canvas.width,canvas.height)*0.6,damage:(superTechLevels.kiExplosion===1?1:superTechLevels.kiExplosion===2?2:4)+(damageBonus*5),createdAt:now};
     if(window.__longRunAudit && window.__longRunAudit.enabled) window.__longRunAudit.kiExplosionExecutions++;
   }
   if(kiExplosionEffect){
     const age=now-kiExplosionEffect.createdAt;
     const progress = Math.min(age / 1000, 1);

kiExplosionEffect.radius =
    18 + (kiExplosionEffect.maxRadius - 18) * progress;
    queryEnemiesNear(kiExplosionEffect.x,kiExplosionEffect.y,kiExplosionEffect.radius+12,(e)=>{
       if(!e||e.dead) return false;
       const dx=e.x-kiExplosionEffect.x, dy=e.y-kiExplosionEffect.y;
       if(dx*dx+dy*dy<=(kiExplosionEffect.radius+e.size)*(kiExplosionEffect.radius+e.size)){
         e.hp-=kiExplosionEffect.damage/60;
         if(window.__longRunAudit && window.__longRunAudit.enabled){
          window.__longRunAudit.damageApplications++;
          window.__longRunAudit.kiExplosionAffectedEnemies++;
         }
         if(e.hp<=0) defeatEnemy(e);
       }
       return false;
    },'kiExplosion');
     if(kiExplosionEffect.radius>=kiExplosionEffect.maxRadius) kiExplosionEffect=null;
   }
     if(window.__longRunAudit && window.__longRunAudit.enabled){
      window.__longRunAudit.recordProjectileDetail('kiExplosion', performance.now()-kiExplosionStart);
     }
 }
 if(superTechLevels.dodonpa>0){
     const specialStart=performance.now();
   const cooldown=20000;
   if(now>=dodonpaCooldownAt){
     dodonpaCooldownAt=now+cooldown;
     if(window.__longRunAudit && window.__longRunAudit.enabled) window.__longRunAudit.specialTechniqueExecutions++;
     const count=superTechLevels.dodonpa===1?1:superTechLevels.dodonpa===2?2:3;
     for(let i=0;i<count;i++){
       const target=nearestEnemyForFrame;
       if(!target) continue;
       const dx = target.x - player.x;
const dy = target.y - player.y;
const len = Math.hypot(dx, dy) || 1;

dodonpaShots.push({
    fromX: player.x,
    fromY: player.y,

    toX: player.x + (dx / len) * 3000,
    toY: player.y + (dy / len) * 3000,

    damage: 3 + damageBonus,

    born: now,
    duration: 500,

    hit: new Set()
});
       hitSpark(target.x,target.y,target.type==='boss');
     }
   }
   for (let i = dodonpaShots.length - 1; i >= 0; i--) {

    const shot = dodonpaShots[i];

    if (!shot) {
        dodonpaShots.splice(i,1);
        continue;
    }

    if (now - shot.born >= shot.duration) {
        dodonpaShots.splice(i,1);
        continue;
    }

    const beamDX = shot.toX - shot.fromX;
    const beamDY = shot.toY - shot.fromY;
    const beamLenSq = beamDX * beamDX + beamDY * beamDY;

    queryEnemiesNear(
        player.x,
        player.y,
        canvas.width * 2,
        (e)=>{

            if(!e || e.dead) return false;

            if(shot.hit.has(e))
                return false;

            const t =
                ((e.x-shot.fromX)*beamDX +
                 (e.y-shot.fromY)*beamDY) / beamLenSq;

            if(t<0 || t>1)
                return false;

            const px = shot.fromX + beamDX*t;
            const py = shot.fromY + beamDY*t;

            const dx = e.x-px;
            const dy = e.y-py;

            if(dx*dx + dy*dy <= (e.size+18)*(e.size+18)){

                shot.hit.add(e);

                e.hp -= shot.damage;

                hitSpark(px,py,e.type==='boss');

                if(window.__longRunAudit && window.__longRunAudit.enabled)
                    window.__longRunAudit.damageApplications++;

                if(e.hp<=0)
                    defeatEnemy(e);
            }

            return false;

        },
        'dodonpa'
    );
}
   if(window.__longRunAudit && window.__longRunAudit.enabled){
    window.__longRunAudit.recordProjectileDetail('specialTechniques', performance.now()-specialStart);
   }
 }
 if(superTechLevels.absorbki>0 && absorbkiTriggerReady && player.hp<=10 && player.hp>0 && absorbkiTriggeredCount < superTechLevels.absorbki){
   absorbkiTriggerReady=false;
   absorbkiShieldUntil=now+5000;
   absorbkiTriggeredCount++;
   absorbkiAbsorbedDamage=0;
 }
 if(superTechLevels.absorbki>0 && now<absorbkiShieldUntil){
   const active=true;
 }
 if(player.hp>12) absorbkiTriggerReady=true;

 profilePhase('Projectile Update',()=>{
   for(let bi=0;bi<bullets.length;bi++){
     const b=bullets[bi];
     if(b.dead) continue;
    if(window.__longRunAudit && window.__longRunAudit.enabled){
      window.__longRunAudit.projectilesUpdated++;
      window.__longRunAudit.projectilesActualizados++;
    }
    const movementStart=performance.now();
    // if bullet has an assigned target (from Muten concentration), home towards it
    if(b.target && !b.target.dead){
      const dx = b.target.x - b.x, dy = b.target.y - b.y; const d = Math.hypot(dx,dy)||1;
      const speed = 8;
      b.vx = dx/d*speed; b.vy = dy/d*speed;
      b.x += b.vx; b.y += b.vy;
    } else {
      b.x+=b.vx; b.y+=b.vy;
    }
    if(window.__longRunAudit && window.__longRunAudit.enabled){
      window.__longRunAudit.recordProjectileDetail('movement', performance.now()-movementStart);
    }
      if(isFarFromPlayer(b)){
        b.dead=true;
        if(window.__longRunAudit && window.__longRunAudit.enabled){
          window.__longRunAudit.projectilesDestroyed++;
          window.__longRunAudit.proyectilesDestruidos++;
        }
        continue;
      }
     const queryStart=performance.now();
    queryEnemiesNear(b.x,b.y,10,(e)=>{
        const candidateStart=performance.now();
        if(!e||e.dead) return false;
        if(window.__longRunAudit && window.__longRunAudit.enabled){
          window.__longRunAudit.recordProjectileDetail('candidateIteration', performance.now()-candidateStart);
        }
        const aabbStart=performance.now();
  if (bulletHitEnemy(b, e)) {
          if(window.__longRunAudit && window.__longRunAudit.enabled){
            window.__longRunAudit.recordProjectileDetail('aabbHit', performance.now()-aabbStart);
          }
          const damageStart=performance.now();
          let incomingDamage=b.d;
          if(e.type==='boss' && e.specialKey==='jiren' && e.meditationState===1){ incomingDamage*=0.25; }
          if(e.type==='boss' && e.specialKey==='cell' && now<e.specialActiveUntil){
            incomingDamage=0;
            e.hp=Math.min(e.maxHp,e.hp+Math.max(1,b.d));
          } else {
            e.hp-=incomingDamage;
            if(window.__longRunAudit && window.__longRunAudit.enabled && incomingDamage>0) window.__longRunAudit.damageApplications++;
          }
          b.dead=true;
          if(window.__longRunAudit && window.__longRunAudit.enabled){
            window.__longRunAudit.projectilesDestroyed++;
            window.__longRunAudit.proyectilesDestruidos++;
          }
          hitSpark(b.x,b.y,e.type==='boss');
          if(e.type==='boss') bossImpact(b.x,b.y);
          if(e.hp<=0) defeatEnemy(e);
          if(window.__longRunAudit && window.__longRunAudit.enabled){
            window.__longRunAudit.recordProjectileDetail('damageApply', performance.now()-damageStart);
            window.__longRunAudit.recordProjectileDetail('projectileRemoval', 0.001);
          }
          return true;
        }
        if(window.__longRunAudit && window.__longRunAudit.enabled){
          window.__longRunAudit.recordProjectileDetail('aabbHit', performance.now()-aabbStart);
        }
        return false;
    },'projectileUpdate');
     if(window.__longRunAudit && window.__longRunAudit.enabled){
      window.__longRunAudit.recordProjectileDetail('queryEnemiesNear', performance.now()-queryStart);
     }
   }


 });
 });

 currentBoss=null;
 const shouldRunBossUpdate = (bossUpdateFrameCounter++ % BOSS_UPDATE_FRAME_INTERVAL) === 0;
 const shouldRunEnemyAI = (enemyAiFrameCounter++ % ENEMY_AI_FRAME_INTERVAL) === 0;
 profilePhase('Enemy Update',()=>{
   for(let ei=0;ei<enemies.length;ei++){
     const e=enemies[ei];
     if(!e.dead && e.type==='boss'){
       currentBoss=e;
       break;
     }
   }
   if(shouldRunBossUpdate){
     profilePhase('Boss Update',()=>{
       for(let ei=0;ei<enemies.length;ei++){
         const e=enemies[ei];
         if(e.dead || e.type!=='boss') continue;
         if(e.bossCategory==='boss' && !kameActive && !e.kameTriggered && e.hp<=e.maxHp*0.1) startKamehameha(e);
         const specialKey=e.specialKey||getBossSpecialKey(e.bossDisplayName||e.bossName||'');
         if(specialKey==='vegeta' && now>=e.specialCooldownAt){
           e.specialCooldownAt=now+7000;
           const angle=Math.atan2(player.y-e.y,player.x-e.x);
           spawnEnemyBullet(e.x,e.y,Math.cos(angle)*3.2,Math.sin(angle)*3.2,'#7e4c19',{type:'garlic',radius:36,lifetimeMs:3000,damagePerSec:15,persistent:true,img:garlicImg});
         }
         if(specialKey==='freezer' && now>=e.specialCooldownAt){
           e.specialCooldownAt=now+10000;
           const angle=Math.atan2(player.y-e.y,player.x-e.x);
           spawnEnemyBullet(e.x,e.y,Math.cos(angle)*2,Math.sin(angle)*2,'#8a6dff',{type:'freezerBall',radius:Math.max(72,Math.round(e.size*2.4)),lifetimeMs:6000,damagePerSec:25,persistent:true,img:deathBallImg});
         }
         if(specialKey==='goldenFreezer' && now>=e.specialCooldownAt){
          e.specialCooldownAt=now+10000;
          e.goldenFreezerBurst={shotIndex:0,nextShotAt:now,fanAngle:Math.atan2(player.y-e.y,player.x-e.x)};
        }
        if(specialKey==='goldenFreezer' && e.goldenFreezerBurst){
          const burst=e.goldenFreezerBurst;
          if(now>=burst.nextShotAt){
            const offset=getGoldenFreezerFanOffset(burst.shotIndex);
            const angle=burst.fanAngle+offset;
            spawnEnemyBullet(e.x,e.y,Math.cos(angle)*4,Math.sin(angle)*4,'#ffffff',{type:'goldenFreezerRay',radius:18,lifetimeMs:2200,spawnedAt:now,persistent:false,damagePerSec:1200,img:rayOfFreezerImg});
            burst.shotIndex++;
            burst.nextShotAt=now+70;
            if(burst.shotIndex>=10) e.goldenFreezerBurst=null;
          }
         }
         if(specialKey==='cell' && now>=e.specialCooldownAt){
           e.specialCooldownAt=now+10000;
           e.specialActiveUntil=now+2000;
         }
        if(specialKey==='buu' && now>=e.specialCooldownAt){

    e.specialCooldownAt = now + 5000;

    e.specialActiveUntil = now + 2500;

}
         if(specialKey==='zamas' && now>=e.specialCooldownAt){
           e.specialCooldownAt=now+10000;
          e.zamasHalo={startedAt:now,duration:4000,minSize:72,maxSize:Math.max(canvas.width,canvas.height)*0.75,damagePerSec:35,size:72,radius:36};
        }
        if(specialKey==='zamas' && e.zamasHalo){
          const halo=e.zamasHalo;
          const elapsed=now-halo.startedAt;
          if(elapsed>=halo.duration){
            e.zamasHalo=null;
          } else {
            const progress=elapsed/halo.duration;
            halo.size=halo.minSize+(halo.maxSize-halo.minSize)*progress;
            halo.radius = halo.size * 0.30;
            const dx=player.x-e.x, dy=player.y-e.y;
            if(dx*dx+dy*dy<=(halo.radius+player.r)*(halo.radius+player.r)){
            if(!window.god){
    player.hp-=halo.damagePerSec/60;
    damageFlash=8;
} 
            }
          }
         }
         if(specialKey==='jiren'){
           if(now>=e.meditationCycleAt){
             e.meditationState=e.meditationState===1?2:1;
             e.meditationCycleAt=now+5000;
           }
         }
       }
     });
   }

   if(shouldRunEnemyAI){
     profilePhase('Enemy AI',()=>{
       for(let ei=0;ei<enemies.length;ei++){
         const e=enemies[ei];
         if(e.dead) continue;
         const specialKey=e.type==='boss' ? (e.specialKey || (e.specialKey=getBossSpecialKey(e.bossDisplayName||e.bossName||''))) : null;
         const isJirenMeditating=e.type==='boss' && specialKey==='jiren' && e.meditationState===1;
         if(!isJirenMeditating){
           let a=Math.atan2(player.y-e.y,player.x-e.x);
           const isJirenBoosted=e.type==='boss' && specialKey==='jiren' && e.meditationState===2;
           const multiplier=isJirenBoosted?2:1;
           const speed=isJirenBoosted?(e.baseSpeed||e.speed)*2:e.speed;
           e.vx=Math.cos(a)*speed; e.vy=Math.sin(a)*speed;
           if(e.shoot){
              e.cd--;
              if(e.cd<=0){
                 if(e.type==="boss"){
                    const col=bossColors[e.bossName]||'#fff';
                    const p=((e.bossSequenceIndex||0)%5);
                    const projectileCount=multiplier>1?2:1;
                    const projectileType=multiplier>1?'jirenBall':'default';
                    const projectileImg=(multiplier>1)?jirenProjectileImg:getBossProjectileImage(e);
                    if(p===0){for(let k=0;k<projectileCount;k++) spawnEnemyBullet(e.x,e.y,Math.cos(a)*4,Math.sin(a)*4,col,{type:projectileType,radius:14,img:projectileImg,damagePerSec:multiplier>1?40:20});}
                    else if(p===1){for(let k=-1;k<=1;k++) for(let q=0;q<projectileCount;q++) spawnEnemyBullet(e.x,e.y,Math.cos(a+k*0.3)*4,Math.sin(a+k*0.3)*4,col,{type:projectileType,radius:14,img:projectileImg,damagePerSec:multiplier>1?40:20});}
                    else if(p===2){for(let k=0;k<4*projectileCount;k++) spawnEnemyBullet(e.x,e.y,Math.cos(k*.785)*3,Math.sin(k*.785)*3,col,{type:projectileType,radius:14,img:projectileImg,damagePerSec:multiplier>1?40:20});}
                    else if(p===3){for(let k=0;k<3*projectileCount;k++) spawnEnemyBullet(e.x,e.y,Math.cos(a)*(2+k),Math.sin(a)*(2+k),col,{type:projectileType,radius:14,img:projectileImg,damagePerSec:multiplier>1?40:20});}
                    else {for(let k=0;k<3*projectileCount;k++) spawnEnemyBullet(e.x,e.y,Math.cos((k-1)*0.4+a)*3,Math.sin((k-1)*0.4+a)*3,col,{type:projectileType,radius:14,img:projectileImg,damagePerSec:multiplier>1?40:20});}
                 } else spawnEnemyBullet(e.x,e.y,Math.cos(a)*4,Math.sin(a)*4,'#66ccff');
                 e.cd=e.type==="boss"?30:90;
              }
           }
         }
       }
     });
   }

   profilePhase('Enemy Movement',()=>{
     for(let ei=0;ei<enemies.length;ei++){
       const e=enemies[ei];
       if(e.dead) continue;
       const specialKey=e.type==='boss' ? (e.specialKey || (e.specialKey=getBossSpecialKey(e.bossDisplayName||e.bossName||''))) : null;
       const isJirenMeditating=e.type==='boss' && specialKey==='jiren' && e.meditationState===1;
       if(!isJirenMeditating){
         e.x+=e.vx; e.y+=e.vy;
       }
    if(aabbHit(player,e)){
if(!window.god){
    player.hp-=0.15*(1-player.armor);
    damageFlash=6;
}       }
     }
   });
 });

 for(let i=0;i<enemyBullets.length;i++){
   const b=enemyBullets[i];
   if(!b || b.dead) continue;
   if(b.type==='beam' || b.type==='cross'){
      if(b.spawnedAt && now-b.spawnedAt>=(b.lifetimeMs||0)) b.dead=true;
   } else {
      b.x+=b.vx; b.y+=b.vy;
      if(isFarFromPlayer(b)){ b.dead=true; continue; }
   }
   const playerW = 34;
const playerH = 112;

if (
    b.x > player.x - playerW / 2 &&
    b.x < player.x + playerW / 2 &&
    b.y > player.y - playerH / 2 &&
    b.y < player.y + playerH / 2
){
      const damage=(b.damagePerSec?b.damagePerSec/60:(b.type==='jirenBall'?2:1));
      if(superTechLevels.absorbki>0 && now<absorbkiShieldUntil){
        player.hp=Math.min(player.maxHp,player.hp+damage);
        absorbkiAbsorbedDamage+=damage;
        addParticle(player.x,player.y,0,0,20,'#66ccff');
      } else {
if(!window.god){
    player.hp-=damage;
    damageFlash=8;
}      }
      if(!b.persistent) b.dead=true;
   }
   if(b.type==='beam' || b.type==='cross'){
      const active=(b.spawnedAt && now-b.spawnedAt<(b.lifetimeMs||0));
      if(!active) b.dead=true;
   }
 }

 profilePhase('PowerUp Update',()=>{
   window.dropsManager.updatePowerUps();

 
 if(kamePhase===1 && kameProjectile && kameProjectile.target){
   let b=kameProjectile.target;
   let dx=b.x-kameProjectile.x, dy=b.y-kameProjectile.y; let d=Math.hypot(dx,dy);
   if(d<20){

   try{
      boomSound.currentTime=0;
      boomSound.play();
   }catch(e){}

   b.hp=0;
   defeatEnemy(b);
   kameExplosion=60;
   kameExplosionTarget=b;
   kameActive=false;
   kamePhase=0;
   kameProjectile=null;
}
   else {kameProjectile.x += dx/d*6; kameProjectile.y += dy/d*6;}
 }
 if(kameExplosion>0){ kameExplosion--; if(kameExplosion<=0) kameExplosionTarget=null; }
 if(kamehamehaProjectile){

    kamehamehaProjectile.x += kamehamehaProjectile.vx;
    kamehamehaProjectile.y += kamehamehaProjectile.vy;

    if(
        kamehamehaProjectile.x < -100 ||
        kamehamehaProjectile.x > canvas.width + 100 ||
        kamehamehaProjectile.y < -100 ||
        kamehamehaProjectile.y > canvas.height + 100
    ){
        kamehamehaProjectile = null;
    }

}

  if(kamehamehaProjectile){

    kamehamehaProjectile.x += kamehamehaProjectile.vx;
    kamehamehaProjectile.y += kamehamehaProjectile.vy;

    queryEnemiesNear(
        kamehamehaProjectile.x,
        kamehamehaProjectile.y,
        40,
        (e)=>{

    if(!e || e.dead) return false;

    const dx = kamehamehaProjectile.x - e.x;
    const dy = kamehamehaProjectile.y - e.y;

    if(dx * dx + dy * dy > (e.size + 24) * (e.size + 24)){
        return false;
    }

    e.hp -= kamehamehaProjectile.damage;

    hitSpark(
        kamehamehaProjectile.x,
        kamehamehaProjectile.y,
        e.type === 'boss'
    );

    if(e.hp <= 0) defeatEnemy(e);

    kamehamehaProjectile = null;

    return true;

},
        'kamehameha'
    );

    if(
        kamehamehaProjectile &&
        (
            kamehamehaProjectile.x < -200 ||
            kamehamehaProjectile.x > canvas.width + 200 ||
            kamehamehaProjectile.y < -200 ||
            kamehamehaProjectile.y > canvas.height + 200
        )
    ){
        kamehamehaProjectile = null;
    }
}

 profilePhase('Particle Update',()=>{
   for(let i=0;i<particles.length;i++){
     const p=particles[i];
     if(!p || p.dead) continue;
     p.x+=p.vx; p.y+=p.vy; p.life--;
     if(p.life<=0 || isFarFromPlayer(p)) p.dead=true;
   }
 });
  for (let i = dodonpaShots.length - 1; i >= 0; i--) {
    const s = dodonpaShots[i];
    if (!s) { dodonpaShots.splice(i, 1); continue; }
    s.life--;
    if (s.life <= 0) { dodonpaShots.splice(i, 1); }
  }
 });

if(player.hp<=0){
  if(extraLives>0){ triggerExtraLife(); return; }
  player.hp=0; gameOver=true; return;
}
bossCycle=getBossCycleForIndex(bossIndex);
if(xp>=xpNeed) levelUp();
}

function isRectVisible(x,y,w,h){
  return x + w >= 0 && x <= canvas.width && y + h >= 0 && y <= canvas.height;
}

function isCircleVisible(x,y,r){
  return x + r >= 0 && x - r <= canvas.width && y + r >= 0 && y - r <= canvas.height;
}

function isSegmentVisible(x1,y1,x2,y2){
  const minX=Math.min(x1,x2), maxX=Math.max(x1,x2);
  const minY=Math.min(y1,y2), maxY=Math.max(y1,y2);
  return maxX >= 0 && minX <= canvas.width && maxY >= 0 && minY <= canvas.height;
}

const hudCanvas=document.createElement('canvas');
const hudCtx=hudCanvas.getContext('2d');
let lastHudUpdateAt=0;
function ensureHudCanvasSize(){
 if(hudCanvas.width!==canvas.width || hudCanvas.height!==canvas.height){
  hudCanvas.width=canvas.width;
  hudCanvas.height=canvas.height;
  lastHudUpdateAt=0;
 }
}

function renderHudLayer(now){
 ensureHudCanvasSize();

 if(now-lastHudUpdateAt < HUD_UPDATE_INTERVAL_MS) return;
 lastHudUpdateAt=now;
 ui.updateHud(hpEl,lvlEl,xpEl);
 hudCtx.clearRect(0,0,hudCanvas.width,hudCanvas.height);
 console.log("HUD", currentBoss?.bossDisplayName, currentBoss?.hp);
 if(currentBoss){
   hudCtx.fillStyle='#111';
   hudCtx.fillRect(canvas.width*0.15,20,canvas.width*0.7,24);
   hudCtx.fillStyle='#c00';
   hudCtx.fillRect(canvas.width*0.15,20,canvas.width*0.7*(currentBoss.hp/currentBoss.maxHp),24);
   hudCtx.strokeStyle='#ff9c00';
   hudCtx.strokeRect(canvas.width*0.15,20,canvas.width*0.7,24);
   hudCtx.fillStyle='#ff9c00';
   hudCtx.font='20px Arial';
   hudCtx.textAlign='center';
   hudCtx.fillText(currentBoss.bossDisplayName||((currentBoss.bossName||'Boss').replace('.png','')),canvas.width/2,16);
   hudCtx.font='15px Arial';
   hudCtx.fillText(Math.ceil(Math.max(0,currentBoss.hp))+'/'+Math.ceil(currentBoss.maxHp),canvas.width/2,38);
 }
 const prevRendererCtx=renderer.ctx;
 renderer.ctx=hudCtx;
 renderer.drawHudCounters({extraLives,dragonballCount}, {babaImg,dragonBallDropImg});
 renderer.ctx=prevRendererCtx;
 drawKillCounter(hudCtx);
}

function draw(){
 const renderState={canvas,player,enemies,bossImages,asteroidImg,shooterAsteroidImg,drawCleanSprite,drawSpriteFacing};
 const projectileRenderState={canvas,player,enemies,bullets,enemyBullets,particles,shieldOrbs,kienzanShots,dodonpaShots,kiExplosionEffect,kameProjectile, kamehamehaProjectile, getCurrentTime};
 const drawNow=getCurrentTime();

 profilePhase('Background',()=>{
   renderer.clear();
  let img = null;

if(window.StoryMode && window.StoryMode.isActive()){
  const chapter = window.StoryMode.getCurrentChapter();
  img = chapter && chapter.sceneImage ? getSceneImage(chapter.sceneImage) : null;
}else{
  img = sceneImages[currentSceneIndex];
}
   if(img && img.complete && img.naturalWidth){
     const iw = img.naturalWidth, ih = img.naturalHeight;
     const sc = Math.max(canvas.width/iw, canvas.height/ih);
     const dw = iw*sc, dh = ih*sc;
     ctx.drawImage(img, (canvas.width-dw)/2, (canvas.height-dh)/2, dw, dh);
   }
 // cycle scenes without transitions (Infinity Mode only)
if(!(window.StoryMode && window.StoryMode.isActive())){
  if(getCurrentTime() >= sceneSwitchAt){
    currentSceneIndex = (currentSceneIndex + 1) % sceneImages.length;
    sceneSwitchAt = getCurrentTime() + SCENE_DURATION_MS;
  }
}
 });

 profilePhase('PowerUp Render',()=>{
   for(let i=0;i<powerUps.length;i++){
     const p=powerUps[i];
     if(!isRectVisible(p.x-20,p.y-20,40,40)) continue;
     if(p.type==='dragonball' && dragonBallDropImg.complete && dragonBallDropImg.naturalWidth){
        ctx.drawImage(dragonBallDropImg,p.x-20,p.y-20,40,40);
     } else if(p.type==='senzu' && capsuleImg.complete && capsuleImg.naturalWidth){
        ctx.drawImage(capsuleImg,p.x-20,p.y-20,40,40);
     } else {
        ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.PI/4);ctx.fillStyle=p.type==='dragonball'?'gold':'lime';ctx.fillRect(-10,-10,20,20);ctx.restore();
     }
   }
 });

 profilePhase('Enemy Render',()=>{
   enemyManager.renderEnemies(ctx,renderState,{halozamasImg});
 });

 profilePhase('HUD',()=>{
   renderHudLayer(drawNow);
   ctx.drawImage(hudCanvas,0,0);
 });

 // ===== VER HITBOXS =====
if (window.showHitboxes) {
// Jugador
const playerW = 34;
const playerH = 112;

ctx.strokeStyle = "magenta";
ctx.lineWidth = 8;

ctx.strokeRect(
    player.x - playerW / 2,
    player.y - playerH / 2,
    playerW,
    playerH
);

// Enemigos
for (const e of enemies) {

    if (!e || e.dead) continue;

    const hb = getHitbox(e);

    ctx.strokeStyle = (e.type === "boss") ? "lime" : "red";

    ctx.strokeRect(
        e.x - hb.w / 2,
        e.y - hb.h / 2,
        hb.w,
        hb.h
    );
}

}

 profilePhase('Projectile Render',()=>{
   projectileManager.renderProjectiles(ctx,projectileRenderState,{gokuShotImg,discoImg,barrierImg,kameImg,kamehamehaImg,drawCleanSprite});
 });

 profilePhase('Particle Render',()=>{
   projectileManager.renderParticles(ctx,projectileRenderState);
 });

 profilePhase('Effects',()=>{
   if(kameExplosion>0 && kameExplosionTarget){let b=kameExplosionTarget; ctx.beginPath(); ctx.arc(b.x,b.y,180*(kameExplosion/60+0.2),0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.fill();}
   if(damageFlash>0){ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(0,0,canvas.width,canvas.height);damageFlash--;}
   if(superTechLevels.absorbki>0 && getCurrentTime()<absorbkiShieldUntil){
       ctx.save();
       ctx.translate(player.x,player.y);
       const barrierOrbitAngle=getCurrentTime()*0.0023;
       const barrierOrbitRadius=player.r+42;
       ctx.translate(Math.cos(barrierOrbitAngle)*barrierOrbitRadius,Math.sin(barrierOrbitAngle)*barrierOrbitRadius);
       ctx.strokeStyle='rgba(120,220,255,0.95)';
       ctx.lineWidth=4;
       ctx.beginPath();
       ctx.arc(0,0,player.r+20+Math.sin(getCurrentTime()*0.01)*2,0,Math.PI*2);
       ctx.stroke();
       if(barrierImg.complete && barrierImg.naturalWidth){
          ctx.drawImage(barrierImg,-player.r-20,-player.r-20,player.r*2+40,player.r*2+40);
       }
       ctx.restore();
    }
 });

 profilePhase('Player Render',()=>{
   if(playerImg.complete){
    const clean=getCleanSprite(playerImg);
    const w=(clean && (clean.naturalWidth||clean.width))?(clean.naturalWidth||clean.width):0;
    const h=(clean && (clean.naturalHeight||clean.height))?(clean.naturalHeight||clean.height):0;
    if(w>0 && h>0){
      ctx.save();

ctx.translate(player.x, player.y);

    if (!playerFacingLeft)
    ctx.scale(-1, 1);

ctx.drawImage(clean, -w/2, -h/2, w, h);

ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(player.x,player.y,player.r,0,Math.PI*2);
      ctx.fillStyle='dodgerblue';
      ctx.fill();
    }
  } else {
      ctx.beginPath();
      ctx.arc(player.x,player.y,player.r,0,Math.PI*2);
      ctx.fillStyle='dodgerblue';
      ctx.fill();
   }
 });

 profilePhase('UI',()=>{});
}

function getBuildText(){
 return window.creditsManager.getBuildText();
}

function getRunTime(){
 return Math.max(0,Math.floor((getCurrentTime()-survivalStart)/1000));
}

function clearActiveObjects(){
 enemies.length=0; bullets.length=0; enemyBullets.length=0; particles.length=0; powerUps.length=0;
 shieldOrbs=[]; kienzanShots=[]; dodonpaShots=[]; kiExplosionEffect=null;
 currentBoss=null; kameActive=false; kamePhase=0; kameProjectile=null; kameExplosion=0; kameExplosionTarget=null;
}

function resetStoryChapterState(){
 clearActiveObjects();
 bossNextSpawnAt=0;
 window.__spawnAcc = 0;
}
window.resetStoryChapterState = resetStoryChapterState;

function resetPlayerProgress(){

    Object.assign(
        player,
        {
            x: canvas.width / 2,
            y: canvas.height / 2,
            r: getDefaultPlayerRadius()
        },
        basePlayer
    );

    Object.keys(upgradeLevels).forEach(k => upgradeLevels[k] = 0);

    Object.keys(superTechLevels).forEach(k => superTechLevels[k] = 0);

    xp = 0;
    lvl = 1;
    xpNeed = 10;
    kills = 0;

    dragonballCount = 0;
    extraLives = 0;

}

function resetRunState(){

    if(window.__longRunAudit)
        window.__longRunAudit.reset();

    clearActiveObjects();

    lastShot = 0;

    bossSpawnedLevel = 0;
    bossCycle = 0;
    bossIndex = 0;
    bossNextSpawnAt = 0;

    rankSaved = false;
    window.__rankSaved = false;

    initials = "";

    shieldOrbs = [];

    kienzanShots = [];
    kienzanCooldownAt = 0;

    kiExplosionEffect = null;
    dodonpaCooldownAt = 0;
    kiExplosionCooldownAt = 0;

    absorbkiShieldUntil = 0;
    absorbkiTriggerReady = true;
    absorbkiTriggeredCount = 0;
    absorbkiAbsorbedDamage = 0;

    dragonDashCooldownAt = 0;

    player.dashFromX = 0;
    player.dashToX = 0;
    player.dashStartAt = 0;
    player.dashUntil = 0;

    currentSceneIndex = 0;
    sceneSwitchAt = getCurrentTime() + SCENE_DURATION_MS;

    gameOver = false;
    paused = false;
    pauseMenuOpen = false;

    playerFacingLeft = false;

    survivalStart = getCurrentTime();

    if(window.__perf)
        window.__perf.spawnAcc = 0;

}

function resetGameState(){

    resetPlayerProgress();

    resetRunState();

}

function saveGame(){
 return window.chapterManager.saveGame();
}

function loadGame(){
 return window.chapterManager.loadGame();
}

function startNewGame(){
 return window.chapterManager.startNewGame();
}

function exitToTitle(){
 return window.chapterManager.exitToTitle();
}

function showMenuMessage(text){
 return window.chapterManager.showMenuMessage(text);
}

function formatTime(sec){
 return window.chapterManager.formatTime(sec);
}

function renderRanksHtml(){
 return window.chapterManager.renderRanksHtml();
}

function renderStartMenu(view='main'){
 return window.chapterManager.renderStartMenu(view);
}

function isLevelUpOpen(){
 return window.sceneManager.isLevelUpOpen();
}

function setPauseMenu(open){
 return window.sceneManager.setPauseMenu(open);
}

function togglePauseMenu(){
 return window.sceneManager.togglePauseMenu();
}

document.addEventListener('keydown', e => {
  if (paused && levelUpEl && levelUpEl.style.display === 'flex') {
    const bs = [...document.querySelectorAll('#levelUp button')];
    if (!bs.length) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') selectedUpgrade = (selectedUpgrade + bs.length - 1) % bs.length;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') selectedUpgrade = (selectedUpgrade + 1) % bs.length;
    bs.forEach((b, i) => { b.style.outline = i === selectedUpgrade ? '3px solid yellow' : ''; });
    if (e.key === 'Enter' && bs[selectedUpgrade]) bs[selectedUpgrade].click();
  }

  if (paused && ui.handleKey(e)) {
    e.preventDefault();
    return;
}

});


function drawKillCounter(targetCtx=ctx){
 targetCtx.save();
 targetCtx.fillStyle='#ff9c00';
 targetCtx.font='26px Arial';
 targetCtx.textAlign='right';
 targetCtx.textBaseline='top';
 targetCtx.fillText('ZENIS '+kills, canvas.width-18, 14);
 if(bossCycle>0){
   targetCtx.font='18px Arial';
   targetCtx.fillText('CICLO '+(bossCycle+1), canvas.width-18, 44);
 }
 targetCtx.restore();
}

function renderGameOver(){
 return window.creditsManager.renderGameOver();
}

const ENABLE_120FPS_CAP = false;
const FPS_CAP_INTERVAL_MS = 1000 / 120;
let lastFrameTime=getCurrentTime();
let lastCompactArraysAt=0;
function loop(){

   if(window.CreditsScene && CreditsScene.running){
    CreditsScene.update(performance.now());
    CreditsScene.render(ctx);
    requestAnimationFrame(loop);
    return;
 }

 const frameNow=getCurrentTime();
 if(ENABLE_120FPS_CAP && frameNow-lastFrameTime<FPS_CAP_INTERVAL_MS){
  requestAnimationFrame(loop);
  return;
 }
 const frameStart=performance.now();
 profilerFramePhases=[];
 const dt=frameNow-lastFrameTime;
 lastFrameTime=frameNow;
 if(window.__longRunAudit){
  window.__longRunAudit.maybeStart(gameStarted, frameNow);
  window.__longRunAudit.noteFrame(dt);
 }
  if(window.__audit && window.__audit.enabled){ window.__audit.frameTimes.push(dt); if(window.__audit.frameTimes.length>10000) window.__audit.frameTimes.shift(); }
  if(window.__stress && window.__stress.enabled){ window.__stress.frameTimes.push(dt); if(window.__stress.frameTimes.length>10000) window.__stress.frameTimes.shift(); }
  if(window.__stress && window.__stress.enabled){
    // detect possible GC pause (suspicious frames)
    const GC_THRESHOLD_MS = 50;
    if(dt > GC_THRESHOLD_MS) window.__stress.registerGcPause(dt);
    // update peaks
    window.__stress.updatePeaks();
  }
 window.bossManager.updateSpawner(dt);
 perfFrame(dt);
 if(!gameStarted){
  if(gameOver){
   ctx.fillText("GAME OVER", canvas.width/2-50, canvas.height/2);
   ctx.fillText("NAME: "+initials, canvas.width/2-50, canvas.height/2+30);
  }
  const frameTotal=performance.now()-frameStart;
  recordProfileFrame(frameTotal);
  requestAnimationFrame(loop);
  return;
 }
 if(gameOver){
  renderGameOver();
  const frameTotal=performance.now()-frameStart;
  recordProfileFrame(frameTotal);
  requestAnimationFrame(loop);
  return;
 }
 // measure update/draw times for stress test
 if(window.__stress && window.__stress.enabled){ const su=performance.now(); profilePhase('Update',()=>update()); window.__stress.accUpdateTime += performance.now()-su; }
 else profilePhase('Update',()=>update());
 if(frameNow-lastCompactArraysAt>=COMPACT_ARRAYS_INTERVAL_MS){
  profilePhase('compactArrays',()=>compactArrays());
  lastCompactArraysAt=frameNow;
 }
 if(window.__stress && window.__stress.enabled){ const sr=performance.now(); profilePhase('draw',()=>draw()); window.__stress.accRenderTime += performance.now()-sr; }
 else profilePhase('draw',()=>draw());
 if(gameOver){
  ctx.fillText("GAME OVER", canvas.width/2-50, canvas.height/2);
  ctx.fillText("NAME: "+initials, canvas.width/2-50, canvas.height/2+30);
 }
 const frameTotal=performance.now()-frameStart;
 recordProfileFrame(frameTotal);
 if(window.__longRunAudit) window.__longRunAudit.maybeSample(frameNow);
 requestAnimationFrame(loop);
}
loop();

window.chapterManager.initMenus();
renderStartMenu();
function perfFrame(dt){
 if(typeof player!=='undefined'){
  playerController.clampToCanvas();
 }
}

window.hitFlash=0;

// ===== DEBUG COMMANDS =====
window.god = false;
window.speed10 = false;

window.addEventListener("keydown", e=>{

    if(e.key==="F6"){
        window.god = !window.god;
        console.log("INVULNERABILIDAD:", window.god);
    }

    if(e.key==="F7"){
       window.speed10 = !window.speed10;

gameTimeOrigin = getCurrentTime();
realTimeOrigin = performance.now();

window.gameSpeed = window.speed10 ? 10 : 1;

console.log("FAST FORWARD x10:", window.speed10);
        
    }

});

window.showHitboxes = false;

document.addEventListener("keydown", e => {
    if (e.key === "F1") {
        window.showHitboxes = !window.showHitboxes;
        e.preventDefault();
    }
});
function playerDamaged(){hitFlash=10;}
function enemyExplode(x,y){
 for(let i=0;i<20;i++) addParticle(x,y,(Math.random()-0.5)*6,(Math.random()-0.5)*6,50,Math.random()>0.5?'orange':'yellow');
}

try{
 const h=document.getElementById('hud');
 if(h) h.style.display='none';
}catch(e){}

window.addEventListener('load',()=>{
  const hud=document.getElementById('hud');
  if(hud) hud.style.display='none';
});

window.addEventListener('load',()=>{
 document.querySelectorAll('#hud,.hud').forEach(e=>e.style.display='none');
});

// v7 patch marker: force game over when HP reaches 0.

let cameraShake=0;
function triggerKamehamehaFX(){cameraShake=30; damageFlash=30;}




/* V15_SAFE_PATCH */

/* V16 HUD+GAMEOVER */
function getSurvivalSeconds(){
 return window.creditsManager.getSurvivalSeconds();
}

(function(){
 const oldLoop = loop;
 loop = function(){
   if (gameOver){
     window.creditsManager.renderGameOver();
     requestAnimationFrame(loop);
     return;
   }
   oldLoop();
 };
})();

document.addEventListener('keydown',e=>{

 if(gameOver && e.key==='Enter'){

   if(!window.__rankSaved){

    console.log("ENTER ->", initials);

     const RANK_KEY = "survivorRanksV2";

let ranks = JSON.parse(localStorage.getItem(RANK_KEY) || "[]");

     ranks.push({
       name: initials || "AAA",
       lvl: lvl,
       kills: kills,
       time: getSurvivalSeconds(),
       build: getBuildText()
     });

     ranks.sort((a,b)=>
       (b.lvl-a.lvl) ||
       (b.kills-a.kills) ||
       (b.time-a.time)
     );

     localStorage.setItem(RANK_KEY, JSON.stringify(ranks.slice(0,10)));

     window.__rankSaved=true;
   }

   location.reload();

 }

});

setInterval(()=>{
 let box=document.getElementById('v16hud');
 if(!box){
   box=document.createElement('div');
   box.id='v16hud';
   box.style.cssText='position:fixed;left:10px;top:10px;z-index:999999;color:#ff9c00;font-family:Arial';
   box.innerHTML=`<div id=hpt style="width:260px;background:#300;height:22px;position:relative"><div id=hpf style="background:#d00;height:100%;width:100%"></div></div>
   <div style="height:4px"></div><span id=hpn style="position:absolute;left:50%;top:2px;transform:translateX(-50%);color:#ff9c00"></span>
   <div id=xpt style="width:260px;background:#024;height:22px;position:relative"><div id=xpf style="background:#09f;height:100%;width:0%"></div><span id=xpn style="position:absolute;left:50%;top:2px;transform:translateX(-50%);color:#ff9c00"></span></div>`;
   document.body.appendChild(box);
 }
if(typeof player!=='undefined'){

  const menuVisible =
      (window.dmpOverlay && document.body.contains(window.dmpOverlay)) ||
      (window.startOverlay && window.startOverlay.style.display !== 'none');

  box.style.display = menuVisible ? 'none' : 'block';

  if(menuVisible) return;

  document.getElementById('hpf').style.width=(Math.max(0,player.hp)/player.maxHp*100)+'%';
  document.getElementById('hpn').textContent=Math.floor(Math.max(0,player.hp))+'/'+player.maxHp;
  document.getElementById('xpf').style.width=(xp/xpNeed*100)+'%';
  document.getElementById('xpn').textContent=xp+'/'+xpNeed+'  LVL '+lvl;
} 
},HUD_UPDATE_INTERVAL_MS);
