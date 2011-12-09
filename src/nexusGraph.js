/* NexusGraph.js
 * Creates our graphing environment and manages user interaction
 *
 * @author Kyle Florence
 * @website http://github.com/kflorence/wikia-nexus-graph/
 *
 */

(function($, window, undefined) {

var NexusGraph = function(canvas, options) {
	this.canvas = canvas;

	// Set up the particle system
	this.particleSystem = arbor.ParticleSystem(options);

	// Pass the rendering off to NexusGraphRenderer
	this.particleSystem.renderer = new NexusGraphRenderer(this);

	// Listen for window resize events
	$(window).resize($.proxy(this.setScreenSize, this));
};

NexusGraph.prototype = {
	mouseDown: function(e) {
	},
	mouseMove: function(e) {
	},
	mouseUp: function(e) {
	},

	// Set the the size of the canvas
	setScreenSize: function() {

		// Pass this on to the particle system to perform a redraw
		this.particleSystem.screenSize(
				this.canvas.width = window.innerWidth, this.canvas.height = window.innerHeight);
	}
};

// Export
window.NexusGraph = NexusGraph;

})(jQuery, window);