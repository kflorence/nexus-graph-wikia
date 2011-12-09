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
		var canvas = this.canvas,
			context = this.context;

		// Blank out the canvas
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);

		// Draw the edges
        this.system.eachEdge(function(edge, pt1, pt2) {
			// edge: {source:Node, target:Node, length:#, data:{}}
			// pt1:  {x:#, y:#}  source position in screen coords
			// pt2:  {x:#, y:#}  target position in screen coords

			// draw a line from pt1 to pt2
			context.strokeStyle = "black";
			context.lineWidth = 1;
			context.beginPath();
			context.moveTo(pt1.x, pt1.y);
			context.lineTo(pt2.x, pt2.y);
			context.stroke();
		});

		// Draw the nodes
        this.system.eachNode(function(node, pt) {
			// node: {mass:#, p:{x,y}, name:"", data:{}}
			// pt:   {x:#, y:#}  node position in screen coords

			// draw a rectangle centered at pt
			var width = context.measureText(node.name).width,
				x = (pt.x - (width / 2)),
				y = pt.y;

			context.fillStyle = "black";
			context.fillRect(x - 10, pt.y - 12, width + 20, width / 2);
			context.fillStyle = "white";
			context.fillText(node.name, x, y);
		});
	}
};

// Export
window.NexusGraphRenderer = NexusGraphRenderer;

})(jQuery);