// ==UserScript==
// @name        ii-puzzle-solver
// @namespace   http://idioticdev.com
// @description Solves for puzzle combat.
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js
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
// @version     3.1
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// @grant       GM_xmlhttpRequest
// ==/UserScript==

/*
 * 1 = orange
 * 0 = green
 */

(function () {
  let state = ''
  let broken = ''
  let zero = ''
  let inputs = []
  let details = $('<table/>')

  if ($('a.nav > div > div').length < 1
    || $('div[style*="puzzlecombat_red"]').length > 0)
    return

  $(document).keypress (e => {
    if (e.which > 48 && e.which < 58)
      GM_setValue ('arm', e.which-48)
  })

  setup()
  findMonster()

  function setup () {
    let nextSection = $('div.navhead:contains("Indiscriminate Flailing")')
    $('<div/>').addClass('navhead').text('Puzzle Solver').insertBefore(nextSection)

    $('a.nav > div > div').each((i, el) => {
      let bg = $(el).css ("background-image")
      state += bg.indexOf ('orange') !== -1 ? '1' : '0'
      broken += bg.indexOf ('disabled') !== -1 ? '1' : '0'
      zero += '0'

      inputs.push($('<input/>')
        .css({
          margin: '5px 0 0 8px',
          width: $(el).width() + 'px',
          background: 'none',
          border: 'none',
          'border-bottom': '1px solid black'
        })
        .insertBefore(nextSection))
    })

    $('<a>').text('Solve Puzzle')
      .attr('href', '')
      .addClass('nav')
      .css('padding', '8px')
      .click(e => {
        e.preventDefault()
        parsePuzzle()
      })
      .insertBefore(nextSection)

    // Display information
    let previous = GM_getValue ('previous')
    let diffBinary = parseInt(previous, 2) ^ parseInt(state, 2)
    let differance = [];
    for (let i = 0; i < state.length; i++) {
      let mask = 1 << i;
      if ((diffBinary & mask) == mask)
        differance.push(state.length - i)
    }

    details.append(
      $('<tr/>').append($('<td/>').text('Current'), $('<td/>').text(state)),
      $('<tr/>').append($('<td/>').text('Previous'), $('<td/>').text(previous)),
      $('<tr/>').append($('<td/>').text('Differance'), $('<td/>').text(differance.reverse().join(','))),
      $('<tr/>').append($('<td/>').text('Arm Attacked'), $('<td/>').text(GM_getValue('arm')))
    ).insertBefore(nextSection)
    GM_setValue('previous', state)
  }

  function findMonster () {
    let monster = $('#combatbars table:last td:last').text()
    if (monster.indexOf ('Elite') == 0) monster = monster.slice (6)
    else if (monster.indexOf ('Deadly') == 0) monster = monster.slice (7)
    else if (monster.indexOf ('Lethal') == 0) monster = monster.slice (7)
    else if (monster.indexOf ('Savage') == 0) monster = monster.slice (7)
    else if (monster.indexOf ('Malignant') == 0) monster = monster.slice (10)
    else if (monster.indexOf ('Dangerous') == 0) monster = monster.slice (10)
    else if (monster.indexOf ('Malevolent') == 0) monster = monster.slice (11)

    let count = $(`#combatbars table b:contains("${monster}")`).length
    if (count > 1)
      monster = `${monster} (x${count})`

    let level = parseInt($('.content span:contains("(Level ")').text().substring(7))

    if (parseInt(state, 2) === 0)
      retrieveStun (monster, level)
    else
      retrieveTargets (monster, level)
  }

  function retrieveTargets (name, level) {
    querySpreadsheet(name === 'Lion' ?
      `select C,D,E,F,G,H,I,J,K where A contains "Lion (${level})" and B=${level}` :
      `select C,D,E,F,G,H,I,J,K where A="${name}"`, targets => {
        inputs.forEach((input, i) => input.val(targets[i] ? targets[i].v : ''))
        parsePuzzle()
      })
  }

  function retrieveStun (name, level) {
    querySpreadsheet(name === 'Lion' ?
      `select L,M,N,O,P where A contains "Lion (${level})" and B=${level}` :
      `select L,M,N,O,P where A="${name}"`, sequence => {
        $('<tr/>').append(
          $('<td/>').text('Stun Sequence'),
          $('<td/>').text(sequence.map(c => c.v))
        ).appendTo(details)
      })
  }

  function querySpreadsheet (query, callback) {
    GM_xmlhttpRequest ({
      method: "GET",
      url: `https://spreadsheets.google.com/tq?tq=${query}&key=0AtPkUdingtHEdFUzLWN0a3dkNDlyT09HNjVsNjg2ZXc`,
      onload: response => {
        callback(JSON.parse (
          response.responseText.slice (
            response.responseText.indexOf('(') + 1,
            response.responseText.length-2)).table.rows[0].c)
      }
    })
  }

  function parsePuzzle () {
    let toggles = [];
    for (let i = 0; i < state.length; i++) {
      let toggle = inputs[i].val().split (',')
      let binary = zero
      for (let a of toggle) {
        let index = parseInt(a) - 1
        binary = binary.substring(0, index) + '1' + binary.substr(index + 1)
      }

      toggles.push (parseInt (binary, 2))
    }

    let result = solve(toggles, parseInt(state, 2), parseInt(broken, 2))
    for (let arm of result)
      inputs[arm - 1].css('background-color', 'green')
  }

  function solve (array, test, filter) {
    var result = [];

    function loop (start,depth,prefix) {
      for (var i=start; i<array.length; i++) {
        var next = prefix^array[i];
        if (depth > 0) {
          if (loop (i+1,depth-1,next)) {
            result.push (i+1);
            return true;
          }
        } else {
          var combo = test^next;
          if (combo == 0 || (combo&filter) == combo) {
            result.push (i+1);
            return true;
          }
        }
      }

      return false;
    }

    for (var i=0; i<array.length; i++)
      if (loop (0,i,0))
        break;

    return result;
  }
})()
