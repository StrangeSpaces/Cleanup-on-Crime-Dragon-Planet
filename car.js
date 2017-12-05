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
    this.pos.y = logicalHeight - 16 - 24;
    this.vel.x = -2;

    this.behavior = new Behavior(this.states, this);

    this.moveThroughWalls = true;

    this.star = Math.floor(STARS);
    this.spawn = this.star;
    AMOUNT += this.star;

    this.updateGraphics();
};

Car.prototype.update = function() {
    if (this.pos.x < logicalWidth) {
        if (!this.played) {
            siren.play();
            this.played = true;
        }
    }

    this.behavior.update(1);
    this.frameNumber = this.behavior.frame.frame;

    if (this.pos.x < logicalWidth*(this.spawn)/(1+this.star) && this.spawn > 0) {
            var pol = new Police();
            pol.pos.y = this.pos.y;
            pol.pos.x = this.pos.x;
            entities.push(pol);
            pol.updateGraphics();
            this.spawn--;
    }

    if (this.pos.x < -50) {
        this.dead = true;
    }

    Entity.prototype.update.call(this);
};

