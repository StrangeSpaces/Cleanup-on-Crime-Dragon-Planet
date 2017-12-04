var logicalWidth = 336;
var logicalHeight = 208;

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

function pad(num, size) {
    var s = Math.abs(num)+"";
    while (s.length < size) s = "0" + s;
    if (num < 0) s = "-" + s;
    return s;
}

var tick_count = 1;
STARS = 0;
STAR_DISPLAY = 0;
function animate() {
    STARS = Math.max(STARS - 0.0003, 0);
    if (AMOUNT == 0 || (++tick_count >= 10 * 60 && wave+1 <= waves[levelNum].count)) {
        if (wave++ < waves[levelNum].count) {
            tick_count = 0;
            for (var i=0; i < waves[levelNum].amount; i++) {
                entities.push(new Puncher());
            }
        } else {
            levelNum++;
            start();
        }
    }

    updateFocus();
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
            if (obj.hp_sprite) {
              obj.hp_sprite.destroy();
              obj.icon_sprite.destroy();
            }
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

    if (STAR_DISPLAY < STARS) {
      STAR_DISPLAY = Math.min(STARS, STAR_DISPLAY + 0.025);
    } else {
      STAR_DISPLAY = Math.max(STARS, STAR_DISPLAY - 0.025);
    }
    for (var i = fillers.length - 1; i >= 0; i--) {
      var amount = Math.min(Math.max(STAR_DISPLAY - i, 0), 1); 
      fillers[i].texture.frame = new PIXI.Rectangle(32, 0, 9 + Math.floor(13*amount), 32);
    }

    score.text = pad(scoreAmount, 6);

    frontContainer.position.x = currentContainer.position.x;
    frontContainer.position.y = currentContainer.position.y;

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
    // f();
}

function start() {
    LF = [];
    RF = [];

    leftPunch = null;
    rightPunch = null;

    wave = 0;
    AMOUNT = 0;
    tick_count = 1;

    // mainContainer.alpha = 0;
    // frontContainer.alpha = 0;
    // uiContainer.alpha = 0;

    if (player && player.hp <= 0) {
        levelNum = 0;
        STARS = 0;
        STAR_DISPLAY = 0;
        scoreAmount = 0;

        mainContainer.removeChildren();
        frontContainer.removeChildren();

        mainContainer.addChild(new PIXI.Sprite(new PIXI.Texture(resources['bg'].texture)));
    }

    loadLevel();

    if (player && player.hp > 0) {
        mainContainer.addChild(player.sprite);
        mainContainer.addChild(player.hp_sprite);
    } else {
        entities.length = 0;
        player = new Player();
        entities.push(player);
    }
};

function init() {
  renderer = PIXI.autoDetectRenderer(logicalWidth, logicalHeight, {
    roundPixels: true,
    resolution: window.devicePixelRatio || 1,
    backgroundColor: 0x240106,
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
             .add('bg', 'imgs/bg.png')
             .add('ui', 'imgs/ui.png')
             .add('eneg', 'imgs/eneg.png')
             .add('dragon', 'imgs/dragon.png')
             .add('dragon_boxes', 'imgs/dragon_hitbox.png')
             .add('police', 'imgs/police.png')
             .add('police_boxes', 'imgs/police_hitbox.png')
             .add('car', 'imgs/car.png')
             .add('icons', 'imgs/icons.png')
             .add('particles', 'imgs/particles.png')
             .add('logo', 'imgs/logo.png')
             .add('cb', 'imgs/crab_hitbox.png')
             .add('jane', 'imgs/jane_sheet.png')
             .add('stars', 'imgs/stars.png')
             .add('pickups', 'imgs/pickups.png')
             .add('projectile', 'imgs/projectiles.png')
             .add('kenpixel', 'imgs/ken.fnt')
             .add('ealpha', 'imgs/ealpha.png').load(function (loader, res) {
      resources = res;

      window.focus();

      track({
          event: 'Started',
          properties: {}
      });

      scoreAmount = 0;
      border = new PIXI.Sprite(new PIXI.Texture(resources['ui'].texture, new PIXI.Rectangle(0, 0, 48, 32)));
      uiContainer.addChild(border);

      power = new PIXI.Sprite(new PIXI.Texture(resources['ui'].texture, new PIXI.Rectangle(0, 32, 48, 32)));
      uiContainer.addChild(power);

      score = new PIXI.extras.BitmapText('000000', { font: '16px KenPixel Mini', align: 'right' });
      score.position.x = logicalWidth - 55;
      uiContainer.addChild(score);
      mainContainer.addChild(new PIXI.Sprite(new PIXI.Texture(resources['bg'].texture)));

      stars = [
        new PIXI.Sprite(new PIXI.Texture(resources['stars'].texture, new PIXI.Rectangle(0, 0, 32, 32))),
        new PIXI.Sprite(new PIXI.Texture(resources['stars'].texture, new PIXI.Rectangle(0, 0, 32, 32))),
        new PIXI.Sprite(new PIXI.Texture(resources['stars'].texture, new PIXI.Rectangle(0, 0, 32, 32))),
        new PIXI.Sprite(new PIXI.Texture(resources['stars'].texture, new PIXI.Rectangle(0, 0, 32, 32))),
        new PIXI.Sprite(new PIXI.Texture(resources['stars'].texture, new PIXI.Rectangle(0, 0, 32, 32))),
      ]

      fillers = [
        new PIXI.Sprite(new PIXI.Texture(resources['stars'].texture, new PIXI.Rectangle(32, 0, 0, 32))),
        new PIXI.Sprite(new PIXI.Texture(resources['stars'].texture, new PIXI.Rectangle(32, 0, 0, 32))),
        new PIXI.Sprite(new PIXI.Texture(resources['stars'].texture, new PIXI.Rectangle(32, 0, 0, 32))),
        new PIXI.Sprite(new PIXI.Texture(resources['stars'].texture, new PIXI.Rectangle(32, 0, 0, 32))),
        new PIXI.Sprite(new PIXI.Texture(resources['stars'].texture, new PIXI.Rectangle(32, 0, 0, 32))),
      ]

      for (var i = stars.length - 1; i >= 0; i--) {
        uiContainer.addChild(stars[i]);
        uiContainer.addChild(fillers[i]);
        fillers[i].position.x = stars[i].position.x = i * 24 + 100;
      }

      start();

      // kick off the animation loop (defined below)
      animate();
  });
};

init();
