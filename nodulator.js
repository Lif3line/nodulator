/*
*	Take in an image, convert it to a bunch of colourful nodes painted onto a canvas then animate those notes so they dynamically move away
*	from the mouse while hovering or towards it while the left mouse button is held down. Optionally lines of a thickness proportional to the
*	distance between nodes may be drawn between nodes for added special effects.
*/

/*** Contain within a module for re-usability ***/
var Nodulator = {

	settings: {
		inputID: 'imageLoader' //ID of image input element to add listener to
	},

	init: function() {
		document.getElementById(this.settings.inputID).addEventListener('change', this.updateImage, false);
	}

	updateImage: function() {

	}


}
