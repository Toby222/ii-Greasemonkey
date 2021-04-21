// ==UserScript==
// @name        ii-puzzle-solver
// @namespace   http://idioticdev.com
// @description Solves for puzzle combat.
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @include     http://*improbableisland.com/*op=search*
// @include     https://*improbableisland.com/*op=search*
// @include     http://*improbableisland.com/*op=fight*
// @include     https://*improbableisland.com/*op=fight*
// @include     http://*improbableisland.com/*module=worldmapen*
// @include     https://*improbableisland.com/*module=worldmapen*
// @include     http://*improbableisland.com/badnav.php*
// @include     https://*improbableisland.com/badnav.php*
// @include     http://*improbableisland.com/runmodule.php?module=onslaught*
// @include     https://*improbableisland.com/runmodule.php?module=onslaught*
// @version     4.2
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_xmlhttpRequest
// ==/UserScript==
/*global $ */

let state = ''
let broken = ''
let zero = ''
const inputs = []
const details = $('<table/>')

const log = () => {} // console.log //

function _x(STR_XPATH) {
    const xresult = document.evaluate(STR_XPATH, document, null, XPathResult.ANY_TYPE, null);
    const xnodes = [];
    let xres;
    while (xres = xresult.iterateNext()) {
        xnodes.push(xres);
    }
    return xnodes;
}

function main () {
  log('ii-puzzle-solver main() start')
  if ($('a.nav > div').length < 1) {
    log('Not puzzle combat')
    log('ii-puzzle-solver setup end')
    return
  }

  $(document).keypress(e => {
    if (e.which > 48 && e.which < 58) {
      GM_setValue('arm', e.which - 48)
    }
  })

  setup()
  findMonster()
  log('ii-puzzle-solver main end')
}

function setup () {
  log('ii-puzzle-solver setup() start')
  const nextSection = $('div.navhead')[0]
  $('<div/>').addClass('navhead').text('Puzzle Solver').insertBefore(nextSection)

  $('a.nav > div').each((i, el) => {
    el = el.parentElement

    let status
    if (el.innerText.split('\n').slice(-2)[0].includes('Guarded')) {
      status = 'guarded'
    } else if (el.innerText.split('\n').slice(-2)[0].includes('Disabled')) {
      status = 'disabled'
    } else if (el.innerText.split('\n').slice(-2)[0].includes('Vulnerable') || el.innerText.split('\n').slice(-2)[0].includes('Exposed')) {
      status = 'vulnerable'
    } else if (el.innerText.split('\n').slice(-2)[0].includes('Hidden')) {
      status = 'hidden'
    } else {
      console.error(el.children)
      console.error('Unknown status: ' + el.innerText.split('\n').slice(-2)[0])
    }

    switch (status) {
      case 'guarded':
        state += '1'
        broken += '0'
        break
      case 'disabled':
        state += '0'
        broken += '1'
        break
      case 'vulnerable':
        state += '0'
        broken += '0'
        break
      case 'hidden':
        state += '?'
        broken += '0'
    }

    zero += '0'
    inputs.push($('<input/>')
      .css({
        margin: '5px 0 0 8px',
        width: $(el).width() + 'px',
        background: 'none',
        border: 'none',
        'border-bottom': '1px solid black'
      }))
  })

  if (parseInt(state) !== 0) {
    for (const input of inputs) {
      input.insertBefore(nextSection)
    }
  }

  // Display information
  const previous = GM_getValue('previous')
  const diffBinary = parseInt(previous, 2) ^ parseInt(state, 2)
  const difference = []
  for (let i = 0; i < state.length; i++) {
    const mask = 1 << i
    if ((diffBinary & mask) === mask) {
      difference.push(state.length - i)
    }
  }

  details.append(
    $('<tr/>').append($('<td/>').text('Current:'), $('<td/>').text(state)),
    $('<tr/>').append($('<td/>').text('Previous:'), $('<td/>').text(previous)),
    $('<tr/>').append($('<td/>').text('Difference:'), $('<td/>').text(difference.reverse().join(','))),
    $('<tr/>').append($('<td/>').text('Arm Attacked:'), $('<td/>').text(GM_getValue('arm')))
  ).insertBefore(nextSection)
  GM_setValue('previous', state)
  log('ii-puzzle-solver setup end')
}

function findMonster () {
  log('ii-puzzle-solver findMonster() start')

  const monsterElements = _x("//td[@colspan='4']")
  monsterElements.shift()

  let monster = monsterElements[0]
    .textContent
    .replace("*", "")
    .replace(/^(Elite|Deadly|Lethal|Savage|Malignant|Dangerous|Malevolent) /, "")

  if (monsterElements.length > 1) {
    monster = `${monster} (x${monsterElements.length})`
  }

  const level = parseInt($('.content span:contains("(Level ")').text().substring(7))

  if (parseInt(state, 2) === 0) {
    retrieveStun(monster, level)
  } else {
    retrieveTargets(monster, level)
  }
  log('ii-puzzle-solver findMonster end')
}

function retrieveTargets (name, level) {
  log(`ii-puzzle-solver retrieveTargets({${name}}, {${level}}) start`)
  querySpreadsheet(name === 'Lion' ? `select C,D,E,F,G,H,I,J,K where A contains "Lion (${level})" and B=${level}` : `select C,D,E,F,G,H,I,J,K where A="${name}"`,
    response => {
      // log(response.responseText.slice(response.responseText.indexOf('(') + 1, response.responseText.length - 2))
      const targets = JSON.parse(response.responseText.slice(response.responseText.indexOf('(') + 1, response.responseText.length - 2)).table.rows[0].c
      inputs.forEach((input, i) => input.val(targets[i] ? targets[i].v : ''))
      parsePuzzle()
    }
  )
  log('ii-puzzle-solver retrieveTargets end')
}

function retrieveStun (name, level) {
  log(`ii-puzzle-solver retrieveStun({${name}}, {${level}})) start`)
  querySpreadsheet(name === 'Lion' ? `select L,M,N,O,P where A contains "Lion (${level})" and B=${level}` : `select L,M,N,O,P where A="${name}"`,
    response => {
      log(response.responseText.slice(response.responseText.indexOf('(') + 1, response.responseText.length - 2))
      const sequence = JSON.parse(response.responseText.slice(response.responseText.indexOf('(') + 1, response.responseText.length - 2)).table.rows[0].c
      $('<tr/>').append(
        $('<td/>').text('Stun Sequence'),
        $('<td/>').text(sequence.map(c => c.v))
      ).appendTo(details)
    })
  log('ii-puzzle-solver retrieveStun end')
}

function querySpreadsheet (query, callback) {
  log(`ii-puzzle-solver querySpreadsheet({${query}}, {${callback.valueOf()}}) start`)
  query = encodeURIComponent(query)
  // log(`URL: https://docs.google.com/spreadsheets/d/19M0BP55bQPHCodKc-KXQzC_zBKwVa5PXHUAKLvwdDaE/gviz/tq?tq=${query}`)
  GM_xmlhttpRequest({
    method: 'GET',
    url: `https://docs.google.com/spreadsheets/d/19M0BP55bQPHCodKc-KXQzC_zBKwVa5PXHUAKLvwdDaE/gviz/tq?tq=${query}`,
    onload: response => {
      callback(response)
    },
    onerror: console.error
  })
  log('ii-puzzle-solver querySpreadsheet end')
}

function parsePuzzle () {
  log('ii-puzzle-solver parsePuzzle() start')
  const toggles = []
  for (const input of inputs) {
    let binary = '0'.repeat(inputs.length)
    for (const a of input.val().split(',')) {
      binary = binary.substring(0, a - 1) + '1' + binary.substr(a)
    }

    toggles.push(parseInt(binary, 2))
  }

  const result = solve(toggles, parseInt(state, 2), parseInt(broken, 2))
  for (const arm of result) {
    inputs[arm - 1].css('background-color', 'green')
  }
  log('ii-puzzle-solver parsePuzzle end')
}

/*
```
you have some number X
as well as two lists of numbers
the first list L1 contains numbers you can XOR with X
the second list L2 contains the indices of X's binary representation that will always be 0

XOR X with any set of the numbers, in any order, as often as you want, so that X becomes 0
```
*/

// array: list of toggles of each limb
// test: current monster state
// filter: broken limbs

function solve (array, test, filter) {
  // [225,77,161,180,90,46,110,37],
  // 45,
  // 0

  log(`ii-puzzle-solver solve([${array}], 0b${test.toString(2)}, 0b${filter.toString(2)}) start`)

  const result = []

  function loop (start, depth, prefix) {
    for (var i = start; i < array.length; i++) {
      var next = prefix ^ array[i]
      if (depth > 0) {
        if (loop(i + 1, depth - 1, next)) {
          result.push(i + 1)
          return true
        }
      } else {
        var combo = test ^ next
        if (combo === 0 || (combo & filter) === combo) {
          result.push(i + 1)
          return true
        }
      }
    }

    return false
  }

  for (var i = 0; i < array.length; i++) {
    if (loop(0, i, 0)) {
      break
    }
  }
  log(`ii-puzzle-solver solve end [result: {${result}}]`)
  return result
}

main()
