window.gamepadManager=(function(){

const input={
    moveX:0,
    moveY:0,
    accept:false,
    dash:false,
    pause:false,
    up:false,
    down:false,
    left:false,
    right:false
};

const pressed={};

const dead=0.2;

let prev={
    accept:false,
    up:false,
    down:false,
    left:false,
    right:false,
    pause:false
};

function update(){

    const pads=navigator.getGamepads?navigator.getGamepads():[];
    const gp=[...pads].find(Boolean);

    if(!gp){

        Object.keys(input).forEach(k=>
            typeof input[k]=="boolean" ? input[k]=false : input[k]=0
        );

        Object.keys(pressed).forEach(k=>pressed[k]=false);

        requestAnimationFrame(update);
        return;
    }

    input.moveX=Math.abs(gp.axes[0])>dead?gp.axes[0]:0;
    input.moveY=Math.abs(gp.axes[1])>dead?gp.axes[1]:0;

    input.left=input.moveX<-dead||gp.buttons[14]?.pressed;
    input.right=input.moveX>dead||gp.buttons[15]?.pressed;
    input.up=input.moveY<-dead||gp.buttons[12]?.pressed;
    input.down=input.moveY>dead||gp.buttons[13]?.pressed;

    input.accept=gp.buttons[0]?.pressed;
    input.dash=input.accept;
    input.pause=gp.buttons[9]?.pressed;

    // Flanco de subida (just pressed)
    pressed.accept=input.accept&&!prev.accept;
    pressed.up=input.up&&!prev.up;
    pressed.down=input.down&&!prev.down;
    pressed.left=input.left&&!prev.left;
    pressed.right=input.right&&!prev.right;
    pressed.pause=input.pause&&!prev.pause;

    if (
    window.ui &&
    typeof window.ui.handleGamepad === "function" &&
    (
      (window.startOverlay && window.startOverlay.style.display === "flex") ||
       (window.pauseOverlay && window.pauseOverlay.style.display === "flex")
    )
){
   window.ui.handleGamepad();
}

    prev.accept=input.accept;
    prev.up=input.up;
    prev.down=input.down;
    prev.left=input.left;
    prev.right=input.right;
    prev.pause=input.pause;

    requestAnimationFrame(update);
}

function consume(name){

    if(!pressed[name]) return false;

    pressed[name]=false;

    return true;
}

requestAnimationFrame(update);

return{
    input,
    pressed,
    consume
};

})();