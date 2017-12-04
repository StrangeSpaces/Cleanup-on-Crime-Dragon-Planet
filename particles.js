Hit.prototype = Object.create(Entity.prototype);
Hit.prototype.parent = Entity.prototype;

function Hit(pos) {
    Entity.call(this, 'particles', 32, 32);

    this.pos.x = pos.x;
    this.pos.y = pos.y;

    this.type = null;
    this.dir = RIGHT;

    this.states = {
        idle: {
            frames: [
                { duration: 6, frame: 0 },
                { duration: 6, frame: 1 },
                { duration: 6, frame: 1, action: function(self) { self.dead = true} },
            ],
        },
    }

    this.behavior = new Behavior(this.states, this);
    this.frameNumber = this.behavior.frame.frame;
    this.moveThroughWalls = true;

    this.updateGraphics();
};

Hit.prototype.update = function() {
    this.behavior.update(1);
    this.frameNumber = this.behavior.frame.frame;
    Entity.prototype.update.call(this);
};



Smoke.prototype = Object.create(Entity.prototype);
Smoke.prototype.parent = Entity.prototype;

function Smoke(pos) {
    Entity.call(this, 'particles', 32, 32);

    this.pos.x = pos.x;
    this.pos.y = pos.y;

    this.type = null;
    this.dir = RIGHT;

    this.states = {
        idle: {
            frames: [
                { duration: 6, frame: 4 },
                { duration: 6, frame: 5 },
                { duration: 6, frame: 15, action: function(self) { self.dead = true} },
            ],
        },
    }

    this.behavior = new Behavior(this.states, this);
    this.frameNumber = this.behavior.frame.frame;
    this.moveThroughWalls = true;

    this.updateGraphics();
    console.log(this.dead)
};

Smoke.prototype.update = function() {
    console.log(this.pos.x)
    this.behavior.update(1);
    this.frameNumber = this.behavior.frame.frame;
    Entity.prototype.update.call(this);
};

