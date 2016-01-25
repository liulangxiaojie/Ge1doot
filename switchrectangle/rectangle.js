
/* 
 * ==============================================================
 * javascript 3D experiment * ===============================================================
 */

"use strict";

(function () {
	/* ==== easing function ==== */
	var Ease = function () {
		this.target   = 0;
		this.position = 0;
	}
	Ease.prototype.move = function (target, speed) {
		this.position += (target - this.position) * speed;
	}
	/* ==== definitions ==== */
	var scr, pointer, mouseZ, over, zoom,
	buffer = [],
	angle = {
		x : new Ease(),
		y : new Ease()
	},
	camera = {
		x : new Ease(),
		y : new Ease(),
		focalLength : 500
	},
	create3DHTML = function (i, x, y, z) {
		/* ==== create image element ==== */
		var img = document.createElement('img');
		img.src = i.src;
		scr.elem.appendChild(img);
		/* ==== constructor ==== */
		var Elem = function (img, x, y) {
			this.img = img;
			this.img.parent = this;
			this.point3D = {
				x  : x,
				y  : y,
				z  : new Ease(),
				w  : img.width * zoom,
				h  : img.height * zoom
			};
			this.next = true;
		}
		/* ==== main 3D function ==== */
		Elem.prototype.animate = function () {
			/* ---- 3D coordinates ---- */
			var x = this.point3D.x - camera.x.position;
			var y = this.point3D.y - camera.y.position;
			this.point3D.z.move(this.point3D.z.target, this.point3D.z.target ? .15 : .08);
			/* ---- rotations ---- */
			var xy = angle.cx * y  - angle.sx * this.point3D.z.position;
			var xz = angle.sx * y  + angle.cx * this.point3D.z.position;
			var yz = angle.cy * xz - angle.sy * x;
			var yx = angle.sy * xz + angle.cy * x;
			/* ---- 2D transform ---- */
			var scale = camera.focalLength / (camera.focalLength + yz);
			x = yx * scale;
			y = xy * scale;
			var w = Math.round(Math.max(0, this.point3D.w * scale * 0.5));
			var h = Math.round(Math.max(0, this.point3D.h * scale * 0.5));
			/* ---- HTML rendering ---- */
			var o    = this.img.style;
			o.left   = Math.round(x + scr.width  * 0.5 - w * .5) + 'px';
			o.top    = Math.round(y + scr.height * 0.5 - h * .5) + 'px';  
			o.width  = w + 'px';
			o.height = h + 'px';
			o.zIndex = 1000 + Math.round(scale * 100);
			return this.next;
		}
		/* ==== create object ==== */
		var obj = new Elem(img, x, y);
		obj.point3D.z.target = z;
		buffer.push(obj);
	},
	/* ==== select element ==== */
	selectElem = function () {
		// ---- get element under the pointer ----
		var element = document.elementFromPoint(pointer.Xr, pointer.Yr);
		if (element.parent && element.parent !== over) {
			// ---- move camera ----
			element.parent.point3D.z.target = mouseZ;
			camera.x.target = element.parent.point3D.x;
			camera.y.target = element.parent.point3D.y;
			if (over) over.point3D.z.target = 0;
			over = element.parent;
		}
	},
	/* ==== init script ==== */
	init = function (FL, mZ, rx, ry) {
		// ---- screen ----
		scr = new ge1doot.Screen({
			container: "screen"
		});
		// ---- init pointer ----
		pointer = new ge1doot.Pointer({
			tap: function() {
				selectElem();
			},
			move: function () {
				selectElem();
			}
		});
		/* ==== build grid ==== */
		var img = document.getElementById('bankImages').getElementsByTagName('img');
		zoom = Math.max(scr.width, scr.height) / 1000;
		for (var i = -300; i <= 300; i += 120) {
			for (var j = -300; j <= 300; j += 120) {
				create3DHTML(
					img[0],
					i * zoom,
					j * zoom,
					0
				);
			}
		}
		buffer[buffer.length - 1].next = false;
		mouseZ = mZ * zoom;
		camera.focalLength = FL;
		angle.rx = rx / zoom;
		angle.ry = ry / zoom;
		/* ==== start script ==== */
		pointer.Y = scr.height * 0.5;
		pointer.X = scr.width  * 0.5;
		run();
	},
	/* ==== main loop ==== */
	run = function () {
		/* ==== motion ease ==== */
		angle.x.move(-(pointer.Y - scr.height * 0.5) * angle.rx, .1);
		angle.y.move( (pointer.X - scr.width  * 0.5) * angle.ry, .1);
		camera.x.move(camera.x.target, .025);
		camera.y.move(camera.y.target, .025);
		/* ==== angles sin and cos ==== */ 
		angle.cx = Math.cos(angle.x.position);
		angle.cy = Math.cos(angle.y.position);
		angle.sx = Math.sin(angle.x.position);
		angle.sy = Math.sin(angle.y.position);
		/* ==== fast loop ==== */
		for (
			var i = 0; 
			buffer[i++].animate();
		);
		/* ==== request next animation frame ==== */
		requestAnimFrame(run);
	}
return {
		load : function () {
			window.addEventListener('load', function () {
				/* ==== let's go ==== */
				init(350, -200, .005, .0025);
			}, false);
		}
	}
})().load();
