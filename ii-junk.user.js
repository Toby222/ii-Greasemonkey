// ==UserScript==
// @name        ii-junk
// @description Lists item price, price per kg, and total bag value in inventory.
// @namespace   http://idioticdev.com
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js
// @include     http://*improbableisland.com/inventory.php*
// @include     http://*improbableisland.com/badnav.php
// @include     http://*improbableisland.com/runmodule.php?module=eboy*
// @version     1
// @grant       GM_setValue
// @grant       GM_getValue
// ==/UserScript==
let prices = JSON.parse(GM_getValue('prices', '{}'))

if (window.location.href.includes('inventory')) {
  let backpack = processBag($('b:contains("Backpack")').closest('table').next())
  $('b:contains("Backpack")').after(` &mdash; ${backpack} req`)
  let bandolier = processBag($('b:contains("Bandolier")').closest('table').next())
  $('b:contains("Bandolier")').after(` &mdash; ${bandolier} req`)
} else {
  $('span:contains("Buying at")').each((i, e) => {
    let name = $(e).closest('table').parent().children().eq(0).text()
    let price = $(e).text()
    price = parseInt(price.substring(price.indexOf(':') + 2))
    prices[name] = price
  })
  GM_setValue('prices', JSON.stringify(prices))
}

function processBag (bag) {
  let total = 0
  for (let item in prices) {
    let name = $(`b:contains("${item}")`, bag)
    if (name.length < 1) continue
    
    let value = prices[item]
    
    let text = $(name).parent().text()
    let weight = parseFloat(text.substring(text.indexOf('Weight: ') + 8, text.indexOf(' kg')))
    let rqk = value / weight
    
    if (text.includes('Quantity'))
      value *= parseInt(name.next().next('b').text())

    name.next().after(`Value: <b>${value}</b> req, ${Math.round(rqk * 100) / 100} per kg | `)
      
    total += value
  }
  
  return total
}
