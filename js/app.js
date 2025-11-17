/* Task Manager — script.js
   Stores tasks in localStorage. Basic CRUD with filtering & search.
*/

const STORAGE_KEY = 'taskmanager.tasks.v1';
let tasks = [];

/* ---------- Helpers ---------- */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const uid = () => 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  tasks = raw ? JSON.parse(raw) : [];
}

/* ---------- Rendering ---------- */
const taskListEl = $('#taskList');
const noTasksEl = $('#noTasks');

function formatDue(dateStr) {
  if (!dateStr) return 'No date';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString();
  } catch (e) { return dateStr; }
}

function statusLabel(s) {
  if (s === 'todo') return 'To Do';
  if (s === 'inprogress') return 'In Progress';
  if (s === 'completed') return 'Completed';
  return s;
}

function escapeHtml(str='') {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function renderTasks() {
  taskListEl.innerHTML = '';
  const filtered = applyFilters(tasks);
  noTasksEl.style.display = filtered.length === 0 ? 'block' : 'none';

  filtered.forEach(t => {
    const card = document.createElement('article');
    card.className = 'task-card';
    card.dataset.id = t.id;
    card.innerHTML = `
      <div class="task-title">
        <div><strong>${escapeHtml(t.title)}</strong></div>
        <div style="display:flex;gap:8px;align-items:center">
          <span class="badge ${t.priority}">${t.priority}</span>
          <span class="status ${t.status}">${statusLabel(t.status)}</span>
        </div>
      </div>
      <div class="task-desc">${escapeHtml(t.description || '')}</div>
      <div class="task-meta">
        <div>Due: ${formatDue(t.dueDate)}</div>
        <div class="task-actions">
          <button class="btn tiny edit-btn" data-id="${t.id}">Edit</button>
          <button class="btn secondary tiny delete-btn" data-id="${t.id}">Delete</button>
        </div>
      </div>
    `;
    taskListEl.appendChild(card);
  });
}

/* ---------- Filters & Search ---------- */
const searchInput = $('#searchInput');
const statusFilter = $('#statusFilter');
const priorityFilter = $('#priorityFilter');
const dateFilter = $('#dateFilter');
const clearFiltersBtn = $('#clearFilters');

function applyFilters(list) {
  const q = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;
  const priority = priorityFilter.value;
  const date = dateFilter.value;

  return list.filter(t => {
    if (status !== 'all' && t.status !== status) return false;
    if (priority !== 'all' && t.priority !== priority) return false;
    if (date && t.dueDate !== date) return false;

    if (q) {
      const hay = (t.title + ' ' + (t.description||'')).toLowerCase();
      return hay.includes(q);
    }
    return true;
  }).sort((a,b) => {
    const statusOrder = {todo:0, inprogress:1, completed:2};
    if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
    const prio = {high:0, medium:1, low:2};
    if (prio[a.priority] !== prio[b.priority]) return prio[a.priority] - prio[b.priority];
    if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
    return 0;
  });
}

/* ---------- Add Task ---------- */
const taskForm = $('#taskForm');
taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = $('#title').value.trim();
  if (!title) { alert('Task title is required'); return; }
  const description = $('#description').value.trim();
  const dueDate = $('#dueDate').value || '';
  const priority = $('#priority').value;

  const t = { id: uid(), title, description, dueDate, priority, status: 'todo', createdAt: new Date().toISOString() };
  tasks.push(t);
  saveTasks();
  renderTasks();
  taskForm.reset();
  document.querySelector('main').scrollIntoView({behavior:'smooth'});
});

/* ---------- Edit Task (modal) ---------- */
const editModal = $('#editModal');
const closeModalBtn = $('#closeModal');
const editForm = $('#editForm');
const editId = $('#editId');
const editTitle = $('#editTitle');
const editDescription = $('#editDescription');
const editDueDate = $('#editDueDate');
const editPriority = $('#editPriority');
const editStatus = $('#editStatus');

function openEditModal(task) {
  editId.value = task.id;
  editTitle.value = task.title;
  editDescription.value = task.description || '';
  editDueDate.value = task.dueDate || '';
  editPriority.value = task.priority;
  editStatus.value = task.status;
  editModal.setAttribute('aria-hidden', 'false');
  editModal.scrollTop = 0;
  editTitle.focus();
}

function closeEditModal() {
  editModal.setAttribute('aria-hidden', 'true');
}

closeModalBtn.addEventListener('click', closeEditModal);
editForm.addEventListener('submit', e => {
  e.preventDefault();
  const id = editId.value;
  const t = tasks.find(x => x.id === id);
  if (!t) { closeEditModal(); return; }
  t.title = editTitle.value.trim();
  t.description = editDescription.value.trim();
  t.dueDate = editDueDate.value || '';
  t.priority = editPriority.value;
  t.status = editStatus.value;
  saveTasks();
  renderTasks();
  closeEditModal();
});

$('#cancelEdit').addEventListener('click', closeEditModal);

/* ---------- Delete ---------- */
function deleteTask(id) {
  if (!confirm('Delete this task permanently?')) return;
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

/* ---------- Event Delegation for Edit/Delete ---------- */
taskListEl.addEventListener('click', (e) => {
  const id = e.target.dataset.id;
  if (!id) return;
  if (e.target.classList.contains('edit-btn')) {
    const t = tasks.find(x => x.id === id);
    if (t) openEditModal(t);
  } else if (e.target.classList.contains('delete-btn')) {
    deleteTask(id);
  }
});

/* ---------- Clear Filters ---------- */
clearFiltersBtn.addEventListener('click', () => {
  searchInput.value = '';
  statusFilter.value = 'all';
  priorityFilter.value = 'all';
  dateFilter.value = '';
  renderTasks();
});

/* ---------- Live filters ---------- */
['input','change'].forEach(ev => {
  searchInput.addEventListener(ev, renderTasks);
  statusFilter.addEventListener(ev, renderTasks);
  priorityFilter.addEventListener(ev, renderTasks);
  dateFilter.addEventListener(ev, renderTasks);
});

/* ---------- Init ---------- */
function init() {
  loadTasks();
  renderTasks();

  // demo tasks if empty
  if (tasks.length === 0) {
    const demo = [
      { id: uid(), title: 'Submit assignment', description: 'Prepare and submit ICT1209 assignment', dueDate: '', priority: 'high', status: 'todo', createdAt: new Date().toISOString() },
      { id: uid(), title: 'Study Ethics', description: 'Read Chapter 4', dueDate: '', priority: 'medium', status: 'inprogress', createdAt: new Date().toISOString() },
      { id: uid(), title: 'Grocery shopping', description: '', dueDate: '', priority: 'low', status: 'completed', createdAt: new Date().toISOString() }
    ];
    tasks = demo;
    saveTasks();
    renderTasks();
  }
}

/* Close modal when clicking outside content */
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeEditModal();
});

/* Keyboard accessibility */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeEditModal();
});

init();
