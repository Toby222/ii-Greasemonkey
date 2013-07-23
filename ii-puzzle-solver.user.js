// ==UserScript==
// @name        ii-puzzle-solver
// @namespace   http://redhatter.gethub.com
// @description Solves for puzzle combat.
// @include     http://improbableisland.com/*
// @include     http://www.improbableisland.com/*
// @version     2.0
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_xmlhttpRequest
// ==/UserScript==

/*
 * 1 = orange
 * 0 = green
  *
 */
var input = '';
var filter = '';

var arms = document.evaluate("//td/a/div/div", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
for (var i = 0; i < arms.snapshotLength; i++)
{
	if(arms.snapshotItem(i).style.backgroundImage.indexOf('orange') != -1)
	{
		input += 1;
		filter += 0;
	} else if(arms.snapshotItem(i).style.backgroundImage.indexOf('disabled') != -1)
	{
		input += 0;
		filter += 1;
	} else
	{
		input += 0;
		filter += 0;
	}
}

if (input == '')
	return
else if (parseInt(input) == 0)
{
	var reply;
	GM_xmlhttpRequest({
		method: "GET",
		url: 	query = 'https://spreadsheets.google.com/tq?tq=select%20L,M,N,O,P%20where%20A%3D"'+GM_getValue('name')+'"&key=0AtPkUdingtHEdFUzLWN0a3dkNDlyT09HNjVsNjg2ZXc',
		onload: function(response)
		{
			reply = JSON.parse(response.responseText.slice(62,response.responseText.length-2)).table.rows[0].c;
			var stun = '';
			for(var i=0; i<reply.length; i++)
				stun += " - "+reply[i].v;

			var insert = document.evaluate("//text()[contains(.,'???')]", document, null, XPathResult.ANY_TYPE, null).iterateNext();
			if (!insert)
				insert = document.evaluate("//text()[contains(.,'No combo moves found yet...')]", document, null, XPathResult.ANY_TYPE, null).iterateNext();

			insert.parentNode.insertBefore(document.createTextNode(stun), insert.nextSibling);
		}
	});
	return;
}

document.addEventListener('keypress', function(e){if(e.which>48 && e.which<58) GM_setValue('press',e.which-48)},true);

var insert = document.evaluate("//div[contains(text(),'Indiscriminate Flailing')]", document, null, XPathResult.ANY_TYPE, null).iterateNext();

var zero = '';

for (var i=0; i<input.length; i++)
{
	element = document.createElement('input');
	element.type = 'number';
	element.style.width = '142px';
	element.style.height = '17px';
	element.style.margin = '1px 0 1px 5px';
	element.style.fontFamily = 'monospace';
	element.id = 'input_'+i;
	insert.parentNode.insertBefore(element, insert);
	zero += '0';
}

var name = document.evaluate("//div[@id='combatbars']/table[2]/tbody/tr/td/b/text()", document, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
if(name.indexOf('Elite') == 0){name = name.slice(6);}
else if(name.indexOf('Deadly') == 0){name = name.slice(7);}
else if(name.indexOf('Lethal') == 0){name = name.slice(7);}
else if(name.indexOf('Savage') == 0){name = name.slice(7);}
else if(name.indexOf('Malignant') == 0){name = name.slice(10);}
else if(name.indexOf('Dangerous') == 0){name = name.slice(10);}
else if(name.indexOf('Malevolent') == 0){name = name.slice(11);}

var num = document.evaluate("count(//div[@id='combatbars']/table)", document, null, XPathResult.NUMBER_TYPE, null);
if(num.numberValue-1 > 1)
	name += ' (x'+(num.numberValue-1)+')';

var query;
if (name == "Lion")
{
	var level = document.evaluate("//span[contains(text(),'(Level')]/text()", document, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
	level = level.slice(8,level.indexOf(')'));
	query = 'https://spreadsheets.google.com/tq?tq=select%20C,D,E,F,G,H,I,J,K%20where%20A%20contains%20"Lion"%20and%20B='+level+'&key=0AtPkUdingtHEdFUzLWN0a3dkNDlyT09HNjVsNjg2ZXc';
} else
{
	query = 'https://spreadsheets.google.com/tq?tq=select%20C,D,E,F,G,H,I,J,K%20where%20A%3D"'+name+'"&key=0AtPkUdingtHEdFUzLWN0a3dkNDlyT09HNjVsNjg2ZXc';
}

var solve = document.createElement('input');
solve.type = 'button';
solve.value = 'Solve';
solve.addEventListener("click", function()
{
	var toggles = [];
	for (var i=0; i<input.length; i++)
	{
		var val = document.getElementById('input_'+i).value;
		var toggle = val.split(',');
		var num = zero;
		for (var a=0; a<toggle.length; a++)
		{
			num = replaceAt(num, parseInt(toggle[a])-1, '1');
		}
		toggles.push(parseInt(num, 2));
	}
	solve.value = combinations(toggles, parseInt(input, 2), parseInt(filter, 2));
	solve.blur();
}, true);
insert.parentNode.insertBefore(solve, insert);

if(GM_getValue('name') != name)
{
	GM_setValue('name',name);

	var first = true;

	for(var i=0; i<input.length; i++)
	{
		GM_setValue('input_'+i, '0');
	}

	var reply;
	GM_xmlhttpRequest({
		method: "GET",
		url: query,
		onload: function(response)
		{
			reply = JSON.parse(response.responseText.slice(62,response.responseText.length-2)).table.rows[0].c;
			for(var i=0; i<reply.length; i++)
			{
				document.getElementById('input_'+i).value = reply[i].v;
				GM_setValue('input_'+i, reply[i].v);
				solve.click();
			}
		}
	});
} else
{
	for (var i=0; i<input.length; i++)
	{
		document.getElementById('input_'+i).value = GM_getValue('input_'+i);
	}
	var first = false;
	solve.click();
}

element = document.createElement('input');
element.type = 'button';
element.value = 'Reset';
element.addEventListener("click", function(){GM_deleteValue('name');}, true);
insert.parentNode.insertBefore(element, insert);

element = document.createElement('div');
element.style.fontFamily = 'monospace';
var prv = GM_getValue('prv');
element.appendChild(document.createTextNode('Previous: '+prv));
element.appendChild(document.createElement('br'));
element.appendChild(document.createTextNode(' Current: '));
var a = document.createElement('a');
a.appendChild(document.createTextNode(input));
a.addEventListener("click", function()
{
	input = prompt('',input);
	a.childNodes[0].nodeValue = input;
}, true);
element.appendChild(a);
element.appendChild(document.createElement('br'));

var diff = parseInt(prv,2)^parseInt(input,2);
var string = '';
for (var i=0; i<input.length; i++)
{
	var mask = 1 << i;
	if((diff&mask) == mask)
		string = (input.length-i)+','+string;
}

string = string.slice(0,string.length-1);

element.appendChild(document.createTextNode('Differance: '+string));
element.appendChild(document.createElement('br'));

var press = GM_getValue('press');
element.appendChild(document.createTextNode('Pressed: '+press));
element.appendChild(document.createElement('br'));

if (string != document.getElementById('input_'+(press-1)).value && !first)
	document.getElementById('input_'+(press-1)).style.backgroundColor = "red";

insert.parentNode.insertBefore(element, insert);
GM_setValue('prv',input);

function combinations (array,test,filter)
{
	var result = [];

	function loop (start,depth,prefix)
	{
		for(var i=start; i<array.length; i++)
		{
			var next = prefix^array[i];
			if (depth > 0)
			{
				if (loop(i+1,depth-1,next))
				{
					result.push(i+1);
					return true;
				}
			} else
			{
				var combo = test^next;
				if(combo == 0 || (combo&filter) == combo)
				{
					result.push(i+1);
					return true;
				}
			}
		}

		return false;
	}

	for(var i=0; i<array.length; i++)
		if(loop(0,i,0))
			break;

	return result;
}

function replaceAt(str, index, char)
{
      return str.substr(0, index) + char + str.substr(index+char.length);
}
