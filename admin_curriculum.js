const $ = (selector) => document.querySelector(selector);
let curriculum = { languages: [], courses: [], topics: [] };

async function api(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = response.status === 204 ? {} : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Unable to complete this request.');
  return data;
}

function fillSelect(select, items, valueKey, textFn, emptyLabel = '') {
  select.innerHTML = `${emptyLabel ? `<option value="">${emptyLabel}</option>` : ''}${items.map(item => `<option value="${item[valueKey]}">${textFn(item)}</option>`).join('')}`;
}

function updateTopicChoices() {
  const courseId = Number($('#lessonCourse').value);
  const topics = curriculum.topics.filter(topic => topic.course_id === courseId);
  fillSelect($('#lessonTopic'), topics, 'id', topic => topic.title, 'Create a new topic below');
}

function renderRecentLessons(lessons) {
  $('#recentLessons').innerHTML = lessons.length ? lessons.map(lesson => `<div class="recent-lesson"><div><strong>${lesson.title}</strong><small>${lesson.course_title} · ${lesson.topic_title} · ${lesson.language}</small></div><span>${lesson.estimated_minutes || 5} min</span></div>`).join('') : '<p class="empty">No lessons have been added yet.</p>';
}

async function loadCurriculumPage() {
  const [content, overview] = await Promise.all([api('/api/admin/curriculum'), api('/api/admin/overview')]);
  curriculum = content;
  fillSelect($('#courseLanguage'), curriculum.languages, 'id', language => language.name);
  fillSelect($('#lessonCourse'), curriculum.courses, 'id', course => `${course.language} · ${course.title} (${course.proficiency_level})`);
  updateTopicChoices();
  $('#totalCourses').textContent = overview.curriculum_totals.courses;
  $('#totalTopics').textContent = overview.curriculum_totals.topics;
  $('#totalLessonsLibrary').textContent = overview.curriculum_totals.lessons;
  renderRecentLessons(overview.recent_lessons);
}

function revealDashboard(email) { $('#adminEmail').textContent = email; $('#adminLogin').classList.add('hidden'); $('#adminDashboard').classList.remove('hidden'); }

$('#adminLoginForm').addEventListener('submit', async event => {
  event.preventDefault(); const form = new FormData(event.currentTarget); $('#loginError').textContent = '';
  try { const data = await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) }); revealDashboard(data.admin.email); await loadCurriculumPage(); } catch (error) { $('#loginError').textContent = error.message; }
});

$('#lessonCourse').addEventListener('change', updateTopicChoices);
$('#addCourseForm').addEventListener('submit', async event => {
  event.preventDefault(); const message = $('#courseMessage'); message.textContent = ''; message.classList.remove('error');
  try { await api('/api/admin/courses', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); event.currentTarget.reset(); message.textContent = 'Course added successfully.'; await loadCurriculumPage(); } catch (error) { message.textContent = error.message; message.classList.add('error'); }
});
$('#addLessonForm').addEventListener('submit', async event => {
  event.preventDefault(); const message = $('#lessonMessage'); message.textContent = ''; message.classList.remove('error');
  try { await api('/api/admin/lessons', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); event.currentTarget.reset(); message.textContent = 'Lesson published successfully.'; await loadCurriculumPage(); } catch (error) { message.textContent = error.message; message.classList.add('error'); }
});
$('#refreshCurriculum').addEventListener('click', () => loadCurriculumPage().catch(error => { if (error.message === 'Authentication required.') location.reload(); else alert(error.message); }));
$('#adminLogout').addEventListener('click', async () => { try { await api('/api/admin/logout', { method: 'POST' }); } catch (error) {} location.reload(); });
api('/api/admin/session').then(async session => { if (session.authenticated) { revealDashboard(session.admin.email); await loadCurriculumPage(); } }).catch(() => {});
