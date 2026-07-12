(function(global){
  class UI {
    constructor(documentRef, state) {
      this.document = documentRef;
      this.state = state;
      this.menuButtons = [];
      this.menuSelected = 0;
    }

    updateHud(hpEl, lvlEl, xpEl) {
      hpEl.textContent = `${Math.max(0, this.state.player.hp | 0)}/${this.state.player.maxHp}`;
      lvlEl.textContent = this.state.lvl;
      xpEl.textContent = `${this.state.xp}/${this.state.xpNeed}`;
    }

    renderPauseMenu(pauseOverlay, levelUpEl, getSuperTechLabel, getRunTime) {
      if (!pauseOverlay) return;
    const techSummary = Object.entries(this.state.superTechLevels)
    .map(([k, v]) =>
        '<span>' + getSuperTechLabel(k) + '</span><b>' + v + '</b>'
    )
    .join('');  
pauseOverlay.innerHTML =
'<div class="pause-card fullscreen">' +

    '<div class="pause-layout">' +

        '<div class="pause-side">' +

            '<img src="assets/pause.png">' +

        '</div>' +

        '<div class="pause-center">' +

            '<h2>Pausa</h2>' +

            '<div class="pause-stats">' +

                '<span>NV ' + this.state.lvl + '</span>' +

                '<span>' + this.state.kills + ' kills</span>' +

                '<span>' + getRunTime() + '</span>' +

            '</div>' +

            '<div class="pause-upgrades">' +

                '<div class="build-grid">' +

                    '<span>Daño</span><b>' + this.state.upgradeLevels.damage + '/' + this.state.upgradeMax.damage + '</b>' +

                    '<span>Cadencia</span><b>' + this.state.upgradeLevels.rate + '/' + this.state.upgradeMax.rate + '</b>' +

                    '<span>Velocidad</span><b>' + this.state.upgradeLevels.speed + '/' + this.state.upgradeMax.speed + '</b>' +

                    '<span>Vida</span><b>' + this.state.upgradeLevels.hp + '/' + this.state.upgradeMax.hp + '</b>' +

                    '<span>Disparo</span><b>' + this.state.upgradeLevels.bullets + '/' + this.state.upgradeMax.bullets + '</b>' +

                    '<span>Dragonballs</span><b>' + this.state.dragonballCount + '/7</b>' +

                    '<span>Vidas</span><b>' + this.state.extraLives + '</b>' +

                    '<span style="grid-column:1 / span 2;font-weight:bold;margin-top:10px;">Técnicas</span>' +

techSummary +

                '</div>' +

            '</div>' +

            '<div id="pauseMsg" class="menu-msg"></div>' +

            '<button id="resumeBtn">Continuar</button>' +

            '<button id="saveBtn">Guardar partida</button>' +

            '<button id="titleBtn">Salir al título</button>' +

        '</div>' +

        '<div class="pause-side right">' +

            '<img src="assets/pause.png">' +

        '</div>' +

    '</div>' +

'</div>';

      this.document.getElementById('resumeBtn').onclick = this.state.togglePauseMenu;
      this.document.getElementById('saveBtn').onclick = this.state.saveGame;
      this.document.getElementById('titleBtn').onclick = this.state.exitToTitle;
      const buttons = [
    this.document.getElementById('resumeBtn'),
    this.document.getElementById('saveBtn'),
    this.document.getElementById('titleBtn')
];

this.menuButtons = buttons;
this.menuSelected = 0;

buttons.forEach((b,i)=>{
    b.style.outline = i===0 ? '3px solid yellow' : '';
});
    }
  }

  global.UI = UI;
})(window);
