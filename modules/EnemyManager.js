(function(global){
  class EnemyManager {
    renderEnemies(ctx, state, assets) {
      const { enemies, player, bossImages, asteroidImg, shooterAsteroidImg, drawCleanSprite } = state;
      const { halozamasImg } = assets || {};

      if (!this._mirroredEnemyImgs) this._mirroredEnemyImgs = { asteroid: null, comet: null };
      const getMirroredImage = (img, slot) => {
        if (!img || !img.complete || !img.naturalWidth) return null;
        const cached = this._mirroredEnemyImgs[slot];
        if (cached && cached.src === img) return cached.mirrored;

        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const mirrorCanvas = typeof OffscreenCanvas !== 'undefined'
          ? new OffscreenCanvas(w, h)
          : (() => {
              const c = document.createElement('canvas');
              c.width = w;
              c.height = h;
              return c;
            })();
        const mctx = mirrorCanvas.getContext('2d');
        mctx.translate(w, 0);
        mctx.scale(-1, 1);
        mctx.drawImage(img, 0, 0, w, h);

        this._mirroredEnemyImgs[slot] = { src: img, mirrored: mirrorCanvas };
        return mirrorCanvas;
      };

      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (e.dead) continue;
        const scale = e.type === 'boss'
          ? ((e.bossName || '').includes('ozaru') ? 4.725 : 2.3625)
          : 1.125;
        const cometScale = 6.75;
        const cometAspect = 1024 / 1536;
        const drawWidth = e.type === 'boss'
          ? e.size * 2 * scale
          : e.shoot
            ? e.size * 2 * cometScale
            : e.size * 2 * scale;
        const drawHeight = e.type === 'boss'
          ? e.size * 2 * scale
          : e.shoot
            ? e.size * 2 * cometScale * cometAspect
            : e.size * 2 * scale;
          if (!this.isVisible(state.canvas, e.x - drawWidth / 2, e.y - drawHeight / 2, drawWidth, drawHeight)) continue;

          if (e.type === 'boss') {
          ctx.save();
          ctx.translate(e.x, e.y);

          if (window.player && window.player.x > e.x)
          ctx.scale(-1, 1);

          if (window.player && window.player.x < e.x)
          ctx.scale(-1, 1);

          if ((e.specialKey || '').toLowerCase() === 'zamas' && e.zamasHalo && e.zamasHalo.size && halozamasImg && halozamasImg.complete && halozamasImg.naturalWidth) {
            const haloSize = e.zamasHalo.size;
            drawCleanSprite(halozamasImg, -haloSize / 2, -haloSize / 2, haloSize, haloSize);
          }

          const bossImg = e.bossName ? bossImages[e.bossName] : null;
          if (bossImg && bossImg.complete && bossImg.naturalWidth) {
          drawSpriteFacing(
    bossImg,
    -e.size * scale,
    -e.size * scale,
    e.size * 2 * scale,
    e.size * 2 * scale,
    player.x < e.x
);
          } else {
            ctx.fillStyle = 'gray';
            ctx.fillRect(-e.size, -e.size, e.size * 2, e.size * 2);
          }
          ctx.restore();
          continue;
        }

        const baseImg = e.shoot ? shooterAsteroidImg : asteroidImg;
        if (baseImg && baseImg.complete && baseImg.naturalWidth) {
          const faceLeft = player.x > e.x;
          const mirroredImg = getMirroredImage(baseImg, e.shoot ? 'comet' : 'asteroid');
          const imgToDraw = (faceLeft && mirroredImg) ? mirroredImg : baseImg;
          ctx.drawImage(imgToDraw, e.x - drawWidth / 2, e.y - drawHeight / 2, drawWidth, drawHeight);
        } else {
          ctx.fillStyle = 'gray';
          ctx.fillRect(e.x - e.size, e.y - e.size, e.size * 2, e.size * 2);
        }
      }
    }

    isVisible(canvas, x, y, w, h) {
      return x + w >= 0 && x <= canvas.width && y + h >= 0 && y <= canvas.height;
    }
  }

  global.EnemyManager = EnemyManager;
})(window);
