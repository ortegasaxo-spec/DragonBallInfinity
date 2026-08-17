(function(global){

let running = false;

let startedAt = 0;
let phase = 0;
let phaseStartedAt = 0;
let returnToMenuAfterCredits = true;
let bossIndex = 0;
let pairIndex = 0;

let side = 1;

const MESSAGE_LIST = [
    "Juego creado íntegramente con IA",
    "Desarrollo completo realizado con IA",
    "Programación realizada mediante IA",
    "Diseño del gameplay realizado con IA",
    "Recursos gráficos generados con IA",
    "Recursos sonoros extraídos de Youtube mediante IA",
    "Optimización realizada con IA",
    "Balance del juego realizado con IA",
    "Testing realizado mediante IA",
    "Todo el contenido ha sido ensamblado mediante IA",
    "Dragon Ball Infinity",
    "Gracias por acompañarme en este proyecto"
];

const HERO_PAIRS = [
    ["Goku","SSJ"],
    ["SSJ3","SSJGod"],
    ["SSJBlue","Ultra Instinto"],
    ["Baba","Shenron"]
];

// PEGAR AQUÍ

const CREDIT_MESSAGES = [
    "Juego creado íntegramente con IA",
    "Programación realizada con IA",
    "Arte generado con IA",
    "Recursos sonoros extraídos de Youtube mediante IA",
    "Diseño y desarrollo realizado con IA",
    "Dragon Ball Infinity"
];

const CREDIT_CHARACTERS = [

    "raditz",
    "nappa",
    "vegeta",
    "ozaru",

    "Guldo",
    "Recoome",
    "Ginyu",
    "Freezer",
    "Freezer100%",

    "A-18",
    "Cell",
    "A-17",
    "PerfectCell",

    "Dabra",
    "Majin Vegeta",
    "Buu",
    "Buuhan",
    "Majin Buu",

    "Bills",
    "Wish",
    "GoldenFreezer",
    "Hit",
    "GokuBlack",
    "GokuRose",
    "Zamas",
    "Kefla",
    "Dyspo",
    "Toppo",
    "jiren"
];


const bossSprites = {};

for(const name of CREDIT_CHARACTERS){
    const img = new Image();
    img.src = "assets/bosses/" + name + ".png";
    bossSprites[name] = img;
}

const heroSprites = {};

[
    "Goku",
    "SSJ",
    "SSJ3",
    "SSJGod",
    "SSJBlue",
    "Ultra Instinto"
].forEach(name=>{
    const img = new Image();
    img.src = "assets/personajes/" + name + ".png";
    heroSprites[name] = img;
});

heroSprites.Baba = new Image();
heroSprites.Baba.src = "assets/baba.png";

heroSprites.Shenron = new Image();
heroSprites.Shenron.src = "assets/Shenron.png";

const finalLogo = new Image();
finalLogo.src = "assets/dmp-blanco.png";

const creditsMusic = new Audio("audio/db1.MP3");
creditsMusic.loop = false;
creditsMusic.volume = 1;

function exitCredits(){



    if(window.storyEndingCredits && window.storyEndingCredits()){

    window.clearStoryEndingCredits();

    stop();

    window.showStoryCompletedScreen();

    return;

}


    stop();

    if(window.startOverlay){

        startOverlay.style.display = "flex";

    }

    if(window.renderStartMenu){

        renderStartMenu();

    }

}

function onKey(e){

    if(!running) return;

    if(
        e.key==="Escape" ||
        e.key==="Enter"
    ){
        exitCredits();
    }

}

function onClick(){

    if(!running) return;

    exitCredits();

}



function begin(){

  



    running = true;

    window.storyCreditsFinished = false;
  

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);

    creditsMusic.currentTime = 0;
    creditsMusic.play().catch(()=>{});

    startedAt = performance.now();

    phase = 0;

    phaseStartedAt = startedAt;

    bossIndex = 0;

    pairIndex = 0;

    side = 1;

}

function stop(){

    running = false;

    creditsMusic.pause();
    creditsMusic.currentTime = 0;

}

function update(now){

    if(!running) return;

    const elapsed = now - phaseStartedAt;

     if(window.closeCreditsRequested){
        window.closeCreditsRequested = false;
        stop();
        if(window.startOverlay){
            window.startOverlay.style.display = "flex";
        }
        return;
    }

    switch(phase){

        // Bosses
        case 0:

            if(elapsed>=3000){

                bossIndex++;

                side*=-1;

                phaseStartedAt=now;

                if(bossIndex>=CREDIT_CHARACTERS.length){

                    phase=1;

                    pairIndex=0;

                    phaseStartedAt=now;

                }

            }

        break;

        // Parejas
        case 1:

            if(elapsed>=5000){

                pairIndex++;

                phaseStartedAt=now;

                if(pairIndex>=HERO_PAIRS.length){

                    phase=2;

                    phaseStartedAt=now;

                }

            }

        break;

        // Pantalla final
        case 2:

    if(elapsed>=6000){

        window.storyCreditsFinished = true;

        exitCredits();

    }

    break;

    }

}

function render(ctx){

  

    if(!running) return;

    ctx.fillStyle="#000";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.textAlign="center";
    ctx.textBaseline="middle";

    //----------------------------------
    // BOSSES
    //----------------------------------

    if(phase===0){

        const name=CREDIT_CHARACTERS[bossIndex];
        const img=bossSprites[name];

        const elapsed=performance.now()-phaseStartedAt;

        let alpha=1;

        if(elapsed<300) alpha=elapsed/300;
        else if(elapsed>2700) alpha=(3000-elapsed)/300;

        alpha=Math.max(0,Math.min(1,alpha));

      const slide = (1-alpha)*40;

        ctx.globalAlpha=alpha;

        if(side>0){

            // texto izquierda

            ctx.fillStyle="#ffffff";
            ctx.font="34px Arial";

ctx.shadowColor = "#000";
ctx.shadowBlur = 14;
ctx.shadowOffsetX = 3;
ctx.shadowOffsetY = 3;

     ctx.fillStyle="#ffffff";
ctx.font="34px Arial";

ctx.shadowColor="#000";
ctx.shadowBlur=14;
ctx.shadowOffsetX=3;
ctx.shadowOffsetY=3;

ctx.fillText(
    CREDIT_MESSAGES[bossIndex % CREDIT_MESSAGES.length],
    canvas.width / 2,
    canvas.height / 2
);

ctx.shadowBlur=0;
ctx.shadowOffsetX=0;
ctx.shadowOffsetY=0;    

ctx.shadowBlur = 0;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;

            // sprite derecha

            if(img.complete){

                let x = canvas.width*0.73;

if(elapsed<300)
    x += slide;

if(elapsed>2700)
    x += (elapsed-2700)/300*40;

                const y=canvas.height/2;

                // Destello de aparición

if(elapsed < 100){

    const flash = 1 - elapsed/100;

    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = flash;

    ctx.beginPath();
    ctx.arc(
        canvas.width*0.73,
        canvas.height/2,
        170,
        0,
        Math.PI*2
    );
    ctx.fill();

    ctx.globalAlpha = alpha;

}

                ctx.drawImage(
                    img,
                    x-150,
                    y-150,
                    300,
                    300
                );

            }

        }else{

            // sprite izquierda

            if(img.complete){

              let x = canvas.width*0.27;

if(elapsed<300)
    x -= slide;

if(elapsed>2700)
    x -= (elapsed-2700)/300*40; 

                const y=canvas.height/2;

                // Destello de aparición

if(elapsed < 100){

    const flash = 1 - elapsed/100;

    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = flash;

    ctx.beginPath();
    ctx.arc(
        canvas.width*0.27,
        canvas.height/2,
        170,
        0,
        Math.PI*2
    );
    ctx.fill();

    ctx.globalAlpha = alpha;

}

                ctx.drawImage(
                    img,
                    x-150,
                    y-150,
                    300,
                    300
                );

            }

            // texto derecha

            ctx.fillStyle="#ffffff";
            ctx.font="34px Arial";

            ctx.fillText(
    CREDIT_MESSAGES[bossIndex % CREDIT_MESSAGES.length],
    canvas.width / 2,
    canvas.height / 2
);

        }

        ctx.globalAlpha=1;

        return;

    }

    //----------------------------------
    // PAREJAS
    //----------------------------------

    if(phase===1){

        const pair=HERO_PAIRS[pairIndex];
      

        const left=heroSprites[pair[0]];
        const right=heroSprites[pair[1]];

        const elapsed=performance.now()-phaseStartedAt;

        let alpha=1;

        if(elapsed<300) alpha=elapsed/300;
        else if(elapsed>4700) alpha=(5000-elapsed)/300;

        alpha=Math.max(0,Math.min(1,alpha));

        ctx.globalAlpha=alpha;

        if(left && left.complete){

            ctx.drawImage(
                left,
                canvas.width*0.18-120,
                canvas.height/2-120,
                240,
                240
            );

        }

        if(right && right.complete){

            ctx.drawImage(
                right,
                canvas.width*0.82-120,
                canvas.height/2-120,
                240,
                240
            );

        }

        ctx.globalAlpha=1;

        return;

    }

    //----------------------------------
    // FINAL
    //----------------------------------

    const elapsed=performance.now()-phaseStartedAt;

    let alpha=1;

    if(elapsed<1000) alpha=elapsed/1000;
    else if(elapsed>5000) alpha=(6000-elapsed)/1000;

    alpha=Math.max(0,Math.min(1,alpha));

    ctx.globalAlpha=alpha;

    if(finalLogo.complete){

        ctx.drawImage(
            finalLogo,
            canvas.width/2-180,
            canvas.height/2-120,
            360,
            180
        );

    }

    ctx.fillStyle="#fff";

    ctx.font="42px Arial";

    ctx.fillText(
        "Gracias por jugar",
        canvas.width/2,
        canvas.height*0.76
    );

    ctx.font="22px Arial";

    ctx.fillText(
        "2026",
        canvas.width/2,
        canvas.height*0.86
    );

    ctx.globalAlpha=1;

}

global.CreditsScene = {

    begin,
    stop,
    update,
    render,

    get running(){
        return running;
    }

};

})(window);