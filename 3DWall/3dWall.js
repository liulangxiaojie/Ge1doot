var ge1doot = ge1doot || {};
ge1doot.Canvas = function() {
    "use strict";
    this.elem = document.createElement("canvas");
    document.body.appendChild(this.elem);
    this.elem.onselectstart = function() {
        return false;
    }
    this.elem.ondrag = function() {
        return false;
    }
    this.ctx = this.elem.getContext("2d");
    this.pointer = {
        x: 0,
        y: 0,
        isDown: false,
        down: null,
        up: null,
        move: null
    }
    this.down = function(e, touch) {
        e.preventDefault();
        var pointer = touch ? e.touches[0] : e;
        (!touch && document.setCapture) && document.setCapture();
        this.pointer.x = pointer.clientX;
        this.pointer.y = pointer.clientY;
        this.pointer.isDown = true;
        this.pointer.down && this.pointer.down();
    }
    this.up = function(e, touch) {
        e.preventDefault();
        (!touch && document.releaseCapture) && document.releaseCapture();
        this.pointer.isDown = false;
        this.pointer.up && this.pointer.up();

    }
    this.move = function(e, touch) {
        e.preventDefault();
        var pointer = touch ? e.touches[0] : e;
        (!touch && document.setCapture) && document.setCapture();
        this.pointer.x = pointer.clientX;
        this.pointer.y = pointer.clientY;
        this.pointer.move && this.pointer.move();
    }
    this._resize = function() {
        var w = this.elem.offsetWidth * 1;
        var h = this.elem.offsetHeight * 1;
        if (w != this.width || h != this.height) {
            this.width = this.elem.width = w;
            this.height = this.elem.height = h;
            this.resize && this.resize();
        }
    }
    window.addEventListener('resize', this._resize.bind(this), false);
    this._resize();
    if ('ontouchstart' in window) {
        this.elem.ontouchstart = function(e) {
            this.down(e, true);
        }.bind(this);
        this.elem.ontouchmove = function(e) {
            this.move(e, true);
        }.bind(this);
        this.elem.ontouchend = function(e) {
            this.up(e, true);
        }.bind(this);
    }
    document.addEventListener("mousedown", function(e) {
        this.down(e, false);
    }.bind(this), true);
    document.addEventListener("mousemove", function(e) {
        this.move(e, false);
    }.bind(this), true);
    document.addEventListener("mouseup", function(e) {
        this.up(e, false);
    }.bind(this), true);
}

! function() {
    "use strict";
    var canvas = new ge1doot.Canvas();
    var ctx = canvas.ctx;
    var pointer = canvas.pointer;
    var cube = [];
    // Easing
    var Ease = function(v) {
        this.target = v || 0;
        this.position = v || 0;
    }
    Ease.prototype.move = function(target, speed) {
            this.position += (target - this.position) * speed;
        }
        // predefine background texture
    var texture;
    canvas.resize = function() {
        texture = document.createElement('canvas');
        texture.width = canvas.width;
        texture.height = canvas.height;
        var ict = texture.getContext('2d');
        ict.fillStyle = 'rgba(0,0,0,0.2)';
        ict.fillRect(0, 0, canvas.width, canvas.height);
        ict.fillStyle = 'rgba(255,255,255,1)';
        ict.fillRect(0, 0, canvas.width, canvas.height * 0.1);
        ict.fillRect(0, canvas.height * 0.9, canvas.width, canvas.height * 0.1);
    }
    canvas.resize();
    var angle = {
        x: new Ease(1),
        y: new Ease(1)
    }
    var fov = new Ease(350);
    var zoom = new Ease(0);
    // Vertex
    var Point = function(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.xp = 0;
            this.yp = 0;
        }
        // 3D to 2D
    Point.prototype.project = function(cube, angle, c) {
            var x = this.x + c * cube.rx * 50;
            var y = this.y + c * cube.ry * 50;
            var z = this.z + c * cube.rz * 50;
            // rotation
            var xy = angle.cx * y - angle.sx * z;
            var xz = angle.sx * y + angle.cx * z;
            var yz = angle.cy * xz - angle.sy * x;
            var yx = angle.sy * xz + angle.cy * x;
            // projection
            var scale = fov.position / (fov.position + yz);
            this.xp = canvas.width * 0.5 + yx * scale * zoom.position;
            this.yp = canvas.height * 0.5 + xy * scale * zoom.position;
            if (yz < -fov.position) cube.visible = false;
        }
        // Cube definition
    var Cube = function(x, y, z, w, h, p, color, rx, ry, rz) {
            this.rx = rx;
            this.ry = ry;
            this.rz = rz;
            this.r = 0;
            this.s = Math.random() * 2 * Math.PI;
            var v = Math.random() * 0.2;
            this.si = v * v;
            this.fill = color.face;
            this.stroke = color.stroke;
            this.over = color.over;
            // 3D coordinates
            this.coord = [
                new Point(x - w, y - h, z),
                new Point(x + w, y - h, z),
                new Point(x + w, y + h, z),
                new Point(x - w, y + h, z),
                new Point(x - w, y - h, z + p),
                new Point(x + w, y - h, z + p),
                new Point(x + w, y + h, z + p),
                new Point(x - w, y + h, z + p)
            ];
            // faces definition
            var c = this.coord;
            this.vertices = [
                [c[0], c[1], c[2], c[3]],
                [c[0], c[4], c[5], c[1]],
                [c[3], c[2], c[6], c[7]],
                [c[0], c[3], c[7], c[4]],
                [c[1], c[5], c[6], c[2]],
                [c[5], c[4], c[7], c[6]]
            ];
        }
        // Paint cube
    Cube.prototype.project = function() {
            this.visible = true;
            // points
            var c = Math.cos(this.s += this.si);
            for (var i = 0; i < 8; i++) {
                this.coord[i].project(this, angle, c);
            }
            // faces
            for (var f = 0; f < 6; f++) {
                var p = this.vertices[f],
                    p0, p1;
                // backface culling
                if (this.visible && ((p[1].yp - p[0].yp) / (p[1].xp - p[0].xp) < (p[2].yp - p[0].yp) / (p[2].xp - p[0].xp) ^ p[0].xp < p[1].xp == p[0].xp > p[2].xp)) {
                    // offset face by 1 pixel
                    if (this.r <= 0) {
                        ctx.beginPath();
                        var x, y, d;
                        for (var i = 0; i < 4; ++i) {
                            // the vertex before
                            p0 = p[(i > 0) ? i - 1 : 3];
                            // this vertex
                            p1 = p[i];
                            // compute line vectors (assume CW face)
                            y = p0.xp - p1.xp;
                            x = p1.yp - p0.yp;
                            // normal length
                            d = 1 / Math.sqrt(x * x + y * y);
                            // draw parallel lines
                            ctx.lineTo(p0.xp + x * d, p0.yp + y * d);
                            ctx.lineTo(p1.xp + x * d, p1.yp + y * d);
                        }
                        // fill polygon
                        ctx.closePath();
                        ctx.fillStyle = this.stroke;
                        ctx.fill();
                    }
                    // paint face color
                    ctx.beginPath();
                    var c = false,
                        x = pointer.x,
                        y = pointer.y;
                    for (var i = -1, j = 3; ++i < 4; j = i) {
                        ctx.lineTo(p[i].xp, p[i].yp);
                        // is pointer in face?
                        if (
                            ((p[i].yp <= y && y < p[j].yp) || (p[j].yp <= y && y < p[i].yp)) &&
                            (x <= (p[j].xp - p[i].xp) * (y - p[i].yp) / (p[j].yp - p[i].yp) + p[i].xp)
                        ) c = !c;
                    }
                    if (c) this.r = 100;
                    if (this.r > 0) {
                        ctx.globalCompositeOperation = 'lighter';
                        ctx.fillStyle = this.over;
                        ctx.fill();
                        ctx.globalCompositeOperation = 'source-over';
                    } else {
                        ctx.fillStyle = this.fill;
                        ctx.fill();
                    }
                    ctx.closePath();
                }
            }
            this.r--;
        }
        // main animation loop
    var run = function() {
            requestAnimationFrame(run);
            ctx.drawImage(texture, 0, 0);
            // camera rotation
            angle.x.move(-(pointer.y - (canvas.height * 0.5)) * .002, 0.1);
            angle.y.move((pointer.x - (canvas.width * 0.5)) * .002, 0.1);
            fov.move(pointer.isDown ? 100 : 350, 0.05);
            zoom.move(pointer.isDown ? 1 : 1, 0.025);
            // angles 
            angle.cx = Math.cos(angle.x.position);
            angle.sx = Math.sin(angle.x.position);
            angle.cy = Math.cos(angle.y.position);
            angle.sy = Math.sin(angle.y.position);
            // 3D to 2D projection
            for (var i = 0, len = cube.length; i < len; i++) {
                cube[i].project();
            }
        }
        // create cubes structure
    var createStructure = function() {
        var r = function(d0, d1) {
            return Math.round(Math.random() * (d1 - d0) + d0);
        };
        var c = function() {
            var color = [{
                face: '#000000',
                stroke: '#333333',
                over: 'rgba(255, 128, 0, 0.25)'
            }, {
                face: '#444444',
                stroke: '#777777',
                over: 'rgba(255, 128, 0, 0.25)'
            }, {
                face: '#ffffff',
                stroke: '#aaaaaa',
                over: 'rgba(255, 128, 0, 0.25)'
            }];
            return color[Math.floor(Math.random() * 3)];
        };
        var w = 50;
        for (var z = 320; z > -320; z -= 10) {
            cube.push(
                new Cube(
                    r(-w, w), r(-w, w), z,
                    r(2, 30), r(2, 30), r(2, 80), c(), 0, 0, 1
                )
            );
            if (z > -50 && z < 50) {
                for (var i = 0; i < 4; i++) {
                    cube.push(
                        new Cube(
                            r(-320, 320), r(-w, w), z,
                            r(2, 80), r(2, 30), r(2, 30), c(), 1, 0, 0
                        )
                    );
                    cube.push(
                        new Cube(
                            r(-w, w), r(-320, 320), z,
                            r(2, 30), r(2, 80), r(2, 30), c(), 0, 1, 0
                        )
                    );
                }
            }
        }
    }
    createStructure();
    pointer.x = canvas.width / 2;
    pointer.y = canvas.height / 2;
    run();
}();