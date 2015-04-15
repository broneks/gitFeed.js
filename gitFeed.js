/*!
 * gitFeed.js (Github Activity Feed Display)
 *
 * Copyright 2014-2015 Bronek Szulc
 * https://github.com/Bszulc/gitFeed.js
 */

var gitFeed = (function(window) {
  'use strict';


  var settings, feeds;

  var monthNames = {

    full  : ['January', 'February', 'March', 'April', 'May', 'June', 
             'July', 'August', 'September', 'October', 'November', 'December'],
    short : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
             'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
  };


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

    var item, itemCommonClass, label, labelClass, labelText, content, contentText;

    itemCommonClass  = 'gitfeed-item-section';
    labelClass       = 'gitfeed-label';

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
    content.appendChild( contentText );


    item.appendChild( content );
    parent.appendChild( item );
  };

  
  // populate each intance of the gitFeed with the retrieved data
  //
  var populateFeeds = function( data ) {

    var i, dataLength, numOfResults, container, listItem, info;

    container = document.createElement('ul');

    dataLength   = data.length;
    numOfResults = (settings.results > dataLength) ? dataLength : settings.results;

    for ( i = 0; i < numOfResults; i++ ) {

      listItem = document.createElement('li');
      listItem.className = "gitfeed-item";

      info = {};

      info.current = data[i];
      info.date    = new Date( info.current.created_at );
      info.minutes = (info.date.getMinutes() < 10 ? '0' : '') + info.date.getMinutes();
      info.hours   = (info.date.getHours()   < 10 ? '0' : '') + info.date.getHours();
      info.day     = (info.date.getDate()    < 10 ? '0' : '') + info.date.getDate();
      info.month   = settings.fullMonthNames ? monthNames.full[info.date.getMonth()] : monthNames.short[info.date.getMonth()];
      info.year    = info.date.getFullYear();
      info.type    = (info.current.type).replace( 'Event', '' );

      
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

      createSection( listItem, {
        itemClass : 'gitfeed-date',
        label     : 'date:',
        content   : info.day + ' ' + info.month + ', ' + info.year + ' - ' + info.hours + ':' + info.minutes
      });

      container.appendChild( listItem );
    }


    feeds.forEach( function( feed ) {
        
      feed.appendChild( container );
    });
  };


  // initialize function that sets user settings and defaults
  //
  var init = function( userSettings ) {

    var defaults, nodes;

    settings = userSettings || {};

    defaults = {
      targetClass    : 'gitfeed',
      fullMonthNames : false,
      hideLabels     : false,
      results        : 10
    };

    if ( !settings.hasOwnProperty( 'username' ) ) {

      throw new Error( 'gitFeed.js : please initialize the plugin with a valid Github username.' );
    }

    extend( settings, defaults );  

    nodes = document.querySelectorAll( '.' + settings.targetClass );
    feeds = Array.prototype.slice.call( nodes );

    getEvents( populateFeeds );
  };


  return init;


})(window);
