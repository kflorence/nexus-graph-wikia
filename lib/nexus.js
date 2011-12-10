/* nexus.js
 *
 * @author Kyle Florence
 * @website http://github.com/kflorence/wikia-nexus-graph/
 *
 */

(function($, window, undefined) {

var nexus = function(options) {
	return nexus.init(options);
};

$.extend(nexus, {
	init: function(options) {
		nexus.canvas = document.getElementById(options.canvas);
		nexus.context = nexus.canvas.getContext('2d');

		// Local data storage
		nexus.data.api = options.api;

		// Set up the arbor particle system
		nexus.system = arbor.ParticleSystem(options.system || {});
		nexus.system.renderer = nexus.renderer;

		// Mouse tracking: the node being dragged
		nexus.dragging = null;

		// Listen to window events
		$(window).unbind('.nexus')
			.bind('mousemove.nexus', nexus.events.onMouseMove)
			.bind('mousedown.nexus', nexus.events.onMouseDown)
			.bind('mouseup.nexus', nexus.events.onMouseUp)
			.bind('resize.nexus', nexus.events.onWindowResize);
		
		return nexus;
	},
	
	data: {
		pages: {}
	},

	events: {
		onMouseDown: function(e) {
			var pos = $(nexus.canvas).offset(),
				mousePos = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);

			// Find the node closest to the mouse pointer position
			nexus.dragging = nexus.system.nearest(mousePos);

			// Don't let physics move the node while we're dragging it
			if (nexus.dragging && nexus.dragging.node !== null) {
				nexus.dragging.node.fixed = true;
			}
		},

		onMouseMove: function(e) {
			var pos = $(nexus.canvas).offset(),
				mousePos = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);

			if (nexus.dragging && nexus.dragging.node !== null) {
				nexus.dragging.node.p = nexus.system.fromScreen(mousePos);
			}
		},

		onMouseUp: function(e) {
			if (!nexus.dragging || nexus.dragging.node === null) return;

			// Allow physical movement again
			nexus.dragging.node.fixed = false;
			nexus.dragging.node.tempMass = 1000;
			nexus.dragging = null;

			return false;
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
		
		clear: function() {
			nexus.context.save();

			nexus.context.fillStyle = nexus.styles.canvas.fill;
	        nexus.context.fillRect(0, 0, nexus.canvas.width, nexus.canvas.height);
	        
	        nexus.context.restore();
		},
		
		drawLine: function(point1, point2) {
			nexus.context.save();

			nexus.context.strokeStyle = nexus.styles.line.stroke;
			nexus.context.lineWidth = nexus.styles.line.width;
			
			nexus.context.beginPath();
			nexus.context.moveTo(point1.x, point1.y);
			nexus.context.lineTo(point2.x, point2.y);
			nexus.context.stroke();
			
			nexus.context.restore();
		},

		drawCircle: function(point, radius) {
			nexus.context.save();

			nexus.context.beginPath();
			nexus.context.arc(point.x, point.y, radius, 0, Math.PI * 2);
			nexus.context.closePath();
			
			nexus.context.fillStyle = nexus.styles.circle.fill;
			nexus.context.fill();

			nexus.context.restore();
		},

		drawText: function(text, point) {
			nexus.context.save();

			nexus.context.fillStyle = nexus.styles.text.fill;
			nexus.context.fillText(text, point.x, point.y);

			nexus.context.restore();
		},

		redraw: function() {
			nexus.renderer.clear();

	        nexus.system.eachEdge(function(edge, point1, point2) {
				nexus.renderer.drawLine(point1, point2, nexus.styles.line);
			});

	        nexus.system.eachNode(function(node, point) {
				var textWidth = nexus.context.measureText(node.name).width,

					// For now, radius is based on page views
					radius = (Math.ceil(node.data.counter/1000000) * 2) || 10;

				nexus.renderer.drawCircle(point, radius);
				nexus.renderer.drawText(node.name, { x: point.x - textWidth / 2, y: point.y });
			});
		},

		setScreenSize: function(width, height) {
			nexus.system.screenSize(nexus.canvas.width = width, nexus.canvas.height = height);
			nexus.renderer.redraw();
		}
	},

	settings: {
		minRadius: 5,
		maxRadius: 20
	},

	styles: {
		canvas: {
			fill: "white"
		},
		circle: {
			fill: "#eee"
		},
		line: {
			stroke: "rgba( 0, 0, 0, 0.15)",
			width: 1
		},
		text: {
			fill: "black"
		}
	}
});

// Exports
window.nexus = nexus;

})(jQuery, this);