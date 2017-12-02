var CollisionHandler = {
    handles: [],

    handle: function(a, b) {
        if (!a || !b) return
        for (var i = 0; i < this.handles.length; i++) {
            var h = this.handles[i];

            if (h[0] == a.type && h[1] == b.type) {
                var boxes = a.collide(b)
                if (boxes) {
                    h[2](a, b, boxes);
                }
                return;
            } else if (h[1] == a.type && h[0] == b.type) {
                var boxes = b.collide(a)
                if (boxes) {
                    h[2](b, a, boxes);
                }
                return;
            }
        }
    }
}


CollisionHandler.handles.push([PLAYER, PLAYER, function(player, p, boxes) {
    console.log(boxes);
}]);

CollisionHandler.handles.push([PLAYER, ENEMY, function(player, enemy, boxes) {
    if (boxes[0] > 0) {
        enemy.dead = true;

        hitEnemy.play();

        var star = new Star();
        star.pos.x = enemy.pos.x;
        star.pos.y = enemy.pos.y;
        entities.push(star);

        var explosion = new Explosion();
        explosion.pos.x = enemy.pos.x;
        explosion.pos.y = enemy.pos.y;
        entities.push(explosion);

        for (var i = 0; i < 4; i++) {
            var eng = new Energy();
            entities.push(eng);

            var dx = random(-5, 5)

            eng.pos.x = enemy.pos.x + dx;
            eng.pos.y = enemy.pos.y;

            eng.vel.x = dx/5;
            eng.vel.y = random(-2, -1.5)
        }
    } else {
        player.damage();
    }
}]);

CollisionHandler.handles.push([PLAYER, ENERGY, function(player, energy, boxes) {
    if (boxes[0] != 0) return;

    var dif = new Vec(player.pos.x - energy.pos.x, player.pos.y - energy.pos.y);

    if (dif.length() < 8) {
        energy.dead = true;
        player.energy += 0.07;
        if (player.energy >= 1) player.energy = 1;

        absorbEnergy.play();
    } else {
        dif.setLength(2);
        energy.vel.x = dif.x;
        energy.vel.y = dif.y;
    }
}]);

CollisionHandler.handles.push([PLAYER, SAW, function(player, saw, boxes) {
    if (saw.struck) return;

    if (boxes[0] > 0) {
        saw.struck = true;
        saw.vel.x = player.dir * 3;
        saw.vel.y = 0;
        saw.arc = false;

        var star = new Star();
        star.pos.x = saw.pos.x;
        star.pos.y = saw.pos.y;
        entities.push(star);

        hitEnemy.play();
    } else {
        player.damage();
        saw.dead = true;
    }
}]);

CollisionHandler.handles.push([SAW, ENEMY, function(saw, enemy, boxes) {
    if (!saw.struck) return;

    saw.dead = true;
    enemy.dead = true;

    var star = new Star();
    star.pos.x = enemy.pos.x;
    star.pos.y = enemy.pos.y;
    entities.push(star);

    var explosion = new Explosion();
    explosion.pos.x = enemy.pos.x;
    explosion.pos.y = enemy.pos.y;
    entities.push(explosion);

    for (var i = 0; i < 4; i++) {
        var eng = new Energy();
        entities.push(eng);

        var dx = random(-5, 5)

        eng.pos.x = enemy.pos.x + dx;
        eng.pos.y = enemy.pos.y;

        eng.vel.x = dx/5;
        eng.vel.y = random(-2, -1.5)
    }
}]);

CollisionHandler.handles.push([SAW, ALPHA, function(saw, enemy, boxes) {
    if (!saw.struck) return;

    saw.dead = true;

    if (boxes[1] == 0) {
        enemy.damage();

        hitEnemy.play();

        enemy.vel.x = player.dir * 4;
        enemy.state = -1;
    } else {
        enemy.vel.x = player.dir * 5;
        enemy.state = -1;

        hitShield.play();
    }

    enemy.boxes.length = 2;
}]);

CollisionHandler.handles.push([PLAYER, ALPHA, function(player, enemy, boxes) {
    if (boxes[0] > 0) {
        if (boxes[1] == 0) {
            enemy.damage();

            hitEnemy.play();

            enemy.vel.x = player.dir * 4;
            enemy.state = -1;
        } else {
            enemy.vel.x = player.dir * 5;
            enemy.state = -1;

            hitShield.play();
        }

        player.boxes.length = 1;
        enemy.boxes.length = 2;
    } else if (boxes[1] > 1 || enemy.state == DASH_ATK) {
        player.damage();
    }
}]);

CollisionHandler.handles.push([PLAYER, LIGHT, function(player, light, boxes) {
    if (boxes[0] > 0) {
        light.dead = true;

        glassBreak.play();

        var star = new Star();
        star.pos.x = light.pos.x;
        star.pos.y = light.pos.y;
        entities.push(star);

        for (var i = 0; i < 4; i++) {
            var eng = new Energy();
            entities.push(eng);

            var dx = random(-5, 5)

            eng.pos.x = light.pos.x + dx;
            eng.pos.y = light.pos.y;

            eng.vel.x = dx/5;
            eng.vel.y = random(-2, -1.5)
        }        
    }
}]);
