// ==UserScript==
// @name        ii-slave-labour
// @namespace   http://RedHatter.github.com
// @description Action automation.
// @include     http://*improbableisland.com/*
// @version     1.0
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// @grant       GM_registerMenuCommand
// ==/UserScript==

var actions = [
	// Name, Conditional link, Path
	["Refresh booze", "Return to Squat Hole",
		["Return to Squat Hole", "Booz", "Chlamydia", "Mudwisearse", "Return to the lounge", "Chlamydia", "Wanker", "Back to Squat Hole", "Jungle"]
	],
	["Refresh booze", "Return to Improbable Central",
		["Return to Improbable Central", "The Prancing SpiderKitty", "Talk to Dan the Landlord", "Ale", "Return to Improbable Central", "Jungle"]
	],
	["Deposit Req", "Return to",
		["Return to", "Bank of Improbable", "Deposit", function () {$('input[type=submit]').click();}, "Return to", "Jungle"]
	]
];

var auto = [
	// Conditional link
//	"Pick up SneezeRoot",
//	"Pick up TwitchLeaf",
]

actions.forEach(function(action, index)
{
	if ($('a:contains("'+action[1]+'")').length > 0)
		GM_registerMenuCommand(action[0], function ()
		{
			GM_setValue('action', index);
			GM_setValue('step', 0);
			window.location = window.location;
		});
});

for (let action of auto)
{
	var link = $('a:contains("'+action+'")');
	if (link.length > 0)
		window.location.href = link.attr('href');
}

traverse();

function traverse()
{
	var index = GM_getValue('action');

	if (typeof index == 'undefined')
		return;

	var action = actions[index];
	var step = GM_getValue('step');
	if (action[2].length > step)
		GM_setValue('step', step+1);
	else
	{
		GM_deleteValue('step');
		GM_deleteValue('action');
	}

	if (typeof action[2][step] == 'string')
	{
		var url = $('a:contains("'+action[2][step]+'")').attr('href');
		if (typeof url != 'undefined')
			window.location.href = url;
	}
	else
		action[2][step]();
}

