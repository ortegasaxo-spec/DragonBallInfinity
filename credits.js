(function(global){
  function getBuildText(){
    return 'D' + upgradeLevels.damage + ' / Cad ' + upgradeLevels.rate + ' / Vel ' + upgradeLevels.speed + ' / Vida ' + upgradeLevels.hp + ' / Disp ' + upgradeLevels.bullets + ' / Dragon ' + dragonballCount + ' / Vidas ' + extraLives + ' / Tech ' + Object.entries(superTechLevels).map(([k,v]) => k + ':' + v).join(',');
  }

  function getSurvivalSeconds(){
    return Math.floor((getCurrentTime() - survivalStart) / 1000);
  }

  function renderGameOver(){
    console.log("renderGameOver()");
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (!window.__rankSaved && initials.length === 3) {

  let ranks = JSON.parse(localStorage.getItem('survivorRanksV2') || '[]');

  ranks.push({
    name: initials,
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

  localStorage.setItem('survivorRanksV2', JSON.stringify(ranks.slice(0,10)));

  window.__rankSaved = true;
} 
    ctx.fillStyle='white';
    ctx.font='30px Arial';
    ctx.fillText('GAME OVER', canvas.width / 2 - 100, 80);
    ctx.fillStyle = "#4FC3FF";
ctx.font = "28px Arial";
    ctx.font = '24px Arial';

let shownName = initials;
while (shownName.length < 3) shownName += "_";

ctx.fillText(
    "NOMBRE: " + shownName,
    canvas.width / 2 - 100,
    115
);

ctx.fillStyle = "white";
ctx.font = "20px Arial";

    let ranks = JSON.parse(localStorage.getItem('survivorRanksV2') || '[]');
    ctx.font='20px Arial';
  ranks.forEach((s, i) =>
    ctx.fillText(
        `${i+1}. ${s.name}  L${s.lvl}  ☠${s.kills}`,
        canvas.width/2-120,
        240+i*28
    )
);
    ctx.fillText('ENTER = MENU', canvas.width / 2 - 100, canvas.height - 60);
  }


  global.creditsManager = {
    getBuildText,
    getSurvivalSeconds,
    renderGameOver,
  };
})(window);
