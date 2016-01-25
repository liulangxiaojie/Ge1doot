/* 
 Spheres - v.1.0.0 - 2014/01/03 
 PROCESSINGJS.COM HEADER ANIMATION  
 MIT License - F1lT3R/Hyper-Metrix
 Modified by Casey Reas, 7 Nov 2013
 Modified by slsdo, 3 Jan 2014
 Javascript adaptation by ge1doot, 25 Oct 2015
*/

~ function() {

		'use strict';

		// setup

		var count = 50,
				circles = [],
				ds = 2,
				dragging = false,
				colors = ['#f80', '#08f', '#666'],
				maxRad, grd;

		// Circle constructor

		function Circle() {

				this.rad = 10 + Math.random() * maxRad; // radius
				this.rad2 = this.rad * this.rad;
				this.pos = new Vector(canvas.width * Math.random(), canvas.height * Math.random()); // Location
				this.vel = new Vector(Math.random() - 0.5, Math.random() - 0.5); // Speed
				this.acc = new Vector(); // Acceleration
				this.offset = new Vector(); // Offset from mouse
				this.force = new Vector(); // force
				this.c = colors[Math.floor(Math.random() * colors.length)]; // Color
				this.locked = false;
				this.parent = null;
				this.k = 0.1; // Spring constant
				this.damp = 0.98; // Damping

		}

		// circle update

		Circle.prototype.update = function() {

				this.acc.set(0, 0);

				if (this.locked && this.parent === null) {

						// Move the particle's coordinates to the mouse's position, minus its original offset
						this.acc.sub(this.force.sub(pointer, this.offset), this.pos).limit(1);
						this.vel.selfAdd(this.acc).limit(3); // Apply acceleration
						this.pos.sub(pointer, this.offset);

				} else if (this.locked && this.parent !== null && this.pos.dist2(this.parent.pos) >= this.parent.rad2) {

						// Move the particle's coordinates to the parent's position, minus its original offset
						this.force.sub(this.pos, this.parent.pos).selfMult(-this.k);
						this.acc.div(this.force, this.rad * 0.5); // Set acceleration
						this.vel.mult(this.force.add(this.vel, this.acc), this.damp).limit(14); // Set velocity
						this.pos.selfAdd(this.vel); // Updated position

				} else {

						this.vel.selfAdd(this.acc.limit(1)); // Apply acceleration
						if (this.vel.mag2() > 0.5 * 0.5) {
								this.vel.selfMult(0.99); // Velocity damping
						}
						this.pos.selfAdd(this.vel); // Move circle

				}

				var dm = this.rad * 1; // Cache diameter
				// Wrap around canvas edges
				if (this.pos.x < -dm) this.pos.x = canvas.width + dm;
				if (this.pos.x > canvas.width + dm) this.pos.x = -dm;
				if (this.pos.y < -dm) this.pos.y = canvas.height + dm;
				if (this.pos.y > canvas.height + dm) this.pos.y = -dm;
			
		};

		// circle render

		Circle.prototype.render = function() {

				ctx.beginPath();

				if (this.pos.dist2(pointer) < this.rad2) {
						ctx.fillStyle = '#f20';
						ctx.globalAlpha = 0.35;
						pointer.over = true;
				} else {
						ctx.fillStyle = this.c;
						ctx.globalAlpha = 0.35;
				}

				ctx.arc(this.pos.x, this.pos.y, this.rad, 0, 2 * Math.PI);
				ctx.fill();

				ctx.strokeStyle = '#777777';
				ctx.globalAlpha = 0.35;

				// Loop through all circles
				for (var j = 0; j < count; j++) {
						var that = circles[j];
						// If the circles are close
						if (this.pos.dist2(that.pos) < this.rad2 * 1.44) {
								// Stroke a line from current circle to adjacent circle
								ctx.beginPath();
								ctx.moveTo(this.pos.x, this.pos.y);
								ctx.lineTo(that.pos.x, that.pos.y);
								ctx.stroke();
								// Attach it to parent
								if (this.locked && !that.locked) {
										that.locked = true;
										that.parent = this;
								}
						} else if (that.parent != null && that.parent === this) {
								ctx.beginPath();
								ctx.moveTo(this.pos.x, this.pos.y);
								ctx.lineTo(that.pos.x, that.pos.y); // Link to parent
								ctx.stroke();
						}
				}
				ctx.fillStyle = '#fff';
				ctx.fillRect(this.pos.x - ds, this.pos.y - ds, ds * 2, ds * 2); // Draw dot in center of circle

		};

		// main draw loop

		function draw() {

				requestAnimationFrame(draw);
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.globalCompositeOperation = 'lighter';
				pointer.over = false;

				// looping through circle array

				for (var i = 0; i < count; i++) {
						circles[i].update();
						circles[i].render();
				}

				// cursor

				if (dragging) {
						canvas.setCursor('move');
				} else {
						if (pointer.over) canvas.setCursor('pointer');
						else canvas.setCursor('default');
				}

				// vignette

				ctx.globalAlpha = 1;
				ctx.globalCompositeOperation = 'source-over';
				ctx.fillStyle = grd;
				ctx.fillRect(0, 0, canvas.width, canvas.height);

		}

		// create canvas context and pointer
    
		var ctx = canvas.init();

		// canvas resize event function

		canvas.resize = function() {

				// radius
				maxRad = Math.round(Math.sqrt(Math.min(this.width, this.height)) * 5);
				// vignette
				var outerRadius = this.width * 0.7;
				var innerRadius = this.height * 0.3;
				grd = ctx.createRadialGradient(this.width / 2, this.height / 2, innerRadius, this.width / 2, this.height / 2, outerRadius);
				grd.addColorStop(0, 'rgba(0,0,0,0)');
				grd.addColorStop(1, 'rgba(0,0,0,1)');

		};

		canvas.resize();

		// pointer

		var pointer = canvas.pointer();

		// pointer down event

		pointer.down = function() {

				// Look for a circle the mouse is in, then lock that circle to the mouse
				for (var i = 0; i < count; i++) {
						// If the circles are close...
						if (circles[i].pos.dist2(this) < circles[i].rad2) {
								circles[i].locked = true;
								circles[i].offset.sub(this, circles[i].pos);
								dragging = true; // Break out of the loop because we found our circle
								break;
						}
				}

		};

		// pointer up event

		pointer.up = function() {

				// User is no-longer dragging
				for (var i = 0; i < count; i++) {
						circles[i].offset.set(0, 0);
						circles[i].locked = false;
						circles[i].parent = null; // Clear parent
				}
				dragging = false;

		};

		// create circles

		for (var i = 0; i < count; i++) {
				circles[i] = new Circle();
		}

		// start

		draw();

}();