# GitFeed.js 

Display your GitHub activity feed on your website :octocat:

## Getting Started

Include the the stylesheet within the head of your page:

```
<link rel="stylesheet" href="gitFeed.css">
```

Include the minified js file at the bottom of the body of your page and then initialize gitFeed 
with your preferred settings:

```
<script src="gitFeed.min.js"></script>
<script>
    // initialize gitfeed
    gitFeed({
      username       : 'bszulc',   // required
      dateFormat     : 'medium',
      timeFormat     : '12',
      hideWatched    : true,
      hideLabels     : true,
      results        : 7
    });
</script>
```

##Settings:

* **username** - your GitHub username -- ***required*** 


* **targetClass** - element class name that gitFeed will target -- *optional*
    
        default is "gitfeed"


* **results** - number of results to display -- *optional*
    
        default is all the results


* **dateFormat** - how to format dates -- *optional*

        default is "long"

 * "short" - e.g. 4/15/2015
 * "medium" - e.g. Apr 15, 2015
 * "long" - e.g. April 15, 2015


* **timeFormat** - how to format time -- *optional*

        default is 24-hour time, e.g. 15:00

 * "12" - gives you 12-hour time, e.g. 3:00 PM

* **hideLabels** - hide section labels -- *optional*
    
        default is false


* **hideWatched** - hide activity about repos you watch or star --  *optional*
        
        default is false


## Screenshot

![GitFeed Screenshot](https://github.com/Bszulc/gitFeed.js/blob/master/gitfeed-screenshot.jpg)
