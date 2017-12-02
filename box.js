Crate.prototype = Object.create(Entity.prototype);
Crate.prototype.parent = Entity.prototype;

var LEFT = -1;
var RIGHT = 1;

function Crate() {
    Entity.call(this, 'tiles', 16, 16);

    this.type = BOX;
    this.dir = RIGHT;

    this.states = {
        idle: {
            frames: [
                { duration: 6, frame: 0 },
            ],
        },
    }

    this.boxes = [
        [
            [new Box(this, 0, 0, 8, 8)],
            [],
        ]
    ]

    this.pos.x = 50;
    this.pos.y = 60;

    this.max_speed = 2;
    this.friction = 0.05;
    this.speed = 0.2

    this.behavior = new Behavior(this.states, this);
};

Crate.prototype.update = function() {
    if (this.vel.x > this.friction) {
        this.vel.x = Math.min(this.max_speed, this.vel.x - this.friction);
    } else if (this.vel.x < -this.friction) {
        this.vel.x = Math.max(-this.max_speed, this.vel.x + this.friction);
    } else {
        this.vel.x = 0;
    }
    this.vel.y += 0.2;

    this.behavior.update(1);
    this.frameNumber = this.behavior.frame.frame;
    this.sprite.scale.x = this.dir;

    this.landed = false;
    Entity.prototype.update.call(this);
};

