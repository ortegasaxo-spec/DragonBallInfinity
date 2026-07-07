(function(global){
  class CollisionSystem {
    isVisibleRect(canvas, x, y, w, h) {
      return x + w >= 0 && x <= canvas.width && y + h >= 0 && y <= canvas.height;
    }

    isVisibleCircle(canvas, x, y, r) {
      return x + r >= 0 && x - r <= canvas.width && y + r >= 0 && y - r <= canvas.height;
    }

   aabbHit(player, e, getHitbox) {

    const hb = getHitbox(e);

    const playerW = 34;
    const playerH = 112;

    const left   = player.x - playerW / 2;
    const right  = player.x + playerW / 2;
    const top    = player.y - playerH / 2;
    const bottom = player.y + playerH / 2;

    const centerX = e.x;
    const centerY = e.y;

    if (hb.shape === 'ellipse') {

        const rx = hb.w / 2 + playerW / 2;
        const ry = hb.h / 2 + playerH / 2;

        const dx = player.x - centerX;
        const dy = player.y - centerY;

        return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
    }

    return (
        right > centerX - hb.w / 2 &&
        left < centerX + hb.w / 2 &&
        bottom > centerY - hb.h / 2 &&
        top < centerY + hb.h / 2
    );
}
   
}

  global.CollisionSystem = CollisionSystem;
})(window);
