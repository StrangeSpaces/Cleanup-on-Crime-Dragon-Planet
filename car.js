Car.prototype = Object.create(Entity.prototype);
Car.prototype.parent = Entity.prototype;

var LEFT = -1;
var RIGHT = 1;

function Car() {
    Entity.call(this, 'car', 48, 48);

    this.type = null;
    this.dir = RIGHT;

    this.states = {
        idle: {
            frames: [
                { duration: 6, frame: 0 },
                { duration: 6, frame: 1 },
                { duration: 6, frame: 2 },
                { duration: 6, frame: 3 },
            ],
        },
    }

    this.pos.x = logicalWidth + 25;
    this.pos.y = logicalHeight - 32 - 24;
    this.vel.x = -2;

    this.behavior = new Behavior(this.states, this);
    this.spawn = true;

    this.moveThroughWalls = true;

    AMOUNT++;
};

Car.prototype.update = function() {
    this.behavior.update(1);
    this.frameNumber = this.behavior.frame.frame;

    if (this.pos.x < logicalWidth/2 && this.spawn) {
        var pol = new Police();
        pol.pos.y = this.pos.y;
        pol.pos.x = this.pos.x;
        entities.push(pol);
        this.spawn = false;
    }

    Entity.prototype.update.call(this);
};

