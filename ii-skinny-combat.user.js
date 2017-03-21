// ==UserScript==
// @name        ii-skinny-combat
// @description Displays abbreviated combat text.
// @namespace   http://idioticdev.com
// @include     http://*improbableisland.com/*op=search*
// @include     http://*improbableisland.com/*op=fight*
// @include     http://*improbableisland.com/*module=worldmapen*
// @include     http://*improbableisland.com/badnav.php*
// @version     1
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js
// @grant       GM_setValue
// @grant       GM_getValue
// ==/UserScript==

let spade = GM_getValue('spade')
let club = GM_getValue('club')

let regex = [
	// Pattern, 'You' text, 'Monster' text

	// Simple damage
	[/You hit .+ for ([\d,]+) points of damage!/, "", "`4 -\1 HP"],
	[/You try to hit .+ but are RIPOSTED for ([\d,]+) points of damage!/, "`4-\1 HP", ""],
//	[/You execute a .*power move!!!/, 1],
	[/.+ tries to hit you but MISSES!/, "", "`4MISS"],
	[/You try to hit .+ but MISS!/, "`4MISS", ""],
	[/.+ tries to hit you but you RIPOSTE for ([\d,]+) points of damage!/, "", "`4 -\1 HP"],
	[/.+ hits you for ([\d,]+) points of damage!/, "`4-\1 HP", ""],

	// Clan aura
	[/Your Clan Aura allows you to reflect ([\d,]+) of the damage you received .+!/, "", "`4 -\1 HP"],
	[/Your Clan Aura allows you to regenerate ([\d,]+) damage!/, "`2+\1 HP", ""],
	[/Your Clan Aura allows you to absorb ([\d,]+) of the damage you dealt to .*!/, "`2+\1 HP", ""],
	[/Your Clan's Aura strengthens you!/, "`3+Atk, +Def", ""],

	// Mounts
	[/You use your Budget Horse as a meat shield, deflecting the blows from .+!/, "`3+0.5 Def", ""],
	[/Sat on Son of Budget Horse's shoulders, your foes find it harder to hit you - and his flying fists give them a run for their money too!/, "`3+3 Def & Atk", ""],
	[/Your KittyBike strikes for ([\d,]+) damage!/, "", "`4 -\1 HP"],

	// Items
	[/.+ can't stand the smell of your Monster Repellent Spray, and doesn't want to get too close!/, "", "`3 -20% Def"],
	[/The grenade explodes close enough to .+ to do ([\d,]+) damage!/, "", "`4-\1 HP"],

	// Equipment
	[/Your Plasma Gun spits gobbets of superheated gas at your opponent!/, "`3+200% Atk", ""],
	[/.+ hits you, and a streak of lightning jumps from your suit, causing ([\d,]+) damage!/, "", "`4-\1 HP"],
	[/.+ is hit by a piece of random debris for ([\d,]+) damage!/, "", "`4-\1 HP"],

	// Booz

	// NewHome booze
	[/The Wanker Lite you imbibed in NewHome has made you feel slightly more aggressive.  Since you have to live in the same world as this beer, you don't particularly feel like concentrating on defending yourself from incoming attacks./,
		"`3+Atk<br>-Def", ""],
	[/Your Attack and Defense are slightly increased by the slow-burning effects of the pint of Hairy Old Number Seven you imbibed in NewHome\./, "`3+Atk<br>+Def", ""],
	// Kitika booze
	[/Thanks to your Warm Cider Fuzzies, your defensive movements are more fluid!/, "`3+10% Def", ""],
	[/The Tigger Balm Shakes make you feel more aggressive!/, "`3+40% Atk, -20% Def", ""],
	// Squat Hole booze
	[/The pint of Wanker you imbibed in Squat Hole has filled you with murderous rage!/, "`3+30% Atk", ""],
	[/The Mudwisearse you imbibed in Squat Hole has made you feel slightly more aggressive.  Very slightly more aggressive\./, "`3+5% Atk", ""],
	// Ace High cake
	[/The cake you ate earlier has boosted your energy!/, "`3+10% Atk<br>+25% Def", "<br>"],

	// Insults
	[/".+" you cry.  You can tell you've struck a deep blow!  Your enemy is most vexed and distressed, and can neither attack nor defend as effectively for this round!/,
		"", "`3-50% Atk<br>-50% Def"],

	// Stun
	[/With the creature on the ropes, you strike with double attack power!/, "`3+100% Atk", ""],
	[/With the creature reeling from your flurry of blows, you strike with triple attack power!/, "`3+200% Atk", ""],
	[/With the creature collapsing under your constant onslaught, you strike with quadruple attack power!/, "`3+300% Atk", ""],
	[/With the creature falling back as you pummel the life out of it, you strike with Quintuple attack power!/, "`3+400% Atk", ""],

	// Race Specials

	// Kittymorph
	[/Because you are fighting completely starkers, .+ is hilariously distracted and cannot attack or defend as effectively!/, "", "`3-50% Atk & Def"],

	// Joker
	[/With a grin you realise that all your cards match up - Joker tradition now allows you to expand your hand by one card!/, "`X<b>+Card</b>", ""],
	[/The mysterious power of your Hearts aura causes you to regenerate ([\d,]+) hitpoints\.\.\./, "`2+\1HP", ""],
	[/Thanks to the power of the Clubs suit, your attacks are more powerful!/, "`3+"+(((club*club*club)*0.005)+1)+" Atk", ""],
	[/Thanks to the power of the Spades suit, .+ is having trouble hitting you!/, "`3+"+(((spade*spade*spade)*0.005)+1)+" Def", ""],
	[/The reward hopper mounted to the closest camera is briefly enveloped in crackling green lightning\.  You step back and deftly catch the single Requisition token that clatters out of it, before heading straight back into the fight!/,
		"`^+1 req", ""],
	[/The reward hopper mounted to the closest camera is briefly enveloped in crackling green lightning\.  You step back and deftly catch the ([\d,]+) Requisition tokens that pour out of it, before heading straight back into the fight!/,
		"`^+\1 req", ""],
	[/Your internal bleeding causes you to lose ([\d,]+) hitpoints\./, "`4-\1 HP", ""],
	[/Your accelerated cellular regeneration causes you to gain ([\d,]+) hitpoints\./, "`2+\1 HP", ""],

	// Requisitions
	[/([\d,]+) shiny Requisition tokens are dispensed from the nearest camera!/, "`^+\1 Req", ""],
	[/([\d,]+) Requisition dropped by less perceptive contestants!/, "`^+\1 Req", ""],
	
	// Other
	[/You have defeated .*!/, "", "<span style='background-color:black;color:white;width:100%;display:inline-block;text-align:center'>K.O.</span>"],
	[/You earn ([\d,]+) Glory Points this round!/, "`X+\1 glory", ""],
	[/([\d,]+) total experience!/, "`X+\1XP", ""],
	[/The force of the blow sends you reeling, and knocks ([\d,]+) Stamina points out of you!/, "`X-\1 Stamina", ""],
	[/You receive ([\d,]+) favor with The Watcher!/, "`X\1 favor", ""],
	[/You find a cigarette!/, "+1 cigarette", ""],
	[/You aim for a vulnerable spot!/, "", "`3-Def"],
	[/You're getting exhausted!/, "", "`3-Def"],
	[/You're getting very tired.../, "`3-Def, -Atk", ""],
	[/Your perfect timing really makes a difference!/, "`3+100% Atk & Def", ""]
]

GM_setValue('spade',$('img[src*=spade]').length)
GM_setValue('club',$('img[src*=club]').length)

let table = $('<table>')
.css({
	'border-collapse': 'collapse'
})
.append(
	$('<th/>').text('You').css({
		'background-color': 'black',
		color: 'white',
		'font-weight': 'normal',
		'padding': '0 5px'
	}),
	$('<th/>').text('Monster').css({
		'background-color': 'black',
		color: 'white',
		'font-weight': 'normal',
		'padding': '0 5px',
		'border-right': '2px solid black'
	})
)

$('td.content').contents().filter((i, e) => e.nodeType == 3).wrap('<span/>')
let begin = $('td.content span:contains("Start of Round")')
let line = begin.nextUntil('br')

let br = $('td.content span br:last-child')
br.parent().after('<br>')
br.remove()

while(!line.is('div, span:contains("End of Round")') && line.length > 0) {
	let last = line.last()
	while (last.next().is('br'))
		last.next().remove()
	
	let you = $('<td/>').css({
		'white-space': 'nowrap',
		'border-right': '1px solid black',
		padding: '0 10px'
	})
	let monster = $('<td/>').css({
		'white-space': 'nowrap',
		'border-right': '2px solid black',
		padding: '0 10px'
	})
	let elements = line
	for (test of regex) {
		var result = test[0].exec(elements.text())
		if (!result) continue
		
		you.append(colorText(test[1].replace('\1',result[1])))
		monster.append(colorText(test[2].replace('\1',result[1])))
		break
	}

	line = last.nextUntil('br')
	$('<tr/>').append(
		you, monster,
		$('<td/>').append(elements.remove()).css('padding-left', '10px')
	).appendTo(table)
}

table.insertAfter(begin)

function colorText (text)
{
	text = text.replace("`1", "<span class='colDkBlue'>");
	text = text.replace("`2", "<span class='colDkGreen'>");
	text = text.replace("`3", "<span class='colDkCyan'>");
	text = text.replace("`4", "<span class='colDkRed'>");
	text = text.replace("`5", "<span class='colDkMagenta'>");
	text = text.replace("`6", "<span class='colDkYellow'>");
	text = text.replace("`7", "<span class='colDkWhite'>");
	text = text.replace("`~", "<span class='colBlack'>");
	text = text.replace("`!", "<span class='colLtBlue'>");
	text = text.replace("`@", "<span class='colLtGreen'>");
	text = text.replace("`#", "<span class='colLtCyan'>");
	text = text.replace("`$", "<span class='colLtRed'>");
	text = text.replace("`%", "<span class='colLtMagenta'>");
	text = text.replace("`^", "<span class='colLtYellow'>");
	text = text.replace("`&", "<span class='colLtWhite'>");
	text = text.replace("`);", "<span class='colLtBlack'>");
	text = text.replace("`e", "<span class='colDkRust'>");
	text = text.replace("`E", "<span class='colLtRust'>");
	text = text.replace("`g", "<span class='colXLtGreen'>");
	text = text.replace("`G", "<span class='colXLtGreen'>");
	text = text.replace("`j", "<span class='colMdGrey'>");
	text = text.replace("`k", "<span class='colaquamarine'>");
	text = text.replace("`K", "<span class='coldarkseagreen'>");
	text = text.replace("`l", "<span class='colDkLinkBlue'>");
	text = text.replace("`L", "<span class='colLtLinkBlue'>");
	text = text.replace("`m", "<span class='colwheat'>");
	text = text.replace("`M", "<span class='coltan'>");
	text = text.replace("`p", "<span class='collightsalmon'>");
	text = text.replace("`P", "<span class='colsalmon'>");
	text = text.replace("`q", "<span class='colDkOrange'>");
	text = text.replace("`Q", "<span class='colLtOrange'>");
	text = text.replace("`R", "<span class='colRose'>");
	text = text.replace("`T", "<span class='colDkBrown'>");
	text = text.replace("`t", "<span class='colLtBrown'>");
	text = text.replace("`V", "<span class='colBlueViolet'>");
	text = text.replace("`v", "<span class='coliceviolet'>");
	text = text.replace("`x", "<span class='colburlywood'>");
	text = text.replace("`X", "<span class='colbeige'>");
	text = text.replace("`y", "<span class='colkhaki'>");
	text = text.replace("`Y", "<span class='coldarkkhaki'>");
	text += "</span>";
	return text;
}
