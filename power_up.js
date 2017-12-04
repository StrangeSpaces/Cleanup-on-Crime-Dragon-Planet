PowerUp.prototype = Object.create(Entity.prototype);
PowerUp.prototype.parent = Entity.prototype;

POWER_UP = 100;

function PowerUp(pos) {
    Entity.call(this, 'tiles', 16, 16);
    this.halfWidth = 1;
    this.age = 0;

    this.type = POWER_UP;
    this.dir = RIGHT;

    this.states = {
        idle: {
            frames: [
                { duration: 6, frame: 0 },
            ],
        },
    }

    this.pos.x = pos.x;
    this.pos.y = pos.y + 8;

    this.behavior = new Behavior(this.states, this);
};

PowerUp.prototype.update = function() {
    this.age++;

    this.behavior.update(1);
    this.frameNumber = this.behavior.frame.frame;

    Entity.prototype.update.call(this);
};

