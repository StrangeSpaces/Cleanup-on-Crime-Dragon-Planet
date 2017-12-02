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

CollisionHandler.handles.push([PLAYER, BOX, function(player, crate, boxes) {
    if (player.haveBeenHit[crate]) {
        return;
    }
    player.haveBeenHit[crate] = true;

    player.knockBack(crate);
}]);
