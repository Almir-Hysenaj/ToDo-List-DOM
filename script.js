// Setting variables
const todoList = [];
const todoListCategories = [];

const leftSection = document.querySelector('.left-container');
const middleSection = document.querySelector('.middle-container');
const rightSection = document.querySelector('.right-container');
const newTaskButton = document.querySelector('.js-add-new-task');
const newListButton = document.querySelector('.js-add-new-list');
const createTaskButton = document.querySelector('.js-create-task');
const toastElement = document.querySelector('.toast');

let activeListId = null;

// Checking local storage
if (localStorage.getItem('todoList')) {
  const savedTasks = JSON.parse(localStorage.getItem('todoList'));
  todoList.push(...savedTasks); // Makes sure array isn't just one item
}

if (localStorage.getItem('todoListCategories')) {
  const savedLists = JSON.parse(localStorage.getItem('todoListCategories'));
  todoListCategories.push(...savedLists);
}

let taskId = localStorage.getItem('taskId') // Condition
  ? Number(localStorage.getItem('taskId')) // If true
  : 0; // Else

let listId = localStorage.getItem('listId')
  ? Number(localStorage.getItem('listId'))
  : 0;

renderTasks();
renderLists();

// When user clicks '+ New Task' in the middle section, input field is shown on the right
newTaskButton.addEventListener('click', () => {
  showRightSection(`
    <div class="right-header">
      <button class="close-right js-close-right">&#62</button>
      <h2>New Task</h2>
    </div>
    <div class="right-body">
      <p>Task Name</p>
      <input type="text" placeholder="Enter task name..." class="name-input js-name-input" />
      <p>Task Description</p>
      <input
        type="text"
        placeholder="Enter task description..."
        class="description-input js-description-input"
      />
      <p>Due Date</p>
      <input type="date" class="date-input js-date-input" />
      <button class="create-task js-create-task">Create Task</button>
    </div>
  `);
});

function findTaskIndexById(taskId) {
  return todoList.findIndex((task) => task.id == taskId);
}

// Handles what to run depending on what button is pressed in the right section
rightSection.addEventListener('click', (event) => {
  if (event.target.classList.contains('js-create-task')) {
    handleCreateTask();
  } else if (event.target.classList.contains('js-update-task')) {
    handleUpdateTask(event.target.dataset.taskId);
  } else if (event.target.classList.contains('js-delete-task')) {
    handleDeleteTask(event.target.dataset.taskId);
  } else if (event.target.classList.contains('js-create-list')) {
    handleCreateList();
  } else if (event.target.classList.contains('js-close-right')) {
    hideRightSection();
  } else {
    return;
  }
});

// In the right section, handles user creating task
function handleCreateTask() {
  const nameInput = document.querySelector('.js-name-input');
  const descInput = document.querySelector('.js-description-input');
  const dateInput = document.querySelector('.js-date-input');

  if (nameInput.value && descInput.value && dateInput.value) {
    todoList.push({
      id: taskId,
      name: nameInput.value,
      description: descInput.value,
      dueDate: dateInput.value,
      completed: false,
      listId: activeListId,
    });
    taskId++;

    saveData();

    showToast('Task created successfully', 'success');
    setTimeout(() => {
      hideRightSection();
    }, 500);

    renderTasks();
  } else {
    showToast('Enter all fields', 'error');
  }
}

// Handles deleting a task
function handleDeleteTask(taskId) {
  let taskIndex = findTaskIndexById(taskId);

  todoList.splice(taskIndex, 1);

  saveData();

  showToast('Task deleted successfully', 'success');
  setTimeout(() => {
    hideRightSection();
  }, 500);

  renderTasks();
}

// Handles updating a task
function handleUpdateTask(taskId) {
  const nameInput = document.querySelector('.js-name-input');
  const descInput = document.querySelector('.js-description-input');
  const dateInput = document.querySelector('.js-date-input');

  let taskIndex = findTaskIndexById(taskId);

  if (nameInput.value && descInput.value && dateInput.value) {
    todoList[taskIndex].name = nameInput.value;
    todoList[taskIndex].description = descInput.value;
    todoList[taskIndex].dueDate = dateInput.value;

    saveData();

    showToast('Task updated successfully', 'success');
    setTimeout(() => {
      hideRightSection();
    }, 500);

    renderTasks();
  } else {
    showToast('Enter all fields', 'error');
  }
}

// When a task is clicked, the task edit field is shown in right container
middleSection.addEventListener('click', (event) => {
  if (event.target.classList.contains('js-task-btn')) {
    editTask(event.target.dataset.taskId);
  } else if (event.target.classList.contains('js-completed-btn')) {
    completeTask(event);
  } else {
    return;
  }
});

function editTask(taskId) {
  let taskIndex = findTaskIndexById(taskId);

  showRightSection(`
    <div class="right-header">
      <button class="close-right js-close-right">&#62</button>
      <h2>Edit Task</h2>
    </div>
    <div class="right-body">
      <p>Task Name</p>
      <input type="text" value="${todoList[taskIndex].name}" placeholder="Enter task name..." class="name-input js-name-input" />
      <p>Task Description</p>
      <input
        type="text"
        value="${todoList[taskIndex].description}"
        placeholder="Enter task description..."
        class="description-input js-description-input"
      />
      <p>Due Date</p>
      <input type="date" value="${todoList[taskIndex].dueDate}" class="date-input js-date-input" />
      <button class="delete-task js-delete-task" data-task-id="${todoList[taskIndex].id}">Delete Task</button>
      <button class="update-task js-update-task" data-task-id="${todoList[taskIndex].id}">Update Task</button>
    </div>
  `);
}

// When user clicks '+ Add New List' on the left section, input field appears on the right section
newListButton.addEventListener('click', () => {
  showRightSection(`
    <div class="right-header">
      <button class="close-right js-close-right">&#62</button>
      <h2>Create List</h2>
    </div>

    <div class="right-body">
      <p>List Name</p>
      <input type="text" placeholder="Enter list name..." class="name-input js-list-name-input" />
      <button class="create-list js-create-list">Create List</button>
    </div>
  `);

  leftSection.classList.toggle('active');
});

// Handles creating a list (category)
function handleCreateList() {
  const listNameInput = document.querySelector('.js-list-name-input');
  if (listNameInput.value) {
    todoListCategories.push({
      id: listId,
      name: listNameInput.value,
    });
    listId++;

    showToast('List created successfuly', 'success');
    setTimeout(() => {
      hideRightSection();
    }, 500);

    saveData();
    renderLists();
  } else {
    showToast('Enter all fields', 'error');
  }
}

// Handles which tasks should be shown depending on list selected
leftSection.addEventListener('click', (event) => {
  if (event.target.classList.contains('js-list-btn')) {
    const listId = event.target.dataset.listId;
    activeListId = Number(listId);

    document.querySelectorAll('.js-list-btn').forEach((button) => {
      button.classList.remove('active');
    });
    event.target.classList.add('active');

    leftSection.classList.toggle('active');
    renderTasks();
  } else if (event.target.classList.contains('js-close-left')) {
    leftSection.classList.toggle('active');
  } else {
    return;
  }
});

// Handles the 'View All' button
document.querySelector('.js-view-all').addEventListener('click', () => {
  activeListId = null;

  document.querySelectorAll('.js-list-btn').forEach((button) => {
    button.classList.remove('active');
  });

  leftSection.classList.toggle('active');
  renderTasks();
});

// Handles completing a task
function completeTask(event) {
  const taskId = event.target.dataset.taskId;
  let taskIndex = findTaskIndexById(taskId);

  if (todoList[taskIndex].completed) {
    todoList[taskIndex].completed = false;
    event.target.classList.remove('completed');
  } else {
    todoList[taskIndex].completed = true;
    event.target.classList.add('completed');
  }

  saveData();
  renderTasks();
}

// Show tasks in the middle section
function renderTasks() {
  taskContainer = document.querySelector('.task-container');
  let html = '';

  todoList
    .filter((task) => activeListId === null || task.listId === activeListId)
    .forEach((task) => {
      html += `
        <div class="task-row">
          <button class="completed-btn js-completed-btn"
          data-task-id="${task.id}"></button>

          <button class="task-btn js-task-btn ${
            task.completed ? 'task-completed' : ''
          }"
          data-task-id="${task.id}">${task.name}<span>&#62</span></button>
        </div>
      `;
    });

  taskContainer.innerHTML = html;
}

// Show lists in the left section
function renderLists() {
  listContainer = document.querySelector('.list-container');
  let html = '';

  todoListCategories.forEach((list) => {
    html += `
      <button class="list-btn js-list-btn" data-list-id="${list.id}">${list.name}</button>
    `;
  });

  listContainer.innerHTML = html;
}

// Handles showing/hiding right section
function showRightSection(htmlContent) {
  rightSection.innerHTML = `
    ${htmlContent}`;
  rightSection.classList.add('active');
}

function hideRightSection() {
  rightSection.innerHTML = '';
  rightSection.classList.remove('active');
}

document.querySelector('.js-toggle-sidebar').addEventListener('click', () => {
  leftSection.classList.toggle('active');
});

function saveData() {
  localStorage.setItem('todoList', JSON.stringify(todoList));
  localStorage.setItem(
    'todoListCategories',
    JSON.stringify(todoListCategories)
  );
  localStorage.setItem('taskId', taskId);
  localStorage.setItem('listId', listId);
}

function showToast(message, type) {
  toastElement.textContent = message;
  toastElement.classList.remove('success', 'error');
  toastElement.classList.add(`${type}`);
  toastElement.style.display = 'block';

  setTimeout(() => {
    toastElement.style.display = 'none';
  }, 2000);
}
