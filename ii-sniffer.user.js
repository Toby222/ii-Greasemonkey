// ==UserScript==
// @name        ii-sniffer
// @namespace   http://idioticdev.com
// @description Show sniffers range on map.
// @include     http://*improbableisland.com/inventory.php*
// @include     https://*improbableisland.com/inventory.php*
// @include     http://*improbableisland.com/runmodule.php?module=worldmapen*
// @include     https://*improbableisland.com/runmodule.php?module=worldmapen*
// @version     3
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// ==/UserScript==
(function () {
  let text = $('.content').text()
  let match = text.match(/It displays, weakly, the number ([\d,]*) in dull red LED's before its radio module catches fire/)
  if (match) {
    reset()
    GM_setValue('begin', true)
    GM_setValue('totalCrates', parseInt(match[1]))
    return
  }

  let alt = $('[style*="images/map/marker_"]')
  if (alt.length < 1) return
  alt = alt.parents('td').attr('alt').match(/\((\d+), (\d+)\)/)

  let player = {
    x: alt[1],
    y: alt[2]
  }

  let cells = JSON.parse(GM_getValue('cells', '[]'))
  if (GM_getValue('begin')) {
    GM_deleteValue('begin')

    for (let y = 0; y < 7; y++)
      for (let x = 0; x < 7; x++)
        cells.push({
          x: player.x - 3 + x,
          y: player.y - 3 + y
        })
        
    GM_setValue('cells', JSON.stringify(cells))
  }

  if (cells.length < 1) {
    reset()
    return
  }

  let cratesFound = GM_getValue('cratesFound', 0)
  match = text.match(/There are ([\d,]*) Supply Crates here/)
  if (match) {
    let href = $('a:contains("Pick up all Supply Crates")').attr('href')
    if (href) {
      GM_setValue('cratesFound', cratesFound + parseInt(match[1]))
      window.location = href
      return
    }
  }

  if (text.includes('There is a Supply Crate here.')) {
    let href = $('a:contains("Pick up Supply Crate")').attr('href')
    if (href) {
      GM_setValue('cratesFound', ++cratesFound)
      window.location = href
      return
    }
  }

  cells.forEach((cell, i) => {
    if (player.x == cell.x && player.y == cell.y) {
      let cut = cells.slice(0)
      cut.splice(i, 1)
      GM_setValue('cells', JSON.stringify(cut))
      return
    }
    
    $(`td [alt*="(${cell.x}, ${cell.y}"]`)
      .css('opacity', '0.7')
      .parent().css('background-color', 'black')
  })

  $('.navhead').first().before(
    $('<div/>', {
      class: 'navhead',
      text: 'Sniffer'
    }),
    'You have found ',
    $('<b>').text(cratesFound),
    ' out of ',
    $('<b>').text(GM_getValue('totalCrates', 0)),
    ' supply crates.',
    $('<a/>', {
      class: 'nav',
      href: '',
      text: 'Reset',
      click: e => {
        e.preventDefault()
        reset()
      }
    }),
    $('<br>').attr('clear', 'all')
  )

  function reset() {
    GM_deleteValue('cratesFound')
    GM_deleteValue('totalCrates')
    GM_deleteValue('cells')
    $('td[style*="opacity: 0.7"]').css('opacity', 'initial')
  }
})()
