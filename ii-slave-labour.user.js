// ==UserScript==
// @name        ii-slave-labour
// @namespace   http://RedHatter.github.com
// @description Action automation.
// @include     http://*improbableisland.com/*
// @version     1.0
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @run-at      document-start
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// @grant       GM_registerMenuCommand
// ==/UserScript==

var actions = [
	// Name, Conditional link, Path
	{
		name: "Free Stuff",
		conditional: "Joe's Diner",
		steps: ["Council Offices", "Claim your Free Stuff", "BANG Grenade", "BANG Grenade", "ZAP Grenade", "Leave"]
	},
	{
		name: "Heal",
		conditional: "Jungle",
		steps: ["Jungle", "Hospital Tent", "Complete Healing", "Return to"]
	},
	{
		name: "Heal",
		conditional: "Hospital Tent",
		steps: ["Hospital Tent", "Complete Healing"]
	},
	{
		name: "Refresh booze",
		conditional: "Return to Squat Hole",
		steps: ["Return to Squat Hole", "Booz", "Chlamydia", "Mudwisearse", "Return to the lounge", "Chlamydia", "Wanker", "Back to Squat Hole", "Jungle"]
	},
	{
		name: "Refresh booze",
		conditional: "Return to Improbable Central",
		steps: ["Return to Improbable Central", "The Prancing SpiderKitty", "Talk to Dan the Landlord", "Ale", "Return to Improbable Central", "Jungle"]
	},
	{
		name: "Deposit Req",
		conditional: "Return to",
		steps: ["Return to", "Bank of Improbable", "Deposit", function () {$('input[type=submit]').click();}, "Return to", "Jungle"]
	},
	{
		name: "Deposit Req",
		conditional: "Bank of Improbable",
		steps: ["Bank of Improbable", "Deposit", function () {$('input[type=submit]').click();}, "Return to"]
	}
];

var auto = [
	// Conditional link
	// "Pick up all Snarls of SneezeRoot",
	// "Pick up SneezeRoot",
	// "Pick up all Clumps of TwitchLeaf",
	// "Pick up TwitchLeaf",
	// "Pick up all Pods of SteelSeed",
	// "Pick up SteelSeed",
	// "Pick up all Supply Crates",
	// "Pick up Supply Crate",
]

var insert = null;
waitForKeyElements (".navhead", function (node)
{
	if (insert == null)
	{
		insert = node;
	}
});

var header = false;
waitForKeyElements ("a.nav", function (node)
{
	if ($(node).attr('href') == undefined)
		return;
	else
		console.log ($(node).attr('href'));

	for (let action of auto)
	{
		if (node.text().indexOf(action) > -1)
		{
			window.location.href = node.attr('href');
			break;
		}
	}

	actions.forEach(function(action, index)
	{
		if ((typeof action.conditional == 'string' && node.text().indexOf(action.conditional) > -1)
			|| (typeof action.conditional == 'function' && action.conditional()))
		{
			GM_registerMenuCommand(action.name, function ()
			{
				GM_setValue('action', index);
				GM_setValue('step', 0);
				window.location = window.location;
			});

			if (!header)
			{
				$("<div class='navhead'>Slaves</div>").insertBefore (insert);
				insert = $("<br clear=all>").insertBefore (insert)
				header = true;
			}

			$("<a class='nav slave'>"+action.name+"</a>").click (function ()
			{
					GM_setValue('action', index);
					GM_setValue('step', 0);
					traverse (node);
			}).insertBefore (insert);
		}
	});

	traverse (node);
});

function traverse (node)
{
	// Do the current action
	var index = GM_getValue('action');

	if (typeof index == 'undefined')
		return;

	var action = actions[index];
	var step = GM_getValue('step');

	if (typeof action.steps[step] == 'string')
	{
		if ( node.text().indexOf(action.steps[step]) > -1
			&& typeof node.attr('href') != 'undefined')
		{
			window.location.href = node.attr('href');
			if (action.steps.length > step+1)
				GM_setValue('step', step+1);
			else
			{
				GM_deleteValue('step');
				GM_deleteValue('action');
			}
		}
	}
	else
	{
		$(window).load(function ()
		{
			action.steps[step]();
			if (action.steps.length > step+1)
				GM_setValue('step', step+1);
			else
			{
				GM_deleteValue('step');
				GM_deleteValue('action');
			}
		});
	}
}