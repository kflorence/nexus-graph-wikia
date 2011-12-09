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

	// Set up some nodes for testing
    nexusGraph.particleSystem.graft({
    	nodes: {
    		f: {
    			alone: true, 
    			mass: .25
    		}
    	},
    	edges: {
    		a: {
    			b: {},
    			c: {},
    			d: {},
    			e: {}
    		}
    	}
	});
});

})(jQuery);