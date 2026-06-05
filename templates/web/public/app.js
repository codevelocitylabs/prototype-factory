// Client-side bootstrap — one fetch, then render. No framework.

async function init() {
  const res = await fetch('/api/bootstrap');
  if (!res.ok) {
    document.getElementById('who').textContent = `Bootstrap failed: ${res.status}`;
    return;
  }
  const data = await res.json();

  document.getElementById('who').textContent =
    `Signed in as ${data.user.name} (${data.user.role}) — local-only, no real auth.`;
  document.getElementById('source').textContent = data.source.label;
  document.getElementById('visits').textContent = data.visits;

  const list = document.getElementById('items');
  for (const item of data.items) {
    const li = document.createElement('li');
    const title = document.createElement('h3');
    title.textContent = item.title;
    const body = document.createElement('p');
    body.textContent = item.body;
    li.append(title, body);
    if (item.tags && item.tags.length) {
      const tagLine = document.createElement('p');
      const em = document.createElement('em');
      em.textContent = `Tags: ${item.tags.join(', ')}`;
      tagLine.append(em);
      li.append(tagLine);
    }
    list.append(li);
  }
}

init();
