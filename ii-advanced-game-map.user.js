// ==UserScript==
// @name        ii-advanced-game-map
// @namespace   http://redhatter.gethub.com
// @description Adds note taking and searching to the game map.
// @include     http://*.improbableisland.com/*
// @version     2
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require     http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js
// @grant       GM_setValue
// @grant       GM_getValue
// ==/UserScript==

var FILTER = true;
var SCALE = 1;
var MARK_NOTES = true;

var prv = new Array();

var map = $("script[src = 'js/places_map\.js']").next();
if (map.length)
{
	GM_setValue('map',map.html());

	$('<input>',{
		placeholder: 'Filter'
	}).insertBefore(map)
		.keyup(function (e)
		{
			var searchString = e.target.value;

			$('[reset]').each(function ()
			{
				$(this).css('background-image',$(this).attr('reset'));
			});


			if (searchString.length < 2)
				return;

			prv = $("a[onclick]", map).filter(function ()
			{
				return $(this).attr('onclick').toLowerCase().indexOf(searchString) != -1;
			}).parent().each(function ()
			{
				$(this).attr('reset',$(this).css('background-image'));
			})
			.css({'background-image': '', 'background-color': 'black'});
		});
} else
{
	$('<a/>',{text: 'Open map'}).click(function ()
	{
		$("<div><script type='text/javascript' src='js/places_map.js'></script><table border='0' cellpadding='0' cellspacing='0' width=645>"+GM_getValue('map')+"</table></div>")
			.appendTo(document).dialog();
	}).insertAfter("[href='http://merch.improbableisland.com']");
}
