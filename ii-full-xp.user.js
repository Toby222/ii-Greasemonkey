// ==UserScript==
// @name        ii-full-xp
// @namespace   http://idioticdev.com
// @description Alters your XP bar to show how far you could level.
// @include     http://*improbableisland.com/*
// @include     https://*improbableisland.com/*
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @version     1
// @grant       none
// ==/UserScript==
(function () {
  let base = [
    0, 100, 400, 1002, 1912, 3140, 4707, 6641, 8985, 11795,
    15143, 19121, 23840, 29437, 36071, 43930, 43930
  ]
  let box = $('td.charinfo:contains("Experience") + td span')
  if (box.length < 1) return

  let xp = box.text().split('/')
  let target = parseInt(xp[1].replace(',', ''))
  xp = parseInt(xp[0].replace(',', ''))
  let level = parseInt($('td.charinfo:contains("Level")').next().text())
  let current = level
  let dk = (target - base[level]) / level / 25

  while (xp > target) {
    level++
    target = base[level] + (level) * dk * 25
  }

  if (level <= current) return

  let last = base[level - 1] + (level - 1) * dk * 25
  let over = xp - last
  let bar = target - last

  box.append(`Level ${level}`)
  $('td[bgcolor="blue"]', box)
    .attr('width', `${over / bar * 100}%`)
    .attr('bgcolor', 'white')
    .closest('span')
      .attr('title', `${target - xp} XP remaining`)
})()
