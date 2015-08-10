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
	// universal_links
	"Return to the Outpost"      : "o",
	"View your Inventory"        : "i",
	"Return to the Jungle"       : "j",

	// outpost_links
	"eBoy's Trading Station"     : "e",
	"Sheila's Shack O' Shiny"    : "s",
	"Bank of Improbable"         : "b",
	"Quit to the fields"         : "Q",
	"New Day Menu"               : "*",
	"The Hunter's Lodge"         : "l",
	"Location Four"              : "4",
	"Frequently Asked Questions" : "?",
	"Council Offices"            : "c",
	"Hall o' Fame"               : "f",
	"Common Ground"              : "g",
	"Clan Halls"                 : "h",
	"Jungle"                     : "j",
	"Daily News"                 : "n",
	"Preferences"                : "p",
	"Travel"                     : "t",
	"List Contestants"           : "w",
	"ScrapYard"                  : "#",
	"Joe's Dojo"                 : "d",
	"Rally Headquarters"         : "r",
	"Reinforce the Defences"     : "r",

	// travel_links
	"North"                      : "t",
	"East"                       : "h",
	"South"                      : "b",
	"West"                       : "f",
	"North-East"                 : "y",
	"North-West"                 : "r",
	"South-East"                 : "n",
	"South-West"                 : "v",
	"Enter the Jungle"           : "j",
	"World Map"                  : "m",

	// OST
	"Go to AceHigh"              : "a",
	"Go to Cyber City 404"       : "c",
	"Go to Improbable Central"   : "i",
	"Go to NewHome"              : "h",
	
	// Looking for trouble
	"Hospital Tent"              : "h",
	"Look for an Easy Fight"     : "1",
	"Look for Trouble"           : "2",
	"Look for Big Trouble"       : "3",
	"Look for Really Big Trouble" : "4"
	
	// Down below
	// "North" : "W",
	// "South" : "S",
	// "West" : "A",
	// "East" : "D",

	// ii-slaves
	// "Heal" : "H"
};

waitForKeyElements ("script", function (node)
{
  unsafeWindow.document.onkeypress = function(e)
	{
		if ( e.altKey || e.ctrlKey || e.metaKey)
			return;
		
		if ($('input:focus').length > 0)
			return;
		
		var key = String.fromCharCode (e.charCode);
		if (e.shiftKey)
			key = key.toUpperCase ();
		
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
		
		key = key.toLowerCase ();
		$(node).attr ("accesskey", key);
		if ($("[accesskey='"+key+"']").length > 1)
			$(node)
				.text (title)
				.attr ("accesskey", "");
	} else
	{
		var key = keys[link];
		var i = link.toLowerCase ().indexOf (key);
		
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
