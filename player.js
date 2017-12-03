Player.prototype = Object.create(Entity.prototype);
Player.prototype.parent = Entity.prototype;

var LEFT = -1;
var RIGHT = 1;

function Player() {
    Entity.call(this, 'jane', 96, 64);
    this.halfWidth = 16;

    this.load_hitboxes('jane_boxes');
    this.createHP();

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
        knock_back: {
            frames: [
                { duration: 1000000, frame: 0 }
            ],
            isAirState: true,
        },
        air_rise: {
            frames: [
                { duration: 6, frame: 14 },
            ],
            update: function(self) {
                if (self.vel.y > 0) {
                    self.behavior.changeState('air_fall');
                } else if (!Key.isDown(Key.JUMP)) {
                    self.vel.y *= 0.9;
                }

                self.standardInput();
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
        },
        kick: {
            frames: [
                { duration: 3, frame: 35 },
                { duration: 3, frame: 36 },
                { duration: 6, frame: 37 },
                { duration: 6, frame: 38, after: 'air_rise' },
            ],
            isAirState: true,
            moveable: false,
        },
        slide: {
            frames: [
                { duration: 3, frame: 42 },
                { duration: 3, frame: 43 },
                { duration: 6, frame: 44 },
                { duration: 6, frame: 45 },
                { duration: 6, frame: 5, after: 'idle' },
            ],
            enter: function(self) {
                self.friction = 0;
                self.vel.x = self.dir * self.max_speed;
                self.push.x = self.dir * 1;
            },
            exit: function(self) {
                self.friction = 0.05;
            },
            moveable: false,
        }
    }

    this.pos.x = 10;
    this.lastY = this.pos.y = 50;

    this.max_speed = 2;
    this.friction = 0.05;
    this.speed = 0.2

    this.power = 0;
    this.lastDisplayedPower = 0;
    this.doubleJump = true;

    this.behavior = new Behavior(this.states, this);

    this.haveBeenHit = {};
};

Player.prototype.knockBack = function(obj) {
    if (this.haveBeenHit[obj.id]) {
        return;
    }
    this.haveBeenHit[obj.id] = true;


    var state = this.behavior.state;
    var knockBack = 0;

    if (state == 'punch') {
        knockBack = 2 + 3 * this.power;
        obj.push.x = this.dir * knockBack;
    } else if (state == 'slide') {
        knockBack = 1.5 + 2.5 * this.power;
        obj.push.x = this.dir * knockBack * 1.5;
    } else if (state == 'upper_cut') {
        knockBack = 3 + 3 * this.power;
        obj.push.y = -knockBack * 1.8;
    } else if (state == 'kick') {
        knockBack = 3 + 3 * this.power;
        obj.push.x = this.dir * knockBack * Math.cos(0.2);
        obj.push.y = -knockBack * Math.sin(0.2);
    }
    if (knockBack == 0) return;

    impacts[5 - Math.min(Math.floor(this.power / 0.16), 5)].play();

    obj.hitstun = Math.floor(1 + knockBack);
    this.hitstun = Math.floor(1 + knockBack);
    obj.behavior.changeState('knock_back');
    obj.knockBackCounter = knockBack * 6;
    obj.damage(knockBack * 11)

    obj.vel.x = 0;
    obj.vel.y = 0;

    SHAKE = knockBack / 0.7 - 1;
}

Player.prototype.damage = function(amount) {
    this.hp = Math.max(this.hp - amount, 0);

    if (this.hp <= 0) {
        start();
    }
}

Player.prototype.hitGround = function() {
    Entity.prototype.hitGround.call(this);

    this.doubleJump = true;

    if (this.states[this.behavior.state].isAirState) {
        if (this.behavior.state == 'upper_cut' || this.behavior.state == 'knock_back') {
            return;
        }

        this.behavior.changeState('idle');
        land.play();
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

        if (Key.pressed(Key.JUMP) && (this.landed || this.doubleJump)) {
            this.behavior.changeState('air_rise');
            this.vel.y = -5;

            if (this.landed) {
                jump.play();
            } else {
                doubleJump.play();
            }
            this.doubleJump = this.landed;
        }

        if (this.landed) {
            if (Key.pressed(Key.P)) {
                if (Key.isDown(Key.UP)) {
                    this.behavior.changeState('upper_cut');
                    this.reducePower(0.22);
                    this.haveBeenHit = {};
                    uppercut.play();
                } else if (Key.isDown(Key.DOWN)) {
                    this.behavior.changeState('slide');
                    this.reducePower(0.22);
                    this.haveBeenHit = {};
                    uppercut.play();
                } else {
                    this.behavior.changeState('punch');
                    this.reducePower(0.12);
                    this.haveBeenHit = {};
                    punch.play();
                }
            }
        } else {
            if (Key.pressed(Key.P)) {
                this.behavior.changeState('kick');
                this.reducePower(0.12);
                this.haveBeenHit = {};
                punch.play();
            }
        }
    }
}

Player.prototype.reducePower = function(amount) {
    this.power = Math.max(this.power - amount, 0)
}

Player.prototype.update = function() {
    Key.update();

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

    this.power = Math.min(this.power + 0.002, 1);

    this.behavior.update(1);
    this.frameNumber = this.behavior.frame.frame;
    this.sprite.scale.x = this.dir;

    Entity.prototype.update.call(this);

    this.updateCamera();

    if (this.lastDisplayedPower < this.power) {
        this.lastDisplayedPower = Math.min(this.lastDisplayedPower + 0.008, this.power);
    } else {
        this.lastDisplayedPower = Math.max(this.lastDisplayedPower - 0.008, this.power);
    }
    power.texture.frame = new PIXI.Rectangle(0, 32, 7 + this.lastDisplayedPower * 40, 32);
};

Player.prototype.updateCamera = function() {
    if (!this.states[this.behavior.state].isAirState) {
        this.lastY = this.pos.y;
    } else if (this.pos.y - this.lastY > 20) {
        this.lastY += (this.pos.y - this.lastY) - 20;
    }

    var dif = new Vec((-this.pos.x + logicalWidth/2) * scaleFactor - currentContainer.position.x,
                      (-this.lastY + 32 + logicalHeight/2) * scaleFactor - currentContainer.position.y);
    dif.setLength(dif.length() / 16);

    currentContainer.position.x += dif.x;
    currentContainer.position.y += dif.y;

    if (currentContainer.position.x > 0) {
        currentContainer.position.x = 0; 
    } 
    if (currentContainer.position.x < (tileMapWidth * 16 - logicalWidth) * -scaleFactor){
        currentContainer.position.x = (tileMapWidth * 16 - logicalWidth) * -scaleFactor;
    }
    if (currentContainer.position.y > 0) {
        currentContainer.position.y = 0; 
    } 
    if (currentContainer.position.y < (tileMapHeight * 16 - logicalHeight) * -scaleFactor){
        currentContainer.position.y = (tileMapHeight * 16 - logicalHeight) * -scaleFactor;
    }
}

