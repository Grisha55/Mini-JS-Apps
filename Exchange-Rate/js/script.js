const $dropLists = document.querySelectorAll('select');
const $fromCurrency = document.querySelector('#from select');
const $toCurrency = document.querySelector('#to select');
const $getButton = document.querySelector('button');
const $changeButton = document.querySelector('#change');
let isRotated = false;

for (let i = 0; i < $dropLists.length; i++) {
  for (let currencyCode in country_list) {
    let selected =
      (i === 0 && currencyCode === 'USD') || (i === 1 && currencyCode === 'RUB')
        ? 'selected'
        : '';
    const optionTag = `<option ${selected}>${currencyCode}</option>`;
    $dropLists[i].insertAdjacentHTML('beforeend', optionTag);
  }

  $dropLists[i].addEventListener('change', (event) => {
    const imgTag = event.target.parentElement.querySelector('img');
    imgTag.src = `https://flagcdn.com/48x36/${country_list[
      event.target.value
    ].toLowerCase()}.png`;
  });
}

function getExchangeRate() {
  const amount = document.querySelector('input');
  const exchangeRateText = document.querySelector('#exchange-rate');

  if (amount.value === '0' || amount.value === '') {
    amount.value = '1';
  }

  exchangeRateText.innerHTML = 'Ищу результат...';

  const url = `https://v6.exchangerate-api.com/v6/fa6de63c8c846e2c8a9ce415/latest/${$fromCurrency.value}`;

  fetch(url)
    .then((response) => response.json())
    .then((result) => {
      const exchangeRate = result.conversion_rates[$toCurrency.value];
      const totalExRate = (amount.value * exchangeRate).toFixed(2);
      exchangeRateText.innerHTML = `${amount.value} ${$fromCurrency.value} = ${totalExRate} ${$toCurrency.value}`;
    })
    .catch(() => {
      exchangeRateText.innerHTML = 'Что-то ппошло не так :(';
    });
}

window.addEventListener('load', () => {
  getExchangeRate();
});

$getButton.addEventListener('click', (event) => {
  event.preventDefault();
  getExchangeRate();
});

$changeButton.addEventListener('click', (event) => {
  event.preventDefault();
  $changeButton.style.transition = 'transform 0.3s ease';

  if (isRotated) {
    $changeButton.style.transform = 'rotate(-180deg)';
  } else {
    $changeButton.style.transform = 'rotate(180deg)';
  }

  const fromValue = $fromCurrency.value;
  const toValue = $toCurrency.value;

  $fromCurrency.value = toValue;
  $toCurrency.value = fromValue;

  const fromImg = $fromCurrency.parentElement.querySelector('img');
  const toImg = $toCurrency.parentElement.querySelector('img');

  fromImg.src = `https://flagcdn.com/48x36/${country_list[
    toValue
  ].toLowerCase()}.png`;

  isRotated = !isRotated;
  getExchangeRate();
});
