var logicalWidth = 320;
var logicalHeight = 232;

var renderer = null;
var stage = null;
var mainContainer = null;
var frontContainer = null;

var resources = null;

var entities = [];

var scaleFactor;
var SHAKE = 0;
var player;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function resizeHandler() {
  scaleFactor = Math.min(
    Math.floor(window.innerWidth / logicalWidth),
    Math.floor(window.innerHeight / logicalHeight)
  ) || 1;
  var newWidth = Math.ceil(logicalWidth * scaleFactor);
  var newHeight = Math.ceil(logicalHeight * scaleFactor);
  
  renderer.view.style.width = `${newWidth}px`;
  renderer.view.style.height = `${newHeight}px`;

  renderer.resize(newWidth, newHeight);
  mainContainer.scale.set(scaleFactor); 
  uiContainer.scale.set(scaleFactor);
  frontContainer.scale.set(scaleFactor);
};

function quadCollision() {
    var qt = new Quadtree();
    for (var i = entities.length - 1; i >= 0; i--) {
        qt.add(entities[i]);
    }
    qt.run();
}

function collision() {
    var length = this.entities.length;

    if (length == 0) return;

    for (var i = 0; i < length - 1; i++) {
        var entI = this.entities[i];

        for (var t = i + 1; t < length; t++) {
            CollisionHandler.handle(entI, this.entities[t]);
        }
    }
}

function animate() {
    for (var i = entities.length - 1; i >= 0; i--) {
        if (entities[i]) {
            if (entities[i].hitstun <= 0) {
                entities[i].update();
            } else {
                entities[i].hitstun--;
            }
        }
    }

    collision();

    entities = entities.filter(function( obj ) {
        if (obj.dead) {
            obj.sprite.destroy();
        }
        return !obj.dead;
    });

    for (var i = 0; i < entities.length; i++) {
        if (entities[i].dead) {
            entities[i].sprite.destroy();
            entities.splice(i, 1);
            i--;
        }
    }

    var oldX = currentContainer.position.x;
    var oldY = currentContainer.position.y;

    if (SHAKE > 0) {
        var ang = Math.random() * Math.PI * 2;
        currentContainer.position.x += Math.cos(ang) * SHAKE * scaleFactor;
        currentContainer.position.y += Math.sin(ang) * SHAKE * scaleFactor;

        SHAKE = Math.max(0, SHAKE - 0.2);
    }

    renderer.render(stage);

    currentContainer.position.x = oldX;
    currentContainer.position.y = oldY;

    // start the timer for the next animation loop
    requestAnimationFrame(animate);
};

function loadLevel() {
    currentContainer = mainContainer;

    // levelNum = -1;
    // if (levelNum >= levelOrder.length) {
    //     var logo = new PIXI.Sprite(new PIXI.Texture(resources['logo'].texture, logo));
    //     logo.anchor.x = 0.5;
    //     logo.anchor.y = 0.5;

    //     logo.position.x = logicalWidth / 2;
    //     logo.position.y = logicalHeight / 2;

    //     mainContainer.position.x = 0;
    //     mainContainer.position.y = 0;
    //     mainContainer.addChild(logo);
    // } else {
        setup();
        Tilemap.init();

    //     if (SX) {
    //         player.pos.x = SX;
    //         player.pos.y = SY;
    //     }
    //     entities.push(player);

        border = new PIXI.Sprite(new PIXI.Texture(resources['ui'].texture, new PIXI.Rectangle(0, 0, 48, 32)));
        uiContainer.addChild(border);

        power = new PIXI.Sprite(new PIXI.Texture(resources['ui'].texture, new PIXI.Rectangle(0, 32, 48, 32)));
        uiContainer.addChild(power);

    //     heart = new PIXI.Sprite(new PIXI.Texture(resources['ui'].texture, new PIXI.Rectangle(0, 64, 48, 32)));
    //     uiContainer.addChild(heart);
    // }

    var count = 0;

    var s = 30;

    var f = function() {
        count++;

        mainContainer.alpha = count / s;
        frontContainer.alpha = count / s;
        uiContainer.alpha = count / s;

        if (count == s) return;

        requestAnimationFrame(f);
    }
    f();
}

function start() {
    mainContainer.removeChildren();
    frontContainer.removeChildren();
    uiContainer.removeChildren();

    mainContainer.alpha = 0;
    frontContainer.alpha = 0;
    uiContainer.alpha = 0;
    entities.length = 0;

    loadLevel();

    player = new Player();
    entities.push(player);
    entities.push(new Puncher());
};

function init() {
  renderer = PIXI.autoDetectRenderer(logicalWidth, logicalHeight, {
    roundPixels: true,
    resolution: window.devicePixelRatio || 1,
    backgroundColor: 0x35211a,
  });
  renderer.view.id = 'pixi-canvas';
  
  PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
  
  stage = new PIXI.Container();
  mainContainer = new PIXI.Container();
  uiContainer = new PIXI.Container();
  frontContainer = new PIXI.Container();
  stage.addChild(mainContainer);
  stage.addChild(frontContainer);
  stage.addChild(uiContainer);
  
  document.body.appendChild(renderer.view);
  window.addEventListener('resize', resizeHandler, false);
  resizeHandler();
  
  PIXI.loader.add('tiles', 'imgs/tiles.png')
             .add('jane_boxes', 'imgs/jane_hitbox.png')
             .add('ui', 'imgs/ui.png')
             .add('eneg', 'imgs/eneg.png')
             .add('particles', 'imgs/particles.png')
             .add('logo', 'imgs/logo.png')
             .add('cb', 'imgs/crab_hitbox.png')
             .add('jane', 'imgs/jane_sheet.png')
             .add('ealpha', 'imgs/ealpha.png').load(function (loader, res) {
      resources = res;

      window.focus();

      track({
          event: 'Started',
          properties: {}
      });

      start();

      // kick off the animation loop (defined below)
      animate();
  });
};

init();
