Player.prototype = Object.create(Entity.prototype);
Player.prototype.parent = Entity.prototype;

var LEFT = -1;
var RIGHT = 1;

function Player() {
    Entity.call(this, 'jane', 96, 64);
    this.halfWidth = 16;

    this.load_hitboxes('jane_boxes');
    console.log(this.boxes);

    this.type = PLAYER;
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
                self.standardInput();
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
                self.standardInput();
            }
        },
        air_rise: {
            frames: [
                { duration: 6, frame: 14 },
            ],
            update: function(self) {
                self.standardInput();

                if (self.vel.y > 0) {
                    self.behavior.changeState('air_fall');
                }
            },
            isAirState: true
        },
        air_fall: {
            frames: [
                { duration: 6, frame: 15 },
            ],
            update: function(self) {
                self.standardInput();
            },
            isAirState: true
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

    this.pos.x = 10;
    this.pos.y = 50;

    this.max_speed = 2;
    this.friction = 0.05;
    this.speed = 0.2

    this.power = 0.5;

    this.behavior = new Behavior(this.states, this);

    this.haveBeenHit = {};
};

Player.prototype.knockBack = function(obj) {
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

    SHAKE = 3;
}

Player.prototype.hitGround = function() {
    Entity.prototype.hitGround.call(this);

    if (this.states[this.behavior.state].isAirState) {
        if (this.behavior.state == 'upper_cut') {
            return;
        }

        this.behavior.changeState('idle');
    }
}

Player.prototype.standardInput = function() {
    if (this.states[this.behavior.state].moveable != false) {
        if (Key.isDown(Key.RIGHT)) {
            this.vel.x += this.speed;

            if (this.landed) {
                this.behavior.changeState('run');
                this.dir = RIGHT;
            }
        } else if (Key.isDown(Key.LEFT)) {
            this.vel.x -= this.speed;

            if (this.landed) {
                this.behavior.changeState('run');
                this.dir = LEFT;
            }
        } else if (this.landed) {
            this.behavior.changeState('idle');
        }

        if (Key.pressed(Key.JUMP) && this.landed) {
            this.behavior.changeState('air_rise');
            this.vel.y = -5;
        }

        if (this.landed) {
            if (Key.pressed(Key.P)) {
                if (Key.isDown(Key.UP)) {
                    this.behavior.changeState('upper_cut');
                    this.reducePower(0.15);
                    this.haveBeenHit = {};
                } else {
                    this.behavior.changeState('punch');
                    this.reducePower(0.075);
                    this.haveBeenHit = {};
                }
            }
        }
    }
}

Player.prototype.reducePower = function(amount) {
    this.power = Math.max(this.power - amount, 0)
}

Player.prototype.update = function() {
    Key.update();

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

    this.power = Math.min(this.power + 0.001, 1);

    this.behavior.update(1);
    this.frameNumber = this.behavior.frame.frame;
    this.sprite.scale.x = this.dir;

    this.landed = false;
    Entity.prototype.update.call(this);

    power.texture.frame = new PIXI.Rectangle(0, 32, 7 + this.power * 40, 32);
};

