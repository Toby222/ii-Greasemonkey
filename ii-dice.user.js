// ==UserScript==
// @name        ii-dice
// @namespace   http://idioticdev.com
// @description Roll dice, flip a coin, or draw from a deck.
// @include     http://*improbableisland.com/*
// @version     1
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @grant       GM_registerMenuCommand
// ==/UserScript==

GM_registerMenuCommand('Roll Dice', function ()
{
	var d1 = toWord (Math.round (Math.random ()*6)+1);
	var d2 = toWord (Math.round (Math.random ()*6)+1);
	if ($('input[name="comment"]')
			.val (': rolls a pair of dice. They come to rest at `)'+d1+'`& and `)'+d2+'`&.')
			.length < 1)
		alert ('You roll the pair of dice. They come to rest at '+d1+' and '+d2+'.');
});

GM_registerMenuCommand('Roll One Die', function ()
{
	var d1 = toWord (Math.round (Math.random ()*6)+1);
	if ($('input[name="comment"]')
		.val (': rolls a single die. It comes to rest at `)'+d1+'`&.')
		.length < 1)
		alert ('You roll the die. It comes to rest at '+d1+'.');
});

GM_registerMenuCommand('Roll Multi-sided Die', function ()
{
	var sides = prompt ('How many sides do you wish your die to have?', 6);
	var d1 = Math.round (Math.random ()*sides)+1;
	if ($('input[name="comment"]')
		.val (': rolls a '+sides+' sided die. It comes to rest at `)'+d1+'`&.')
		.length < 1)
		alert ('You roll the '+sides+' sided die. It comes to rest at '+d1+'.');
});


GM_registerMenuCommand('Flip a Coin', function ()
{
	var flip = Math.round (Math.random ()*2)+1;
	var coin = (flip == 1) ? 'heads' : 'tails';
	if ($('input[name="comment"]')
		.val (': flips a coin. It lands with `)'+coin+' facing up`&.')
		.length < 1)
		alert ('You flip a coin. It lands with '+coin+' facing up.');
});

GM_registerMenuCommand('Draw a Card', function ()
{
	var num = Math.round (Math.random ()*12)+1;
	var suit = Math.round (Math.random ()*4)+1;
	var card = 'The ';
	switch (num)
	{
		case 1:
			card += 'Ace';
			break;
		case 11:
			card += 'Jack';
			break;
		case 12:
			card += 'Queen';
			break;
		case 13:
			card += 'King';
			break;
		default:
			card += capitalize (toWord (num));
			break;
	}

	card += ' of ';

	switch (suit)
	{
		case 1:
			card += 'Spades';
			break;
		case 2:
			card += 'Clubs';
			break;
		case 3:
			card += 'Dimonds';
			break;
		case 4:
			card += 'Hearts';
			break;
	}

	if ($('input[name="comment"]')
		.val (': gives a deck of cards a quick ruffle and pulls out '+card+'.')
		.length < 1)
		alert ('You give the deck of cards a quick ruffle and pull out '+card+'.');
});

function toWord (num)
{
	switch (num)
	{
		case 0:
			return 'zero';
		case 1:
			return 'one';
		case 2:
			return 'two';
		case 3:
			return 'three';
		case 4:
			return 'four';
		case 5:
			return 'five';
		case 6:
			return 'six';
		case 7:
			return 'seven';
		case 8:
			return 'eight';
		case 9:
			return 'nine';
		case 10:
			return 'ten';
		default:
			return num+'';
	}
}

function capitalize (str)
{
	return str.charAt(0).toUpperCase() + str.slice(1);
}
