Bomb.prototype = Object.create(Entity.prototype);
Bomb.prototype.parent = Entity.prototype;

BOMB = 777;

function Bomb(pos) {
    Entity.call(this, 'bomb', 32, 32);
    this.load_hitboxes('bombbox');

    this.halfHeight = 8;
    this.age = 0;

    this.type = BOMB;
    this.dir = RIGHT;

    this.states = {
        idle: {
            frames: [
                { duration: 6, frame: 0 },
            ],
        },
        spin: {
            frames: [
                { duration: 6, frame: 2 },
                { duration: 6, frame: 3 },
                { duration: 6, frame: 4 },
                { duration: 6, frame: 5 },
            ],
        },
    }

    this.pos.x = pos.x - 12;
    this.pos.y = pos.y + 10;

    this.max_speed = 2;
    this.friction = 0.05;
    this.speed = 0.2;
    this.age = 0;

    this.behavior = new Behavior(this.states, this);
};

Bomb.prototype.hitGround = function() {
    Entity.prototype.hitGround.call(this);

    if (!this.old && this.landed) {
        bombLand.play();
    }
}

Bomb.prototype.update = function() {
    if (this.push.x == 0 && this.push.y == 0) {
        this.behavior.changeState('idle');
    } else {
        this.behavior.changeState('spin');
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

    if (Math.floor(++this.age / ((150 - this.age)/30 + 5)) % 2 == 0) {
        this.frameNumber += 6;
    }

    if (this.age == 150) {
        this.dead = true;
        entities.push(new Explosion(this.pos));
    }

    this.sprite.scale.x = this.dir;

    this.old = this.landed;
    Entity.prototype.update.call(this);
};



BombDragon.prototype = Object.create(Entity.prototype);
BombDragon.prototype.parent = Entity.prototype;

function BombDragon() {
    Entity.call(this, 'bdrag', 64, 48);
    this.createHP(40);

    this.load_hitboxes('bdrag_hitbox');
    this.halfWidth = 16;

    this.type = PUNCHER;
    this.dir = RIGHT;

    this.states = {
        idle: {
            frames: [
                { duration: 6, frame: 0 },
            ],
            // update: function(self) {
            //     self.think();
            // }
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
                { duration: 6, frame: 6, action: function(self) { self.vel.y = -1.15 } },
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
                { duration: 6, frame: 8, action: function(self) { self.drop(); } },
                { duration: 6, frame: 9 },
                { duration: 6, frame: 10, after: 'run' },
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

    this.pos.x = logicalWidth + 140;
    this.pos.y = 60;

    this.max_speed = 2;
    this.friction = 0.05;
    this.speed = 0.2

    this.stab_wait = 0;
    this.shoot_wait = 0;

    this.behavior = new Behavior(this.states, this);
    this.behavior.changeState('run')

    this.haveBeenHit = {};
    this.destroy_timer = 0;

    this.bomb = true;

    AMOUNT++;
};

BombDragon.prototype.drop = function() {
    if (!this.bomb) return;

    bombFall.play();
    this.bomb = false;
    entities.push(new Bomb(this.pos));
}

BombDragon.prototype.think = function() {
    if (this.pos.x < -50) {
        this.dead = true;
        AMOUNT--;
    }

    if (this.pos.y < 60) {
        this.pos.y++;
    } else if (this.pos.y > 70) {
        this.pos.y--;
    }

    if (this.bomb && Math.abs(player.pos.x - this.pos.x) < 12) {
        this.behavior.changeState('stab');
        this.vel.y = 0;
    }

    this.vel.x = -1;
}

BombDragon.prototype.knockBack = function(obj) {
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

BombDragon.prototype.hitGround = function() {
    Entity.prototype.hitGround.call(this);

    if (this.behavior.state == 'knock_back') {
        this.behavior.changeState('idle');
        if (this.arresting) {
            this.knockBackCounter = 0.01;
        }
    }
}

BombDragon.prototype.reducePower = function(amount) {
    this.power = Math.max(this.power - amount, 0)
}

BombDragon.prototype.damage = function(amount) {
    this.hp = Math.max(this.hp - amount * 2, 0);
    this.drop();

    if (this.hp == 0) {
        enemyDied.play();
        this.behavior.changeState('dead');
        this.destroy_timer = 30;
        this.icon_sprite.position.y = this.sprite.position.y;
        this.icon_sprite.texture.frame = new PIXI.Rectangle(64, 0, 32, 32);
    } else if (this.hp <= this.copHp) {
        this.arresting = true;
    }
}

BombDragon.prototype.update = function() {
    if (this.destroy_timer > 0) {
        if (--this.destroy_timer <= 0) {
            this.dead = true;
            
            if (this.hp <= 0) {
                scoreAmount -= 300;
                entities.push(new Label('-300', this.pos));
                var old = Math.floor(STARS);
                STARS += 0.8
                STARS = Math.min(5, STARS);
                if (old < Math.floor(STARS)) {
                    entities.push(new Car());
                    STARS = Math.floor(STARS);
                }

                if (Math.random() < CHANCE/5 + (0.2 - player.hp/500)) {
                    entities.push(new PowerUp(this.pos));
                    CHANCE -= 0.35;
                } else {
                    CHANCE += 0.05;
                }
            } else {
                scoreAmount += 150;
                entities.push(new Label('150', this.pos));
                arrested.play();

                if (Math.random() < CHANCE + (0.2 - player.hp/500)) {
                    entities.push(new PowerUp(this.pos));
                    CHANCE -= 0.35;
                } else {
                    CHANCE += 0.05;
                }
            }
            AMOUNT--;

            return;
        }
    }

    this.stab_wait--;
    this.shoot_wait--;
    if (this.knockBackCounter > 0) {
        this.knockBackCounter -= 0.12;
        if (this.knockBackCounter <= 0) {
            if (this.arresting) {
                this.behavior.changeState('arresting');
                this.icon_sprite.texture.frame = new PIXI.Rectangle(0, 0, 32, 32);
                this.destroy_timer = 120;
            } else {
                this.behavior.changeState('run');
            }
        }
    }

    if (this.behavior.state != 'stab')this.vel.y += 0.1;

    this.behavior.update(1);
    this.frameNumber = this.behavior.frame.frame + (this.behavior.state == 'run' && !this.bomb ? 16 : 0);
    this.sprite.scale.x = this.dir;

    this.moveThroughWalls = (this.behavior.state == 'run' ? true : false);
    Entity.prototype.update.call(this);

    if (this.destroy_timer > 0) {
        if (this.hp > 0) {
            this.icon_sprite.position.y = this.sprite.position.y - 40 * this.destroy_timer/120;
        } else {
            this.icon_sprite.position.y = this.sprite.position.y - 40 * (30-this.destroy_timer)/30;
        }
    }
};

