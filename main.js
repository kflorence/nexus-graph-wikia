/* main.js
 *
 * Initializes the nexus graph script and pulls in data for it
 *
 * @author Kyle Florence
 * @website http://github.com/kflorence/wikia-nexus-graph/
 *
 */

jQuery(function($) {

	// TODO: look into d3.js, arbor is buggy
	// FIXME: live wikia API has bugs that cause wkpoppages not to work
	nexus({
		canvas: 'nexusGraph',
		wiki: (window.location.search.match(/wiki=(\w+)/i) || ['', 'beer'])[1]
	});
});
