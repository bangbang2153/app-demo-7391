/* ============================================================
   Invoice App – app.js (client side)
   ============================================================ */

// ── Helpers ───────────────────────────────────────────────────

function fmtRp(n) {
  const num = parseFloat(n) || 0;
  return 'Rp' + num.toLocaleString('id-ID') + ',00';
}

function sync(inputId, previewId) {
  const el = document.getElementById(previewId);
  if (el) el.textContent = document.getElementById(inputId).value;
}

function syncDate() {
  const val = document.getElementById('invDate').value;
  if (!val) return;
  const [y, m, d] = val.split('-');
  document.getElementById('invInvDate').textContent = `${d}/${m}/${y}`;
}

function showToast(msg) {
  let t = document.getElementById('globalToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'globalToast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Items ─────────────────────────────────────────────────────

const TEMPLATE_URAIAN =
  'Sewa Mobil Daihtsu xenia BM 1412 UA selama 7 hari terhitung dari\n' +
  'tanggal 12 April, 2026 hingga 19 April, 2026';

let items = [
  { uraian: TEMPLATE_URAIAN, harga: 2100000 }
];

function renderItems() {
  const container = document.getElementById('itemsContainer');
  container.innerHTML = '';

  items.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card-header">
        <span>Item ${i + 1}</span>
        <button class="btn-del-item" onclick="removeItem(${i})" title="Hapus item">×</button>
      </div>
      <label>Uraian / Deskripsi</label>
      <textarea class="uraian-textarea"
        placeholder="Tulis keterangan lengkap di sini..."
        oninput="items[${i}].uraian = this.value; renderPreview()"
      >${item.uraian}</textarea>
      <label>Harga (Rp)</label>
      <input class="harga-input" type="number" min="0" step="1000"
        value="${item.harga}"
        placeholder="0"
        oninput="items[${i}].harga = parseFloat(this.value) || 0; renderPreview()">
    `;
    container.appendChild(card);
  });

  renderPreview();
}

function renderPreview() {
  const tbody = document.getElementById('invTableBody');
  tbody.innerHTML = '';
  let total = 0;

  items.forEach((item, i) => {
    total += item.harga;
    // Preserve line-breaks in uraian as <br>
    const uraianHtml = (item.uraian || '-')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/\n/g, '<br>');

    tbody.innerHTML += `
      <tr>
        <td class="no-col">${i + 1}</td>
        <td>${uraianHtml}</td>
        <td class="price-col">${fmtRp(item.harga)}</td>
        <td class="total-col">${fmtRp(item.harga)}</td>
      </tr>`;
  });

  document.getElementById('invTotal').textContent = fmtRp(total);
}

function addItem() {
  items.push({ uraian: '', harga: 0 });
  renderItems();
  // Scroll to newly added card
  const container = document.getElementById('itemsContainer');
  container.lastElementChild && container.lastElementChild.scrollIntoView({ behavior: 'smooth' });
}

function removeItem(i) {
  if (items.length === 1) { showToast('Minimal harus ada 1 item.'); return; }
  items.splice(i, 1);
  renderItems();
}

// ── Logo handling ─────────────────────────────────────────────

function setInvLogo(src) {
  const img   = document.getElementById('invLogo');
  const ph    = document.getElementById('invLogoPlaceholder');
  if (src) {
    img.src          = src;
    img.style.display = '';
    if (ph) ph.style.display = 'none';
  } else {
    img.style.display = 'none';
    if (ph) ph.style.display = '';
  }
}

function selectDefaultLogo() {
  // Mark active
  document.getElementById('logoOptDefault').classList.add('active');
  document.getElementById('logoOptCustom').classList.remove('active');

  if (SERVER_STATE.defaultLogo) {
    setInvLogo(SERVER_STATE.defaultLogo);
  }

  // If there was a custom logo, offer reset
  if (SERVER_STATE.customLogo) {
    fetch('/upload/logo/reset', { method: 'POST' })
      .then(() => {
        SERVER_STATE.customLogo = null;
        document.getElementById('btnResetLogo') &&
          (document.getElementById('btnResetLogo').style.display = 'none');
        showToast('Logo default digunakan.');
      });
  }
}

async function uploadLogo(input) {
  const file = input.files[0];
  if (!file) return;

  const fd = new FormData();
  fd.append('logo', file);

  try {
    const res  = await fetch('/upload/logo', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) {
      const cacheBust = data.url + '?v=' + Date.now();
      SERVER_STATE.customLogo = data.url;

      // Update thumb in form
      const thumb = document.getElementById('customLogoThumb');
      if (thumb.tagName === 'SPAN') {
        // Replace span with img
        const img = document.createElement('img');
        img.id    = 'customLogoThumb';
        img.src   = cacheBust;
        img.alt   = 'Custom Logo';
        thumb.replaceWith(img);
      } else {
        thumb.src = cacheBust;
      }
      document.getElementById('customLogoLabel').textContent = 'Logo Kustom ✓';

      // Activate custom option
      document.getElementById('logoOptCustom').classList.add('active');
      document.getElementById('logoOptDefault').classList.remove('active');

      // Show reset button
      const resetBtn = document.getElementById('btnResetLogo');
      if (resetBtn) resetBtn.style.display = '';

      // Update invoice preview
      setInvLogo(cacheBust);
      showToast('Logo berhasil diupload! ✓');
    }
  } catch (err) {
    showToast('Gagal upload logo. Coba lagi.');
  }
}

async function resetLogo() {
  await fetch('/upload/logo/reset', { method: 'POST' });
  SERVER_STATE.customLogo = null;
  document.getElementById('logoOptDefault').classList.add('active');
  document.getElementById('logoOptCustom').classList.remove('active');
  document.getElementById('customLogoLabel').textContent = 'Upload Logo Baru';

  const thumb = document.getElementById('customLogoThumb');
  if (thumb && thumb.tagName === 'IMG') {
    const span = document.createElement('span');
    span.id        = 'customLogoThumb';
    span.style.fontSize = '28px';
    span.textContent = '📁';
    thumb.replaceWith(span);
  }

  const resetBtn = document.getElementById('btnResetLogo');
  if (resetBtn) resetBtn.style.display = 'none';

  if (SERVER_STATE.defaultLogo) {
    setInvLogo(SERVER_STATE.defaultLogo + '?v=' + Date.now());
  }
  showToast('Kembali ke logo default.');
}

// ── Stamp handling ────────────────────────────────────────────

async function uploadStamp(input) {
  const file = input.files[0];
  if (!file) return;

  const fd = new FormData();
  fd.append('stamp', file);

  try {
    const res  = await fetch('/upload/stamp', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) {
      const cacheBust = data.url + '?v=' + Date.now();

      // Update form box
      const box   = document.getElementById('stampBox');
      const ph    = document.getElementById('stampPlaceholder');
      const thumb = document.getElementById('stampThumb');
      const label = document.getElementById('stampLabel');

      if (ph) ph.style.display = 'none';
      thumb.src          = cacheBust;
      thumb.style.display = '';
      label.textContent  = 'Stempel tersimpan ✓\nKlik untuk ganti';
      label.style.display = '';

      // Update invoice preview
      const invStamp = document.getElementById('invStamp');
      const invStampPh = document.getElementById('invStampPlaceholder');
      invStamp.src          = cacheBust;
      invStamp.style.display = '';
      if (invStampPh) invStampPh.style.display = 'none';

      showToast('Stempel berhasil diupload! ✓');
    }
  } catch (err) {
    showToast('Gagal upload stempel. Coba lagi.');
  }
}

// ── Init ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  syncDate();
  renderItems();
});
