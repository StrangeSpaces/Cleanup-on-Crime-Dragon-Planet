function Wave(num, pos) {
    this.pos = new Vec(pos.x-14, pos.y);
    this.vel = new Vec(0, -0.5);

    this.hitstun = 0;
    this.age = 0;

    this.id = ++runningID;

    this.type = null;
    this.sprite = new PIXI.Sprite(new PIXI.Texture(resources['wave'].texture));
    this.sprite.anchor.x = 0.5;

    this.num = new PIXI.Sprite(new PIXI.Texture(resources['num'].texture, new PIXI.Rectangle(num * 32, 0, 32, 48)));
    // this.num.anchor.x = 0;

    this.updateGraphics();
    frontContainer.addChild(this.sprite);
    frontContainer.addChild(this.num);
}

Wave.prototype.updateGraphics = function() {
    this.sprite.position.x = this.pos.x;
    this.sprite.position.y = this.pos.y;

    this.num.position.x = this.pos.x + 56;
    this.num.position.y = this.pos.y;

    this.sprite.alpha = 1 - this.age*this.age/(120*120);
    this.num.alpha = 1 - this.age*this.age/(120*120);
}

Wave.prototype.update = function() {
    if (this.age++ >= 120) {
        this.dead = true;
        this.num.destroy();
        return;
    }

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    this.updateGraphics();
};
