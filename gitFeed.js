/*!
 * gitFeed.js (Github Activity Feed Display)
 *
 * Copyright 2014 Bronek Szulc
 * https://github.com/Bszulc/gitFeed.js
 */

function gitFeed(settings) {
	if (typeof settings === 'undefined' || typeof settings.username === 'undefined') {
		console.log('gitFeed.js INIT ERROR: please initialize the plugin with a valid Github username (e.g gitFeed({ username: yourusername });)');
		return;
	}

	var months = typeof settings.fullMonthNames !== 'undefined' && settings.fullMonthNames ?
                    ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] : 
                    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	
	var $feed  = $('.gitfeed');
	var numResults = !isNaN(+settings.results) && isFinite(settings.results) && settings.results > 0 ? settings.results : 5;

	var populateFeed = function(data) {
		var i, current, list, date, minutes, hours, day, month, year;
		
		for (i = 0; i < numResults; i++) {

            current = data[i],
            list    = [],
            date    = new Date(current.created_at),
            minutes = date.getMinutes(),
            hours   = date.getHours(),
            day     = date.getDate(),
            month   = date.getMonth(),
            year    = date.getFullYear();

			if (current.payload.shas) {
				list.push('<li><span class="gf-label">Commit:</span><a href="' + 
                          current.url + 
                          '" target="_blank">' + 
                          current.payload.shas[0][2] + 
                          '</a></li>');
			}

			if (current.repository) {
				list.push('<li><span class="gf-label">Repo:</span><a href="' + 
                          current.repository.url + 
                          '" target="_blank">' + 
                          current.repository.name + 
                          '</a></li>');
			}

			list.push('<li><span class="gf-label">Action:</span><span>' + 
                      (current.type).replace('Event', '') + 
                      '</span></li>');

			list.push('<li><span class="gf-label">Date:</span><span>' + 
                      (day < 10 ? '0' : '') + day + 
                      '-' + months[month] + '-' + 
                      year + ' at ' + 
                      (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes + 
                      '</span></li>');
				
			$feed.append('<ul>' + (list.toString()).replace(/>,</g, '><') + '</ul>');
		}
	};

	$.ajax({
		url: 'https://github.com/' + settings.username + '.json', 
		dataType: 'jsonp',
		success: function(data) {
			populateFeed(data);
		},
		error: function(error) {
			console.log('gitFeed.js AJAX ERROR: ' + JSON.stringify(error, null, 2));
		}
	});
}