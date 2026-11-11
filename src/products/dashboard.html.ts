export const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Shesh stock dashboard</title>
  <style>
    :root { color-scheme: light; }
    body { font-family: system-ui, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 16px; color: #1a1a1a; }
    h1 { font-size: 1.5rem; margin-bottom: 8px; }
    p { color: #444; }
    .card { border: 1px solid #ddd; border-radius: 10px; padding: 16px; margin: 16px 0; }
    label { display: block; font-weight: 600; margin-bottom: 6px; }
    input[type="password"] { width: 100%; box-sizing: border-box; padding: 8px 10px; border: 1px solid #ccc; border-radius: 6px; }
    button { margin-top: 10px; padding: 8px 14px; border: 0; border-radius: 6px; background: #0b6; color: #fff; font-weight: 600; cursor: pointer; }
    button:disabled { opacity: 0.6; cursor: default; }
    .error { color: #b00020; min-height: 1.2em; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #eee; }
    .yes { color: #0a7; font-weight: 700; }
    .no { color: #b00020; font-weight: 700; }
    .switch { position: relative; display: inline-block; width: 48px; height: 26px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; inset: 0; background: #ccc; border-radius: 26px; transition: 0.2s; }
    .slider:before { content: ""; position: absolute; height: 20px; width: 20px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: 0.2s; }
    .switch input:checked + .slider { background: #0b6; }
    .switch input:checked + .slider:before { transform: translateX(22px); }
    #products { display: none; }
  </style>
</head>
<body>
  <h1>Gas stock availability</h1>
  <p>Toggle each cylinder SKU. Changes are saved immediately and used by the WhatsApp bot on the next customer message.</p>

  <div class="card" id="auth">
    <label for="key">Dashboard API key</label>
    <input id="key" type="password" autocomplete="current-password" placeholder="DASHBOARD_API_KEY">
    <button id="load" type="button">Load products</button>
    <p class="error" id="auth-error"></p>
  </div>

  <div class="card" id="products">
    <table>
      <thead>
        <tr>
          <th>Brand</th>
          <th>Size</th>
          <th>Price</th>
          <th>Available</th>
          <th>YES / NO</th>
        </tr>
      </thead>
      <tbody id="rows"></tbody>
    </table>
    <p class="error" id="save-error"></p>
  </div>

  <script>
    const keyInput = document.getElementById('key');
    const authError = document.getElementById('auth-error');
    const saveError = document.getElementById('save-error');
    const productsCard = document.getElementById('products');
    const rows = document.getElementById('rows');
    const stored = sessionStorage.getItem('dashboardApiKey');
    if (stored) keyInput.value = stored;

    function headers() {
      return { 'Content-Type': 'application/json', 'x-admin-key': keyInput.value };
    }

    async function loadProducts() {
      authError.textContent = '';
      saveError.textContent = '';
      const res = await fetch('/products', { headers: headers() });
      if (!res.ok) {
        productsCard.style.display = 'none';
        authError.textContent = res.status === 401
          ? 'Invalid API key.'
          : 'Could not load products. Is DASHBOARD_API_KEY set on the server?';
        return;
      }
      sessionStorage.setItem('dashboardApiKey', keyInput.value);
      const items = await res.json();
      rows.innerHTML = items.map((p) => \`
        <tr>
          <td>\${p.brand}</td>
          <td>\${p.size}</td>
          <td>\${p.price}</td>
          <td id="label-\${p.id}" class="\${p.inStock ? 'yes' : 'no'}">\${p.inStock ? 'YES' : 'NO'}</td>
          <td>
            <label class="switch">
              <input type="checkbox" data-id="\${p.id}" \${p.inStock ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
          </td>
        </tr>
      \`).join('');
      productsCard.style.display = 'block';
      rows.querySelectorAll('input[type="checkbox"]').forEach((el) => {
        el.addEventListener('change', () => toggle(el));
      });
    }

    async function toggle(el) {
      saveError.textContent = '';
      const id = el.getAttribute('data-id');
      const inStock = el.checked;
      el.disabled = true;
      const res = await fetch('/products/' + id, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ inStock }),
      });
      el.disabled = false;
      if (!res.ok) {
        el.checked = !inStock;
        saveError.textContent = 'Could not save that change. Try again.';
        return;
      }
      const label = document.getElementById('label-' + id);
      label.textContent = inStock ? 'YES' : 'NO';
      label.className = inStock ? 'yes' : 'no';
    }

    document.getElementById('load').addEventListener('click', loadProducts);
    keyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') loadProducts(); });
    if (stored) loadProducts();
  </script>
</body>
</html>`;
