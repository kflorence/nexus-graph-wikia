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
	options: {
		api: 'kflorence.wikia-dev.com/api.php', // Change me when prod is updated
		pageLimit: 10,
		pageLinkLimit: 20,
		pollingInterval: 1000,
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
		},
		system: {},
		wiki: 'www'
	},

	init: function(options) {
		nexus.options = $.extend(nexus.options, options);

		// Set up the canvas
		nexus.canvas = document.getElementById(options.canvas);
		nexus.context = nexus.canvas.getContext('2d');

		// Set up the arbor particle system
		nexus.system = arbor.ParticleSystem(options.system);
		nexus.system.renderer = nexus.renderer;

		// Compensate for a bug in the Arbor library
		// See: https://github.com/samizdatco/arbor/issues/12
		nexus.system.addNode('__0', { invisible: true });
		nexus.system.addNode('__1', { invisible: true });
		nexus.system.addEdge('__0', '__1', { invisible: true });

		// Track nodes and edges
		nexus.nodes = {};
		nexus.edges = {};

		// Listen to window events
		$(window).unbind('.nexus')
			.bind('mousemove.nexus', nexus.events.onMouseMove)
			.bind('mousedown.nexus', nexus.events.onMouseDown)
			.bind('mouseup.nexus', nexus.events.onMouseUp)
			.bind('resize.nexus', nexus.events.onWindowResize);

		// Start the polling loop
		nexus.loop.start();

		return nexus;
	},

	data: {
		getPage: function() {
			nexus.data.load({
				data: {
					list: 'wkpoppages',
					wklimit: 1,
					wkoffset: nexus.state.offset
				},
				success: function(data) {
					var results = 0;

					$.each(data.query.wkpoppages, function(id, page) {

						// Update pointers to current page
						nexus.state.pageId = id;
						nexus.state.pageTitle = page.title;
						nexus.state.pageLinkCount = 0;

						// Add page as node if it doesn't already exist
						if (!nexus.nodes[page.title]) {
							nexus.nodes[page.title] = nexus.system.addNode(page.title, page);

							// Queue this page for link retrieval on the next loop
							nexus.state.plcontinue = true;
							nexus.state.pageCount++;
						}

						results++;
					});

					// If no results were returned, we've reached the last page
					if (!results) {
						nexus.loop.stop();
					}
				},
				complete: function(xhr, status) {
					nexus.state.offset++;
				}
			});
		},

		getPageLinks: function() {
			var data = {
					prop: 'links',
					pllimit: 5,
					titles: nexus.state.pageTitle
				};

			// Pass in plcontinue from previous query if it exists
			if (typeof nexus.state.plcontinue == 'string') {
				data.plcontinue = nexus.state.plcontinue;
			}

			// Reset plcontinue for next request
			nexus.state.plcontinue = null;

			nexus.data.load({
				data: data,
				success: function(data) {
					var page = data.query.pages[nexus.state.pageId],
						more = data['query-continue'];

					// This page has no links
					if (!page.links) {
						return;
					}

					// This page has more links
					if (more) {
						nexus.state.plcontinue = more.links.plcontinue;
					}

					$.each(page.links, function(i, link) {

						// Add link as node if it doesn't already exist
						if (!nexus.nodes[link.title]) {
							nexus.nodes[link.title] = nexus.system.addNode(link.title);
						}

						// Add this node as an edge to the page node
						nexus.edges[nexus.state.pageTitle + '|' + link.title] =
								nexus.system.addEdge(nexus.state.pageTitle, link.title);

						nexus.state.pageLinkCount++;
					});
				}
			});
		},

		load: function(options) {
			$.ajax($.extend(true, {
				url: 'http://' + nexus.options.wiki + '.' + nexus.options.api,
				data: {
					action: 'query',
					format: 'json'
				},
				dataType: 'jsonp',
				error: function() {
					console.log('Load error: ', arguments);
				}
			}, options));
		}
	},

	loop: {
		next: function() {
			if (!nexus.state.polling) {
				return;
			}

			// Load links for the current page (until we reach our limit)
			if (nexus.state.plcontinue && nexus.state.pageLinkCount < nexus.options.pageLinkLimit) {
				nexus.data.getPageLinks();

			// Load the next page (until we reach our limit)
			} else if (nexus.state.pageCount < nexus.options.pageLimit) {
				nexus.data.getPage();

			// Nothing left to do
			} else {
				nexus.loop.stop();
			}
		},

		start: function() {

			// If there is already a loop running, kill it before starting another
			if (nexus.state.polling) {
				nexus.loop.stop();
			}

			nexus.state.polling = setInterval(nexus.loop.next, nexus.options.pollingInterval);
			nexus.loop.next();
		},

		stop: function() {
			clearInterval(nexus.state.polling);
		}
	},

	events: {
		onMouseDown: function(e) {
			var pos = $(nexus.canvas).offset(),
				mousePos = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);

			// Find the node closest to the mouse pointer position
			if ((nexus.state.dragging = nexus.system.nearest(mousePos)) !== null) {

				// Tell the physics engine not to move the node while we drag it
				nexus.state.dragging.node.fixed = true;
			}
		},

		onMouseMove: function(e) {

			// If we are dragging a node, update its location
			if (nexus.state.dragging !== null) {
				var pos = $(nexus.canvas).offset(),
					mousePos = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);

				nexus.state.dragging.node.p = nexus.system.fromScreen(mousePos);
			}
		},

		onMouseUp: function(e) {

			// If we were dragging a node, perform some cleanup
			if (nexus.state.dragging !== null) {
				nexus.state.dragging.node.fixed = false;
				nexus.state.dragging.node.tempMass = 1000;
				nexus.state.dragging = null;
			}
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

			nexus.context.fillStyle = nexus.options.styles.canvas.fill;
			nexus.context.fillRect(0, 0, nexus.canvas.width, nexus.canvas.height);

			nexus.context.restore();
		},
		
		drawLine: function(point1, point2) {
			nexus.context.save();

			nexus.context.strokeStyle = nexus.options.styles.line.stroke;
			nexus.context.lineWidth = nexus.options.styles.line.width;
			
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
			
			nexus.context.fillStyle = nexus.options.styles.circle.fill;
			nexus.context.fill();

			nexus.context.restore();
		},

		drawText: function(text, point) {
			nexus.context.save();

			nexus.context.fillStyle = nexus.options.styles.text.fill;
			nexus.context.fillText(text, point.x, point.y);

			nexus.context.restore();
		},

		redraw: function() {
			nexus.renderer.clear();

			nexus.system.eachEdge(function(edge, point1, point2) {
				if (!edge.data.invisible) {
					nexus.renderer.drawLine(point1, point2);
				}
			});

			nexus.system.eachNode(function(node, point) {
				if (!node.data.invisible) {
					var textWidth = nexus.context.measureText(node.name).width,

						// For now, radius is based on page views (10px - 100px)
						radius = Math.min(Math.max(Math.ceil((node.data.counter || 0) / 100000), 10), 100);

					nexus.renderer.drawCircle(point, radius);
					nexus.renderer.drawText(node.name, { x: point.x - textWidth / 2, y: point.y });
				}
			});
		},

		setScreenSize: function(width, height) {
			nexus.system.screenSize(nexus.canvas.width = width, nexus.canvas.height = height);
			nexus.renderer.redraw();
		}
	},

	state: {
		pageId: "",
		pageTitle: "",
		pageCount: 0,
		pageLinkCount: 0,

		offset: 0,
		plcontinue: "",

		dragging: null,
		polling: null
	}
});

// Exports
window.nexus = nexus;

})(jQuery, this);
