/* main.js
 *
 * Initializes the nexus graph script and pulls in data for it
 * 
 * @author Kyle Florence
 * @website http://github.com/kflorence/wikia-nexus-graph/
 *
 */

jQuery(function($) {
	var wiki = window.location.search.replace('?', '') || 'naruto';

	nexus.init({ api: 'http://' + wiki + '.kflorence.wikia-dev.com/api.php', canvas: 'nexusGraph' });

	$.ajax({
		url: nexus.data.api,
		data: {
			action: 'query',
			list: 'wkpoppages',
			wklimit: 5,
			format: 'json'
		},
		dataType: 'jsonp',
		success: function(data) {
			$.each(data.query.wkpoppages, function(id, page) {
				$.ajax({
					url: nexus.data.api,
					data: {
						action: 'query',
						prop: 'links',
						titles: page.title,
						format: 'json'
					},
					dataType: 'jsonp',
					success: function(data) {
						var title = data.query.pages[id].title;
						nexus.data.pages[title] = nexus.system.addNode(title, page);
	
						$.each(data.query.pages[id].links, function(id, link) {
							if (!nexus.data.pages[link.title]) {
								nexus.data.pages[link.title] = nexus.system.addNode(link.title);
							}

							// Link this node to the page node
							nexus.system.addEdge(link.title, title);
						});
					},
					error: function() {
						console.log('error: ', arguments);
					}
				});
			});
		},
		error: function() {
			console.log('error: ', arguments);
		}
	});
});