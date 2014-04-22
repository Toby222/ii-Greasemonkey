// ==UserScript==
// @name        ii-puzzle-solver
// @namespace   http://RedHatter.gethub.com
// @description Solves for puzzle combat.
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @include     http://*improbableisland.com/*op=search*
// @include     http://*improbableisland.com/*op=fight*
// @include     http://*improbableisland.com/*module=worldmapen*
// @include     http://*improbableisland.com/badnav.php*
// @version     2.0
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// @grant       GM_xmlhttpRequest
// ==/UserScript==

/*
 * 1 = orange
 * 0 = green
 */


// Build the input and filter strings to represent the arm positions
var input = '';
var filter = '';
$("td > a > div > div").each (function (index)
{
	if ($(this).css ("background-image").indexOf ('orange') != -1)
	{
		input += 1;
		filter += 0;
	} else if ($(this).css ("background-image").indexOf ('disabled') != -1)
	{
		input += 0;
		filter += 1;
	} else
	{
		input += 0;
		filter += 0;
	}

	// Store key press when arm is clicked
	$(this).click (function ()
	{
		GM_setValue ('press',index+1);
	})
});

if (input == '')
	return

// If input is all zeros (green) than monster is stunned, get stun sequence
else if (parseInt (input) == 0)
{
	if (GM_getValue ('stun') == '')
		GM_xmlhttpRequest ({
			method: "GET",
			url: 	query = 'https://spreadsheets.google.com/tq?tq=select%20L,M,N,O,P%20where%20A%3D"'+GM_getValue ('name')+'"&key=0AtPkUdingtHEdFUzLWN0a3dkNDlyT09HNjVsNjg2ZXc',
			onload: function (response)
			{
				var reply = JSON.parse (response.responseText.slice (62,response.responseText.length-2)).table.rows[0].c;
				var stun = reply[0].v;
				for (var i = 1; i < reply.length; i++)
					stun += " - "+reply[i].v;

				$(document.createTextNode (stun)).insertBefore ($('div.navhead:contains ("Strike body parts")'));
				GM_setValue ('stun', stun);
			}
		});
	else
		$(document.createTextNode (GM_getValue ('stun'))).insertBefore ($('div.navhead:contains ("Strike body parts")'));
	return;
}

// Store keypress when a key is pressed
$(document).keypress (function (e)
{
	if (e.which>48 && e.which<58)
		GM_setValue ('press',e.which-48)
});

// Create and insert text box for each arm
var insert = $('div.navhead:contains ("Indiscriminate Flailing")');
var zero = '';
for (var i=0; i<input.length; i++)
{
	$("<input type='number' id='input_"+i+"' style='width:142px;height:17px;margin:1px 0 1px 5px;font-family:monospace'>")
		.insertBefore (insert)
	zero += '0';
}

// Extract monster name
var name = $("div#combatbars > table:last td > b").text ();
var num = $("div#combatbars > table td > b:contains ("+name+")").length;

if (name.indexOf ('Elite') == 0){name = name.slice (6);}
else if (name.indexOf ('Deadly') == 0){name = name.slice (7);}
else if (name.indexOf ('Lethal') == 0){name = name.slice (7);}
else if (name.indexOf ('Savage') == 0){name = name.slice (7);}
else if (name.indexOf ('Malignant') == 0){name = name.slice (10);}
else if (name.indexOf ('Dangerous') == 0){name = name.slice (10);}
else if (name.indexOf ('Malevolent') == 0){name = name.slice (11);}

if (num > 1)
	name += ' (x'+num+')';

// Set url for getting monster info from spreadsheet
var query;
if (name == "Lion")
{
	level = $('span:contains (" (Level")').text ().slice (8,level.indexOf (')'));
	query = 'https://spreadsheets.google.com/tq?tq=select%20C,D,E,F,G,H,I,J,K%20where%20A%20contains%20"Lion"%20and%20B='+level+'&key=0AtPkUdingtHEdFUzLWN0a3dkNDlyT09HNjVsNjg2ZXc';
} else
	query = 'https://spreadsheets.google.com/tq?tq=select%20C,D,E,F,G,H,I,J,K%20where%20A%3D"'+name+'"&key=0AtPkUdingtHEdFUzLWN0a3dkNDlyT09HNjVsNjg2ZXc';

// Button for solving puzzle
var solve = $("<input type='button' value='Solve'>")
	.insertBefore (insert)
	.click (function ()
	{
		var toggles = [];
		for (var i=0; i<input.length; i++)
		{
			var toggle = $("#input_"+i).val ().split (',');
			var num = zero;
			for (var a=0; a<toggle.length; a++)
			{
				num = replaceAt (num, parseInt (toggle[a])-1, '1');
			}
			toggles.push (parseInt (num, 2));
		}
		$(this)
			.val (combinations (toggles, parseInt (input, 2), parseInt (filter, 2)))
			.blur ();
	});


// Set arm combinations ether by memory (if correct) or spreadsheet
if (GM_getValue ('name') != name)
{
	GM_setValue ('name',name);
	GM_setValue ('stun', '');

	var first = true;


	// Remember dummy values to stop null error
	for (var i=0; i<input.length; i++)
	{
		GM_setValue ('input_'+i, '0');
	}

	// Get monster info from spreadsheet
	var reply;
	GM_xmlhttpRequest ({
		method: "GET",
		url: query,
		onload: function (response)
		{
			reply = JSON.parse (response.responseText.slice (62,response.responseText.length-2)).table.rows[0].c;
			for (var i=0; i<reply.length; i++)
			{
				$("#input_"+i).val (reply[i].v);
				GM_setValue ('input_'+i, reply[i].v);
				solve.click ();
			}
		}
	});
} else
{
	// Set values from memory
	for (var i=0; i<input.length; i++)
	{
		$('#input_'+i).val (GM_getValue ('input_'+i));
	}
	var first = false;
	solve.click ();
}

// Create button to reset name
$("<input type='button' value='Reset'>")
	.insertBefore (insert)
	.click (function ()
	{
		GM_deleteValue ('name');
	});

// Display info
var prv = GM_getValue ('prv');
var diff = parseInt (prv,2)^parseInt (input,2);
var string = '';
for (var i=0; i<input.length; i++)
{
	var mask = 1 << i;
	if ((diff&mask) == mask)
		string = (input.length-i)+','+string;
}
string = string.slice (0,string.length-1);
var press = GM_getValue ('press');

$("<div style='font-family:monospace'>Previous: "+prv+"<br>Current : </div>")
	.append ($("<a>"+input+"</a>").click (function ()
		{
			input = prompt ('',input);
			a.childNodes[0].nodeValue = input;
		})
	)
	.append ($("<br>Differance: "+string+"<br>Pressed: "+press+"<br>"))
	.insertBefore (insert);

// Show error if spreadsheet and reality don't match
if (string != $('#input_'+ (press-1)).val () && !first)
	$('#input_'+ (press-1)).css ("background-color", "red");

GM_setValue ('prv',input);

// Search for a working combination by brute force
function combinations (array,test,filter)
{
	var result = [];

	function loop (start,depth,prefix)
	{
		for (var i=start; i<array.length; i++)
		{
			var next = prefix^array[i];
			if (depth > 0)
			{
				if (loop (i+1,depth-1,next))
				{
					result.push (i+1);
					return true;
				}
			} else
			{
				var combo = test^next;
				if (combo == 0 || (combo&filter) == combo)
				{
					result.push (i+1);
					return true;
				}
			}
		}

		return false;
	}

	for (var i=0; i<array.length; i++)
		if (loop (0,i,0))
			break;

	return result;
}

function replaceAt (str, index, char)
{
      return str.substr (0, index) + char + str.substr (index+char.length);
}
