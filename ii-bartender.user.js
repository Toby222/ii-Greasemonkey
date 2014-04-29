// ==UserScript==
// @name        ii-bartender
// @namespace   http://RedHatter.github.com
// @description Monitors buffs and shows an alert when they have changed.
// @include     http://*improbableisland.com/*
// @exclude     http://*improbableisland.com/runmodule.php?module=staminasystem*
// @exclude     http://*improbableisland.com/bio.php?char=*
// @exclude     http://*enquirer.improbableisland.com/*
// @version     1.0
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require     http://google-diff-match-patch.googlecode.com/svn/trunk/javascript/diff_match_patch.js
// @grant       GM_setValue
// @grant       GM_getValue
// ==/UserScript==

var buffList = [
	// Booze name, buff name, effects
	["", "KittyBike Claws","+13 Dmg "],
	["", "Lotsa Penetron Bolts", "+100% Atk "],
	
	// Booze
	["Mudwisearse", "Crappiest Beer Ever", "+5% Atk "],
	["Wanker", "Wanker", "+30% Atk "],
	["Cake or Death", "Full Of Cake", "+10% Atk +25% Def "],
	["Brain Hemorrhage", "Brain Hemorrhage Fuzzies", "+12% Atk "],
	["Monster Mash", "Monster Mash Grumps", "+20% Atk "],
	["Special Sauce", "Special Sauce Warmth", "+25% Atk +33% Def"],
	["Ale", "Buzz", "+16% Atk"]
];

var old = GM_getValue('buffs');

var buffs = '';
$('#stat_buffs span:not(.colDkWhite)').each(function ()
{
	if ($(this).text())
		buffs += $(this).text()+"\n";
		
	for (let buff of buffList)
		if ($(this).text().indexOf(buff[1]) > -1)
			$(this).prepend(buff[2]);
});

if (buffs)
	GM_setValue('buffs',buffs);

var dmp = new diff_match_patch();
var diffs = dmp.diff_main(buffs, old);
dmp.diff_cleanupSemantic(diffs);

var end = "";

for (let buff of diffs)
	if (buff[0] == 1)
		end += buff[1]+"\n";

var begun = "";

for (let buff of diffs)
	if (buff[0] == -1)
		begun += buff[1]+"\n";

var text = "";

if (end != "")
	text = "These buffs have ended: \n"+end;

if (begun != "")
	text = "\nThese buffs have begun: \n"+begun;

if (text != "")
	alert(text)

if (window.location.href.indexOf('op=bartender') > -1)
	for (let buff of buffList)
		if (buff[0] && buffs.indexOf(buff[1]) == -1)
			$('a:contains("'+buff[0]+'")').css('font-weight', 'bold');
