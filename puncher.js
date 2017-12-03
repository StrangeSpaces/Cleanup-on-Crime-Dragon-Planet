Puncher.prototype = Object.create(Entity.prototype);
Puncher.prototype.parent = Entity.prototype;

var LF = [];
var RF = [];

var leftPunch;
var rightPunch;

function loseFocus(side, puncher) {
    if (side == -1) {
        if (puncher != leftPunch) return;
        leftPunch = null;
        for (var i = 0; i < LF.length; i++) {
            if (LF[i].selectFocus(-1)) {
                leftPunch = LF.splice(i, 1)[0];
                return;
            }
        }
    } else {
        if (puncher != rightPunch) return;
        rightPunch = null;
        for (var i = 0; i < RF.length; i++) {
            if (RF[i].selectFocus(1)) {
                rightPunch = RF.splice(i, 1)[0];
                return;
            }
        }
    }
}

function wantFocus(side, puncher) {
    // if (side == -1) {
        LF.push(puncher);
    // } else {
        RF.push(puncher);
    // }
}

function updateFocus() {
    LF.sort(function(a, b) {
        return Math.abs(a.pos.x - player.pos.x) - Math.abs(b.pos.x - player.pos.x);
    });

    RF.sort(function(a, b) {
        return Math.abs(a.pos.x - player.pos.x) - Math.abs(b.pos.x - player.pos.x);
    });

    if (!leftPunch) {
        loseFocus(-1);
    }

    if (!rightPunch) {
        loseFocus(1);
    }
}

function Puncher() {
    Entity.call(this, 'dragon', 64, 48);
    this.createHP();

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
            },
            canFocus: true
        },
        flee: {
            frames: [
                { duration: 6, frame: 4 },
                { duration: 6, frame: 5 },
                { duration: 6, frame: 6 },
                { duration: 6, frame: 7, after: 'idle' },
            ],
            enter: function(self) {
                loseFocus(self.focus, self);
                wantFocus(null, self);
                self.focus = null;
            },
            update: function(self) {
                if (player.pos.x < self.pos.x) {
                    self.vel.x += self.speed;
                    self.dir = -1;
                } else {
                    self.vel.x -= self.speed;
                    self.dir = 1;
                }
            }
        },
        consider: {
            frames: [
                { duration: 18, frame: 0, },
                { duration: 0, action: function(self) {
                    var percent = Math.random();
                    if (percent < 0.2) {
                        self.facePlayer();
                        self.behavior.changeState('stab');
                    } else if (percent < 0.7) {
                        self.behavior.changeState('idle');
                    } else {
                        self.behavior.changeState('flee');
                    }
                } }
            ],
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
            },
            canFocus: true
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
            cancelable: false,
        },
        arresting: {
            frames: [
                { duration: 1000000, frame: 16 }
            ],
            isAirState: true,
            cancelable: false,
        },
        dead: {
            frames: [
                { duration: 1000000, frame: 12 }
            ],
            isAirState: true,
            exit: function(self) {
                return '__cancel_exit__'
            }
        },
        stab: {
            frames: [
                { duration: 6, frame: 8 },
                { duration: 6, frame: 9 },
                { duration: 6, frame: 10 },
                { duration: 6, frame: 11, after: 'flee' },
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

    this.pos.x = 250 + 200 * Math.random();
    this.pos.y = 50;

    this.max_speed = 2;
    this.friction = 0.05;
    this.speed = 0.2

    this.stab_wait = 0;

    this.behavior = new Behavior(this.states, this);

    this.haveBeenHit = {};
    this.destroy_timer = 0;

    this.focus = null;
    this.targetDelay = 0;
    wantFocus(null, this);
};

Puncher.prototype.selectFocus = function(side) {
    if (this.focus != null || !this.states[this.behavior.state].canFocus) return;

    if (side == -1) {
        if (player.pos.x > this.pos.x) {
            this.focus = -1;
            return true;
        }
    } else {
        if (player.pos.x < this.pos.x) {
            this.focus = 1;
            return true;
        }
    }
}

Puncher.prototype.facePlayer = function() {
    if (player.pos.x > this.pos.x) {
        this.dir = -1;
    } else {
        this.dir = 1;
    }
}

Puncher.prototype.think = function() {
    if (player.pos.x > this.pos.x) {
        this.dir = -1;
    } else {
        this.dir = 1;
    }

    if (this.focus != null) {
        this.target = null;

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
    } else {
        if (!this.target) {
            if (this.targetDelay <= 0) {
                var d = Math.random() * 200 + 60;

                if (player.pos.x > this.pos.x) {
                    d = -d;
                }
                this.target = player.pos.x + d;
            } else {
                this.targetDelay--;
            }
        } else {
            if (this.target > this.pos.x) {
                this.vel.x += this.speed;
                this.dir = -1;
            } else {
                this.vel.x -= this.speed;
                this.dir = 1;
            }

            if (Math.abs(this.target - this.pos.x) <= Math.abs(this.vel.x)) {
                this.target = null;
                this.targetDelay = 30;
                this.vel.x = 0
            }
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
    obj.damage(15);

    obj.vel.x = 0;
    obj.vel.y = 0;
}

Puncher.prototype.hitWall = function() {
    if (this.states[this.behavior.state].canFocus && this.landed) {
        this.vel.y = -4;
    }
}

Puncher.prototype.hitGround = function() {
    Entity.prototype.hitGround.call(this);

    if (this.states[this.behavior.state].isAirState) {
        if (this.states[this.behavior.state].cancelable == false) {
            return;
        }

        this.behavior.changeState('idle');
    }
}

Puncher.prototype.reducePower = function(amount) {
    this.power = Math.max(this.power - amount, 0)
}

Puncher.prototype.damage = function(amount) {
    this.hp = Math.max(this.hp - amount, 0);

    loseFocus(this.focus, this);
    if (this.hp == 0) {
        this.behavior.changeState('dead');
        this.destroy_timer = 30;
        this.icon_sprite.texture.frame = new PIXI.Rectangle(64, 0, 32, 32);
    } else if (this.hp <= 300/16) {
        this.arresting = true;
    } else {
        wantFocus(null, this);
    }
}

Puncher.prototype.update = function() {
    if (this.destroy_timer > 0) {
        if (--this.destroy_timer <= 0) {
            this.dead = true;

            if (this.hp <= 0) {
                scoreAmount -= 300;
                entities.push(new Label('-300', this.pos));
                entities.push(new Police());
            } else {
                scoreAmount += 150;
                entities.push(new Label('150', this.pos));
            }
            return;
        }
    }

    this.stab_wait--;
    if (this.knockBackCounter > 0 && this.behavior.state == 'knock_back') {
        if (--this.knockBackCounter <= 0) {
            if (this.arresting) {
                this.behavior.changeState('arresting');
                this.icon_sprite.texture.frame = new PIXI.Rectangle(0, 0, 32, 32);
                this.destroy_timer = 120;
            } else {
                this.behavior.changeState('consider');
            }
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

    Entity.prototype.update.call(this);
};

