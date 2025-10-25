// Mock данные для поиска (в реальном проекте заменить на API)
const searchData = [
  'JavaScript tutorial',
  'JavaScript массивы',
  'JavaScript функции',
  'React компоненты',
  'React хуки',
  'Vue.js руководство',
  'Angular приложение',
  'Node.js сервер',
  'Python программирование',
  'Python данные науки',
  'HTML CSS верстка',
  'CSS flexbox grid',
  'Веб разработка',
  'Фронтенд разработка',
  'Бэкенд разработка',
  'Базы данных SQL',
  'Мобильная разработка',
  'Искусственный интеллект',
  'Машинное обучение',
  'Веб дизайн',
];

// DOM элементы
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const suggestionsContainer = document.getElementById('suggestions-container');
const resultsContainer = document.getElementById('results-container');
const resultsList = document.getElementById('results-list');
const resultsCount = document.getElementById('results-count');
const loadingIndicator = document.getElementById('loading-indicator');
const noResults = document.getElementById('no-results');
const searchHistory = document.getElementById('search-history');
const historyItems = document.getElementById('history-items');

// Переменные состояния
let currentSuggestions = [];
let selectedSuggestionIndex = -1;
let searchHistoryList = JSON.parse(localStorage.getItem('searchHistory')) || [];

// Инициализация
function init() {
  updateSearchHistoryDisplay();
  setupEventListeners();
}

// Настройка обработчиков событий
function setupEventListeners() {
  // Ввод в поисковую строку
  searchInput.addEventListener('input', handleSearchInput);

  // Фокус на поле ввода
  searchInput.addEventListener('focus', handleInputFocus);

  // Клик по кнопке поиска
  searchButton.addEventListener('click', performSearch);

  // Enter в поле ввода
  searchInput.addEventListener('keydown', handleKeyDown);

  // Клик вне поля ввода (скрытие подсказок)
  document.addEventListener('click', handleClickOutside);
}

// Обработчик ввода в поисковую строку
function handleSearchInput(e) {
  const query = e.target.value.trim();

  if (query.length === 0) {
    hideSuggestions();
    return;
  }

  // Debounce для оптимизации
  clearTimeout(window.suggestionsTimeout);
  window.suggestionsTimeout = setTimeout(() => {
    showSuggestions(query);
  }, 300);
}

// Фокус на поле ввода
function handleInputFocus() {
  const query = searchInput.value.trim();
  if (query.length > 0) {
    showSuggestions(query);
  }
}

// Показать подсказки
function showSuggestions(query) {
  currentSuggestions = getSuggestions(query);
  selectedSuggestionIndex = -1;

  if (currentSuggestions.length === 0) {
    hideSuggestions();
    return;
  }

  renderSuggestions(currentSuggestions, query);
  suggestionsContainer.style.display = 'block';
}

// Получить подсказки на основе запроса
function getSuggestions(query) {
  const lowerQuery = query.toLowerCase();
  return searchData
    .filter((item) => item.toLowerCase().includes(lowerQuery))
    .slice(0, 8); // Ограничиваем количество подсказок
}

// Отрисовка подсказок
function renderSuggestions(suggestions, query) {
  const suggestionsHTML = suggestions
    .map((suggestion, index) => {
      const highlightedSuggestion = highlightMatch(suggestion, query);
      return `
                <div class="suggestion-item ${
                  index === selectedSuggestionIndex ? 'active' : ''
                }" 
                     data-index="${index}">
                    ${highlightedSuggestion}
                </div>
            `;
    })
    .join('');

  suggestionsContainer.innerHTML = suggestionsHTML;

  // Добавляем обработчики клика для подсказок
  suggestionsContainer.querySelectorAll('.suggestion-item').forEach((item) => {
    item.addEventListener('click', () => {
      selectSuggestion(parseInt(item.dataset.index));
    });
  });
}

// Подсветка совпадения в тексте
function highlightMatch(text, query) {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) return text;

  const before = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchIndex + query.length);
  const after = text.slice(matchIndex + query.length);

  return `${before}<span class="suggestion-highlight">${match}</span>${after}`;
}

// Скрыть подсказки
function hideSuggestions() {
  suggestionsContainer.style.display = 'none';
  selectedSuggestionIndex = -1;
}

// Обработчик клавиатуры
function handleKeyDown(e) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      navigateSuggestions(1);
      break;
    case 'ArrowUp':
      e.preventDefault();
      navigateSuggestions(-1);
      break;
    case 'Enter':
      e.preventDefault();
      if (selectedSuggestionIndex >= 0) {
        selectSuggestion(selectedSuggestionIndex);
      } else {
        performSearch();
      }
      break;
    case 'Escape':
      hideSuggestions();
      break;
  }
}

// Навигация по подсказкам стрелками
function navigateSuggestions(direction) {
  if (currentSuggestions.length === 0) return;

  selectedSuggestionIndex += direction;

  if (selectedSuggestionIndex < 0) {
    selectedSuggestionIndex = currentSuggestions.length - 1;
  } else if (selectedSuggestionIndex >= currentSuggestions.length) {
    selectedSuggestionIndex = 0;
  }

  renderSuggestions(currentSuggestions, searchInput.value.trim());

  // Скролл к выбранному элементу
  const selectedElement = suggestionsContainer.querySelector(
    '.suggestion-item.active'
  );
  if (selectedElement) {
    selectedElement.scrollIntoView({ block: 'nearest' });
  }
}

// Выбор подсказки
function selectSuggestion(index) {
  if (index >= 0 && index < currentSuggestions.length) {
    searchInput.value = currentSuggestions[index];
    hideSuggestions();
    performSearch();
  }
}

// Клик вне поля ввода
function handleClickOutside(e) {
  if (
    !searchInput.contains(e.target) &&
    !suggestionsContainer.contains(e.target)
  ) {
    hideSuggestions();
  }
}

// Выполнить поиск
function performSearch() {
  const query = searchInput.value.trim();

  if (query.length === 0) {
    hideResults();
    return;
  }

  // Добавляем в историю
  addToSearchHistory(query);

  // Показываем загрузку
  showLoading();

  // Имитация задержки API
  setTimeout(() => {
    const results = searchData.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );

    displayResults(results, query);
  }, 800);
}

// Показать индикатор загрузки
function showLoading() {
  resultsList.style.display = 'none';
  noResults.style.display = 'none';
  loadingIndicator.style.display = 'block';
  resultsContainer.style.display = 'block';
}

// Отобразить результаты
function displayResults(results, query) {
  loadingIndicator.style.display = 'none';

  if (results.length === 0) {
    showNoResults();
    return;
  }

  resultsCount.textContent = `Найдено результатов: ${results.length}`;

  const resultsHTML = results
    .map(
      (result) => `
            <div class="result-item">
                <div class="result-title">${highlightMatch(result, query)}</div>
                <div class="result-description">
                    Результат по запросу "${query}". Это пример описания для демонстрации работы поиска.
                </div>
            </div>
        `
    )
    .join('');

  resultsList.innerHTML = resultsHTML;
  resultsList.style.display = 'block';
  noResults.style.display = 'none';
  resultsContainer.style.display = 'block';
}

// Показать "нет результатов"
function showNoResults() {
  resultsList.style.display = 'none';
  noResults.style.display = 'block';
  resultsCount.textContent = `Найдено результатов: 0`;
  resultsContainer.style.display = 'block';
}

// Скрыть результаты
function hideResults() {
  resultsContainer.style.display = 'none';
}

// Добавить в историю поиска
function addToSearchHistory(query) {
  // Удаляем дубликаты
  searchHistoryList = searchHistoryList.filter((item) => item !== query);

  // Добавляем в начало
  searchHistoryList.unshift(query);

  // Ограничиваем размер истории
  if (searchHistoryList.length > 10) {
    searchHistoryList = searchHistoryList.slice(0, 10);
  }

  // Сохраняем в localStorage
  localStorage.setItem('searchHistory', JSON.stringify(searchHistoryList));

  // Обновляем отображение
  updateSearchHistoryDisplay();
}

// Обновить отображение истории
function updateSearchHistoryDisplay() {
  if (searchHistoryList.length === 0) {
    searchHistory.style.display = 'none';
    return;
  }

  const historyHTML = searchHistoryList
    .map(
      (item) => `
            <div class="history-item" data-query="${item}">${item}</div>
        `
    )
    .join('');

  historyItems.innerHTML = historyHTML;
  searchHistory.style.display = 'block';

  // Добавляем обработчики для элементов истории
  historyItems.querySelectorAll('.history-item').forEach((item) => {
    item.addEventListener('click', () => {
      searchInput.value = item.dataset.query;
      performSearch();
    });
  });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', init);
