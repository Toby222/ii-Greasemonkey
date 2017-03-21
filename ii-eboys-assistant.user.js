// ==UserScript==
// @name        ii-eboys-assistant
// @namespace   http://idioticdev.com
// @description Adds a 'Sell all' link whenever you sell an item.
// @include     http://*improbableisland.com/runmodule.php?module=eboy*
// @include     http://*improbableisland.com/badnav.php*
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @version     1
// @grant       GM_setValue
// @grant       GM_getValue
// @run-at      document-start
// ==/UserScript==
window.addEventListener('DOMContentLoaded', () => {
  if ($('a:contains("Sell another ")').length == 0) GM_setValue('running', false)
}, false)
waitForKeyElements ('a:contains("Sell another ")', node => {
  let link = $(node)

  if (GM_getValue('running', false)) {
    window.location = link.attr('href')
  } else
    link.after(
      ' | ',
      $('<a>', {
        href: '',
        text: 'Sell all',
        click: e => {
          e.preventDefault()
          GM_setValue('running', true)
          window.location = link.attr('href')
        }
      })
    )
})
