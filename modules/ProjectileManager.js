(function(global){
  class ProjectileManager {
    renderProjectiles(ctx, state, assets) {
      const {
  bullets,
  enemyBullets,
  particles,
  shieldOrbs,
  kienzanShots,
  dodonpaShots,
  kiExplosionEffect,
  kameProjectile,
  kamehamehaProjectile,
  canvas
} = state;
      const renderNow = state.getCurrentTime ? state.getCurrentTime() : performance.now();
      const {
    gokuShotImg,
    kameImg,
    kamehamehaImg,
    discoImg,
    barrierImg,
    drawCleanSprite
} = assets;

      const gokuShotStepDeg = 10;
      const gokuShotSteps = 360 / gokuShotStepDeg;
      const gokuShotPivotX = 64;
      const gokuShotPivotY = 21.5;
      const gokuShotCacheSize = 160;
      if (!this._gokuShotRotCache || this._gokuShotRotCache.stepDeg !== gokuShotStepDeg || this._gokuShotRotCache.size !== gokuShotCacheSize || this._gokuShotRotCache.img !== gokuShotImg) {
        const cacheCanvases = new Array(gokuShotSteps);
        for (let s = 0; s < gokuShotSteps; s++) {
          const tile = typeof OffscreenCanvas !== 'undefined'
            ? new OffscreenCanvas(gokuShotCacheSize, gokuShotCacheSize)
            : (() => {
                const c = document.createElement('canvas');
                c.width = gokuShotCacheSize;
                c.height = gokuShotCacheSize;
                return c;
              })();
          const tctx = tile.getContext('2d');
          const cx = gokuShotCacheSize / 2;
          const cy = gokuShotCacheSize / 2;
          tctx.translate(cx, cy);
          tctx.rotate((s * gokuShotStepDeg) * Math.PI / 180);
          tctx.drawImage(gokuShotImg, -gokuShotPivotX, -gokuShotPivotY, 64, 43);
          cacheCanvases[s] = tile;
        }
        this._gokuShotRotCache = {
          img: gokuShotImg,
          stepDeg: gokuShotStepDeg,
          size: gokuShotCacheSize,
          cx: gokuShotCacheSize / 2,
          cy: gokuShotCacheSize / 2,
          tiles: cacheCanvases
        };
      }

      for (let i = 0; i < bullets.length; i++) {
        const b = bullets[i];
        if (!this.isVisibleRect(canvas, b.x - 32, b.y - 21.5, 64, 43)) continue;
        const ang = Math.atan2(b.vy || 0, b.vx || 1);
        const deg = (ang * 180 / Math.PI + 360) % 360;
        const idx = Math.round(deg / gokuShotStepDeg) % gokuShotSteps;
        const tile = this._gokuShotRotCache.tiles[idx];
        ctx.drawImage(tile, b.x - this._gokuShotRotCache.cx, b.y - this._gokuShotRotCache.cy);
      }

      for (let i = 0; i < enemyBullets.length; i++) {
        const b = enemyBullets[i];
        if (b.type === 'beam') {
          if (!this.isVisibleSegment(canvas, b.fromX, b.fromY, b.toX, b.toY)) continue;
          ctx.save();
          ctx.strokeStyle = b.color || '#9b41ff';
          ctx.lineWidth = b.width || 8;
          ctx.beginPath();
          ctx.moveTo(b.fromX, b.fromY);
          ctx.lineTo(b.toX, b.toY);
          ctx.stroke();
          ctx.restore();
          continue;
        }
        if (b.type === 'cross') {
          if (!this.isVisibleRect(canvas, b.x - 1, b.y - 1, 2, 2)) continue;
          ctx.save();
          ctx.strokeStyle = b.color || '#ffffff';
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.moveTo(0, b.y);
          ctx.lineTo(canvas.width, b.y);
          ctx.moveTo(b.x, 0);
          ctx.lineTo(b.x, canvas.height);
          ctx.stroke();
          ctx.restore();
          continue;
        }
        if (b.img) {
          const baseSize = (b.radius || 12) * 2;

          let size = baseSize;

          if (b.type === 'garlic') {
            size = baseSize * 4;
          } else if (b.type === 'goldenFreezerRay') {
            size = baseSize * 2;
          }

          if (!this.isVisibleRect(canvas, b.x - size / 2, b.y - size / 2, size, size)) continue;

          if (b.type === 'garlic') {
            const facing = (b.vx || 0) < 0 ? -1 : 1;
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.scale(facing, 1);
            drawCleanSprite(b.img, -size / 2, -size / 2, size, size);
            ctx.restore();
          } else {
            ctx.save();
            ctx.translate(b.x, b.y);
          if (b.type === 'goldenFreezerRay')
            ctx.rotate(Math.atan2(b.vy || 0, b.vx || 1) + Math.PI);
            drawCleanSprite(b.img, -size / 2, -size / 2, size, size);
            ctx.restore();
          }

          continue;
        }
        if (!this.isVisibleCircle(canvas, b.x, b.y, b.radius || 8)) continue;
        ctx.fillStyle = b.color || '#8B5A2B';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      if (shieldOrbs && shieldOrbs.length) {
        for (let i = 0; i < shieldOrbs.length; i++) {
          const orb = shieldOrbs[i];
          if (!this.isVisibleCircle(canvas, orb.x, orb.y, 14)) continue;
          ctx.save();
          ctx.translate(orb.x, orb.y);
          ctx.strokeStyle = 'rgba(255,220,100,0.95)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 12 + Math.sin(renderNow * 0.01 + orb.angle) * 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,230,120,0.25)';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      if (kienzanShots && kienzanShots.length) {
        for (let i = 0; i < kienzanShots.length; i++) {
          const d = kienzanShots[i];
          if (!d || d.dead || !this.isVisibleCircle(canvas, d.x, d.y, 24)) continue;
          ctx.save();
          ctx.translate(d.x, d.y);
          ctx.rotate(Math.atan2(d.vy, d.vx));
          ctx.shadowBlur = 18;
          ctx.shadowColor = '#ffffff';
          if (discoImg && discoImg.complete && discoImg.naturalWidth) ctx.drawImage(discoImg, -24, -24, 48, 48);
          else { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill(); }
          ctx.restore();
        }
      }

      if (dodonpaShots && dodonpaShots.length) {
        for (let i = 0; i < dodonpaShots.length; i++) {
          const s = dodonpaShots[i];
          if (!s || !this.isVisibleSegment(canvas, s.fromX, s.fromY, s.x, s.y)) continue;
          ctx.save();
          ctx.strokeStyle = 'rgba(255,240,100,0.95)';
          ctx.lineWidth = 6;
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#fff3a0';
          ctx.beginPath();
          ctx.moveTo(s.fromX, s.fromY);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
          ctx.restore();
        }
      }

      if (kiExplosionEffect && this.isVisibleCircle(canvas, kiExplosionEffect.x, kiExplosionEffect.y, kiExplosionEffect.radius)) {
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.translate(kiExplosionEffect.x, kiExplosionEffect.y);
        ctx.strokeStyle = 'rgba(255,255,180,0.9)';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(0, 0, kiExplosionEffect.radius, 0, Math.PI * 2);
        ctx.stroke();
        if (barrierImg && barrierImg.complete && barrierImg.naturalWidth) ctx.drawImage(barrierImg, -kiExplosionEffect.radius, -kiExplosionEffect.radius, kiExplosionEffect.radius * 2, kiExplosionEffect.radius * 2);
        ctx.restore();
      }

      if (kameProjectile && this.isVisibleRect(canvas, kameProjectile.x - 40, kameProjectile.y - 80, 80, 160)) {
        const t = kameProjectile.target;
        const ang = Math.atan2(t.y - kameProjectile.y, t.x - kameProjectile.x) + Math.PI / 2;
        ctx.save();
        ctx.translate(kameProjectile.x, kameProjectile.y);
        ctx.rotate(ang);
        ctx.drawImage(assets. kameImg, -40, -80, 160, 160);
        ctx.restore();
      }
    if (kamehamehaProjectile && this.isVisibleRect(
    canvas,
    kamehamehaProjectile.x - 40,
    kamehamehaProjectile.y - 80,
    80,
    160
)){

    const ang =
        Math.atan2(
            kamehamehaProjectile.vy,
            kamehamehaProjectile.vx
        ) + Math.PI / 2;

    ctx.save();

    ctx.translate(
        kamehamehaProjectile.x,
        kamehamehaProjectile.y
    );

    ctx.rotate(ang);

    ctx.drawImage(
        kamehamehaImg,
        -40,
        -80,
        80,
        160
    );

    ctx.restore();
}  
    }

    renderParticles(ctx, state) {
      const { particles, canvas } = state;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!this.isVisibleRect(canvas, p.x, p.y, 4, 4)) continue;
        ctx.fillStyle = p.color || 'orange';
        ctx.fillRect(p.x, p.y, 4, 4);
      }
    }

    isVisibleRect(canvas, x, y, w, h) {
      return x + w >= 0 && x <= canvas.width && y + h >= 0 && y <= canvas.height;
    }

    isVisibleCircle(canvas, x, y, r) {
      return x + r >= 0 && x - r <= canvas.width && y + r >= 0 && y - r <= canvas.height;
    }

    isVisibleSegment(canvas, x1, y1, x2, y2) {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      return maxX >= 0 && minX <= canvas.width && maxY >= 0 && minY <= canvas.height;
    }
  }

  global.ProjectileManager = ProjectileManager;
})(window);
