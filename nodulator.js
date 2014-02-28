/*
*	Take in an image, convert it to a bunch of colourful nodes painted onto a canvas then animate those notes so they dynamically move away
*	from the mouse while hovering or towards it while the left mouse button is held down. Optionally lines of a thickness proportional to the
*	distance between nodes may be drawn between nodes for added special effects.
*/

/*** Contain within a module for re-usability ***/
var Nodulator = {

	settings: {
		inputID: 'imageLoader', //ID of image input element to add listener to
		canvasID: 'nodeBox',

		nodeSparsity: 12, //Distance(px) between nodes on creation
		drawThreshold: 220, //Grayscale pixel threshold; pixels whiter than this value will not be converted to nodes (0-255)

		nodeRadius: 5 //Radius(px) of nodes when drawn
	},

	canvas: null, //Canvas data
	ctx: null,       //Canvas context data

	nodes: [], // Array for nodes; each node is an object containing current and initial X & Y co-ordinates and the nodes colour

	/*** Add listeners then start animating using a default image ***/
	init: function() {
		this.canvas = document.getElementById(this.settings.canvasID);
		this.ctx = this.canvas.getContext('2d');

		document.getElementById(this.settings.inputID).addEventListener('change', this.updateImage, false);
	},

	/*** Note: 'this' context change***/
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

		img.onload = function() { //Draw onto canvas to access pixel data
			Nodulator.ctx.clearRect(0, 0, Nodulator.canvas.width, Nodulator.canvas.height); //Clear canvas

			var offsetX = Math.floor((Nodulator.canvas.width - img.width) / 2); //Center image within canvas
			var offsetY = Math.floor((Nodulator.canvas.height - img.height) / 2);

			Nodulator.ctx.drawImage(img, offsetX, offsetY); //Actual drawing

			/* Get image data and associated pixel data to work with */
			var imageData = Nodulator.ctx.getImageData(0, 0, Nodulator.canvas.width, Nodulator.canvas.height);
			var pixelData = imageData.data;
			var i, j, pos, colour, node; //Variables for loop

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

						node = { //Node object literal
							x: i,
							y: j,
							initX: i,
							initY: j,
							colour: colour
						}
						Nodulator.nodes.push(node); //Append to the array of nodes
					}
				}
			}
			Nodulator.drawNodes(); //Place here to ensure only started once node generation is complete
		};
		img.src = src;
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
	}
}

Nodulator.init();
