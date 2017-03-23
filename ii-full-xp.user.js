// ==UserScript==
// @name        ii-full-xp
// @namespace   http://idioticdev.com
// @description Alters your XP bar to show how far you could level.
// @include     http://*improbableisland.com/*
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @version     1
// @grant       none
// ==/UserScript==
let base = [
  0, 100, 400, 1002, 1912, 3140, 4707, 6641, 8985, 11795,
  15143, 19121, 23840, 29437, 36071, 43930, 43930
]
let box = $('td.charinfo:contains("Experience") + td span')
let xp = box.text().split('/')
let target = parseInt(xp[1].replace(',', ''))
xp = parseInt(xp[0].replace(',', ''))
let level = parseInt($('td.charinfo:contains("Level")').next().text())
let dk = (target - base[level]) / level / 25

while (xp > target) {
  level++
  target = base[level] + (level) * dk * 25
}

box.append(`Level ${level}`)
$('td[bgcolor="blue"]', box)
  .attr('width', `${xp / target}%`)
  .attr('bgcolor', 'white')
  .closest('span')
    .attr('title', `${target - xp} XP remaining`)
