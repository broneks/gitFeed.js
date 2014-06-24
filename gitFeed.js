/*!
 * gitFeed.js (Github Activity Feed Display)
 *
 * Copyright 2014 Bronek Szulc
 * https://github.com/Bszulc/gitFeed.js
 */

function gitFeed(settings) {
	if (typeof settings === 'undefined' || typeof settings.url === 'undefined') {
		console.log('gitFeed.js INIT ERROR: please initialize the plugin and define your Github activity feed url (e.g. https://github.com/username.json)');
		return false;
	}

	var months 	   = (typeof settings.fullMonthNames !== 'undefined' && settings.fullMonthNames ? 
						['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] : 
						['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
		$feed  	   = $('.gitfeed');
		numResults = (!isNaN(+settings.results) && isFinite(settings.results) ? settings.results : 5);

	$.ajax({
		url: settings.url, 
		dataType: 'jsonp',
		success: function(data) {
			for (var i = 0; i < numResults; i++) {
				var that    = data[i],
					list    = [],
					date    = new Date(that.created_at),
					minutes = date.getMinutes(),
					hours   = date.getHours(),
					day     = date.getDate(),
					month   = date.getMonth(),
					year    = date.getFullYear();

				if (that.payload.shas) {
					list.push('<li><span class="gf-label">Commit:</span><a href="' + that.url + '" target="_blank">' + that.payload.shas[0][2] + '</a></li>');
				}

				if (that.repository) {
					list.push('<li><span class="gf-label">Repo:</span><a href="' + that.repository.url + '" target="_blank">' + that.repository.name + '</a></li>');
				}

				list.push('<li><span class="gf-label">Action:</span><span>' + (that.type).replace('Event', '') + '</span></li>');
				list.push('<li><span class="gf-label">Date:</span><span>' + (day < 10 ? '0' : '') + day + "-" + months[month] + "-" + year + " at " + (hours < 10 ? '0' : '') + hours + ":" + (minutes < 10 ? '0' : '') + minutes + '</span></li>');
					
				$feed.append('<ul>' + (list.toString()).replace(/>,</g, '><') + '</ul>');
			}
		},
		error: function(err) {
			console.log('gitFeed.js AJAX ERROR: ' + JSON.stringify(err, null, 2));
		}
	});
}