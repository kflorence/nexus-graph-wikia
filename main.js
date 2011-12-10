/* main.js
 *
 * Initializes the nexus graph script and pulls in data for it
 * 
 * @author Kyle Florence
 * @website http://github.com/kflorence/wikia-nexus-graph/
 *
 */

jQuery(function($) {
	var pollingLoop, plcontinue, currentId, currentTitle,
		wiki = window.location.search.replace('?', '') || 'naruto',
		offset = 1, limit = 10;

	nexus.init({ api: 'http://' + wiki + '.kflorence.wikia-dev.com/api.php', canvas: 'nexusGraph' });

	// ajax error
	function error() {
		console.log('error: ', arguments);
	}

	// get a page and it's links and add it to the system
	function getPage() {
		$.ajax({
			url: nexus.data.api,
			data: {
				action: 'query',
				list: 'wkpoppages',
				wklimit: 1,
				wkoffset: offset,
				format: 'json'
			},
			dataType: 'jsonp',
			complete: function() {
				offset++;
			},
			success: function(data) {
				var len = 0;
				
				$.each(data.query.wkpoppages, function(id, page) {
					len++;
					
					currentId = id;
					currentTitle = page.title;

					// Prevent infinite loop
					if (!nexus.data.pages[currentTitle]) {
					console.log('added title: ', currentTitle);
						nexus.data.pages[currentTitle] = nexus.system.addNode(currentTitle, page);
						getLinks();
					}
				});

				// stop polling if there's nothing left
				if (len == 0) {
					stop();
				}
			},
			error: error
		});
	}

	// get the links for a page
	function getLinks() {
		var params = {
				action: 'query',
				prop: 'links',
				titles: currentTitle,
				format: 'json'
			};

		if (plcontinue) {
			params.plcontinue = plcontinue;
		}

		$.ajax({
			url: nexus.data.api,
			data: params,
			dataType: 'jsonp',
			success: function(data) {
console.log(data);
				var node = data.query.pages[currentId];

				$.each(node.links, function(i, link) {
					if (!nexus.data.pages[link.title]) {
						console.log('added link: ', link.title);
						nexus.data.pages[link.title] = nexus.system.addNode(link.title);
					}

					// Link this node to the page node
					console.log('attaching: "' + currentTitle + '" to "' + link.title + '"');
					nexus.system.addEdge(currentTitle, link.title);
				});

				// Continue to get links for the page, if there are more
				if (data["query-continue"]) {
					plcontinue = data["query-continue"].links.plcontinue;
				} else {
					plcontinue = null;
				}
			},
			error: error
		});
	}

	(function run() {
		if (!pollingLoop) {
			pollingLoop = setInterval(run, 5000);
		}

		// If there are more links, keep going
		if (plcontinue) {
			getLinks();

		// on to the next page
		} else if (offset < limit) {
			getPage();
		}
	})();
	
	// stop the polling loop
	function stop() {
		clearInterval(pollingLoop);
	}
	
	window.stop = stop;
});