(function(global){
  class Renderer {
    constructor(canvas, ctx) {
      this.canvas = canvas;
      this.ctx = ctx;
    }

    clear() {
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground(stars, stars2, stars3) {
      this.ctx.fillStyle = 'white';
      for (let idx = 0; idx < 3; idx++) {
        const arr = [stars, stars2, stars3][idx];
        for (let i = 0; i < arr.length; i++) {
          const s = arr[i];
          s.y += 0.2 + idx * 0.3;
          if (s.y > this.canvas.height) s.y = 0;
          this.ctx.fillRect(s.x, s.y, s.r, s.r);
        }
      }
    }

    drawHudCounters(state, assets) {
      const { ctx } = this;
      ctx.save();
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.font = '18px Arial';
      ctx.fillStyle = 'white';
      const baseX = this.canvas.width - 20;
      const baseY = this.canvas.height - 24;
      if (assets.babaImg && assets.babaImg.complete && assets.babaImg.naturalWidth) { ctx.drawImage(assets.babaImg, baseX - 34, baseY - 16, 28, 28); }
      ctx.fillText(String(state.extraLives), baseX - 32, baseY - 1);
      const dragonY = this.canvas.height - 58;
      if (assets.dragonBallDropImg && assets.dragonBallDropImg.complete && assets.dragonBallDropImg.naturalWidth) { ctx.drawImage(assets.dragonBallDropImg, baseX - 34, dragonY - 16, 28, 28); }
      ctx.fillText(`${state.dragonballCount}/7`, baseX - 32, dragonY - 1);
      ctx.restore();
    }
  }

  global.Renderer = Renderer;
})(window);
