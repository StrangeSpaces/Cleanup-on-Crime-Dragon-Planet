Player.prototype = Object.create(Entity.prototype);
Player.prototype.parent = Entity.prototype;

var LEFT = -1;
var RIGHT = 1;

function Player() {
    Entity.call(this, 'jane', 96, 64);
    this.halfWidth = 16;

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
        }
    }

    this.pos.x = 10;
    this.pos.y = 50;

    this.max_speed = 2;
    this.friction = 0.05;
    this.speed = 0.2

    this.behavior = new Behavior(this.states, this);
};

Player.prototype.hitGround = function() {
    Entity.prototype.hitGround.call(this);

    if (this.behavior.frame.isAirState) {
        this.behavior.changeState('idle');
    }
}

Player.prototype.standardInput = function() {
    if (this.behavior.frame.moveable != false) {
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

        if (Key.pressed(Key.UP) && this.landed) {
            this.vel.y = -5;
            this.behavior.changeState('air_rise');
        }

        if (this.landed && Key.pressed(Key.P)) {
            this.behavior.changeState('punch');
        }
    }
}

Player.prototype.update = function() {
    Key.update();

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

