/*!
 * gitFeed.js (Github Activity Feed Display)
 *
 * Copyright 2014-2015 Bronek Szulc
 * https://github.com/broneks/gitFeed.js
 */

var gitFeed = (function(window) {
  'use strict';


  var settings, feeds;


  // basic object extension
  //
  var extend = function( original, extension ) {

    var prop;

    for ( prop in extension ) {

      if ( !original.hasOwnProperty( prop ) ) {

        original[prop] = extension[prop];
      }
    }
  };


  // access jsonp Github api for user's public events
  // store the returned data in session in order to prevent unauthenticated api limit from being reached
  //
  var getEvents = function( callback ) {

    var dataStore, url, callbackName, script;

    dataStore = sessionStorage.getItem( 'gitfeed_store' );

    if ( dataStore ) {

      callback( JSON.parse( dataStore ) );
      return;
    }


    url = 'https://api.github.com/users/' + settings.username + '/events/public';

    callbackName = 'gitfeed_cb_' + Math.round( 100000 * Math.random() );

    script = document.createElement('script');
    script.src = url + ( url.indexOf( '?' ) >= 0 ? '&' : '?' ) + 'callback=' + callbackName;

    document.body.appendChild( script );

    window[callbackName] = function( data ) {

      delete window[callbackName];
      document.body.removeChild( script );

      if ( data.data.hasOwnProperty( 'message' ) ) {

        throw new Error( data.data.message );
      }

      sessionStorage.setItem( 'gitfeed_store', JSON.stringify( data.data ) );

      callback( data.data );
    };
  };


  // create DOM elements for each section within the gitFeed list items
  // then append the sections to the corresponding list item
  //
  var createSection = function( parent, options, type ) {

    var item, itemCommonClass, label, labelClass, valueClass, labelText, content, contentText;

    itemCommonClass  = 'gitfeed-item-section';
    labelClass       = 'gitfeed-label';
    valueClass       = 'gitfeed-value';

    item = document.createElement('div');
    item.className = options.itemClass + ' ' + itemCommonClass;


    if ( !settings.hideLabels ) {

      labelText = document.createTextNode( options.label );

      label = document.createElement('span');
      label.className = labelClass;
      label.appendChild( labelText );

      item.appendChild( label );
    }

    if ( type === 'link' ) {

      options.url = 'https://github.com' +
                    (options.url.split('/repos')[1]).replace(/\/commits\//, '/commit/');

      content = document.createElement('a');
      content.href = options.url;
      content.setAttribute('target', '_blank');

    } else {

      content = document.createElement('span');
    }

    contentText = document.createTextNode( options.content );
    content.className = valueClass;
    content.appendChild( contentText );


    item.appendChild( content );
    parent.appendChild( item );
  };


  // format the feed item date and time
  //
  var formatDate = (function() {

    var monthNames = {

      long  : 'January February March April May June July August September October November December'.split(' '),
      short : 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')
    };


    var timeFormat = function( t ) {

      if ( settings.timeFormat && settings.timeFormat.toLowerCase() === 'hide') {
        return '';
      }

      var hours   = (t.hours   < 10 ? '0' : '') + t.hours;
      var minutes = (t.minutes < 10 ? '0' : '') + t.minutes;
      var marker  = '';

      if ( settings.timeFormat && settings.timeFormat === '12' ) {
        hours  = (t.hours > 12) ? t.hours - 12 : t.hours;
        hours  = (t.hours < 10  ? '0' : '') + t.hours;
        marker = (t.hours > 12) ? ' PM': ' AM';
      }

      return ' ' + String.fromCharCode( 8211 ) + ' ' + hours + ':' + minutes + marker;
    };


    // e.g. 9/3/2010
    //
    var shortFormat = function( d ) {

      return (d.month + 1) + '/' + d.day + '/' + d.year + timeFormat( d );
    };


    // e.g. Sep 3, 2010
    //
    var mediumFormat = function( d ) {

      return monthNames.short[d.month] + ' ' + d.day + ', ' + d.year + timeFormat( d );
    };


    // e.g. September 3, 2010
    //
    var longFormat = function( d ) {

      return monthNames.long[d.month] + ' ' + d.day + ', ' + d.year + timeFormat( d );
    };


    return function( date ) {

      var formatted, d;

      d = {
        month : date.getMonth(),
        day   : date.getDate(),
        year  : date.getFullYear(),
        hours : date.getHours(),
        minutes : date.getMinutes()
      };

      switch ( settings.dateFormat.toLowerCase() ) {

        case 'hide':
          formatted = '';
          break;

        case 'short':
          formatted = shortFormat( d );
          break;

        case 'medium':
          formatted = mediumFormat( d );
          break;

        case 'long':
        default:
          formatted = longFormat( d );
      }

      return formatted;
    }
  })();


  // populate each intance of the gitFeed with the retrieved data
  //
  var populateFeeds = function( data ) {

    var i, dataLength, numOfResults, container, listItem, info;

    container = document.createElement('ul');

    dataLength   = data.length;
    numOfResults = (!settings.results || settings.results > dataLength) ? dataLength : settings.results;

    for ( i = 0; i < numOfResults; i++ ) {

      listItem = document.createElement('li');
      listItem.className = 'gitfeed-item';

      info = {};

      info.current = data[i];
      info.type    = (info.current.type).replace( 'Event', '' );

      if ( settings.hideWatched && info.type.toLowerCase() === 'watch' ) {

        if ( numOfResults <= dataLength - 1 ) {

          numOfResults += 1;
        }

        continue;
      }

      info.date = formatDate( new Date( info.current.created_at ) );


      if ( info.current.payload.commits ) {

        createSection( listItem, {
          itemClass : 'gitfeed-commit',
          label     : 'commit:',
          url       : info.current.payload.commits[0].url,
          content   : info.current.payload.commits[0].message
        }, 'link' );
      }

      if ( info.current.repo ) {

        createSection( listItem, {
          itemClass : 'gitfeed-repo',
          label     : 'repo:',
          url       : info.current.repo.url,
          content   : info.current.repo.name
        }, 'link' );
      }

      createSection( listItem, {
        itemClass : 'gitfeed-action',
        label     : 'action:',
        content   : info.type
      });

      if ( info.date ) {

        createSection( listItem, {
          itemClass : 'gitfeed-date',
          label     : 'date:',
          content   : info.date
        });
      }

      container.appendChild( listItem );
    }


    feeds.forEach( function( feed ) {

      feed.appendChild( container );
    });
  };


  // initialize function that sets user settings and defaults
  //
  var init = function( userSettings ) {

    var defaults, nodes, i;

    settings = userSettings || {};

    defaults = {
      targetClass    : 'gitfeed',
      dateFormat     : 'long',
      hideLabels     : false,
      hideWatched    : false
    };

    if ( !settings.hasOwnProperty( 'username' ) ) {

      throw new Error( 'gitFeed.js : please initialize the plugin with a valid Github username.' );
    }

    extend( settings, defaults );

    nodes = document.querySelectorAll( '.' + settings.targetClass );
    feeds = Array.prototype.slice.call( nodes );

    try {

      getEvents( populateFeeds );

    } catch( err ) {

      for (i = 0; i < feeds.length; i++) {
        feeds[i].parentNode.removeChild( feeds[i] );
      }

      throw new Error( 'gitFeed.js : an unexpected error occurred: ' + err );
    }
  };


  return init;


})( window );
