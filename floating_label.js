function Label(text, pos, notFloating) {
    this.floating = !notFloating
    this.pos = new Vec(pos.x, pos.y);
    this.vel = new Vec(0, notFloating ? 0 : -0.5);

    this.label = [];
    this.hitstun = 0;
    this.age = 0;

    this.id = ++runningID;

    this.text = text;
    this.type = null;
    this.sprite = new PIXI.extras.BitmapText(text, { font: '16px KenPixel Mini', align: 'center' });
    this.sprite.anchor.x = 0.5;
    this.updateGraphics();
    frontContainer.addChild(this.sprite);
}

Label.prototype.updateGraphics = function() {
    this.sprite.position.x = this.pos.x;
    this.sprite.position.y = this.pos.y;

    if (this.floating) this.sprite.alpha = 1 - this.age*this.age/(120*120);
}

Label.prototype.update = function() {
    if (this.age++ >= 120 && this.floating) {
        this.dead = true;
        return;
    }

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    this.updateGraphics();
};
