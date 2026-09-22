const $ = (selector) => document.querySelector(selector);
let learnerRows = [];

async function api(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = response.status === 204 ? {} : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Unable to complete this request.');
  return data;
}

function renderBreakdown(target, rows, label) {
  const total = rows.reduce((sum, row) => sum + row.learner_count, 0) || 1;
  $(target).innerHTML = rows.length ? rows.map(row => `<div class="breakdown-row"><div><strong>${row[label]}</strong><span>${row.learner_count} learner${row.learner_count === 1 ? '' : 's'}</span></div><i><b style="width:${Math.round((row.learner_count / total) * 100)}%"></b></i></div>`).join('') : '<p class="empty">No learner data yet.</p>';
}

function renderLearners() {
  const query = $('#learnerSearch').value.trim().toLowerCase();
  const filtered = learnerRows.filter(row => [row.name, row.email, row.language, row.proficiency].some(value => String(value).toLowerCase().includes(query)));
  $('#learnerRows').innerHTML = filtered.map(row => `<tr><td><strong>${row.name}</strong><small>${row.email}</small></td><td>${row.language}</td><td><span class="tag">${row.proficiency}</span></td><td>${row.assessment_completed ? 'Completed' : 'Not started'}</td><td><div class="progress"><i><b style="width:${row.progress_percent}%"></b></i><span>${row.progress_percent}%</span></div></td><td>${row.total_xp}</td><td>${row.login_count}</td></tr>`).join('');
  $('#emptyState').classList.toggle('hidden', filtered.length !== 0);
}

async function loadDashboard() {
  const data = await api('/api/admin/overview');
  $('#totalLearners').textContent = data.totals.learners;
  $('#totalAssessments').textContent = data.totals.assessments_completed;
  $('#totalLessons').textContent = data.totals.lessons_completed;
  $('#totalPractice').textContent = data.totals.practice_attempts;
  learnerRows = data.learners;
  renderBreakdown('#languageBreakdown', data.languages, 'language');
  renderBreakdown('#levelBreakdown', data.levels, 'proficiency');
  renderLearners();
}

function revealDashboard(email) {
  $('#adminEmail').textContent = email;
  $('#adminLogin').classList.add('hidden');
  $('#adminDashboard').classList.remove('hidden');
}

$('#adminLoginForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  $('#loginError').textContent = '';
  try {
    const data = await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) });
    revealDashboard(data.admin.email);
    await loadDashboard();
  } catch (error) { $('#loginError').textContent = error.message; }
});

$('#learnerSearch').addEventListener('input', renderLearners);
$('#refreshDashboard').addEventListener('click', () => loadDashboard().catch(error => { if (error.message === 'Authentication required.') location.reload(); else alert(error.message); }));
$('#adminLogout').addEventListener('click', async () => { try { await api('/api/admin/logout', { method: 'POST' }); } catch (error) {} location.reload(); });

api('/api/admin/session').then(async session => { if (session.authenticated) { revealDashboard(session.admin.email); await loadDashboard(); } }).catch(() => {});
