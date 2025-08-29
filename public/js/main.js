async function loadPartial(url, selector) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    const html = await res.text();
    const el = document.querySelector(selector);
    if (el) el.innerHTML = html;
  } catch (err) {
    console.error('Error loading partial', url, err);
  }
}

window.loadPartial = loadPartial;
