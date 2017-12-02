Puncher.prototype = Object.create(Entity.prototype);
Puncher.prototype.parent = Entity.prototype;

function Puncher() {
    Entity.call(this, 'dragon', 64, 48);
    this.load_hitboxes('dragon_boxes');
    this.halfWidth = 16;

    this.type = PUNCHER;
    this.dir = RIGHT;

    this.states = {
        idle: {
            frames: [
                { duration: 6, frame: 0 },
            ],
            update: function(self) {
                self.think();
            }
        },
        run: {
            frames: [
                { duration: 6, frame: 4 },
                { duration: 6, frame: 5 },
                { duration: 6, frame: 6 },
                { duration: 6, frame: 7 },
            ],
            update: function(self) {
                self.think();
            }
        },
        air_rise: {
            frames: [
                { duration: 6, frame: 14 },
            ],
            update: function(self) {
            },
            isAirState: true
        },
        air_fall: {
            frames: [
                { duration: 6, frame: 0 },
            ],
            update: function(self) {
            },
            isAirState: true
        },
        knock_back: {
            frames: [
                { duration: 1000000, frame: 12 }
            ],
            isAirState: true,
        },
        stab: {
            frames: [
                { duration: 6, frame: 8 },
                { duration: 6, frame: 9 },
                { duration: 6, frame: 10 },
                { duration: 6, frame: 11, after: 'idle' },
            ],
            moveable: false
        },
        upper_cut: {
            frames: [
                { duration: 6, frame: 28 },
                { duration: 6, frame: 29 },
                { duration: 6, frame: 30, action: function(self) {
                    self.vel.y = -5;
                } },
                { duration: 6, frame: 31 },
                { duration: 6, frame: 32 },
                { duration: 6, frame: 33, after: 'air_fall' },
            ],
            isAirState: true,
            moveable: false,
        }
    }

    this.pos.x = 60;
    this.pos.y = 50;

    this.max_speed = 2;
    this.friction = 0.05;
    this.speed = 0.2

    this.stab_wait = 0;

    this.behavior = new Behavior(this.states, this);

    this.haveBeenHit = {};
};

Puncher.prototype.think = function() {
    if (player.pos.x > this.pos.x) {
        this.dir = -1;
    } else {
        this.dir = 1;
    }

    var dist = Math.abs(player.pos.x - this.pos.x);
    if (dist < 28) {
        this.vel.x = 0;

        if (this.stab_wait <= 0) {
            this.behavior.changeState('stab');
            this.haveBeenHit = {};
            this.stab_wait = 66*2;
            return;
        }
    } else if (dist > 40) {
        if (player.pos.x > this.pos.x) {
            this.vel.x += this.speed;
        } else {
            this.vel.x -= this.speed;
        }
    } else {
        if (this.stab_wait <= 0) {
            this.behavior.changeState('stab');
            this.haveBeenHit = {};
            this.stab_wait = 66*2;
            return;
        }
    }

    if (this.vel.x == 0) {
        this.behavior.changeState('idle');
    } else {
        this.behavior.changeState('run');
    }
}

Puncher.prototype.knockBack = function(obj) {
    if (this.haveBeenHit[obj]) {
        return;
    }
    this.haveBeenHit[obj] = true;

    obj.push.x = this.dir * -4;

    obj.hitstun = 3;
    this.hitstun = 3;
    obj.behavior.changeState('knock_back');
    obj.knockBackCounter = 20;

    obj.vel.x = 0;
    obj.vel.y = 0;
}

Puncher.prototype.hitGround = function() {
    Entity.prototype.hitGround.call(this);

    if (this.states[this.behavior.state].isAirState) {
        if (this.behavior.state == 'knock_back') {
            return;
        }

        this.behavior.changeState('idle');
    }
}

Puncher.prototype.reducePower = function(amount) {
    this.power = Math.max(this.power - amount, 0)
}

Puncher.prototype.update = function() {
    this.stab_wait--;
    if (this.knockBackCounter > 0) {
        if (--this.knockBackCounter <= 0) {
            this.behavior.changeState('idle');
        }
    }

    if (!this.landed && !this.states[this.behavior.state].isAirState) {
        this.behavior.changeState('air_fall');
    }

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

