// ==UserScript==
// @name        ii-advanced-game-map
// @namespace   http://idioticdev.com
// @include     http://*improbableisland.com/*
// @version     3
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @grant       GM_setValue
// @grant       GM_getValue
// ==/UserScript==
let map = null
let fulltext = {}
if (window.location.href.includes('op=viewmap')) {
  map = $('td[style*="images/map"]').closest('table').eq(0)
  GM_setValue('map', map[0].outerHTML)
  
  let strip = $('<span>')
  $('tr', map).each((y, tr) => {
    $('td', tr).each((x, td) =>
      $('a', td).each((i, a) => {
        $(this).attr('title')
        let text = $(a).attr('onclick')
        text = text.substring(text.indexOf(','), text.lastIndexOf("'"))
        text = text.replace(/\\'/g, '')
        text = strip.html(text).text()
        text = ($(a).attr('title') + text).toLowerCase()
        fulltext[`${x},${y},${i}`] = text
      }))
  })
  GM_setValue('fulltext', JSON.stringify(fulltext))
} else {
  fulltext = JSON.parse(GM_getValue('fulltext', '{}'))
  $('<script>').attr('src', '/js/places_map.js').appendTo('head')
  
  map = $(GM_getValue('map')).css('margin', '50px auto')
  let container = $('<div>').append(map)
    .css({
      height: 0,
      transition: 'height 1s',
      overflow: 'hidden'
    })
    .insertBefore($('.content h2').eq(0))
  $('a:contains("MoTD")').before($('<a>', {
    text: 'Map',
    href: '',
    click: e => {
      e.preventDefault()
      container.css('height', container.height() == 0 ? '1100px' : 0)
    }
  }), ' | ')
}

function includesAny(text, words) {
  
}

function filter (text) {
  let words = text.split(/\s+/)
  let selected = {}
  for (let id in fulltext)
    if (words.every(word => fulltext[id].includes(word)))
      selected[id] = fulltext[id]
  
  $('tr', map).each((y, tr) =>
    $('td', tr).each((x, td) =>
      $('a', td).each((i, a) => {
        if (selected[`${x},${y - 1},${i}`])
          $(a).show()
        else
          $(a).hide()
      })))
}

let timer = null
map.prepend(
  $('<tr/>').append(
    $('<td/>'),
    $('<td/>', { colspan: 25 }).append(
      $('<input>')
        .keyup(function (e) {
          window.clearTimeout(timer)
          timer = window.setTimeout(() => filter($(this).val()), 100)
        })
        .css('width', '100%')
        .attr('placeholder', 'Full text search...')
      )))
