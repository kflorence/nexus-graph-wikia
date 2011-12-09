/* NexusGraphRenderer.js
 * Renders things on the canvas.
 * 
 * @author Kyle Florence
 * @website http://github.com/kflorence/wikia-nexus-graph/
 *
 */

(function($, undefined) {

var NexusGraphRenderer = function(graph) {
	this.graph = graph;
	this.canvas = graph.canvas;
	this.system = graph.particleSystem;

	// Get the rendering context of the canvas on a 2d plane
	this.context = this.canvas.getContext('2d');
}

NexusGraphRenderer.prototype = {

	// Called once by arbor before any drawing begins
	init: function() {

		// Set initial screen size
		this.graph.setScreenSize();
	},

	// Called repeatedly whenever node positions change and the canvas needs to be redrawn
	redraw: function() {
		var cvs = this.canvas,
			ctx = this.context;

		// Blank out the canvas
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, cvs.width, cvs.height);

		// Draw the edges
        this.system.eachEdge(function(edge, pt1, pt2) {
			// edge: {source:Node, target:Node, length:#, data:{}}
			// pt1:  {x:#, y:#}  source position in screen coords
			// pt2:  {x:#, y:#}  target position in screen coords

			// draw a line from pt1 to pt2
			ctx.strokeStyle = "rgba(0, 0, 0, .333)";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(pt1.x, pt1.y);
			ctx.lineTo(pt2.x, pt2.y);
			ctx.stroke();
		});

		// Draw the nodes
        this.system.eachNode(function(node, pt) {
			// node: {mass:#, p:{x,y}, name:"", data:{}}
			// pt:   {x:#, y:#}  node position in screen coords

			// draw a rectangle centered at pt
			var w = 10;
			ctx.fillStyle = (node.data.alone) ? "orange" : "black";
			ctx.fillRect(pt.x - w / 2, pt.y - w / 2, w, w);
		});
	}
};

// Export
window.NexusGraphRenderer = NexusGraphRenderer;

})(jQuery);