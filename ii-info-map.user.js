// ==UserScript==
// @name        ii-info-map
// @namespace   http://redhatter.gethub.com
// @description A map that records the places you come across, and allows you to add notes.
// @include     http://*improbableisland.com/*
// @include     https://*improbableisland.com/*
// @exclude	http://*improbableisland.com/forest.php*
// @exclude	https://*improbableisland.com/forest.php*
// @version     1
// ==/UserScript==

var WIDTH = 16;
var HEIGHT = 16;
var IMAGE = 'https://github.com/RedHatter/ii-info-map/raw/master/map.png';
var RESIZE = 1;
var CROP = -20;
var SHOW_PLACES = false;

var x;
var y;
var div;
var bar;
var info;
var map;
var boxX;
var boxY;

var element = document.createElement( 'a' );
element.appendChild(document.createTextNode('Open Map'));
element.addEventListener("click", openMap, true);

var textNode = document.createTextNode(' | ');

var insert = document.evaluate("//a[contains(@href,'http://merch.improbableisland.com')]", document, null, XPathResult.ANY_TYPE, null).iterateNext();
insert.parentNode.insertBefore(textNode, insert.nextSibling);
insert.parentNode.insertBefore(element, textNode.nextSibling);

var loc = document.evaluate("//tbody/tr/td/img[@src='images/trans.gif']", document, null, XPathResult.ANY_TYPE, null).iterateNext();
if(loc)
{
	var splitL = loc.alt.split(', ');
	var x = parseInt(splitL[0].slice(1))+2;
	var y = parseInt(splitL[1])-2;
	boxX = x;
	boxY = y;

	var places = eval(GM_getValue(x+","+y));
	if (!places || !places[0])
	{
		var newPlaces = document.evaluate("//tbody/tr[@class='trlight' or @class='trdark']/td", document, null, XPathResult.ANY_TYPE, null);
		if (newPlaces)
		{
			places = [];
			var element = newPlaces.iterateNext();
			while (element)
			{
				var html = element.innerHTML;
				var name = document.evaluate("./a[1]/b/text()|./a[1]/b/span/text()|./b[1]/text()", element, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
				if (html.indexOf('(locked)') != -1)
				{
					name += " (locked)";
				}
				html = html.slice(html.indexOf('<br>')+4);
			
				var place = {title:name,desc:html};
				places.push(place);
				element = newPlaces.iterateNext();
			}
			GM_setValue(x+","+y, uneval(places));
		}
	}
}


function openMap()
{
	//Top popup element
	div = document.createElement('div');
	div.className = 'trdark';
	div.style.position = 'absolute';
	div.style.zIndex = '100';
	div.style.top = '0';
	div.style.left = '0';
	div.style.overflow = 'hidden';

	//Dragable bar for moving map
	bar = document.createElement('div');
	bar.className = 'trhead';
	bar.style.width = '100%';
	bar.style.height = '20px';
	bar.style.textAlign = 'center';
	bar.innerHTML = "Drag to move";
	bar.addEventListener("mousedown", startMove, true);
	bar.addEventListener("mouseup", endMove, true);
	div.appendChild(bar);

	//The map image
	image = document.createElement('img');
	image.src = IMAGE;
	image.width = Math.round(image.width*RESIZE);
	image.height = Math.round(image.height*RESIZE);
	image.useMap = '#clickmap';
	div.appendChild(image);

	div.style.height = image.height-CROP;
	div.style.width = image.width;

	//div to show place info
	info = document.createElement('div');
	info.style.padding = '5px';
	info.style.position = 'relative';
	info.style.cssFloat = 'right';
	info.style.width = '400px';
	info.style.height = image.height-CROP-30;
	info.style.overflow = 'auto';
	div.appendChild(info);

	map = document.createElement('map');
	map.id = 'clickmap';
	div.appendChild(map);

	if(loc)
	{	
		//current location indicator
		box = document.createElement('div');
		box.style.position = 'absolute';
		box.style.zIndex = 105;
		box.style.backgroundColor = "#FF9900";
		box.style.height = HEIGHT*RESIZE;
		box.style.width = WIDTH*RESIZE;
		box.style.borderRadius = HEIGHT/2*RESIZE;
		box.addEventListener("click", openCellE, true);
		box.setAttribute('data-loc', boxX+","+boxY);
		box.style.top = (((40-boxY)*HEIGHT)*RESIZE)+20;
		box.style.left = ((boxX-1)*WIDTH)*RESIZE;
		div.appendChild(box);
	}

	for (var y=0; y<=39; y++)
	{
		for (var x=0; x<=24; x++)
		{
			var area = document.createElement('area');
			area.shape = 'rect';
			area.coords = (x*WIDTH)*RESIZE+','+(y*HEIGHT)*RESIZE+','+((x*WIDTH)+WIDTH)*RESIZE+','+((y*HEIGHT)+HEIGHT)*RESIZE;
			area.alt = (x+1)+','+(40-y);
			area.setAttribute('data-loc', area.alt);
			area.addEventListener("click", openCellE, true);
			area.href = area.alt;
			map.appendChild(area);

			if (SHOW_PLACES)
			{
				var places = eval(GM_getValue(area.alt));
				if (places)
				{
					var box = document.createElement('div');
					box.style.position = 'absolute';
					box.style.zIndex = '110';
					box.style.backgroundColor = "black";
					box.style.height = HEIGHT*RESIZE;
					box.style.width = WIDTH*RESIZE;
					box.style.top = (((y-1)*HEIGHT)*RESIZE)+20;
					box.style.left = (x*WIDTH)*RESIZE;
					div.appendChild(box);
				}
			}
		}
	}
	document.body.appendChild(div);
}

function createPlace(cell) {editPlace(cell, null);}

function editPlace(cell, i)
{
	while (info.hasChildNodes())
	{
		info.removeChild(info.lastChild);
	}
	var places = eval(GM_getValue(cell));

	div.style.width = div.style.width = image.width+parseInt(info.style.width)+20;

	var name = document.createElement('input');
	name.type = 'text';
	name.placeholder = 'Name';
	info.appendChild(name);

	info.appendChild(document.createElement('br'));

	var dec = document.createElement('textarea');
	dec.placeholder = 'Description';
	info.appendChild(dec);

	info.appendChild(document.createElement('br'));

	var note = document.createElement('textarea');
	note.placeholder = 'Notes';
	info.appendChild(note);

	info.appendChild(document.createElement('br'));

	if (i >= 0)
	{
		name.value = places[i].title;
		dec.value = places[i].desc;
		note.value = places[i].notes;
	}

	element = document.createElement('input');
	element.type = 'button';
	element.value = 'Save';
	element.style.cssFloat = 'right';
	element.addEventListener("click", function(e)
	{
		var place = {title:name.value,desc:dec.value,notes:note.value};
		if (places)
		{
			if (i >= 0)
				places[i] = place;
			else
				places.push(place);
		} else
		{
			places = [place];
		}
		GM_setValue(cell, uneval(places));
		div.style.width = image.width;
	}, true);
	info.appendChild(element);

	element = document.createElement('input');
	element.type = 'button';
	element.value = 'Cancel';
	element.style.cssFloat = 'right';
	element.addEventListener("click", function(e){div.style.width = image.width;}, true);
	info.appendChild(element);
}

function openPlace(cell, i)
{
	while (info.hasChildNodes())
	{
		info.removeChild(info.lastChild);
	}

	var places = eval(GM_getValue(cell));
	div.style.width = image.width+parseInt(info.style.width)+20;

	var element = document.createElement('b');
	element.appendChild(document.createTextNode('Name: '));
	info.appendChild(element);
	info.appendChild(document.createTextNode(places[i].title));

	info.appendChild(document.createElement('br'));
	info.appendChild(document.createElement('br'));

	element = document.createElement('b');
	element.appendChild(document.createTextNode('Description: '));
	info.appendChild(element);

	element = document.createElement('p');
	element.innerHTML = places[i].desc;
	info.appendChild(element);

	info.appendChild(document.createElement('br'));

	element = document.createElement('b');
	element.appendChild(document.createTextNode('Notes: '));
	info.appendChild(element);

	if (places[i].notes)
	{
		element = document.createElement('p');
		element.appendChild(document.createTextNode(places[i].notes));
		info.appendChild(element);
	} else
	{
		element = document.createElement('a');
		element.appendChild(document.createTextNode('add notes'));
		element.addEventListener("click", function(e){editPlace(cell, i);}, true);
		info.appendChild(element);
	}

	info.appendChild(document.createElement('br'));
 
	element = document.createElement('a');
	element.style.cssFloat = 'right';
	element.appendChild(document.createTextNode('Close'));
	element.addEventListener("click", function(e){div.style.width = image.width}, true);
	info.appendChild(element);

	element = document.createElement('a');
	element.appendChild(document.createTextNode('(Delete)'));
	element.addEventListener("click", function(e)
	{
		places[i] = null;
		GM_setValue(cell, uneval(places));
		div.style.width = image.width;
	}, true);

	info.appendChild(element);

	element = document.createElement('a');
	element.appendChild(document.createTextNode('(Edit)'));
	element.addEventListener("click", function(e){editPlace(cell, i);}, true);
	info.appendChild(element);

}

function openCellE(event)
{
	openCell(event.target.getAttribute('data-loc'));
	event.preventDefault();
}

function openCell(cell)
{
	while (info.hasChildNodes())
	{
		info.removeChild(info.lastChild);
	}

	div.style.width = div.style.width = image.width+parseInt(info.style.width)+20;;

	var places = eval(GM_getValue(cell));
	if (places)
	{
		for (var i=0; i<4; i++)
		{
			if (places[i])
			{
				var element = document.createElement('b');
				element.appendChild(document.createTextNode('Name: '));
				info.appendChild(element);

				element = document.createElement('a');
				element.appendChild(document.createTextNode(places[i].title));
				(function (i)
				{
					element.addEventListener("click", function (e){openPlace(cell, i);}, true);
				})(i)
				info.appendChild(element);

				info.appendChild(document.createElement('br'));
				info.appendChild(document.createElement('br'));

				element = document.createElement('b');
				element.appendChild(document.createTextNode('Description: '));
				info.appendChild(element);

				element = document.createElement('p');
				element.innerHTML = places[i].desc;
				info.appendChild(element);

				info.appendChild(document.createElement('br'));

				if (places[i].notes)
				{
					element = document.createElement('b');
					element.appendChild(document.createTextNode('Notes: '));
					info.appendChild(element);

					element = document.createElement('p');
					element.appendChild(document.createTextNode(places[i].notes));
					info.appendChild(element);

					info.appendChild(document.createElement('br'));
				}
			}
		}
	}

	info.appendChild(document.createElement('br'));

	element = document.createElement('a');
	element.appendChild(document.createTextNode("(Create Place)"));
	element.addEventListener("click", function(e){createPlace(cell);}, true);
	info.appendChild(element);

	element = document.createElement('a');
	element.appendChild(document.createTextNode(" (Delete Info)"));
	element.addEventListener("click", function(e){GM_deleteValue(cell); div.style.width = image.width;}, true);
	info.appendChild(element);

	element = document.createElement('a');
	element.style.cssFloat = 'right';
	element.appendChild(document.createTextNode('Close'));
	element.addEventListener("click", function(e){div.style.width = image.width}, true);
	info.appendChild(element);
}

function startMove(event)
{
	x = event.clientX-parseInt(div.style.left);
	y = event.clientY-parseInt(div.style.top);
	document.body.addEventListener("mousemove", move, true);
	document.body.addEventListener("mouseup", endMove, true);
}

function endMove()
{
	document.body.removeEventListener("mousemove", move, true);
	document.body.removeEventListener("mouseup", endMove, true);
}

function move(event)
{
	div.style.top = event.clientY-y;
	div.style.left = event.clientX-x;
}
