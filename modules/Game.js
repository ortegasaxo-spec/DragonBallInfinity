import { PlayerController } from './Player.js';
import { EnemyManager } from './EnemyManager.js';
import { ProjectileManager } from './ProjectileManager.js';
import { CollisionSystem } from './CollisionSystem.js';
import { Renderer } from './Renderer.js';
import { AudioManager } from './AudioManager.js';
import { UI } from './UI.js';

export class Game {
  constructor(root) {
    this.root = root;
    this.canvas = root.document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.playerController = new PlayerController(root.player, this.canvas);
    this.enemyManager = new EnemyManager();
    this.projectileManager = new ProjectileManager();
    this.collisionSystem = new CollisionSystem();
    this.renderer = new Renderer(this.canvas, this.ctx);
    this.audioManager = new AudioManager();
    this.ui = new UI(root.document, root);
  }

  clampPlayer() {
    this.playerController.clampToCanvas();
  }

  renderEnemies() {
    this.enemyManager.renderEnemies(this.ctx, this.root, {});
  }

  renderProjectiles() {
    this.projectileManager.renderProjectiles(this.ctx, this.root, {
      gokuShotImg: this.root.gokuShotImg,
      discoImg: this.root.discoImg,
      barrierImg: this.root.barrierImg,
      kameImg: this.root.kameImg,
      drawCleanSprite: this.root.drawCleanSprite
    });
  }

  renderBackground() {
    this.renderer.clear();
    // If root provides sceneImages (Infinity Mode), draw current scene stretched
    if (this.root && this.root.sceneImages && this.root.sceneImages.length) {
      const img = this.root.sceneImages[this.root.currentSceneIndex || 0];
      if (img && img.complete && img.naturalWidth) {
        const iw = img.naturalWidth, ih = img.naturalHeight;
        const sc = Math.max(this.canvas.width/iw, this.canvas.height/ih);
        const dw = iw*sc, dh = ih*sc;
        this.ctx.drawImage(img, (this.canvas.width-dw)/2, (this.canvas.height-dh)/2, dw, dh);
      }
    } else {
      this.renderer.drawBackground(this.root.stars, this.root.stars2, this.root.stars3);
    }
  }

  drawHudCounters() {
    this.renderer.drawHudCounters(this.root, {
      babaImg: this.root.babaImg,
      dragonBallDropImg: this.root.dragonBallDropImg
    });
  }

  updateHud() {
    this.ui.updateHud(this.root.hpEl, this.root.lvlEl, this.root.xpEl);
  }
}
