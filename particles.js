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

Explosion.prototype = Object.create(Entity.prototype);
Explosion.prototype.parent = Entity.prototype;

EXP = 12124;
function Explosion(pos) {
    Entity.call(this, 'exp', 96, 48);
    this.load_hitboxes('expbox');

    this.pos.x = pos.x;
    this.pos.y = pos.y - 14;

    this.type = EXP;
    this.dir = RIGHT;

    this.states = {
        idle: {
            frames: [
                { duration: 6, frame: 0 },
                { duration: 6, frame: 1, action: function(self) { SHAKE = 7; bombExplode.play(); } },
                { duration: 6, frame: 2 },
                { duration: 6, frame: 3 },
                { duration: 6, frame: 4 },
                { duration: 6, frame: 4, action: function(self) { self.dead = true} },
            ],
        },
    }

    this.behavior = new Behavior(this.states, this);
    this.frameNumber = this.behavior.frame.frame;
    this.moveThroughWalls = true;

    this.haveBeenHit = {};

    this.updateGraphics();
};

Explosion.prototype.update = function() {
    this.behavior.update(1);
    this.frameNumber = this.behavior.frame.frame;
    Entity.prototype.update.call(this);
};

Explosion.prototype.knockBack = function(obj) {
    if (this.haveBeenHit[obj]) {
        return;
    }
    this.haveBeenHit[obj] = true;

    if (this.pos.x > obj.pos.x) {
        obj.push.x = -4;
    } else {
        obj.push.x = 4;
    }

    obj.hitstun = 3;
    this.hitstun = 3;
    obj.behavior.changeState('knock_back');
    obj.knockBackCounter = 20;
    obj.damage(25);

    obj.vel.x = 0;
    obj.vel.y = 0;
}

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
};

Smoke.prototype.update = function() {
    this.behavior.update(1);
    this.frameNumber = this.behavior.frame.frame;
    Entity.prototype.update.call(this);
};

