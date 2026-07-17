(function(global){

  const gameOverImg = new Image();
gameOverImg.src = "assets/gameover.png";

  function getBuildText(){
    return 'D' + upgradeLevels.damage + ' / Cad ' + upgradeLevels.rate + ' / Vel ' + upgradeLevels.speed + ' / Vida ' + upgradeLevels.hp + ' / Disp ' + upgradeLevels.bullets + ' / Dragon ' + dragonballCount + ' / Vidas ' + extraLives + ' / Tech ' + Object.entries(superTechLevels).map(([k,v]) => k + ':' + v).join(',');
  }

  function getSurvivalSeconds(){
    return Math.floor((getCurrentTime() - survivalStart) / 1000);
  }

  function renderGameOver(){
       ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (!window.__rankSaved && initials.length === 3) {

  let ranks = JSON.parse(localStorage.getItem('survivorRanksV2') || '[]');

  const zenis = kills;

  let difficultyBonus = 0;

if (selectedDifficulty === "hard") {
    difficultyBonus = Math.floor(zenis * 0.20);
}
else if (selectedDifficulty === "hardcore") {
    difficultyBonus = Math.floor(zenis * 0.50);
}

let ngBonus = 0;

if (window.newGameManager) {
    ngBonus = Math.floor(
        zenis * ((window.newGameManager.getSelectedCycle() - 1) * 0.10)
    );
}

const totalZenis = zenis + difficultyBonus + ngBonus;

ranks.push({
    name: initials,
    lvl: lvl,
    zenis: totalZenis,
    bonus: difficultyBonus + ngBonus,
    time: getSurvivalSeconds(),
    build: getBuildText()
});

ranks.sort((a,b)=>
    (b.lvl-a.lvl) ||
    (b.zenis-a.zenis) ||
    (b.time-a.time)
);

  localStorage.setItem('survivorRanksV2', JSON.stringify(ranks.slice(0,7)));

  if (window.chapterManager && window.chapterManager.addPermanentZenis) {
    window.chapterManager.addPermanentZenis(totalZenis);
  }

  window.__rankSaved = true;
} 
    ctx.fillStyle='white';
    ctx.font='30px Arial';
    // Dibujar imágenes Game Over

if (gameOverImg.complete) {

    const imgW = 220;
    const imgH = 220;

    // izquierda
    ctx.drawImage(
        gameOverImg,
        canvas.width/2 - 805,
        250,
        imgW,
        imgH
    );

    // derecha espejada
    ctx.save();

    ctx.translate(canvas.width/2 + 390 + imgW,0);

    ctx.scale(-1,1);

    ctx.drawImage(
        gameOverImg,
        - 105,
        250,
        imgW,
        imgH
    );

    ctx.restore();

    ctx.fillStyle="white";
    ctx.font="24px Arial";

    ctx.fillText(
        "GAME OVER",
        canvas.width/2-805,
        700
    );

    ctx.fillText(
        "GAME OVER",
        canvas.width/2+575,
        700
    );
}
    
    ctx.font='42px Arial';

ctx.fillText(
    'RANKING',
    canvas.width/2-90,
    70
);
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

const zenis = kills;

let difficultyBonus = 0;
let bonusText = "";

if (selectedDifficulty === "hard") {
    difficultyBonus = Math.floor(zenis * 0.20);
    bonusText = "+20%";
}
else if (selectedDifficulty === "hardcore") {
    difficultyBonus = Math.floor(zenis * 0.50);
    bonusText = "+50%";
}

let ngBonus = 0;
let ngText = "+0%";

if (window.newGameManager) {

    const cycle = window.newGameManager.getSelectedCycle();

    ngBonus = Math.floor(
        zenis * ((cycle - 1) * 0.10)
    );

    ngText = "+" + ((cycle - 1) * 10) + "%";
}

const totalZenis = zenis + difficultyBonus + ngBonus;

ctx.fillStyle = "#FFD54F";
ctx.font = "26px Arial";
ctx.textAlign = "center";

const x = canvas.width / 2;
let y = 725;

ctx.fillText(
    `ZENIS: ${zenis}`,
    x,
    y
);

y += 38;

ctx.fillText(
    `BONUS NG (${ngText}): +${ngBonus}`,
    x,
    y
);

y += 38;

ctx.fillText(
    `BONUS DIFICULTAD (${bonusText || "+0%"}): +${difficultyBonus}`,
    x,
    y
);

y += 38;

ctx.fillStyle = "#00FF66";

ctx.fillText(
    `TOTAL ZENIS: ${totalZenis}`,
    x,
    y
);

ctx.textAlign = "left";
ctx.fillStyle = "white";
ctx.font = "20px Arial";

    let ranks = JSON.parse(localStorage.getItem('survivorRanksV2') || '[]');
    ctx.font='20px Arial';
  ranks.forEach((s, i) =>
    ctx.fillText(
        `${i+1}. ${s.name}  L${s.lvl}  Z${s.zenis ?? s.kills}`,
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
