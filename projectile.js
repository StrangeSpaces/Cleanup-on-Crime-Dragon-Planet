Projectile.prototype = Object.create(Entity.prototype);
Projectile.prototype.parent = Entity.prototype;

var LEFT = -1;
var RIGHT = 1;

function Projectile() {
    Entity.call(this, 'projectile', 32, 32);
    this.halfWidth = 8;
    this.halfHeight = 8;

    this.type = PROJECTILE;
    this.dir = RIGHT;

    this.bounces = 0;

    this.states = {
        idle: {
            frames: [
                { duration: 6, frame: 0 },
            ],
        },
    }

    this.boxes = [
        [
            [],
            [new Box(this, 0, 0, 8, 8)],
        ]
    ]

    this.behavior = new Behavior(this.states, this);
};

Projectile.prototype.hitGround = function() {
    Entity.prototype.hitGround.call(this);

    this.vel.y = -3.5;
    if (++this.bounces == 2) {
        this.dead = true;
    }
}

Projectile.prototype.update = function() {
    if (--this.age == 0) {
        this.dead = true;
        return;
    }

    this.vel.y += 0.1;

    this.behavior.update(1);
    this.frameNumber = this.behavior.frame.frame;
    this.sprite.scale.x = this.dir;

    this.landed = false;
    Entity.prototype.update.call(this);
};

