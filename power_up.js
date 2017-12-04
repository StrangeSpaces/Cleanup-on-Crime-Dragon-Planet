PowerUp.prototype = Object.create(Entity.prototype);
PowerUp.prototype.parent = Entity.prototype;

POWER_UP = 100;

function PowerUp(pos) {
    Entity.call(this, 'pickups', 32, 32);
    this.halfWidth = 1;
    this.age = 0;

    this.type = POWER_UP;
    this.dir = RIGHT;

    this.states = {
        idle: {
            frames: [
                { duration: 6, frame: 0 },
            ],
        },
    }

    this.pos.x = pos.x;
    this.pos.y = pos.y + 8;

    this.behavior = new Behavior(this.states, this);
    this.frameNumber = Math.floor(Math.random() * 4);
};

PowerUp.prototype.update = function() {
    this.age++;

    if (this.age == 240) {
        this.dead = true;
        return
    } else if (this.age >= 180) {
        if (Math.floor(this.age / 3) % 2 == 0) {
            this.sprite.alpha = 0;
        } else {
            this.sprite.alpha = 1;
        }
    }  else if (this.age >= 120) {
        if (Math.floor(this.age / 5) % 2 == 0) {
            this.sprite.alpha = 0;
        } else {
            this.sprite.alpha = 1;
        }
    }

    this.behavior.update(1);

    Entity.prototype.update.call(this);
};

