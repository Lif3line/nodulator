/*
*	Take in an image, convert it to a bunch of colourful nodes painted onto a canvas then animate those notes so they
* dynamically move away from the mouse while hovering or towards it while the left mouse button is held down.
* Adam Hartwell 2014.
*/

/*** Shim for ensuring animation always works ***/
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
//
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

/*** Contain within a module for re-usability ***/
var Nodulator = {

	settings: {
		inputID: 'imageLoader', // ID of image input element to add listener to
		canvasID: 'nodeBox',

		nodeSparsity: 12,       // Distance(px) between nodes on creation
		drawThreshold: 220,     // Grayscale threshold; pixels whiter than this value will not be converted to nodes (0-255)

		nodeRadius: 5,          // Radius(px) of nodes when drawn
		pushRating: 150,        // To minimise computation these ratings are used; fairly arbitary
		pullRating: 50,         // higher number = greater push/pull strength
		returnPercent: 0.05,    // Percentage of distance moved back towards starting point each frame

		mouseOutDistance: -9999 // When off canvas assume mouse is arbitrarily too far away to affect nodes
	},

	canvas: null, // Canvas data
	ctx: null,    // Canvas context data

	nodes: [],    // Array for nodes; each node is an object containing current and initial X & Y co-ordinates and the nodes colour

	mouse: {      // Mouse starting set up as far as canvas is concerned
		x: -9999,
		y: -9999,
		down: false
	},

	/*** Add listeners then start animating using a default image ***/
	init: function() {
		this.canvas = document.getElementById(this.settings.canvasID);
		this.ctx = this.canvas.getContext('2d');

		this.ctx.canvas.width  = window.innerWidth; //Set canvas to current window size - minus space for image input
		this.ctx.canvas.height = window.innerHeight - 50;

		document.getElementById(this.settings.inputID).addEventListener('change', this.updateImage, false);

		/* Mouse listeners */
		window.addEventListener('mouseup',   this.mouseUp,   false);	// Detect mouse up/down anywhere
		window.addEventListener('mousedown', this.mouseDown, false);
		this.canvas.addEventListener('mouseout',  this.mouseLeave,  false);
		this.canvas.addEventListener('mousemove', this.mouseMove, false);

		/* Touch screen listeners */
		var touchable = 'createTouch' in document; // Check whether to add the relevant listeners

		if(touchable) {
			this.canvas.addEventListener("touchstart", this.mouseMove, false);
			this.canvas.addEventListener("touchmove", this.mouseMove, false);
			this.canvas.addEventListener("touchend", this.mouseUp, false);
			this.canvas.addEventListener("touchcancel", this.mouseLeave, false);
			this.canvas.addEventListener("touchleave", this.mouseLeave, false);
		}

		this.generateNodes('default.jpg'); 	// Create nodes based on default image and start animating
	},

	/*** Recursive animation of nodes ***/
	animate: function() {
		 this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //Clear

		 /* Update and redraw */
		 this.updateNodes();
		 this.drawNodes();

		 requestAnimationFrame(function(){ Nodulator.animate() }); //Get new frame (see below for compatability shim)
	},

	/*** Calculate how far nodes should move to avoid the mouse - update positions accordingly ***/
	updateNodes: function() { // Work in polar format with radians (save conversions) where the node is in relation to the mouse
		var i, angle, distance;
		for (i = 0; i < this.nodes.length; i++ ){
			angle = Math.atan2(this.nodes[i].y - this.mouse.y, this.nodes[i].x - this.mouse.x);
			distance =  Math.sqrt(Math.pow(this.mouse.x - this.nodes[i].x,2) + Math.pow(this.mouse.y - this.nodes[i].y,2));

			/* Calculate new position for nodes based on distance from mouse and from its origin */
			if (!this.mouse.down) { // Move away from mouse
				this.nodes[i].x += Math.cos(angle) * (this.settings.pushRating / distance) + (this.nodes[i].initX - this.nodes[i].x)
					* this.settings.returnPercent;
				this.nodes[i].y += Math.sin(angle) * (this.settings.pushRating / distance) + (this.nodes[i].initY - this.nodes[i].y)
					* this.settings.returnPercent;
			} else if (distance > 10) { // Suck towards mouse if pull is sufficient (and mouse down) - stop moving when near to mouse
				this.nodes[i].x += Math.cos(angle) * -(this.settings.pullRating / distance) + (this.nodes[i].initX - this.nodes[i].x)
					* this.settings.returnPercent;
				this.nodes[i].y += Math.sin(angle) * -(this.settings.pullRating / distance) + (this.nodes[i].initY - this.nodes[i].y)
					* this.settings.returnPercent;
			}
		}
	},

	/*** Draw each node ***/
	drawNodes: function() {
		for(var i = 0; i < this.nodes.length; i++) {
			this.ctx.fillStyle = this.nodes[i].colour;
			this.ctx.strokeStyle = this.nodes[i].colour;
			this.ctx.beginPath();
			this.ctx.arc(this.nodes[i].x, this.nodes[i].y, this.settings.nodeRadius ,0 , 6.284); //6.284 instead of 2*pi used for effeciency
			this.ctx.closePath();
			this.ctx.fill();
		}
	},

	/*** Mouse functions ***/
	mouseDown: function(e) { // Note that mouse is down
		Nodulator.mouse.down = true;
	},

	mouseMove: function(e) { // Save mouse position (using whichever method works in current browser)
		Nodulator.mouse.x = e.offsetX || (e.layerX - Nodulator.canvas.offsetLeft);
		Nodulator.mouse.y = e.offsetY || (e.layerY - Nodulator.canvas.offsetTop);
	},

	mouseUp: function(e) {   // Note that mouse is up
		Nodulator.mouse.down = false;
	},

	mouseLeave: function(e) { // Move mouse far enough away to not affect nodes
		Nodulator.mouse.x = Nodulator.settings.mouseOutDistance;
		Nodulator.mouse.y = Nodulator.settings.mouseOutDistance;
	},

	/*** Load in new image and move on to generation nodes and animating immediately ***/
	updateImage: function(e) {
		var reader = new FileReader();
		reader.onload = function(event){
			Nodulator.generateNodes(event.target.result);
		}
		reader.readAsDataURL(e.target.files[0]);
	},

	/*** Take in an image source and convert it into the titular nodes***/
	generateNodes: function(src) {
		var img = new Image();

		img.onload = function() { // Draw onto canvas to access pixel data
			Nodulator.nodes =[];  // Flush any existing nodes

			Nodulator.ctx.clearRect(0, 0, Nodulator.canvas.width, Nodulator.canvas.height); // Clear canvas

			var offsetX = Math.floor((Nodulator.canvas.width - img.width) / 2);             // Center image within canvas
			var offsetY = Math.floor((Nodulator.canvas.height - img.height) / 2);

			Nodulator.ctx.drawImage(img, offsetX, offsetY); // Actual drawing

			/* Get image data and associated pixel data to work with */
			var imageData = Nodulator.ctx.getImageData(0, 0, Nodulator.canvas.width, Nodulator.canvas.height);
			var pixelData = imageData.data;
			var i, j, pos, colour, node; // Variables for loop

			/* Loop to check each pixel in a grid with spaces defined by this.nodeSparsity*/
			for (i = 0; i < Nodulator.canvas.width; i += Nodulator.settings.nodeSparsity) {
				for (j = 0; j < Nodulator.canvas.height; j += Nodulator.settings.nodeSparsity) {
					pos = (i + (j * imageData.width)) * 4;
					/* Data set up in 1D array: R-G-B-A and repeat */
					if (pixelData[pos] > Nodulator.settings.drawThreshold && pixelData[pos + 1] > Nodulator.settings.drawThreshold
					&& pixelData[pos + 2] > Nodulator.settings.drawThreshold  || pixelData[pos + 3] === 0) {
						continue; // Ignore pixels that are too white or are transparent (canvas background)
					} else {

						colour = 'rgba(' + pixelData[pos] + ',' + pixelData[pos + 1] + ',' + pixelData[pos + 2] + ',' + '1)';

						node = { // Node object literal
							x: i,
							y: j,
							initX: i,
							initY: j,
							colour: colour
						}
						Nodulator.nodes.push(node); // Append to the array of nodes
					}
				}
			}
			Nodulator.animate(); // Place here to ensure only started once node generation is complete
		};
		img.src = src;
	}
}

Nodulator.init(); //Start the Nodulator!!
