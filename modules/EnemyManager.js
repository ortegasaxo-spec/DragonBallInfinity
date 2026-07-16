(function(global){

class EnemyManager {

renderEnemies(ctx, state, assets) {

const {
    enemies,
    player,
    bossImages,
    asteroidImg,
    shooterAsteroidImg,
    drawCleanSprite
} = state;

const { halozamasImg } = assets || {};

if (!this._mirroredEnemyImgs)
    this._mirroredEnemyImgs = { asteroid:null, comet:null };

const getMirroredImage = (img, slot)=>{

    if(!img || !img.complete || !img.naturalWidth) return null;

    const cached=this._mirroredEnemyImgs[slot];
    if(cached && cached.src===img) return cached.mirrored;

    const w=img.naturalWidth;
    const h=img.naturalHeight;

    const canvas=
        typeof OffscreenCanvas!=="undefined"
        ? new OffscreenCanvas(w,h)
        : (()=>{

            const c=document.createElement("canvas");
            c.width=w;
            c.height=h;
            return c;

        })();

    const cctx=canvas.getContext("2d");

    cctx.translate(w,0);
    cctx.scale(-1,1);
    cctx.drawImage(img,0,0,w,h);

    this._mirroredEnemyImgs[slot]={
        src:img,
        mirrored:canvas
    };

    return canvas;

};

for(let i=0;i<enemies.length;i++){

    const e=enemies[i];

    if(e.dead) continue;

    const cometScale=6.75;
    const cometAspect=1024/1536;

    const drawWidth=
        e.shoot
        ? e.size*2*cometScale
        : e.size*2*1.125;

    const drawHeight=
        e.shoot
        ? e.size*2*cometScale*cometAspect
        : e.size*2*1.125;

    if(
        !this.isVisible(
            state.canvas,
            e.x-drawWidth/2,
            e.y-drawHeight/2,
            drawWidth,
            drawHeight
        )
    ) continue;

    if(e.type==="boss"){

        ctx.save();

        ctx.translate(e.x,e.y);

        if(
            (e.specialKey||"").toLowerCase()==="zamas" &&
            e.zamasHalo &&
            halozamasImg &&
            halozamasImg.complete
        ){

            const s=e.zamasHalo.size;

            drawCleanSprite(
                halozamasImg,
                -s/2,
                -s/2,
                s,
                s
            );

        }

                const bossImg = e.bossName
            ? bossImages[e.bossName]
            : null;

        if (bossImg && bossImg.complete && bossImg.naturalWidth) {

            const clean = getCleanSprite(bossImg);

const baseWidth = clean.width;
const baseHeight = clean.height;

// Goku mide 158 px.
// Los sprites de 1000 px deben medir un 10% más.
const TARGET_BOSS_1000_HEIGHT = 200;

// Escala basada en que un sprite de 1000 px pase a medir 174 px.
const scale = TARGET_BOSS_1000_HEIGHT / 1000;

const drawW = baseWidth * scale;
const drawH = baseHeight * scale;

e.drawW = drawW;
e.drawH = drawH;

console.log(
    e.bossName,
    clean.width,
    clean.height,
    drawW,
    drawH
);

drawSpriteFacing(
    bossImg,
    -drawW / 2,
    -drawH / 2,
    drawW,
    drawH,
    player.x < e.x
);
        } else {

            ctx.fillStyle = "gray";

            ctx.fillRect(
                -e.size,
                -e.size,
                e.size * 2,
                e.size * 2
            );

        }

        ctx.restore();
        continue;
    }

    // ===== Enemigos normales =====

    const baseImg=e.shoot
        ? shooterAsteroidImg
        : asteroidImg;

    if(baseImg && baseImg.complete && baseImg.naturalWidth){

        const faceLeft=player.x>e.x;

        const mirroredImg=getMirroredImage(
            baseImg,
            e.shoot ? "comet" : "asteroid"
        );

        const imgToDraw=
            (faceLeft && mirroredImg)
            ? mirroredImg
            : baseImg;

        ctx.drawImage(
            imgToDraw,
            e.x-drawWidth/2,
            e.y-drawHeight/2,
            drawWidth,
            drawHeight
        );

    }else{

        ctx.fillStyle="gray";

        ctx.fillRect(
            e.x-e.size,
            e.y-e.size,
            e.size*2,
            e.size*2
        );

    }

}

}

isVisible(canvas,x,y,w,h){

    return (
        x+w>=0 &&
        x<=canvas.width &&
        y+h>=0 &&
        y<=canvas.height
    );

}

}

global.EnemyManager=EnemyManager;

})(window);
