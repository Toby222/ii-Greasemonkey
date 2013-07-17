// ==UserScript==
// @name        ii-snifer
// @namespace   http://redhatter.github.com
// @description Show snifer range on map.
// @include     http://*improbableisland.com/*
// @version     1
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// ==/UserScript==

var attr = $('[style*="images/map/marker_"]').parents('td').attr('alt');
if (attr)
{
	var split = attr.indexOf(',');
	var cy = attr.substring(1,split);
	var cx = attr.substring(split+2,attr.indexOf(')'));
	
	GM_setValue('y',cy);
	GM_setValue('x',cx);
	
	var box_y = parseInt(GM_getValue('box_y'), 10);
	var box_x = parseInt(GM_getValue('box_x'), 10);
	
	if (box_y && box_x)
	{
		$('<button>Reset</button>').click(function ()
		{
			GM_deleteValue('visited','');
			GM_deleteValue('box_y','');
			GM_deleteValue('box_x','');
		}).appendTo('h2:contains("Travel")');
	
		var visited = GM_getValue('visited')+'/'+cy+','+cx;
		GM_setValue('visited',visited);
		
		for (var y = 0; y < 7; y++)
			for (var x = 0; x < 7; x++)
			{
				if (visited.indexOf((y+box_y)+','+(x+box_x)) > -1)
					continue;
				
				$('td [alt*="('+(y+box_y)+', '+(x+box_x)+'"]')
					.css('opacity', '0.7')
					.parent().css('background-color', 'black');
			}
	}

} else if ($('body').text().indexOf("You thumb the switch on your Crate Sniffer.") > -1)
{
	GM_setValue('box_y', GM_getValue('y')-3);
	GM_setValue('box_x', GM_getValue('x')-3);
}