/* nexus.js
 *
 * @author Kyle Florence
 * @website http://github.com/kflorence/wikia-nexus-graph/
 *
 */

(function($, window, undefined) {

var nexus = {
	init: function(options) {
		nexus.canvas = $(options.canvas).get(0);
		nexus.context = nexus.canvas.getContext('2d');
		nexus.system = arbor.ParticleSystem(options.system || {});
		nexus.system.renderer = nexus.renderer;
	
		$(window).resize(nexus.events.onWindowResize);
	},
	
	events: {
		onMouseDown: function(e) {
		},
	
		onMouseMove: function(e) {
		},
	
		onMouseUp: function(e) {
		},
	
		onWindowResize: function(e) {
			nexus.renderer.setScreenSize(this.innerWidth, this.innerHeight);
		}
	},
	
	// See: http://arborjs.org/reference
	renderer: {
		init: function() {
			nexus.renderer.setScreenSize(window.innerWidth, window.innerHeight);
		},
	
		redraw: function() {
	
			// Blank out the canvas
	        nexus.context.fillStyle = "white";
	        nexus.context.fillRect(0, 0, nexus.canvas.width, nexus.canvas.height);
	
			// Draw the edges
	        nexus.system.eachEdge(function(edge, pt1, pt2) {
				// edge: {source:Node, target:Node, length:#, data:{}}
				// pt1:  {x:#, y:#}  source position in screen coords
				// pt2:  {x:#, y:#}  target position in screen coords
	
				// draw a line from pt1 to pt2
				nexus.context.strokeStyle = "black";
				nexus.context.lineWidth = 1;
				nexus.context.beginPath();
				nexus.context.moveTo(pt1.x, pt1.y);
				nexus.context.lineTo(pt2.x, pt2.y);
				nexus.context.stroke();
			});

			// Draw the nodes
	        nexus.system.eachNode(function(node, pt) {
				// node: {mass:#, p:{x,y}, name:"", data:{}}
				// pt:   {x:#, y:#}  node position in screen coords
	
				// draw a rectangle centered at pt
				var width = nexus.context.measureText(node.name).width,
					x = (pt.x - (width / 2)),
					y = pt.y;
	
				nexus.context.fillStyle = "black";
				nexus.context.fillRect(x - 10, pt.y - 12, width + 20, width / 2);
				nexus.context.fillStyle = "white";
				nexus.context.fillText(node.name, x, y);
			});
		},
	
		setScreenSize: function(width, height) {
			nexus.system.screenSize(nexus.canvas.width = width, nexus.canvas.height = height);
		}
	}
};

// Exports
window.nexus = nexus;

})(jQuery, this);