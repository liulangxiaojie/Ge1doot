var ge1doot = ge1doot || {};
ge1doot.Canvas = function()
{  
	"use strict";
	this.elem = document.createElement("canvas");
	document.body.appendChild(this.elem);
	this.elem.onselectstart = function() { return false; }
	this.elem.ondrag = function() { return false; }
	this.ctx = this.elem.getContext("2d");
	this.pointer = {
		x: 0,
		y: 0,
		isDown: false,
		down: null,
		up: null,
		move: null
	}
	this.down = function(e, touch)
	{
		e.preventDefault();
		var pointer = touch ? e.touches[0] : e;
		(!touch && document.setCapture) && document.setCapture();
		this.pointer.x = pointer.clientX;
		this.pointer.y = pointer.clientY;
		this.pointer.isDown = true;
		this.pointer.down && this.pointer.down();
	}
	this.up = function(e, touch)
	{
		e.preventDefault();
		(!touch && document.releaseCapture) && document.releaseCapture();
		this.pointer.isDown = false;
		this.pointer.up && this.pointer.up();

	}
	this.move = function(e, touch)
	{
		e.preventDefault();
		var pointer = touch ? e.touches[0] : e;
		(!touch && document.setCapture) && document.setCapture();
		this.pointer.x = pointer.clientX;
		this.pointer.y = pointer.clientY;
		this.pointer.move && this.pointer.move();
	}
	this._resize = function()
	{
		var w = this.elem.offsetWidth * 1;
		var h = this.elem.offsetHeight * 1;
		if (w != this.width || h != this.height)
		{
			this.width = this.elem.width = w;
			this.height = this.elem.height = h;
			this.resize && this.resize();
		}
	}
	window.addEventListener('resize', this._resize.bind(this), false);
	this._resize();
	if ('ontouchstart' in window)
	{
		this.elem.ontouchstart = function(e) { this.down(e, true); }.bind(this);
		this.elem.ontouchmove  = function(e) { this.move(e, true); }.bind(this);
		this.elem.ontouchend   = function(e) { this.up(e, true);   }.bind(this);
	}
	document.addEventListener("mousedown", function(e) { this.down(e, false); }.bind(this), true);
	document.addEventListener("mousemove", function(e) { this.move(e, false); }.bind(this), true);
	document.addEventListener("mouseup", function(e)   { this.up(e, false);   }.bind(this), true);
}