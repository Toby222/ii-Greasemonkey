// ==UserScript==
// @name        ii-duct-tape
// @namespace   http://RedHatter.github.com
// @description Makes the hotkeys more consistent, so that e.g. Bank of Improbable is always "b". 
// @include     http://*improbableisland.com/*
// @exclude     http://*improbableisland.com/home.php*
// @version     1.0
// @grant       none
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @run-at      document-start
// ==/UserScript==
var keys = {
	
	// Shops
	"Bank of Improbable" : "B",
	"eBoy's Trading Station" : "E",
	"Sheila's Shack O' Shiny" : "S",
	"Council Offices" : "C",
	
	// OST
	"Go to AceHigh" : "A",
	"Go to Cyber City 404" : "C",
	"Go to Improbable Central" : "I",
	"Go to NewHome" : "H",
	
	// Looking for trouble
	"Look for an Easy Fight" : "1",
	"Look for Trouble" : "2",
	"Look for Big Trouble" : "3",
	"Look for Really Big Trouble" : "4",
	
	// Down below
	"North" : "W",
	"South" : "S",
	"West" : "A",
	"East" : "D",

	"View your Inventory" : "I",
	"Enter the Jungle" : "J",
	"Return to the Outpost" : "R",
	"Back to the Outpost" : "R",
	
	// ii-slaves
	"Heal" : "H"
};

waitForKeyElements ("script", function (node)
{
  unsafeWindow.document.onkeypress = function(e)
	{
		if ( e.altKey || e.ctrlKey || e.shiftKey || e.metaKey)
			return;
		
		var key = String.fromCharCode (e.charCode).toUpperCase ();
		$("[accesskey="+key+"]")[0].click ();
	};
});

waitForKeyElements ("a.nav", function (node)
{
	var title = $(node).text ();
	if (title.charAt (0) == "(")
		title = title.substring (4);
	
	var link = title.replace(new RegExp(" ?\\(.*?\\) ?", 'g'), "");
	console.log (title);

	if (keys[link] == undefined)
	{
		var key = $(node).attr ("accesskey");
		if (key == undefined)
			return;
		
		key = key.toUpperCase ();
		$(node).attr ("accesskey", key);
		if ($("[accesskey='"+key+"']").length > 1)
			$(node)
				.text (title)
				.attr ("accesskey", "");	
	} else
	{
		var key = keys[link];
		var i = title.toUpperCase ().indexOf (key);
		
		$("[accesskey='"+key+"']").each (function( index )
		{
			console.log ($(this).text ());
	  	$(this)
				.text($(this).text ())
				.attr ("accesskey", "");
		});
		$(node)
			.html (i > -1 ? title.substring (0, i) + "<span class=\"navhi\">" + title.charAt (i) + "</span>" + title.substring (i+1) : "(<span class=\"navhi\">" + key + "</span>) " + title)
			.attr ("accesskey", key);
	}
});
