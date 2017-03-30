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
  constructor (type) {
    let buttons = $('<div>').append(
      $('<a>', {
        text: 'Clear',
        href: '',
        click: e => {
          e.preventDefault()
          this.items.forEach(item => item.clear())
        }
      }))
    if (type == 'sell')
      buttons.append(' | ',
      $('<a>', {
        text: 'All',
        href: '',
        click: e => {
          e.preventDefault()
          this.items.forEach(item => item.queue(item.quantity))
        }
      }))
    this.view = $('<div>').addClass('inventory').append(buttons)
    
    this.items = []
    $(type == 'sell' ? '.navhead:contains("Sell Items")' : '.navhead:contains("Buy Items")')
      .nextUntil('.navhead', 'a.nav').each((i, e) => {
        let item = null
        if (type == 'sell') {
          let match = $(e).text().match(/(.+?) \(([\d,]+) available\)/)
          item = new Item(match[1], parseInt(match[2].replace(/,/g, '')))
        } else {
          let match = $(e).text().match(/(.+?) \(([\d,]+) Req\)/)
          item = new PermItem(match[1], parseInt(match[2].replace(/,/g, '')))
        }
        this.view.append(item.view)
        this.items.push(item)
      })
  }
  
  getItems () {
    let items = []
    this.items.forEach(item => {
      for (let i = 0; i < item.queued; i++)
        items.push(item.name)
    })
    
    return items
  }

  render () {
    this.items.forEach(item => item.render())
  }
}

class PermItem {
  constructor (name, cost) {
    this.name = name
    this.cost = cost
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
    this.queued = Math.max(this.queued + (amount || 1), 0)

    this.render()
    this.listener()
  }
  
  clear () {
    this.queued = 0
    
    this.render()
    this.listener()
  }

  render() {
    this.view.attr('data-cost', this.cost)
    if (this.queued > 0)
      this.view.attr('data-queued', this.queued)
    else
      this.view.removeAttr('data-queued')
  }
}

class Item {
  constructor (name, quantity) {
    this.name = name
    this.quantity = quantity
    this.queued = 0

    this.selectAllView = $('<div>').click(e => {
      e.stopPropagation()
      
      if (this.queued == this.quantity)
        this.clear()
      else
        this.queue(this.quantity)
    })
    this.view = $('<div>').addClass('trdark item')
      .append(this.selectAllView)
      .css('background-image', `url('${icons[this.name]}'`)
      .click(() => this.queue())
      .contextmenu(e => {
        e.preventDefault()
        this.queue(-1)
      })
  }

  queue (amount) {
    this.queued = Math.max(Math.min(this.queued + (amount || 1), this.quantity), 0)

    this.render()
    this.listener()
  }
  
  clear () {
    this.queued = 0
    
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
  constructor (inventory, store) {
    this.items = {
      sell: [],
      buy: []
    }
    
    inventory.items.forEach(item =>
      item.listener = () => {
        this.items.sell = inventory.getItems()
        this.render()
      })
    store.items.forEach(item =>
      item.listener = () => {
        this.items.buy = store.getItems()
        this.render()
      })

    this.progressView = $('<div>').append($('<div>'), $('<span>'))
    this.buttonView = $('<input>', {
      type: 'button',
      value: 'Select items to buy and sell.'
    }).click(() => {
      this.showProgress()
      this.do()
    })
    this.view = $('<div>').append(this.buttonView).addClass('cashier')
  }

  do (context) {
    let url = ''
    if (this.items.sell.length > 0) {
      let item = this.items.sell.splice(0, 1)[0]
      url = $(`a:contains("${item}")[href*="op=sell"]`,
        context || $('td.navigation')).attr('href')
    } else if (this.items.buy.length > 0) {
      let item = this.items.buy.splice(0, 1)[0]
      url = $(`a:contains("${item}")[href*="op=buy"]`,
        context || $('td.navigation')).attr('href')
    } else
      return

    this.render()

    if (this.items.sell.length + this.items.buy.length < 1) {
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

  showProgress () {
    this.view.empty().append(this.progressView)
    this.initalCount = this.items.sell.length + this.items.buy.length
    this.render()
  }

  render () {
    this.buttonView.val(`Sell ${this.items.sell.length} / buy ${this.items.buy.length}.`)
    if (this.initalCount) {
      let number = this.initalCount - this.items.sell.length + this.items.buy.length
      $('span', this.progressView).text(`${number} of ${this.initalCount}`)
      $('div', this.progressView).css('width', `${number / this.initalCount * 100}%`)
    }
  }
}

const icons = {}
$('img[src*="images/items"]').each((i, e) => {
  let name = $(e).parent().next().children().eq(0).text()
  icons[name] = $(e).attr('src')
})

const inventory = new Inventory('sell')
const store = new Inventory('buy')
const cachier = new Cashier(inventory, store)

$('<div>').addClass('assistant')
  .append(inventory.view, store.view, cachier.view)
  .insertBefore($('.content h2').eq(0))
inventory.render()
store.render()

$('<style>').text(`
  .assistant {
    border: 1px dotted black;
    position: relative;
  }
  
  .assistant::after {
    content: '';
    position: absolute;
    top: 20px;
    right: 50%;
    bottom: 50px;
    border-right: 1px dotted black;
  }

  .assistant .inventory {
    width: calc(50% - 20px);
    display: inline-block;
    vertical-align: top;
    margin: 10px;
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
    transition: 0.1s;
  }

  .assistant .item:hover {
    transform: scale(1.1);
  }
  
  .assistant .item:hover div {
    position: absolute;
    top: 2px;
    right: 5px;
    width: 10px;
    height: 10px;
    background-color: white;
    border-radius: 5px;
    z-index: 3;
  }
  
  .assistant .item::before {
    content: attr(data-quantity);
    position: absolute;
    top: 2px;
    left: 5px;
    font-weight: bold;
    color: white;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    z-index: 1;
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
    z-index: 2;
  }

  .assistant .cashier div {
    position: relative;
    border-color: black;
    border-style: solid;
    border-width: 1px 0;
    text-align: center;
    color: white;
    padding: 5px 0;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  }

  .assistant .cashier span {
    z-index: 2;
    position: relative;
  }
  
  .assistant .cashier div div {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 0;
    background-color: black;
    z-index: 1;
  }
`).appendTo('head')
