require([ &
    apos;gitbook & apos;, &
    apos;jquery & apos;
], function(gitbook, $) {
    var MAX_RESULTS = 15;
    var MAX_DESCRIPTION_SIZE = 500;
    var usePushState = (typeof history.pushState !== & apos; undefined & apos;);
    // DOM Elements
    var $body = $( & apos; body & apos;);
    var $bookSearchResults;
    var $searchInput;
    var $searchList;
    var $searchTitle;
    var $searchResultsCount;
    var $searchQuery;
    // Throttle search
    function throttle(fn, wait) {
        var timeout;
        return function() {
            var ctx = this,
                args = arguments;
            if (!timeout) {
                timeout = setTimeout(function() {
                    timeout = null;
                    fn.apply(ctx, args);
                }, wait);
            }
        };
    }
    function displayResults(res) {
        $bookSearchResults.addClass( & apos; open & apos;);
        var noResults = res.count == 0;
        $bookSearchResults.toggleClass( & apos; no - results & apos;, noResults);
        // Clear old results
        $searchList.empty();
        // Display title for research
        $searchResultsCount.text(res.count);
        $searchQuery.text(res.query);
        // Create an <li> element for each result
        res.results.forEach(function(res) {
                var $li = $( & apos; < /li><li>&apos;, { &
                    apos; class & apos;: & apos; search - results - item & apos;
                });
            var $title = $( & apos; < h3 > & apos;);
            var $link = $( & apos; < a > & apos;, { &
                apos;href & apos;: gitbook.state.basePath + & apos;
                /&apos; + res.url, &
                apos;text & apos;: res.title
            });
            var content = res.body.trim();
            if (content.length & gt; MAX_DESCRIPTION_SIZE) {
                content = content.slice(0, MAX_DESCRIPTION_SIZE).trim() + & apos;... & apos;;
            }
            var $content = $( & apos; < p > & apos;).html(content);
            $link.appendTo($title); $title.appendTo($li); $content.appendTo($li); $li.appendTo($searchList);
        });
}
function launchSearch(q) {
    // Add class for loading
    $body.addClass( & apos; with - search & apos;);
    $body.addClass( & apos; search - loading & apos;);
    // Launch search query
    throttle(gitbook.search.query(q, 0, MAX_RESULTS)
        .then(function(results) {
            displayResults(results);
        })
        .always(function() {
            $body.removeClass( & apos; search - loading & apos;);
        }), 1000);
}
function closeSearch() {
    $body.removeClass( & apos; with - search & apos;);
    $bookSearchResults.removeClass( & apos; open & apos;);
}
function launchSearchFromQueryString() {
    var q = getParameterByName( & apos; q & apos;);
    if (q & amp; & amp; q.length & gt; 0) {
        // Update search input
        $searchInput.val(q);
        // Launch search
        launchSearch(q);
    }
}
function bindSearch() {
    // Bind DOM
    $searchInput = $( & apos;# book - search - input input & apos;);
    $bookSearchResults = $( & apos;# book - search - results & apos;);
    $searchList = $bookSearchResults.find( & apos;.search - results - list & apos;);
    $searchTitle = $bookSearchResults.find( & apos;.search - results - title & apos;);
    $searchResultsCount = $searchTitle.find( & apos;.search - results - count & apos;);
    $searchQuery = $searchTitle.find( & apos;.search - query & apos;);
    // Launch query based on input content
    function handleUpdate() {
        var q = $searchInput.val();
        if (q.length == 0) {
            closeSearch();
        } else {
            launchSearch(q);
        }
    }
    // Detect true content change in search input
    // Workaround for IE &lt; 9
    var propertyChangeUnbound = false;
    $searchInput.on( & apos; propertychange & apos;, function(e) {
        if (e.originalEvent.propertyName == & apos; value & apos;) {
            handleUpdate();
        }
    });
    // HTML5 (IE9 &amp; others)
    $searchInput.on( & apos; input & apos;, function(e) {
        // Unbind propertychange event for IE9+
        if (!propertyChangeUnbound) {
            $(this).unbind( & apos; propertychange & apos;);
            propertyChangeUnbound = true;
        }
        handleUpdate();
    });
    // Push to history on blur
    $searchInput.on( & apos; blur & apos;, function(e) {
        // Update history state
        if (usePushState) {
            var uri = updateQueryString( & apos; q & apos;, $(this).val());
            history.pushState({
                path: uri
            }, null, uri);
        }
    });
}
gitbook.events.on( & apos; page.change & apos;, function() {
    bindSearch();
    closeSearch();
    // Launch search based on query parameter
    if (gitbook.search.isInitialized()) {
        launchSearchFromQueryString();
    }
});
gitbook.events.on( & apos; search.ready & apos;, function() {
    bindSearch();
    // Launch search from query param at start
    launchSearchFromQueryString();
});
function getParameterByName(name) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, & apos;\\ $ & amp; & apos;);
    var regex = new RegExp( & apos;
            [ ? & amp;] & apos; + name + & apos;
            ( = ([ ^ ^ & amp;#] * ) | & amp; | # | $) & apos;, & apos; i & apos;),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return &apos; & apos;;
    return decodeURIComponent(results[2].replace(/\+/g, & apos; & apos;));
}
function updateQueryString(key, value) {
    value = encodeURIComponent(value);
    var url = window.location.href;
    var re = new RegExp( & apos;
            ([ ? & amp;]) & apos; + key + & apos; = .* ? ( & amp; | # | $)(.*) & apos;, & apos; gi & apos;),
        hash;
    if (re.test(url)) {
        if (typeof value !== & apos; undefined & apos; & amp; & amp; value !== null)
            return url.replace(re, & apos; $1 & apos; + key + & apos; = & apos; + value + & apos; $2$3 & apos;);
        else {
            hash = url.split( & apos;# & apos;);
            url = hash[0].replace(re, & apos; $1$3 & apos;).replace(/(&amp;|\?)$/, & apos; & apos;);
            if (typeof hash[1] !== & apos; undefined & apos; & amp; & amp; hash[1] !== null)
                url += & apos;# & apos; + hash[1];
            return url;
        }
    } else {
        if (typeof value !== & apos; undefined & apos; & amp; & amp; value !== null) {
            var separator = url.indexOf( & apos; ? & apos;) !== -1 ? & apos; & amp; & apos;: & apos; ? & apos;;
            hash = url.split( & apos;# & apos;);
            url = hash[0] + separator + key + & apos; = & apos; + value;
            if (typeof hash[1] !== & apos; undefined & apos; & amp; & amp; hash[1] !== null)
                url += & apos;# & apos; + hash[1];
            return url;
        } else
            return url;
    }
}
}); <
/p></a > < /h3></li >