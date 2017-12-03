var CollisionHandler = {
    handles: {},

    handle: function(a, b) {
        if (!a || !b) return
        var col = this.handles[a.type];
        if (col) {
            col = col[b.type];
            if (col) {
                col(a, b);
            }
        }
    },

    addCollision(collision) {
        this.handles[collision[1]] = this.handles[collision[1]] || {}
        this.handles[collision[2]] = this.handles[collision[2]] || {}

        if (collision[0]) {
            this.handles[collision[1]][collision[2]] = function(a, b) {
                var boxes = a.collide(b)
                if (boxes) {
                    collision[3](a, b, boxes);
                }
                return;
            }

            this.handles[collision[2]][collision[1]] = function(b, a) {
                var boxes = a.collide(b)
                if (boxes) {
                    collision[3](a, b, boxes);
                }
                return;
            }
        } else {
            this.handles[collision[1]][collision[2]] = function(a, b) {
                if (a.bodyCollide(b)) {
                    collision[3](a, b);
                }
                return;
            }

            this.handles[collision[2]][collision[1]] = function(b, a) {
                if (a.bodyCollide(b)) {
                    collision[3](a, b);
                }
                return;
            }
        }
    }
}

CollisionHandler.addCollision([true, PLAYER, BOX, function(player, crate, boxes) {
    if (player.haveBeenHit[crate]) {
        return;
    }
    player.haveBeenHit[crate] = true;

    player.knockBack(crate);
}]);

CollisionHandler.addCollision([true, PLAYER, PUNCHER, function(player, puncher, boxes) {
    if (boxes[2]) {
        player.knockBack(puncher);
    } else {
        puncher.knockBack(player);
    }
}]);

CollisionHandler.addCollision([true, PLAYER, PROJECTILE, function(player, projectile, boxes) {
    player.push.x = projectile.dir * 2;

    player.hitstun = 1;
    player.behavior.changeState('knock_back');
    player.knockBackCounter = 10;

    player.vel.x = 0;
    player.vel.y = 0;

    projectile.dead = true
}]);

// CollisionHandler.addCollision([false, PUNCHER, PUNCHER, function(a, b) {
//     console.log('boo');
//     if (a.pos.x < b.pos.x) {
//         a.pos.x = b.left() - a.halfWidth;
//     } else {
//         b.pos.x = a.left() - b.halfWidth;
//     }
// }]);
