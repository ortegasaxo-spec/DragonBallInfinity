(function(global){
  class PlayerController {
    constructor(player, canvas) {
      this.player = player;
      this.canvas = canvas;
    }

    clampToCanvas() {
      if (!this.player) return;
      this.player.x = Math.max(this.player.r, Math.min(this.canvas.width - this.player.r, this.player.x));
      this.player.y = Math.max(this.player.r, Math.min(this.canvas.height - this.player.r, this.player.y));
    }

    getHitbox(e) {
      if (!e) return { w: 0, h: 0, shape: 'rect' };
      if (e.type === 'boss') {

  const n = (e.bossName || '').toLowerCase();

  if (n.includes('ozaru')) {
    return {
        w: (e.drawW || 0) * 0.75,
        h: (e.drawH || 0) * 0.80,
        shape: 'ellipse'
    };
}

  let scale = 1;

  if (
      n === 'bills' ||
      n === 'dyspo' ||
      n === 'freezer' ||
      n === 'freezer100' ||
      n === 'goldenfreezer' ||
      n === 'vegeta' ||
      n === 'majinvegeta' ||
      n === 'kefla'
  ){
      scale = 0.67;
  }

  if (
      n === 'majinbuu' ||
      n === 'guldo'
  ){
      scale = 0.5;
  }

  return {
    w: (e.drawW || 0) * 0.715 * scale,
    h: (e.drawH || 0) * 0.952 * scale,
    shape: 'rect'
};
}
      const scale = 1.125;
      const cometScale = 4.5;
      const cometAspect = 1024 / 1536;
      const width = e.type === 'boss'
        ? e.size * 2 * scale 
        : e.shoot
          ? e.size * 2 * cometScale 
          : e.size * 2 * scale;
      const height = e.type === 'boss'
        ? e.size * 2 * scale
        : e.shoot
          ? e.size * 2 * cometScale * cometAspect * 0.75
          : e.size * 2 * scale;
      return { w: width, h: height, shape: 'rect' };
    }

    aabbHit(px, py, e) {
      const hb = this.getHitbox(e);
      if (hb.shape === 'ellipse') {
        const rx = hb.w / 2;
        const ry = hb.h / 2;
        const dx = px - e.x;
        const dy = py - e.y;
        return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
      }
      return Math.abs(px - e.x) < hb.w / 2 && Math.abs(py - e.y) < hb.h / 2;
    }
  }

  global.PlayerController = PlayerController;
})(window);
