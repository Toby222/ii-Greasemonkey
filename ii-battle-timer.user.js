// ==UserScript==
// @name        ii-battle-timer
// @namespace   http://redhatter.gethub.com
// @description Inserts a timer for timed commbate.
// @include     http://improbableisland.com/*
// @include     http://www.improbableisland.com/*
// @version     1
// ==/UserScript==

var element = getElementByText(" seconds");
if (element)
{
	var num = parseInt(element.innerHTML);
	var i = num;
	setInterval(change, 1000);

/*	Draws bar for each second. Never worked well.
	var fill = document.createElement('div');
	var bar = document.createElement('div');
	bar.style.width = "50px";
	bar.style.height = "10px";
	bar.style.border = "1px solid black";
	bar.style.position = "relative";
	bar.style.left = "200px";
	fill.style.width = "0%";
	fill.style.height = "100%";
	fill.style.backgroundColor = "green";
	bar.appendChild(fill);
	element.parentNode.insertBefore(bar, element.nextSibling);

	var size = 0;

	setInterval(grow, 100);

}

function grow()
{
	if(size < 100)
	{
		size += 10;
		fill.style.width = size+"%";
	}
	else
	{
		size = 0;
	}*/
}

function change()
{
	if (i <= 1)
	{
		i = num;
	}
	else
	{
		i--;
	}
	element.innerHTML = i + " seconds";
}

function getElementByText(text, ctx)
{
  return document.evaluate("//b[text()[contains(.,'"+text+"')]]", 
     ctx || document, null, XPathResult.ANY_TYPE, null).iterateNext();
}

