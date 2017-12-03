var level;
var levelNum = 0;

var wave = 0;

var waves = [
    {count: 1, amount: 2},
    {count: 2, amount: 2},
    {count: 3, amount: 2},
    {count: 2, amount: 3},
    {count: 4, amount: 3}
]


var levelOrder = [
    'CrimeDragonLand',
    'CrimeDragonLand',
    'CrimeDragonLand',
    'CrimeDragonLand',
    'CrimeDragonLand'
]

var tiles;
var bg;
var placement;
var fg;
var tileMapWidth;
var tileMapHeight;
var cols;

function setup() {
    level = levelOrder[levelNum];

    tiles = TileMaps[level]['layers'][1]['data'];
    bg = TileMaps[level]['layers'][0]['data'];
    placement = TileMaps[level]['layers'][2]['data'];
    fg = TileMaps[level]['layers'][3]['data'];
    tileMapWidth = TileMaps[level]['width'];
    tileMapHeight = TileMaps[level]['height'];
    cols = TileMaps[level]['tilesets'][0]['columns'];
}

var SX = null;

var Tilemap = {
    tileSize: 16,

    init: function() {
        for (var y = 0; y < tileMapHeight; y++) {
            for (var x = 0; x < tileMapWidth; x++) {
                this.place(bg[y * tileMapWidth + x] - 1, x, y, currentContainer);
            }
        }
        for (var y = 0; y < tileMapHeight; y++) {
            for (var x = 0; x < tileMapWidth; x++) {
                this.place(tiles[y * tileMapWidth + x] - 1, x, y, currentContainer);
            }
        }
        for (var y = 0; y < tileMapHeight; y++) {
            for (var x = 0; x < tileMapWidth; x++) {
                this.place(placement[y * tileMapWidth + x] - 1, x, y, currentContainer);
            }
        }
        for (var y = 0; y < tileMapHeight; y++) {
            for (var x = 0; x < tileMapWidth; x++) {
                var tile = fg[y * tileMapWidth + x] - 1;
                this.place(tile, x, y, frontContainer);
            }
        }
        // for (var y = 0; y < tileMapHeight; y++) {
        //     for (var x = 0; x < tileMapWidth; x++) {
        //         var ent = placement[y * tileMapWidth + x] - 1;
        //         var entity = null;
        //         if (ent == 16) {
        //             entity = new Enemy();
        //         } else if (ent == 17) {
        //             entity = new Blocker();
        //         } else if (ent == 18) {
        //             entity = new Chucker();
        //         } else if (ent == 25) {
        //             SX = x * 16 + 8;
        //             SY = y * 16;
        //         } else if (ent == 27) {
        //             // entity = new Boss();
        //         }

        //         if (entity) {
        //             entity.pos.x = (x + 0.5) * this.tileSize;
        //             entity.pos.y = y * this.tileSize;
        //             entities.push(entity);
        //         }
        //     }
        // }
    },

    place(f, x, y, con) {
        if (f >= 0) {
            var frame = new PIXI.Rectangle(f % cols * 16, Math.floor(f / cols) * 16, this.tileSize, this.tileSize);
            var sprite = new PIXI.Sprite(new PIXI.Texture(resources['tiles'].texture, frame));

            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;

            sprite.position.x = (x+0.5) * this.tileSize;
            sprite.position.y = (y+0.5) * this.tileSize;

            con.addChild(sprite);
        }
    },

    check: function(entity, axis) {
        if (entity.moveThroughWalls) return;

        var startX = Math.floor(entity.left() / this.tileSize);
        var startY = Math.floor(entity.top() / this.tileSize);

        var endX = Math.ceil(entity.right() / this.tileSize);
        var endY = Math.ceil(entity.bot() / this.tileSize);

        for (var y = startY; y < endY; y++) {
            for (var x = startX; x < endX; x++) {
                var f = placement[y * tileMapWidth + x] - 1;

                // if (entity == player && player.winPause < 0 && f == 24) {
                //     track({
                //         event: 'Beat Level',
                //         properties: {
                //             level: levelNum,
                //             level_name: level
                //         }
                //     });
                //     levelNum++;
                //     start();
                // }

                var tile = this.getTile(x, y);
                if (tile != 0) {
                    // if (entity == player && tile >= 9 && tile <= 12) {
                    //     if ((x+0.5) * this.tileSize < entity.right() &&
                    //         (y+0.5) * this.tileSize < entity.bot() &&
                    //         (x+0.5) * this.tileSize > entity.left() &&
                    //         (y+0.5) * this.tileSize > entity.top()) {

                    //         player.die()
                    //     }
                    //     continue;
                    // }
                    // if (x * this.tileSize < entity.right() &&
                    //     y * this.tileSize < entity.bot() &&
                    //     (x+1) * this.tileSize > entity.left() &&
                    //     (y+1) * this.tileSize > entity.top()) {

                        if (axis == 0) {
                            if ((x+0.5) * this.tileSize - entity.pos.x > 0) {
                                entity.pos.x += x * this.tileSize - entity.right();
                                entity.hitWall(1);
                            } else {
                                entity.pos.x += (x+1) * this.tileSize - entity.left();
                                entity.hitWall(-1);
                            }
                        } else {
                            if ((y+0.5) * this.tileSize - entity.pos.y > 0) {
                                entity.pos.y = y * this.tileSize - entity.halfHeight;
                                entity.hitGround();
                            } else {
                                entity.pos.y = (y+1) * this.tileSize + entity.halfHeight;
                            }
                        }
                        return;
                    // }
                }
            }
        }
    },

    getTile: function(x, y) {
        if (x < 0 || y < 0 || x >= tileMapWidth || y >= tileMapHeight) return 1;
        return placement[y * tileMapWidth + x];
    }
}
