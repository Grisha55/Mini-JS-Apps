const $tasksContainer = document.getElementById('tasks-container');
const $addTaskBtn = document.getElementById('add-task-btn');
const $taskInput = document.getElementById('task-input');

// Переменная для хранения перетаскиваемой задачи
let draggedTask = null;

// Инициализация перетаскивания при загрузке
document.addEventListener('DOMContentLoaded', function () {
  initDragAndDrop();
});

// Обработчик добавления новой задачи
$addTaskBtn.addEventListener('click', addNewTask);

// Также добавляем по нажатию Enter
$taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addNewTask();
  }
});

// ========== DRAG & DROP ЛОГИКА ==========

function initDragAndDrop() {
  // Обработчики для контейнера
  $tasksContainer.addEventListener('dragover', handleDragOver);
  $tasksContainer.addEventListener('drop', handleDrop);
  $tasksContainer.addEventListener('dragenter', handleContainerDragEnter);
  $tasksContainer.addEventListener('dragleave', handleContainerDragLeave);
}

function makeTaskDraggable(task) {
  task.draggable = true;
  task.addEventListener('dragstart', handleDragStart);
  task.addEventListener('dragend', handleDragEnd);
  task.addEventListener('dragenter', handleDragEnter);
  task.addEventListener('dragleave', handleDragLeave);
}

function handleDragStart(e) {
  draggedTask = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.id || '');

  // Небольшая задержка для визуального эффекта
  setTimeout(() => {
    this.style.opacity = '0.6';
  }, 0);
}

function handleDragEnd() {
  this.classList.remove('dragging');
  this.style.opacity = '1';

  // Убираем стили подсветки со всех задач
  document.querySelectorAll('.task').forEach((task) => {
    task.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  // Находим элемент, после которого нужно вставить
  const afterElement = getDragAfterElement($tasksContainer, e.clientY);
  const draggingTask = document.querySelector('.dragging');

  if (!draggingTask) return;

  if (afterElement == null) {
    $tasksContainer.appendChild(draggingTask);
  } else {
    $tasksContainer.insertBefore(draggingTask, afterElement);
  }
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();

  // Убираем стили подсветки
  document.querySelectorAll('.task').forEach((task) => {
    task.classList.remove('drag-over');
  });
}

function handleDragEnter(e) {
  e.preventDefault();
  if (this !== draggedTask) {
    this.classList.add('drag-over');
  }
}

function handleDragLeave(e) {
  // Проверяем, что мы действительно вышли из элемента
  if (!this.contains(e.relatedTarget)) {
    this.classList.remove('drag-over');
  }
}

function handleContainerDragEnter(e) {
  e.preventDefault();
}

function handleContainerDragLeave(e) {
  e.preventDefault();
}

// Функция для определения позиции вставки
function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll('.task:not(.dragging)'),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

// ========== ОСНОВНАЯ ЛОГИКА ==========

function addNewTask() {
  const taskText = $taskInput.value.trim();

  // Проверяем, что поле не пустое
  if (taskText === '') {
    alert('Введите текст задачи!');
    return;
  }

  // Создаем элемент задачи
  const taskElement = document.createElement('div');
  taskElement.className = 'task';

  // HTML структура задачи
  taskElement.innerHTML = `
    <div class="task-content">
      <input type="checkbox" class="task-checkbox">
      <span class="task-text">${escapeHtml(taskText)}</span>
      <button class="edit-btn">✏️</button>
      <button class="delete-btn">🗑️</button>
    </div>
    <div class="edit-form" style="display: none;">
      <input type="text" class="edit-input" value="${escapeHtml(taskText)}">
      <button class="save-btn">💾</button>
      <button class="cancel-btn">❌</button>
    </div>
  `;

  // Добавляем задачу в контейнер
  $tasksContainer.appendChild(taskElement);

  // Очищаем поле ввода
  $taskInput.value = '';

  // Настраиваем обработчики для новой задачи
  setupTaskHandlers(taskElement);

  // Делаем задачу перетаскиваемой!
  makeTaskDraggable(taskElement);

  updateTasksCount();
}

// Функция для настройки обработчиков задачи
function setupTaskHandlers(taskElement) {
  const $checkbox = taskElement.querySelector('.task-checkbox');
  const $taskText = taskElement.querySelector('.task-text');
  const $editBtn = taskElement.querySelector('.edit-btn');
  const $deleteBtn = taskElement.querySelector('.delete-btn');
  const $editForm = taskElement.querySelector('.edit-form');
  const $editInput = taskElement.querySelector('.edit-input');
  const $saveBtn = taskElement.querySelector('.save-btn');
  const $cancelBtn = taskElement.querySelector('.cancel-btn');

  // Удаление задачи
  $deleteBtn.addEventListener('click', () => {
    taskElement.style.transition = 'all 0.3s ease';
    taskElement.style.opacity = '0';
    taskElement.style.transform = 'translateX(-100px)';

    setTimeout(() => {
      taskElement.remove();
      updateTasksCount();
    }, 300);
  });

  // Переключение состояния выполнения
  $checkbox.addEventListener('change', () => {
    $taskText.style.textDecoration = $checkbox.checked
      ? 'line-through'
      : 'none';
    $taskText.style.color = $checkbox.checked ? '#a0aec0' : '#2d3748';
  });

  // Начало редактирования
  $editBtn.addEventListener('click', () => {
    // Показываем форму редактирования, скрываем текст
    $taskText.style.display = 'none';
    $editForm.style.display = 'flex';
    $editInput.focus();
    $editInput.select();
  });

  // Сохранение изменений
  $saveBtn.addEventListener('click', saveEdit);
  $editInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveEdit();
  });

  // Отмена редактирования
  $cancelBtn.addEventListener('click', () => {
    $editForm.style.display = 'none';
    $taskText.style.display = 'inline';
  });

  function saveEdit() {
    const newText = $editInput.value.trim();

    if (newText === '') {
      alert('Текст задачи не может быть пустым!');
      return;
    }

    $taskText.textContent = newText;
    $editForm.style.display = 'none';
    $taskText.style.display = 'inline';
  }
}

// Вспомогательная функция для безопасного ввода HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Обновление счетчика задач
function updateTasksCount() {
  const count = document.querySelectorAll('.task').length;
  const $tasksCount = document.getElementById('nav__number-of-tasks');
  $tasksCount.textContent = `${count} ${getTaskWord(count)}`;
}

// Функция для правильного склонения слова "задача"
function getTaskWord(count) {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'задача';
  } else if (
    [2, 3, 4].includes(count % 10) &&
    ![12, 13, 14].includes(count % 100)
  ) {
    return 'задачи';
  } else {
    return 'задач';
  }
}

// Также можно редактировать по двойному клику на текст
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('task-text')) {
    e.target.closest('.task').querySelector('.edit-btn').click();
  }
});
