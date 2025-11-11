const $tasksCount = document.getElementById('nav__number-of-tasks');
const $tasksContainer = document.getElementById('tasks-container');
const $addTaskBtn = document.getElementById('add-task');

let draggedTask = null;

// Инициализация
document.addEventListener('DOMContentLoaded', function () {
  initDragAndDrop();
  updateTasksCount();
});

// Перетаскивание
function initDragAndDrop() {
  const tasks = document.querySelectorAll('.task');

  tasks.forEach((task) => {
    makeTaskDraggable(task);
  });

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
  // Устанавливаем данные для переноса
  e.dataTransfer.setData('text/plain', this.id || '');
  setTimeout(() => {
    this.style.opacity = '0.4';
  }, 0);
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  this.style.opacity = '1';
  this.style.transform = '';

  // Убираем стили со всех задач
  document.querySelectorAll('.task').forEach((task) => {
    task.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  // Находим элемент, после которого нужно вставить
  const afterElement = getDragAfterElement($tasksContainer, e.clientY);
  const draggable = document.querySelector('.dragging');

  if (afterElement == null) {
    $tasksContainer.appendChild(draggable);
  } else {
    $tasksContainer.insertBefore(draggable, afterElement);
  }
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();

  // Убираем стили
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
  // Проверяем, что мы действительно вышли из элемента, а не перешли в его дочерний элемент
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

// Обработчики для чекбоксов и добавления задач
$tasksContainer.addEventListener('change', function (e) {
  if (e.target.classList.contains('checkbox')) {
    const task = e.target.closest('.task');
    deleteTask(task);
  }
});

$addTaskBtn.addEventListener('click', addNewTask);

function deleteTask(task) {
  task.style.transition = 'all 0.3s ease';
  task.style.opacity = '0';
  task.style.transform = 'translateX(-100px)';

  setTimeout(() => {
    task.remove();
    updateTasksCount();
  }, 300);
}

function addNewTask() {
  const newTask = document.createElement('div');
  const taskId = 'task-' + Date.now();
  const taskHTML = `
    <div class="task-block">
      <input type="checkbox" class="checkbox">
      <h1 class="task-title">Новая задача</h1>
    </div>
  `;

  newTask.classList.add('task');
  newTask.id = taskId;
  newTask.innerHTML = taskHTML;

  // Делаем новую задачу перетаскиваемой
  makeTaskDraggable(newTask);

  $tasksContainer.appendChild(newTask);
  updateTasksCount();
}

function updateTasksCount() {
  const tasks = document.querySelectorAll('.task');
  const count = tasks.length;
  $tasksCount.textContent = `${count} ${getTaskWord(count)}`;
}

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
