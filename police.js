Police.prototype = Object.create(Entity.prototype);
Police.prototype.parent = Entity.prototype;

function Police() {
    Entity.call(this, 'police', 96, 48);
    this.createHP();

    this.load_hitboxes('police_boxes');
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
        wait: {
            frames: [
                { duration: 20, frame: 0, after: 'idle' }
            ]
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
                { duration: 1000000, frame: 8 }
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
                { duration: 1000000, frame: 8 }
            ],
            isAirState: true,
            exit: function(self) {
                return '__cancel_exit__'
            }
        },
        stab: {
            frames: [
                { duration: 6, frame: 12 },
                { duration: 6, frame: 13, action: function(self) { swing.play() } },
                { duration: 6, frame: 14, after: 'idle' },
            ],
            moveable: false
        },
        shoot: {
            frames: [
                { duration: 6, frame: 16 },
                { duration: 6, frame: 17, action: function(self) {
                    var proj = new Projectile();
                    proj.pos.x = self.pos.x - self.dir * 4;
                    proj.pos.y = self.pos.y + 8;

                    proj.vel.x = self.dir * -1.5;
                    proj.vel.y = -3.5;

                    proj.dir = -self.dir;
                    proj.updateGraphics();

                    entities.push(proj);

                    fireball.play();
                } },
                { duration: 6, frame: 18 },
                { duration: 6, frame: 19, after: 'wait' },
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

    this.pos.x = Math.random() * logicalWidth;
    this.pos.y = 50;

    this.max_speed = 2;
    this.friction = 0.05;
    this.speed = 0.2

    this.stab_wait = 0;
    this.shoot_wait = 0;

    this.behavior = new Behavior(this.states, this);

    this.haveBeenHit = {};
    this.destroy_timer = 0;
};

Police.prototype.think = function() {
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
            this.stab_wait = 90;
            return;
        }
    } else if (dist > 40) {
        if (this.shoot_wait <= 0 && this.stab_wait <= 30) {
            if (player.pos.x > this.pos.x) {
                this.vel.x += this.speed;
            } else {
                this.vel.x -= this.speed;
            }
        } else if (this.shoot_wait <= 60 && this.stab_wait <= 60) {
            if (player.pos.x < this.pos.x) {
                this.vel.x += this.speed;
            } else {
                this.vel.x -= this.speed;
            }

            if (this.pos.x < 20) {
                this.vel.x = 0;
            } else if (this.pos.x > logicalWidth - 20) {
                this.vel.x = 0;
            }
        }

        if (dist > 60 && this.shoot_wait <= 0 && Math.random() * 100 <= 1) {
            this.behavior.changeState('shoot');
            this.shoot_wait = 100;
            return;
        }
    } else {
        if (this.stab_wait <= 0) {
            this.behavior.changeState('stab');
            this.haveBeenHit = {};
            this.stab_wait = 90;
            return;
        }
    }

    if (this.vel.x == 0) {
        this.behavior.changeState('idle');
    } else {
        this.behavior.changeState('run');
    }
}

Police.prototype.knockBack = function(obj) {
    if (this.haveBeenHit[obj] || obj.inv > 0) {
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

Police.prototype.hitGround = function() {
    Entity.prototype.hitGround.call(this);

    if (this.states[this.behavior.state].isAirState) {
        if (this.states[this.behavior.state].cancelable == false) {
            return;
        }

        this.behavior.changeState('idle');
    }
}

Police.prototype.reducePower = function(amount) {
    this.power = Math.max(this.power - amount, 0)
}

Police.prototype.damage = function(amount) {
    this.hp = Math.max(this.hp - amount, 0);

    if (this.hp == 0) {
        enemyDied.play();
        this.behavior.changeState('dead');
        this.destroy_timer = 30;
        this.icon_sprite.position.y = this.sprite.position.y;
        this.icon_sprite.texture.frame = new PIXI.Rectangle(64, 0, 32, 32);
    }
}

Police.prototype.update = function() {
    if (this.destroy_timer > 0) {
        if (--this.destroy_timer <= 0) {
            this.dead = true;

            if (Math.random() < CHANCE/5 + (0.2 - player.hp/500)) {
                entities.push(new PowerUp(this.pos));
                CHANCE -= 0.35;
            } else {
                CHANCE += 0.05;
            }

            AMOUNT--;
            return;
        }
    }

    this.stab_wait--;
    this.shoot_wait--;
    if (this.knockBackCounter > 0 && this.behavior.state == 'knock_back') {
        if (--this.knockBackCounter <= 0) {
            if (this.arresting) {
                this.behavior.changeState('arresting');
                this.icon_sprite.texture.frame = new PIXI.Rectangle(0, 0, 32, 32);
                this.destroy_timer = 120;
            } else {
                this.behavior.changeState('idle');
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

    if (this.destroy_timer > 0) {
        if (this.hp > 0) {
            this.icon_sprite.position.y = this.sprite.position.y - 40 * this.destroy_timer/120;
        } else {
            this.icon_sprite.position.y = this.sprite.position.y - 40 * (30-this.destroy_timer)/30;
        }
    }
};

