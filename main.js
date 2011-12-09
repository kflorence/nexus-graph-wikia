/* main.js
 *
 * Initializes the nexus graph script and pulls in data for it
 * 
 * @author Kyle Florence
 * @website http://github.com/kflorence/wikia-nexus-graph/
 *
 */

jQuery(function($) {
	nexus.init({ api: 'http://naruto.kflorence.wikia-dev.com/api.php', canvas: '#nexusGraph' });

	nexus.system.addNode("test");
	nexus.system.addNode("test2");
});