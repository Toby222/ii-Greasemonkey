// ==UserScript==
// @name        ii-battle-timer
// @namespace   http://RedHatter.github.com
// @description Inserts a timer for timed commbate.
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @include     http://improbableisland.com/*
// @include     http://www.improbableisland.com/*
// @version     1
// @grant       GM_setValue
// @grant       GM_getValue
// ==/UserScript==

var element = $('b:contains(" seconds")');
if (element.length > 0)
{
	var delay = GM_getValue ('delay');
	if (delay == 'undefined')
		delay = 0;

	var early = $('b:contains(" Seconds early")');
	var late = $('b:contains(" Seconds late")');
	if (early.length > 0)
		delay += parseFloat(early.text())*1000;
	else if (late.length > 0)
		delay -= parseFloat(late.text())*1000;

	GM_setValue ('delay', delay);

	var list = $('<select><option>Delay of '+delay+'</option><option>Reset delay</option></select>');
	$('.nav').each (function ()
	{
		$('<option/>')
			.attr ('value', $(this).attr('href'))
			.text ($(this).text ().replace ($(':hidden:not(.navhi)', this).text (), ''))
			.appendTo (list);
	})
	list.insertAfter (element);

	var num = parseInt(element.text());
	var i = num;
	if (delay < 0)
	{
		i -= Math.floor(delay/1000);
		setTimeout(function () {setInterval(change, 1000);}, delay*-1);
	} else
		setTimeout(function () {setInterval(change, 1000);}, delay);
}

function change()
{
	if (i <= 1)
	{
		i = num;
		var val = list.val ();
		if (val == 'Reset delay')
		{
			delay = 0;
			GM_setValue ('delay', 0);
			$('option:contains("Delay of")').text('Delay of 0');
		}
		else if (val != 'Delay of '+delay)
			window.location = val;
	}
	else
	{
		i--;
	}
	element.text (i + " seconds ");
}