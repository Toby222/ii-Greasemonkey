// ==UserScript==
// @name        ii-duct-tape
// @namespace   http://idioticdev.com
// @description Makes the hotkeys more consistent, so that e.g. Bank of Improbable is always "b". 
// @include     http://*improbableisland.com/*
// @exclude     http://*improbableisland.com/home.php*
// @version     2
// @grant       none
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @run-at      document-start
// ==/UserScript==
let keys = {
  // universal_links
  "Return to the Outpost"      : "o",
  "View your Inventory"        : "i",
  "Return to the Jungle"       : "j",

  // outpost_links
  "eBoy's Trading Station"     : "e",
  "Sheila's Shack O' Shiny"    : "s",
  "Bank of Improbable"         : "b",
  "Quit to the fields"         : "Q",
  "New Day Menu"               : "*",
  "The Hunter's Lodge"         : "l",
  "Location Four"              : "4",
  "Frequently Asked Questions" : "?",
  "Council Offices"            : "c",
  "Hall o' Fame"               : "f",
  "Common Ground"              : "g",
  "Clan Halls"                 : "h",
  "Jungle"                     : "j",
  "Daily News"                 : "n",
  "Preferences"                : "p",
  "Travel"                     : "t",
  "List Contestants"           : "w",
  "ScrapYard"                  : "#",
  "Joe's Dojo"                 : "d",
  "Rally Headquarters"         : "r",
  "Reinforce the Defences"     : "r",

  // travel_links
  "North"                      : "t",
  "East"                       : "h",
  "South"                      : "b",
  "West"                       : "f",
  "North-East"                 : "y",
  "North-West"                 : "r",
  "South-East"                 : "n",
  "South-West"                 : "v",
  "Enter the Jungle"           : "j",
  "World Map"                  : "m",

  // OST
  "Go to AceHigh"              : "a",
  "Go to Cyber City 404"       : "c",
  "Go to Improbable Central"   : "i",
  "Go to NewHome"              : "h",
  
  // Looking for trouble
  "Hospital Tent"              : "h",
  "Look for an Easy Fight"     : "1",
  "Look for Trouble"           : "2",
  "Look for Big Trouble"       : "3",
  "Look for Really Big Trouble" : "4"
}

waitForKeyElements ("script", node => {
  unsafeWindow.document.onkeypress = function(e)
  {
    if ( e.altKey || e.ctrlKey || e.metaKey)
      return
    
    if ($('input:focus').length > 0) return
    
    let key = String.fromCharCode (e.charCode)
    $(`[accesskey='${key}']`)[0].click()
  }
})

let processed = []
waitForKeyElements ("a.nav", node => {
  if (processed.includes(node[0])) return
  processed.push(node[0])
  
  let title = $(node).text()
  if (title.charAt (0) == "(")
    title = title.substring(4)
  
  let link = title.replace(new RegExp(" ?\\(.*?\\) ?", 'g'), "")

  if (!keys[link]) {
    let key = node.attr ("accesskey")
    if (!key) return

    assign(node, title, key.toLowerCase())
  } else {
    assign(node, title, keys[link])
  }
})

let links = {}
function assign (node, title, key) {
  node.removeAttr('accesskey')
  
  if (!title) {
    title = node.text()
    if (title.charAt (0) == "(")
      title = title.substring(4)
  }
  
  if (!key)
    for (let i = 0; i < title.length; i++) {
      let tryk = title.charAt(i).toLowerCase()
      if (links[tryk] || tryk == ' ' || tryk == "'") continue
        
      key = tryk
      break
    }
    
  if (!key) return

  let dup = links[key]
  links[key] = node
  if (dup) assign(dup)

  let i = title.toLowerCase().indexOf(key)
  
  $(node)
    .html (i > -1
      ? `${title.substring(0, i)}<span class="navhi">${title.charAt(i)}</span>${title.substring(i + 1)}`
      : `(<span class="navhi">${key}</span>) ${title}`)
    .attr ("accesskey", key)
}
