// ==UserScript==
// @name        ii-sniffer
// @namespace   http://idioticdev.com
// @description Show sniffers range on map.
// @include     http://*improbableisland.com/badnav.php*
// @include     http://*improbableisland.com/inventory.php*
// @include     http://*improbableisland.com/runmodule.php?module=worldmapen*
// @version     2
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// ==/UserScript==

let match = $('.content').text().match(/It displays, weakly, the number ([\d,]*) in dull red LED's before its radio module catches fire/)
if (match) {
  let player = JSON.parse(GM_getValue('player', '{}'))
  GM_setValue('origin', JSON.stringify({
    x: player.x - 3,
    y: player.y - 3
  }))
  GM_setValue('totalCrates', parseInt(match[1]))
  return
}

let found = GM_getValue('foundCrates', 0)
match = $('.content').text().match(/There are ([\d,]*) Supply Crates here/)
if (match) {
  found += parseInt(match[1])
  GM_setValue('foundCrates', found)
}

if ($('.content').text().includes('There is a Supply Crate here.'))
  GM_setValue('foundCrates', ++found)

let attr = $('[style*="images/map/marker_"]').parents('td').attr('alt')
if (!attr) return

let split = attr.indexOf(',')
let player = {
  y: parseInt(attr.substring(1, split)),
  x: parseInt(attr.substring(split + 2, attr.indexOf(')')))
}
GM_setValue('player', JSON.stringify(player))

let origin = JSON.parse(GM_getValue('origin'))
if (!origin) return

$('.navhead').first().before(
  $('<div/>', {
    class: 'navhead',
    text: 'Sniffer'
  }),
  $('<table/>').append(
    $('<tr>').append($('<td/>').text('Total Crates '), $('<td/>').text(GM_getValue('totalCrates'))),
    $('<tr>').append($('<td/>').text('Found Crates '), $('<td/>').text(found))
  ),
  $('<a/>', {
    class: 'nav',
    href: '',
    text: 'Reset',
    click: reset
  }),
  $('<br>').attr('clear', 'all')
)

let visited = `${GM_getValue('visited', '')}/${player.y},${player.x}`
GM_setValue('visited', visited)

let count = 0

for (let y = 0; y < 7; y++)
  for (let x = 0; x < 7; x++) {
    if (visited.includes(`/${y + origin.y},${x + origin.x}`))
      continue
    
    $(`td [alt*="(${y + origin.y}, ${x + origin.x}"]`)
      .css('opacity', '0.7')
      .parent().css('background-color', 'black')
    count++
  }
  
if (count < 1)
  reset()

function reset() {
  GM_deleteValue('visited')
  GM_deleteValue('origin')
  $('td[style*="opacity: 0.7"]').css('opacity', 'initial')
}
