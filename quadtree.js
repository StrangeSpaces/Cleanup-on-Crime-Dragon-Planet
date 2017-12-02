var MAX_ENTITIES = 5;

var check = {};

function Quadtree(position, size, depth) {
    this.entities = [];

    this.position = position || new Vec(0, 0);
    this.size = size || 1000;
    this.depth = depth || 0;

    check = {};
}

Quadtree.prototype.add = function(entity) {
    if (this.children) {
        if (entity.left() <= this.position.x) {
            if (entity.top() <= this.position.y) {
                this.children[0].add(entity);
            }
            if (entity.bot() >= this.position.y) {
                this.children[2].add(entity);
            }
        }

        if (entity.right() >= this.position.x) {
            if (entity.top() <= this.position.y) {
                this.children[1].add(entity);
            }
            if (entity.bot() >= this.position.y) {
                this.children[3].add(entity);
            }
        }
    } else {
        this.entities.push(entity);

        if (this.entities.length > MAX_ENTITIES && this.depth < 4) {
            this.divide();
        }
    }
}

Quadtree.prototype.divide = function() {
    this.children = [];

    for (var y = 0; y < 2; y++) {
        for (var x = 0; x < 2; x++) {
            this.children.push(new Quadtree(
                new Vec(this.position.x - this.size / 2 + this.size * x,
                        this.position.y - this.size / 2 + this.size * y),
                this.size / 2,
                this.depth + 1
            ));
        }
    }

    for (var i = this.entities.length - 1; i >= 0; i--) {
        this.add(this.entities[i]);
    }

    this.entities = null;
}

Quadtree.prototype.run = function() {
    if (this.children) {
        for (var i = this.children.length - 1; i >= 0; i--) {
            this.children[i].run();
        }
    } else {
        var length = this.entities.length;

        if (length == 0) return;

        for (var i = 0; i < length - 1; i++) {
            var entI = this.entities[i];
            if (!check[entI.id]) check[entI.id] = {};

            for (var t = i + 1; t < length; t++) {
                var entT = this.entities[t];
                if (!check[entI.id][entT.id]) {
                    CollisionHandler.handle(entI, entT);
                    check[entI.id][entT.id] = true;
                }
            }
        }
    }
}
