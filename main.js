/* main.js
 *
 * Initializes the nexus graph script and pulls in data for it
 * 
 * @author Kyle Florence
 * @website http://github.com/kflorence/wikia-nexus-graph/
 *
 */

(function($) {

// On DOM ready
$(function() {
	var nexusGraph = new NexusGraph(document.getElementById('nexusGraph'));

	var nodes = {
			"Adjunct": {},
			"Alcohol": {},
			"Barley": {}
		},
		edges = {
			"Adjunct": {
				"Alcohol": {},
				"Barley": {}
			}
		};

	// Set up some nodes for testing
    nexusGraph.particleSystem.graft({ nodes: nodes, edges: edges });
});

})(jQuery);