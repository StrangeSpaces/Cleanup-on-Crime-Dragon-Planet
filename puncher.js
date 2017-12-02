Puncher.prototype = Object.create(Entity.prototype);
Puncher.prototype.parent = Entity.prototype;

function Puncher() {
    Entity.call(this, 'jane', 96, 64);
    this.halfWidth = 16;

    this.load_hitboxes('jane_boxes');
    console.log(this.boxes);

    this.type = PUNCHER;
    this.dir = RIGHT;

    this.states = {
        idle: {
            frames: [
                { duration: 6, frame: 0 },
                { duration: 6, frame: 1 },
                { duration: 6, frame: 2 },
                { duration: 6, frame: 3 },
                { duration: 6, frame: 4 },
                { duration: 6, frame: 5 },
            ],
            update: function(self) {
                self.think();
            }
        },
        run: {
            frames: [
                { duration: 6, frame: 7 },
                { duration: 6, frame: 8 },
                { duration: 6, frame: 9 },
                { duration: 6, frame: 10 },
                { duration: 6, frame: 11 },
                { duration: 6, frame: 12 },
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
                { duration: 6, frame: 15 },
            ],
            update: function(self) {
            },
            isAirState: true
        },
        knock_back: {
            frames: [
                { duration: 1000000, frame: 0 }
            ],
            isAirState: true,
        },
        punch: {
            frames: [
                { duration: 6, frame: 21 },
                { duration: 6, frame: 22 },
                { duration: 6, frame: 23 },
                { duration: 6, frame: 24, after: 'idle' },
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

    this.power = 0.5;

    this.behavior = new Behavior(this.states, this);

    this.haveBeenHit = {};
};

Puncher.prototype.think = function() {
    if (player.pos.x > this.pos.x) {
        this.vel.x += this.speed;
        this.dir = 1;
    } else {
        this.vel.x -= this.speed;
        this.dir = -1;
    }

    if (Math.abs(player.pos.x - this.pos.x) < 32) {
        this.vel.x = 0;
    }

    if (this.vel.x == 0) {
        this.behavior.changeState('idle');
    } else {
        this.behavior.changeState('run');
    }
}

Puncher.prototype.knockBack = function(obj) {
    var state = player.behavior.state;

    console.log(this.power)
    var mult = 0.4 + this.power * 0.6;

    if (state == 'punch') {
        obj.push.x = this.dir * 4 * mult;
    } else if (state == 'upper_cut') {
        obj.push.y = -7 * mult;
    }

    obj.hitstun = 3;
    this.hitstun = 3;

    SHAKE = 3 * mult;
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

