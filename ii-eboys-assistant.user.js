// ==UserScript==
// @name        ii-eboys-assistant
// @namespace   http://idioticdev.com
// @description Enables batch buying and selling for eBoy's Trading Station.
// @include     http://*improbableisland.com/runmodule.php?module=eboy*
// @include     http://*improbableisland.com/badnav.php*
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @version     2
// @grant       GM_setValue
// @grant       GM_getValue
// @run-at      document-start
// ==/UserScript==
let item = GM_getValue('item', 'invalid')
let amount = GM_getValue('amount', 0)

window.addEventListener('DOMContentLoaded', () => {
  $('span:contains("Buying at: ")').each((i, e) => {
    let node = $(e).closest('td').next()

    let amountInput = $('<input>').css({
      background: 'none',
      width: '20px',
      border: 'none',
      'border-bottom': '1px solid black',
      'margin-right': '10px',
      'text-align': 'center'
    })

    let buy = $('a:contains("Buy for ")', node)
    let sell = $('a:contains("Sell for ")', node)
    
    if (buy.length > 0 || sell.length > 0)
      node.append(
        $('<br>'),
        'How many? ',
        amountInput
      )
    
    if (buy.length > 0)
      $('<a/>', {
        text: 'Buy',
        href: buy.attr('href'),
        click: e => {
          let href =  buy.attr('href')
          GM_setValue('item', href.substring(0, href.lastIndexOf('&')))
          GM_setValue('amount', parseInt(amountInput.val()) - 1)
        }
      }).appendTo(node)

    if (buy.length > 0 && sell.length > 0)
      node.append(' | ')
    
    if (sell.length > 0)
      node.append(
        $('<a/>', {
          text: 'Sell',
          href: sell.attr('href'),
          click: e => {
            let href =  sell.attr('href')
            GM_setValue('item', href.substring(0, href.lastIndexOf('&')))
            GM_setValue('amount', parseInt(amountInput.val()) - 1)
          }
        }),
        ' | ',
        $('<a/>', {
          text: 'Sell All',
          href: sell.attr('href'),
          click: e => {
            let href =  sell.attr('href')
            GM_setValue('item', href.substring(0, href.lastIndexOf('&')))
            GM_setValue('amount', -1)
          }
        })
      )
  })

  let another = $('a:contains("Sell another ")')
  another.after(
    ' | ',
    $('<a>', {
      href: another.attr('href'),
      text: 'Sell all',
      click: e => {
        let href =  another.attr('href')
        GM_setValue('item', href.substring(0, href.lastIndexOf('&')))
        GM_setValue('amount', -1)
      }
    })
  )

  if ($(`a[href*="${item}"]`).length == 0) GM_setValue('amount', 0)
}, false)

if (amount > 0 || amount == -1)
  waitForKeyElements(`a[href*="${item}"]`, node => {
    if (amount > 0) GM_setValue('amount', amount - 1)
    window.location = node.attr('href')
  })
