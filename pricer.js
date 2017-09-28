(($) => {
  let currencies = [
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
  function loadCurrencies() {
    return fetch(`https://api.coinmarketcap.com/v1/ticker/?convert=${currencyType}`)
      .then((resp) => resp.json())
      .then((cryptos) => {
        cryptos.forEach((crypto) => {
          cryptoToCurrency[crypto.symbol] = crypto[`price_${currencyType.toLowerCase()}`];
        });
      })
      .catch((e) => console.warn(e));
  }
  // reload currencies every 10 seconds
  setInterval(loadCurrencies, 10000);

  function updateRow(targetRow) {
    if (targetRow.hasClass('converted')) return;
    targetRow.addClass('converted');

    let crypto = targetRow.children().eq(3).text().trim();
    let currencyVal = cryptoToCurrency[crypto];
    if (!currencyVal) return;

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
    let select = $("<select style='position: fixed; right: 0; bottom: 0; color: black; z-index: 999999'>");
    currencies.forEach((cur, i) => {
      let newOption = $('<option>').val(i).html(cur);
      select.append(newOption);
    });
    select.val(currencies.indexOf(currencyType));
    select.on('change', () => {
      let newCurrency = currencies[select.val()];
      loadCurrencies(newCurrency).then(() => {
        $.cookie('currencyType', currencies.indexOf(newCurrency));
        currencyType = newCurrency;
      });
    });
    $('body').prepend(select);
  }
  currencySelector();
})(window.jQuery);
