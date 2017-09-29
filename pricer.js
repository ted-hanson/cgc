(($) => {
  let currencies = [ "CRYPTO",
    "GBP", "AUD", "USD", "BRL", "CAD", "CHF", "CLP", "CNY",
    "CZK", "DKK", "EUR", "HKD", "HUF", "IDR", "ILS", "INR",
    "JPY", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PKR",
    "PLN", "RUB", "SEK", "SGD", "THB", "TRY", "TWD", "ZAR"
  ];

  // Load currency from cookie
  let savedCurrency = parseInt($.cookie('currencyType')) || 0;
  let currencyType = currencies[savedCurrency];

  // crypto => currency hash state to be updated from API
  let cryptoToCurrency = {};
  function loadCurrencies(type = currencyType) {
    if (currencies.indexOf(currencyType) < 0) {
      return Promise.resolve();
    }

    return fetch(`https://api.coinmarketcap.com/v1/ticker/?convert=${type}`)
      .then((resp) => resp.json())
      .then((cryptos) => {
        cryptos.forEach((crypto) => {
          if (!cryptoToCurrency[crypto.symbol]) cryptoToCurrency[crypto.symbol] = {};

          cryptoToCurrency[crypto.symbol][type] = crypto[`price_${type.toLowerCase()}`];
        });
      })
      .catch((e) => console.warn(e));
  }

  function updateRow(targetRow) {
    if (targetRow.hasClass('converted')) return;
    targetRow.addClass('converted');

    let crypto = targetRow.children().eq(3).text().trim();
    if (!cryptoToCurrency[crypto]) return;

    let currencyVal = cryptoToCurrency[crypto][currencyType];
    if (!currencyVal) {
      setTimeout(() => updateRow(targetRow), 1000 + 9000 * Math.random());
      return;
    }

    let bet = targetRow.find('.text-right');
    let amt = parseFloat(bet.text()) * currencyVal;
    bet.text(`${amt.toFixed(2)} ${currencyType}`);
  }

  function updateTables() {
    $('.table-striped').find('tr:not([id$=_head]):not(.converted)').each((i, e) => {
      let targetRow = $(e);
      updateRow(targetRow);
    });

    $('.table-striped').unbind('DOMNodeInserted').bind('DOMNodeInserted', (event) => {
      let targetRow = $(event.target);
      updateRow(targetRow);
    });
  }
  loadCurrencies().then(updateTables);

  function currencySelector() {
    let select = $("<select style='font-size: 30px; position: fixed; right: 0; bottom: 0; color: black; z-index: 999999'>");
    currencies.forEach((cur, i) => {
      let newOption = $('<option>').val(i).html(cur);
      select.append(newOption);
    });
    select.val(currencies.indexOf(currencyType));
    select.on('change', () => {
      let newCurrency = currencies[select.val()];
      loadCurrencies(newCurrency)
        .then(() => {
          $.cookie('currencyType', currencies.indexOf(newCurrency));
          currencyType = newCurrency;
        })
        .catch((e) => console.log(e))
    });
    $('body').prepend(select);
  }
  currencySelector();

  // Warning if trying to send message
  window.sendMessage = (msg) => {
    if (msg.trim().split(' ').length < 2) {
      if (!confirm("Are you sure you want to submit '${msg}'?")) return;
    }
    window.sendMessage(msg);
  };
})(window.jQuery);
