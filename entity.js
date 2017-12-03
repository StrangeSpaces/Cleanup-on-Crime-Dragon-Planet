function Vec(x,y) {
    this.x = x;
    this.y = y;
}

Vec.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
}

Vec.prototype.setLength = function(target) {
    if (target <= 0) {
        this.x = 0;
        this.y = 0;
        return;
    }

    var len = this.length();
    if (len == 0) {
        this.x = target;
    } else {
        this.x *= (target/len);
        this.y *= (target/len);
    }
}

var ENTITY = 0;
var PLAYER = 1;
var BOX = 2;
var PUNCHER = 3;
var PROJECTILE = 4;

var runningID = 0;


function Box(entity, x, y, width, height) {
    this.ent = entity;

    if (width < 0) {
        x = x + width;
        width = -width;
    }

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
}

Box.prototype.collide = function(other) {
    return (this.ent.pos.x + this.x * this.ent.dir - this.width < other.ent.pos.x + other.x * other.ent.dir + other.width &&
            this.ent.pos.y + this.y - this.height < other.ent.pos.y + other.y + other.height &&
            this.ent.pos.x + this.x * this.ent.dir + this.width > other.ent.pos.x + other.x * other.ent.dir - other.width &&
            this.ent.pos.y + this.y + this.height > other.ent.pos.y + other.y - other.height)
}

function Entity(file, width, height) {
    this.pos = new Vec(-1000, 15);
    this.vel = new Vec(0, 0);
    this.push = new Vec(0, 0);
    this.offset = new Vec(0, 0);

    this.boxes = [];
    this.height = 0;
    this.hitstun = 0;
    this.knockBackCounter = 0;

    this.id = ++runningID;

    if (file) {
        this.frameNumber = 0;
        this.framesPerRow = Math.floor(resources[file].texture.width / width);

        this.file = file;
        this.frame = new PIXI.Rectangle(0, 0, width, height);
        this.sprite = new PIXI.Sprite(new PIXI.Texture(resources[file].texture, this.frame));

        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;

        currentContainer.addChild(this.sprite);
        this.con = currentContainer;
    }

    if (!this.halfWidth) {
        this.halfWidth = width / 2;
        this.halfHeight = height / 2;
    }
}

Entity.prototype.createHP = function() {
    this.hp_sprite = new PIXI.Sprite(new PIXI.Texture(resources['tiles'].texture, new PIXI.Rectangle(0, 0, 16, 4)));
    this.hp = 100;
    currentContainer.addChild(this.hp_sprite);

    this.icon_sprite = new PIXI.Sprite(new PIXI.Texture(resources['icons'].texture, new PIXI.Rectangle(0, 0, 0, 32)));
    currentContainer.addChild(this.icon_sprite);
}

Entity.prototype.load_hitboxes = function(file) {
    var image = this.getPixels(file);

    var width = this.frame.width;
    var height = this.frame.height;

    var mx = resources[file].texture.width;
    var my = resources[file].texture.height;

    for (var y = 0; y < my; y += height) {
        for (var x = 0; x < mx; x += width) {
            this.boxes.push(this.load_hitboxes_frame(image, mx, x, y, width, height));
        }
    }
};

Entity.prototype.load_hitboxes_frame = function(pixels, w, start_x, start_y, width, height) {
    var hit = {};
    var hurt = {};

    for (var y = start_y; y < start_y + height; y++) {
        for (var x = start_x; x < start_x + width; x++) {
            var i = (w * y + x) * 4;
            var r = pixels[i];
            var g = pixels[i + 1];
            var b = pixels[i + 2];
            var a = pixels[i + 3];

            if (a == 255) {
                if (r > 0) {
                    if (!hurt[r]) {
                        hurt[r] = [];
                    }

                    hurt[r].push([x-start_x,y-start_y]);
                } else if (b > 0) {
                    if (!hit[b]) {
                        hit[b] = [];
                    }

                    hit[b].push([x-start_x,y-start_y]);
                }
            }
        }
    }

    var frames = [
        [],
        [],
    ]

    for (var key in hurt) {
        var pair = hurt[key];

        var w = pair[1][0] - pair[0][0];
        var h = pair[1][1] - pair[0][1];

        frames[0].push(new Box(
            this,
            (pair[0][0] + w/2) - width/2,
            (pair[0][1] + h/2) - height/2,
            w/2,
            h/2
        ));
    }

    for (var key in hit) {
        var pair = hit[key];

        var w = pair[1][0] - pair[0][0];
        var h = pair[1][1] - pair[0][1];

        frames[1].push(new Box(
            this,
            (pair[0][0] + w/2) - width/2,
            (pair[0][1] + h/2) - height/2,
            w/2,
            h/2
        ));
    }

    return frames;
};

Entity.prototype.getPixels = function(file) {
    var w = resources[file].texture.width;
    var h = resources[file].texture.height;
    var renderTexture = PIXI.RenderTexture.create(w, h);
    var sprite = new PIXI.Sprite(new PIXI.Texture(resources[file].texture));
    renderer.render(sprite, renderTexture);
    var p = renderer.extract.pixels(renderTexture);
    return renderer.extract.pixels(renderTexture);
};

Entity.prototype.addBox = function(box) {
    if (!box) {
        box = new Box(this, -this.halfWidth, -this.halfHeight, this.halfWidth * 2, this.halfHeight * 2);
    }
    this.boxes.push(box);
};

Entity.prototype.top = function() {
    return this.pos.y - this.halfHeight;
}

Entity.prototype.bot = function() {
    return this.pos.y + this.halfHeight;
}

Entity.prototype.left = function() {
    return this.pos.x - this.halfWidth;
}

Entity.prototype.right = function() {
    return this.pos.x + this.halfWidth;
}

Entity.prototype.collide = function(other) {
    for (var i = this.boxes[this.frameNumber][0].length - 1; i >= 0; i--) {
        var i_box = this.boxes[this.frameNumber][0][i];
        for (var t = other.boxes[other.frameNumber][1].length - 1; t >= 0; t--) {
            var t_box = other.boxes[other.frameNumber][1][t];
            if (i_box.collide(t_box)) {
                return [i_box, t_box, false];
            }
        }
    }

    for (var i = this.boxes[this.frameNumber][1].length - 1; i >= 0; i--) {
        var i_box = this.boxes[this.frameNumber][1][i];
        for (var t = other.boxes[other.frameNumber][0].length - 1; t >= 0; t--) {
            var t_box = other.boxes[other.frameNumber][0][t];
            if (i_box.collide(t_box)) {
                return [i_box, t_box, true];
            }
        }
    }

    return null;
}

Entity.prototype.bodyCollide = function(other) {
    return (this.left() < other.right() &&
        this.top() < other.bot() &&
        this.right() > other.left() &&
        this.bot() > other.top())
}

Entity.prototype.updateGraphics = function() {
    this.sprite.position.x = this.pos.x + this.offset.x;
    this.sprite.position.y = this.pos.y + this.offset.y;

    if (this.hp_sprite) {
        this.hp_sprite.position.x = this.sprite.position.x - 8;
        this.hp_sprite.position.y = this.sprite.position.y - 16;

        this.icon_sprite.position.x = this.sprite.position.x - 16;
        this.icon_sprite.position.y = this.sprite.position.y - 40;

        this.hp_sprite.texture.frame = new PIXI.Rectangle(0, 0, Math.ceil(this.hp * 16/100), 4);
    }

    this.frame.x = (this.frameNumber % this.framesPerRow) * this.frame.width;
    this.frame.y = Math.floor(this.frameNumber / this.framesPerRow) * this.frame.height;

    this.sprite.texture.frame = this.frame;
}

Entity.prototype.update = function() {
    this.pos.x += this.vel.x + this.push.x;
    Tilemap.check(this, 0);
    this.pos.y += this.vel.y + this.push.y;
    Tilemap.check(this, 1);

    this.push.setLength(Math.max(this.push.length() - 0.1, 0));

    this.updateGraphics();
};

Entity.prototype.hitGround = function() {
    this.vel.y = 0;
    this.landed = true;
    this.push.y = 0;
}

Entity.prototype.hitWall = function() {
}

Entity.prototype.friction = function(amount) {
    if (Math.abs(this.vel.x) < amount) {
        this.vel.x = 0;
    } else {
        this.vel.x -= amount * Math.sign(this.vel.x);
    }
}
