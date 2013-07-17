// ==UserScript==
// @name        Short Term Memory
// @namespace   https://github.com/RedHatter
// @description Saves last unloaded page for quick review.
// @include     *
// @version     1
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// ==/UserScript==

GM_registerMenuCommand("View previous page", function ()
{
	var w = window.open('', 'Short Term Memory');
	w.document.head.innerHTML = GM_getValue('head');
	w.document.body.innerHTML = GM_getValue('body');
}, "V");

window.addEventListener("unload", function()
{
	var base = window.location.href;
	base = base.substring(0,base.lastIndexOf('/'));
	GM_setValue('head', document.head.innerHTML+"<base href='"+base+"'>");
	GM_setValue('body', document.body.innerHTML);
}, false);
