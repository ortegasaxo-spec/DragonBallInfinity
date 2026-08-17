
const audioManager = window.audioManager;
const kameSound = audioManager.kameSound;
const boomSound = audioManager.boomSound;
const bossImages = window.bossManager.bossImages;
const bossColors = window.bossManager.bossColors;

// Lightweight spawn accumulator used by the spawner.
window.__spawnAcc = window.__spawnAcc || 0;
let gameOver=false;
let pauseMenuOpen=false;
let initials="";
document.addEventListener("keydown",e=>{



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

function getCurrentTime(){
  return performance.now();
}


let survivalStart=getCurrentTime();

const canvas = document.getElementById("gameCanvas");
const ctx=canvas.getContext('2d');
function resizeGameCanvas(){
  canvas.width=innerWidth;
  canvas.height=innerHeight;
}
resizeGameCanvas();
window.addEventListener('resize', resizeGameCanvas);
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

window.ui = ui;
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
let xp=0,lvl=1,xpNeed=10,lastShot=0,paused=false,bossSpawnedLevel=0; let rankSaved=false; let bossCycle=0; let currentBoss=null;
let bossIndex=0,bossNextSpawnAt=0;
const basePlayer={hp:100,maxHp:100,speed:3,damage:1,bullets:1,fireRate:350,armor:0};


/* === PERFORMANCE POOLS === */
const bulletPool=[];
const particlePool=[];
const enemyPool=[];
const enemyBulletPool=[];

function acquireBullet(){ const b = bulletPool.pop(); return b || {}; }
function releaseBullet(b){ for(const k in b) delete b[k]; if(bulletPool.length<800) bulletPool.push(b); }

function acquireEnemy(){ const e = enemyPool.pop(); return e || {}; }
function releaseEnemy(e){ for(const k in e) delete e[k]; if(enemyPool.length<300) enemyPool.push(e); }

function acquireEnemyBullet(){ const b = enemyBulletPool.pop(); return b || {}; }
function releaseEnemyBullet(b){ for(const k in b) delete b[k]; if(enemyBulletPool.length<500) enemyBulletPool.push(b); }

function acquireParticle(){ const p = particlePool.pop(); return p || {}; }
function releaseParticle(p){ for(const k in p) delete p[k]; if(particlePool.length<1500) particlePool.push(p); }

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
  return grid;
}
let activeEnemyGrid={};
const activeEnemyGridKeys=[];
const COLLISION_GRID_FRAME_INTERVAL = 2;
let collisionGridFrameCounter = 0;
function queryEnemiesNear(x,y,radius,callback,source){
  const grid=activeEnemyGrid;
  if(!grid || typeof callback!=='function') return;
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
  if(!e) return bossProjectileImages[0];

  const bossName = e.bossDisplayName || e.bossName || "";

  if(
    bossName==="GOLDEN FREEZER" ||
    bossName==="goku black" ||
    bossName==="goku rose" ||
    bossName==="ZAMAS"
){
    return jirenProjectileImg;
}

if(bossName==="Kefla"){
    return bossProjectileImgA;
}

  if(
    e.type==="boss" &&
    (e.specialKey || getBossSpecialKey(bossName))==="jiren"
  ){
    return jirenProjectileImg;
  }

  return (e.bossSequenceIndex!==undefined)
    ? bossProjectileImages[e.bossSequenceIndex % bossProjectileImages.length]
    : bossProjectileImages[0];
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

function triggerDragonDash(){
 const now = getCurrentTime();
 if(superTechLevels.dragonDash <= 0 || now < dragonDashCooldownAt) return false;

 const dist = Math.round(canvas.width * DRAGON_DASH_DISTANCE_PCT);
 const toX = playerFacingLeft
  ? Math.max(player.r, player.x - dist)
  : Math.min(canvas.width - player.r, player.x + dist);

 player.dashFromX = player.x;
 player.dashToX = toX;
 player.dashStartAt = now;
 player.dashUntil = now + DRAGON_DASH_DURATION;
 player.invulnerableUntil = player.dashUntil;
 dragonDashCooldownAt = now + DRAGON_DASH_COOLDOWN;
 return true;
}

document.addEventListener('keydown', e => {
 if(e.code === 'Space' && !e.repeat && triggerDragonDash()) e.preventDefault();
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
      
    }
  } else {
   for(let i=0;i<shotCount;i++){
     const offset=(i-(shotCount-1)/2)*spread;
     const nb=acquireBullet();
     nb.x=player.x; nb.y=player.y; nb.vx=Math.cos(a+offset)*8; nb.vy=Math.sin(a+offset)*8; nb.d=player.damage; nb.dead=false;
     bullets.push(nb);
     
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
  octx.fillStyle = "black";
octx.fillRect(0, 0, ov.width, ov.height);
   if(shenronImg && shenronImg.complete!==false){
   const maxW=ov.width*0.7, maxH=ov.height*0.7;
const iw=shenronImg.naturalWidth||shenronImg.width||1;
const ih=shenronImg.naturalHeight||shenronImg.height||1;
const sc=Math.min(maxW/iw,maxH/ih);
const w=iw*sc;
const h=ih*sc;
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
 if(window.gameMode !== 'story') return;
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
   paused=false; 
   kamePhase=1;
   kameProjectile={x:player.x,y:player.y,target:boss};
   try{kameSound.currentTime=0;kameSound.play();}catch(e){}
 };
 renderCharge();
}

function update(){
 if(paused) return;

 const now=getCurrentTime();
 if(window.gamepadManager && window.gamepadManager.consume('accept')) triggerDragonDash();
 let storyAction=null;
 if(window.StoryMode&&window.StoryMode.tick&&window.StoryMode.isActive&&window.StoryMode.isActive()){
  storyAction=window.StoryMode.tick(now,{paused,menuOpen:!!(levelUpEl&&levelUpEl.style.display==='flex'),hasActiveStoryBoss:enemies.some(e=>e&&!e.dead&&e.storyChapterBoss)});
 }
 if(storyAction){
  if(storyAction.spawnBossName){ window.bossManager.spawnStoryBossByName(storyAction.spawnBossName,{isFinalBoss:storyAction.isFinalBoss,chapterId:storyAction.chapterId}); }
  if(storyAction.nextChapter){ window.StoryMode.nextChapter(); }
 }
 {
  // handle dash movement override
  if (player.dashUntil && now < player.dashUntil){
    const t = Math.min(1, Math.max(0, (now - (player.dashStartAt||0)) / DRAGON_DASH_DURATION));
    player.x = (player.dashFromX || player.x) + ((player.dashToX || player.x) - (player.dashFromX || player.x)) * t;
  } else {
    let moveX = 0;
let moveY = 0;

// ===== TECLADO =====
if (keys.w || keys["arrowup"]) moveY -= 1;
if (keys.s || keys["arrowdown"]) moveY += 1;
if (keys.a || keys["arrowleft"]) moveX -= 1;
if (keys.d || keys["arrowright"]) moveX += 1;

// ===== GAMEPAD =====
if (window.gamepadManager) {

    if (moveX === 0) moveX = window.gamepadManager.input.moveX;
    if (moveY === 0) moveY = window.gamepadManager.input.moveY;

    if (window.gamepadManager.input.left)  moveX = -1;
    if (window.gamepadManager.input.right) moveX = 1;
    if (window.gamepadManager.input.up)    moveY = -1;
    if (window.gamepadManager.input.down)  moveY = 1;
}

if (moveX || moveY) {

    const len = Math.hypot(moveX, moveY) || 1;

    player.x += (moveX / len) * player.speed;
    player.y += (moveY / len) * player.speed;

    if (moveX !== 0)
        playerFacingLeft = moveX < 0;
}
  }
   if(now-lastShot>player.fireRate){ shoot(); lastShot=now; }
 }

   if((collisionGridFrameCounter++ % COLLISION_GRID_FRAME_INTERVAL) === 0){
    // The collision grid is reused for one frame, so spatial queries can lag by at most one frame.
    const enemyGrid=buildEnemyCollisionGrid();
    activeEnemyGrid=enemyGrid;
   }
 const nearestEnemyForFrame = (superTechLevels.kienzan>0 || superTechLevels.dodonpa>0) ? findNearestEnemy() : null;
 {
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
   const cooldown=2000;
   if(now>=kienzanCooldownAt){
     kienzanCooldownAt=now+cooldown;
     
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
         
         hitSpark(disc.x,disc.y,e.type==='boss');
         if(e.hp<=0) defeatEnemy(e);
         return true;
       }
       return false;
    },'kienzan');
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

         

            launchKamehameha(target);

        }
    }

}

 if(superTechLevels.kiExplosion>0){
   const cooldown=superTechLevels.kiExplosion===1?60000:superTechLevels.kiExplosion===2?45000:30000;
   if(now>=kiExplosionCooldownAt){
     kiExplosionCooldownAt=now+cooldown;
     kiExplosionEffect={x:player.x+(playerFacingLeft?-34:34),y:player.y,radius:10,maxRadius:Math.max(canvas.width,canvas.height)*0.6,damage:(superTechLevels.kiExplosion===1?1:superTechLevels.kiExplosion===2?2:4)+(damageBonus*5),createdAt:now};
     
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
         
         if(e.hp<=0) defeatEnemy(e);
       }
       return false;
    },'kiExplosion');
     if(kiExplosionEffect.radius>=kiExplosionEffect.maxRadius) kiExplosionEffect=null;
   }
     
 }
 if(superTechLevels.dodonpa>0){
   const cooldown=20000;
   if(now>=dodonpaCooldownAt){
     dodonpaCooldownAt=now+cooldown;
     
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

                

                if(e.hp<=0)
                    defeatEnemy(e);
            }

            return false;

        },
        'dodonpa'
    );
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

 {
   for(let bi=0;bi<bullets.length;bi++){
     const b=bullets[bi];
     if(b.dead) continue;
    
    // if bullet has an assigned target (from Muten concentration), home towards it
    if(b.target && !b.target.dead){
      const dx = b.target.x - b.x, dy = b.target.y - b.y; const d = Math.hypot(dx,dy)||1;
      const speed = 8;
      b.vx = dx/d*speed; b.vy = dy/d*speed;
      b.x += b.vx; b.y += b.vy;
    } else {
      b.x+=b.vx; b.y+=b.vy;
    }
    
      if(isFarFromPlayer(b)){
        b.dead=true;
        
        continue;
      }
    queryEnemiesNear(b.x,b.y,10,(e)=>{
        if(!e||e.dead) return false;
        
  if (bulletHitEnemy(b, e)) {
          
          let incomingDamage=b.d;
          if(e.type==='boss' && e.specialKey==='jiren' && e.meditationState===1){ incomingDamage*=0.25; }
          if(e.type==='boss' && e.specialKey==='cell' && now<e.specialActiveUntil){
            incomingDamage=0;
            e.hp=Math.min(e.maxHp,e.hp+Math.max(1,b.d));
          } else {
            e.hp-=incomingDamage;
          }
          b.dead=true;
          
          hitSpark(b.x,b.y,e.type==='boss');
          if(e.type==='boss') bossImpact(b.x,b.y);
          if(e.hp<=0) defeatEnemy(e);
          
          return true;
        }
        
        return false;
    },'projectileUpdate');
     
   }


 }
 }

 currentBoss=null;
 const shouldRunBossUpdate = (bossUpdateFrameCounter++ % BOSS_UPDATE_FRAME_INTERVAL) === 0;
 const shouldRunEnemyAI = (enemyAiFrameCounter++ % ENEMY_AI_FRAME_INTERVAL) === 0;
 {
   for(let ei=0;ei<enemies.length;ei++){
     const e=enemies[ei];
     if(!e.dead && e.type==='boss'){
       currentBoss=e;
       break;
     }
   }
   if(shouldRunBossUpdate){
     {
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
            if(dx*dx+dy*dy<=(halo.radius+player.r)*(halo.radius+player.r)){player.hp-=halo.damagePerSec/60;
    damageFlash=8; 
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
     }
   }

   if(shouldRunEnemyAI){
     {
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
                    let p=((e.bossSequenceIndex||0)%5);

if(e.bossDisplayName==="GOLDEN FREEZER"){
    p=2;
}

else if(e.bossDisplayName==="Kefla"){
    p=0;
}

                    const projectileCount=multiplier>1?2:1;
                    const projectileType=multiplier>1?'jirenBall':'default';
                    const projectileImg=(multiplier>1)?jirenProjectileImg:getBossProjectileImage(e);
                    if(p===0){
    for(let k=0;k<projectileCount;k++)
        spawnEnemyBullet(e.x,e.y,Math.cos(a)*4,Math.sin(a)*4,col,{
            type:projectileType,
            radius:14,
            img:projectileImg,
            damagePerSec:multiplier>1?40:20
        });
}
                    else if(p===1){for(let k=-1;k<=1;k++) for(let q=0;q<projectileCount;q++) spawnEnemyBullet(e.x,e.y,Math.cos(a+k*0.3)*4,Math.sin(a+k*0.3)*4,col,{type:projectileType,radius:14,img:projectileImg,damagePerSec:multiplier>1?40:20});}
                    else if(p===2){
    const offsets=[-0.30,-0.10,0.10,0.30];

    for(const offset of offsets){
        for(let q=0;q<projectileCount;q++){
            spawnEnemyBullet(
                e.x,
                e.y,
                Math.cos(a+offset)*3,
                Math.sin(a+offset)*3,
                col,
                {
                    type:projectileType,
                    radius:14,
                    img:projectileImg,
                    damagePerSec:multiplier>1?40:20
                }
            );
        }
    }
}
                    else if(p===3){for(let k=0;k<3*projectileCount;k++) spawnEnemyBullet(e.x,e.y,Math.cos(a)*(2+k),Math.sin(a)*(2+k),col,{type:projectileType,radius:14,img:projectileImg,damagePerSec:multiplier>1?40:20});}
                    else {for(let k=0;k<3*projectileCount;k++) spawnEnemyBullet(e.x,e.y,Math.cos((k-1)*0.4+a)*3,Math.sin((k-1)*0.4+a)*3,col,{type:projectileType,radius:14,img:projectileImg,damagePerSec:multiplier>1?40:20});}
                 } else spawnEnemyBullet(e.x,e.y,Math.cos(a)*4,Math.sin(a)*4,'#66ccff');
                 e.cd=e.type==="boss"?30:90;
              }
           }
         }
       }
     }
   }

   {
     for(let ei=0;ei<enemies.length;ei++){
       const e=enemies[ei];
       if(e.dead) continue;
       const specialKey=e.type==='boss' ? (e.specialKey || (e.specialKey=getBossSpecialKey(e.bossDisplayName||e.bossName||''))) : null;
       const isJirenMeditating=e.type==='boss' && specialKey==='jiren' && e.meditationState===1;
       if(!isJirenMeditating){
         e.x+=e.vx; e.y+=e.vy;
       }
    if(aabbHit(player,e)){player.hp-=0.15*(1-player.armor);
    damageFlash=6;       }
     }
   }
 }

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
      } else {player.hp-=damage;
    damageFlash=8;      }
      if(!b.persistent) b.dead=true;
   }
   if(b.type==='beam' || b.type==='cross'){
      const active=(b.spawnedAt && now-b.spawnedAt<(b.lifetimeMs||0));
      if(!active) b.dead=true;
   }
 }

 {
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

 {
   for(let i=0;i<particles.length;i++){
     const p=particles[i];
     if(!p || p.dead) continue;
     p.x+=p.vx; p.y+=p.vy; p.life--;
     if(p.life<=0 || isFarFromPlayer(p)) p.dead=true;
   }
 }
  for (let i = dodonpaShots.length - 1; i >= 0; i--) {
    const s = dodonpaShots[i];
    if (!s) { dodonpaShots.splice(i, 1); continue; }
    s.life--;
    if (s.life <= 0) { dodonpaShots.splice(i, 1); }
  }
 }

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

 {
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
 }

 {
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
 }

 {
   enemyManager.renderEnemies(ctx,renderState,{halozamasImg});
 }

 {
   renderHudLayer(drawNow);
   ctx.drawImage(hudCanvas,0,0);
 }

 {
   projectileManager.renderProjectiles(ctx,projectileRenderState,{gokuShotImg,discoImg,barrierImg,kameImg,kamehamehaImg,drawCleanSprite});
 }

 {
   projectileManager.renderParticles(ctx,projectileRenderState);
 }

 {
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
 }

 {
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
 }

 {}
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

  if (
    startOverlay &&
    startOverlay.style.display === 'flex' &&
    ui.handleKey(e)
) {
    e.preventDefault();
    return;
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
 const dt=frameNow-lastFrameTime;
 lastFrameTime=frameNow;
 
  
  
  
 window.bossManager.updateSpawner(dt);
 perfFrame(dt);

 // Navegación de menús con gamepad
if (window.startOverlay &&
    window.startOverlay.style.display === 'flex'){
    ui.handleGamepad();
}

if(paused){
    ui.handleGamepad();
}
 if(!gameStarted){
  if(gameOver){
   ctx.fillText("GAME OVER", canvas.width/2-50, canvas.height/2);
   ctx.fillText("NAME: "+initials, canvas.width/2-50, canvas.height/2+30);
  }
  requestAnimationFrame(loop);
  return;
 }
 if(gameOver){
  renderGameOver();
  requestAnimationFrame(loop);
  return;
 }



 // measure update/draw times for stress test
 
 update();
 if(frameNow-lastCompactArraysAt>=COMPACT_ARRAYS_INTERVAL_MS){
  compactArrays();
  lastCompactArraysAt=frameNow;
 }
 
 draw();
 if(gameOver){
  ctx.fillText("GAME OVER", canvas.width/2-50, canvas.height/2);
  ctx.fillText("NAME: "+initials, canvas.width/2-50, canvas.height/2+30);
 }
 
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

function playerDamaged(){
    hitFlash = 10;
}

function enemyExplode(x,y){

    for(let i=0;i<20;i++){

        addParticle(
            x,
            y,
            (Math.random()-0.5)*6,
            (Math.random()-0.5)*6,
            50,
            Math.random()>0.5 ? "orange" : "yellow"
        );

    }

}

try{

    const hud = document.getElementById("hud");

    if(hud) hud.style.display = "none";

}catch(e){}

window.addEventListener("load",()=>{

    document.querySelectorAll("#hud,.hud").forEach(e=>e.style.display="none");

});

let cameraShake = 0;

function triggerKamehamehaFX(){

    cameraShake = 30;
    damageFlash = 30;

}




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


     const RANK_KEY = "survivorRanksV2";

let ranks = JSON.parse(localStorage.getItem(RANK_KEY) || "[]");

     const zenis = kills;

let bonus = 0;

if (selectedDifficulty === "hard") {
    bonus = Math.floor(zenis * 0.20);
}
else if (selectedDifficulty === "hardcore") {
    bonus = Math.floor(zenis * 0.50);
}

const totalZenis = zenis + bonus;

ranks.push({
    name: initials || "AAA",
    lvl: lvl,
    zenis: totalZenis,
    bonus: bonus,
    time: getSurvivalSeconds(),
    build: getBuildText()
});

ranks.sort((a,b)=>
    (b.lvl-a.lvl) ||
    (b.zenis-a.zenis) ||
    (b.time-a.time)
);

     localStorage.setItem(RANK_KEY, JSON.stringify(ranks.slice(0,7)));

     if (window.chapterManager && window.chapterManager.addPermanentZenis) {
       window.chapterManager.addPermanentZenis(totalZenis);
     }

     window.__rankSaved=true;
   }

   window.chapterManager.exitToTitle();

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
