// ============================
//  ИБ Инциденттер Жүйесі
//  Жалағаш ауданы әкімдігі
// ============================

let incidents = JSON.parse(localStorage.getItem('ib_incidents') || '[]');
let filterStatus = 'all';

// ---- CLOCK ----
function updateClock() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  document.getElementById('clock').textContent =
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const days = ['Жексенбі','Дүйсенбі','Сейсенбі','Сәрсенбі','Бейсенбі','Жұма','Сенбі'];
  const months = ['қаңтар','ақпан','наурыз','сәуір','мамыр','маусым','шілде','тамыз','қыркүйек','қазан','қараша','желтоқсан'];
  document.getElementById('dateDisplay').textContent =
    `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}
setInterval(updateClock, 1000);
updateClock();

// Set today's date as default
document.getElementById('incidentDate').valueAsDate = new Date();

// ---- SAVE ----
function save() {
  localStorage.setItem('ib_incidents', JSON.stringify(incidents));
}

// ---- ADD INCIDENT ----
function addIncident() {
  const type = document.getElementById('incidentType').value.trim();
  const dept = document.getElementById('department').value.trim();
  const date = document.getElementById('incidentDate').value;
  const priority = document.getElementById('priority').value;
  const desc = document.getElementById('description').value.trim();
  const reporter = document.getElementById('reportedBy').value.trim();

  if (!type || !dept || !date || !reporter) {
    showToast('❌ Барлық өрістерді толтырыңыз!', 'error');
    return;
  }

  const incident = {
    id: Date.now(),
    type,
    dept,
    date,
    priority,
    desc,
    reporter,
    status: 'Жаңа / Новый',
    createdAt: new Date().toISOString()
  };

  incidents.unshift(incident);
  save();
  renderTable();
  updateStats();
  clearForm();
  showToast('✓ Инцидент тіркелді!');
}

// ---- CLEAR FORM ----
function clearForm() {
  document.getElementById('incidentType').value = '';
  document.getElementById('department').value = '';
  document.getElementById('incidentDate').valueAsDate = new Date();
  document.getElementById('priority').value = 'Орташа / Средний';
  document.getElementById('description').value = '';
  document.getElementById('reportedBy').value = '';
}

// ---- CHANGE STATUS ----
function changeStatus(id) {
  const inc = incidents.find(i => i.id === id);
  if (!inc) return;

  const statuses = ['Жаңа / Новый', 'Жұмыста / В работе', 'Шешілді / Решён'];
  const idx = statuses.indexOf(inc.status);
  inc.status = statuses[(idx + 1) % statuses.length];

  save();
  renderTable();
  updateStats();
  showToast('↻ Статус жаңартылды');
}

// ---- DELETE ----
function deleteIncident(id) {
  if (!confirm('Инцидентті жою? / Удалить инцидент?')) return;
  incidents = incidents.filter(i => i.id !== id);
  save();
  renderTable();
  updateStats();
  showToast('🗑 Жойылды / Удалён', 'error');
}

// ---- FILTER ----
function filterIncidents(status, btn) {
  filterStatus = status;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTable();
}

// ---- RENDER TABLE ----
function renderTable() {
  const tbody = document.getElementById('tableBody');
  const filtered = filterStatus === 'all'
    ? incidents
    : incidents.filter(i => i.status === filterStatus);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="8">Инциденттер жоқ · Нет инцидентов</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((inc, idx) => {
    const statusClass = inc.status === 'Жаңа / Новый' ? 'badge-new'
      : inc.status === 'Жұмыста / В работе' ? 'badge-progress'
      : 'badge-done';

    const priorityClass = inc.priority.includes('Жоғары') ? 'priority-high'
      : inc.priority.includes('Орташа') ? 'priority-mid'
      : 'priority-low';

    const dateFormatted = inc.date ? new Date(inc.date + 'T00:00:00').toLocaleDateString('ru-RU') : '—';

    return `
      <tr>
        <td class="num-cell">${String(idx + 1).padStart(3, '0')}</td>
        <td class="date-cell">${dateFormatted}</td>
        <td>${inc.type}</td>
        <td>${inc.dept}</td>
        <td class="${priorityClass}">${inc.priority}</td>
        <td>
          <span class="badge ${statusClass}" onclick="changeStatus(${inc.id})" title="Басу арқылы өзгерту / Нажмите для смены">
            ${inc.status}
          </span>
        </td>
        <td>${inc.reporter}</td>
        <td>
          <button class="btn-delete" onclick="deleteIncident(${inc.id})">✕</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ---- UPDATE STATS ----
function updateStats() {
  document.getElementById('statTotal').textContent = incidents.length;
  document.getElementById('statNew').textContent = incidents.filter(i => i.status === 'Жаңа / Новый').length;
  document.getElementById('statProgress').textContent = incidents.filter(i => i.status === 'Жұмыста / В работе').length;
  document.getElementById('statDone').textContent = incidents.filter(i => i.status === 'Шешілді / Решён').length;
}

// ---- TOAST ----
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.background = type === 'error' ? '#ff1744' : '#00d4ff';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ---- INIT ----
renderTable();
updateStats();
