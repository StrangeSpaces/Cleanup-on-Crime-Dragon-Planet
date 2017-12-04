START = 500;

function Start() {
    this.pos = new Vec(logicalWidth / 2, logicalHeight / 2 + 60);
    this.vel = new Vec(0, 0);

    this.halfWidth = 1;
    this.age = 0;

    this.type = START;

    this.states = {
        idle: {
            frames: [
                { duration: 6, frame: 0 },
            ],
        },
    }

    this.behavior = new Behavior(this.states, this);
    this.moveThroughWalls = true;

    this.sprite = new PIXI.extras.BitmapText('START', { font: '16px KenPixel Blocks', align: 'center' });
    this.sprite.anchor.x = 0.5;
    currentContainer.addChild(this.sprite);

    this.updateGraphics();

    AMOUNT++;

    this.destroy = 60 * 60 * 60;

    this.frameNumber = 0;
    this.hitstun = 0;
    this.dir = 1;

    this.boxes = [
        [
            [new Box(this, 0, 0, 20, 8)],
            [],
        ]
    ]
    this.start_y = this.pos.y;
    this.age = 0;
};

Start.prototype.updateGraphics = function() {
    this.sprite.position.x = this.pos.x;
    this.sprite.position.y = this.pos.y;
}

Start.prototype.update = function() {
    if (--this.destroy <= 0) {
        this.dead = true;
        player.power = 0;
        AMOUNT--;
    } else if (this.destroy <= 60) {
        if (Math.floor(this.destroy / 5) % 2 == 0) {
            this.sprite.alpha = 0;
        } else {
            this.sprite.alpha = 1;
        }
    }

    this.pos.y = this.start_y + Math.sin(++this.age/20)*2;

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    this.updateGraphics();
};

