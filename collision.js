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
    player.damage(8);

    projectile.dead = true
}]);

CollisionHandler.addCollision([true, PLAYER, START, function(player, start, boxes) {
    if (start.destroy <= 60) return;

    start.destroy = 60;

    start.hitstun = 6;
    player.hitstun = 6;
}]);

CollisionHandler.addCollision([false, PLAYER, POWER_UP, function(player, power_up, boxes) {
    if (power_up.age <= 10) return;

    power_up.dead = true;
    player.hp = Math.min(player.hp + 50, 100);
    player.power = Math.min(player.power + 0.5, 1);
}]);

// CollisionHandler.addCollision([false, PUNCHER, PUNCHER, function(a, b) {
//     // var as = a.behavior.state;
//     // var bs = b.behavior.state;
//     // if (as == 'knock_back' && bs != 'knock_back') {
//     //     a.hitstun = 1;
//     //     b.hitstun = 1;

//     //     b.behavior.changeState('knock_back');
//     //     b.knockBackCounter = a.knockBackCounter;

//     //     b.vel.x = 0;
//     //     b.vel.y = 0;

//     //     b.push.x = a.push.x;
//     //     b.push.y = a.push.y;
//     // } else if (as != 'knock_back' && bs == 'knock_back') {
//     //     b.hitstun = 1;
//     //     a.hitstun = 1;

//     //     a.behavior.changeState('knock_back');
//     //     a.knockBackCounter = b.knockBackCounter;

//     //     a.vel.x = 0;
//     //     a.vel.y = 0;

//     //     a.push.x = a.push.x;
//     //     a.push.y = a.push.y;
//     // }
// }]);
