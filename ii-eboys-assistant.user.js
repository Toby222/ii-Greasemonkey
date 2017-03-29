// ==UserScript==
// @name        ii-eboys-assistant
// @namespace   http://idioticdev.com
// @description Complex batch buy and selling for eBoy's Trading Station.
// @include     http://*improbableisland.com/runmodule.php?module=eboy*
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @version     3
// @grant       none
// ==/UserScript==
class Inventory {
  constructor () {
    this.view = $('<div>').addClass('inventory')

    this.items = []
    $('.navhead:contains("Sell Items")').nextUntil('.navhead', 'a.nav').each((i, e) => {
      let match = $(e).text().match(/(.+?) \(([\d,]+) available\)/)
      let item = new Item(match[1], parseInt(match[2].replace(/,/g, '')))
      this.view.append(item.view)
      item.listener = this.itemChanged.bind(this)
      this.items.push(item)
    })

    this.cachier = new Cashier()
    this.view.append(this.cachier.view)
  }

  render () {
    this.items.forEach(item => item.render())
    this.cachier.render()
  }

  itemChanged () {
    let items = []
    this.items.forEach(item => {
      for (let i = 0; i < item.queued; i++)
        items.push(item.name)
    })
    this.cachier.setItems(items)
  }
}

class Item {
  constructor (name, quantity) {
    this.name = name
    this.quantity = quantity
    this.queued = 0

    this.view = $('<div>').addClass('trdark item')
      .css('background-image', `url('${icons[this.name]}'`)
      .click(() => this.queue())
      .contextmenu(e => {
        e.preventDefault()
        this.queue(-1)
      })
  }

  queue (amount) {
    this.queued = Math.min(this.queued + (amount || 1), this.quantity)

    this.render()
    this.listener()
  }

  render() {
    this.view.attr('data-quantity', this.quantity - this.queued)
    if (this.queued > 0)
      this.view.attr('data-queued', this.queued)
    else
      this.view.removeAttr('data-queued')
  }
}

class Cashier {
  constructor () {
    this.items = []

    this.progressView = $('<div>').append($('<div>'), $('<span>'))
    this.buttonView = $('<input>', {
      type: 'button',
      value: 'Sell items.'
    }).click(() => {
      this.showProgress()
      this.do()
    })
    this.view = $('<div>').append(this.buttonView).addClass('cashier')
  }

  do (context) {
    if (this.items.length < 1) return

    let item = this.items.splice(0, 1)[0]
    this.render()
    let url = $(`a:contains("${item}")[href*="op=sell"]`,
      context || $('td.navigation')).attr('href')

    if (this.items.length == 1) {
      window.location = url
      return
    }

    $.ajax({
      url,
      success: html => {
        let begin = html.indexOf('<td class="navigation">')
        let end = html.indexOf('</td>', begin)
        this.do($(html.substring(begin, end)))
      }
    })
  }

  setItems (items) {
    this.items = items
    this.render()
  }

  showProgress () {
    this.view.empty().append(this.progressView)
    this.initalCount = this.items.length
    this.render()
  }

  render () {
    this.buttonView.val(`Sell ${this.items.length} items.`)
    if (this.initalCount) {
      let number = this.initalCount - this.items.length
      $('span', this.progressView).text(`Selling ${number} of ${this.initalCount}`)
      $('div', this.progressView).css('width', `${number / this.initalCount * 100}%`)
    }
  }
}

const icons = {}
$('img[src*="images/items"]').each((i, e) => {
  let name = $(e).parent().next().children().eq(0).text()
  icons[name] = $(e).attr('src')
})

const inventory = new Inventory()
$('<div>').addClass('assistant')
  .append(inventory.view)
  .insertBefore($('.content h2').eq(0))
inventory.render()

$('<style>').text(`
  .assistant {
    border: 1px dotted black;
  }

  .assistant .inventory {
    width: 50%;
    padding: 10px;
  }

  .assistant .item {
    position: relative;
    display: inline-block;
    margin: 5px;
    cursor: pointer;
    width: 60px;
    height: 60px;
    overflow: hidden;
    background-repeat: no-repeat;
    background-position: center;
  }

  .assistant .item::before {
    content: attr(data-quantity);
    position: absolute;
    top: 2px;
    left: 5px;
    font-weight: bold;
    color: white;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  }

  .assistant .item:hover::before {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .assistant .item[data-queued]::after {
    content: attr(data-queued);
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    text-align: center;
    font-weight: bold;
    font-size: 2em;
    color: white;
    line-height: 60px;
    background-color: rgba(0, 0, 0, 0.3);
  }

  .assistant .cashier div {
    position: relative;
    border: 1px solid black;
    text-align: center;
    color: white;
  }

  .assistant .cashier div div {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    background-color: black;
  }
`).appendTo('head')
