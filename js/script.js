// Dynamic brand title and inline text
document.addEventListener('DOMContentLoaded', () => {
  const brandEl = document.getElementById('brand-title');
  const brandInline = document.getElementById('brand-inline');
  const pageTitle = document.title || 'Muhayat Techlabs';
  if (brandEl) brandEl.textContent = pageTitle.toUpperCase();
  if (brandInline) brandInline.textContent = pageTitle;

  // Username greet
  const usernameEl = document.getElementById('username');
  const savedName = localStorage.getItem('visitor_name');
  if (usernameEl) usernameEl.textContent = savedName ? savedName : 'Guest';

  // Highlight nav link on scroll
  const ids = ['home-page','our-profile','portfolio','message-us'];
  const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
  const links = Array.from(document.querySelectorAll('.nav-link'));
  const onScroll = () => {
    const scrollPos = window.scrollY + 120;
    for (let i = sections.length - 1; i >= 0; i--) {
      const sec = sections[i];
      if (sec && sec.offsetTop <= scrollPos) {
        links.forEach(a => a.classList.remove('text-blue-600'));
        const active = document.querySelector(`.nav-link[href="#${sec.id}"]`);
        if (active) active.classList.add('text-blue-600');
        break;
      }
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on scroll
  const revealables = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  revealables.forEach(el => io.observe(el));
});

// Form validation
function validateForm() {
  const nameInput = document.getElementById('name-input');
  const feedback = document.getElementById('form-feedback');
  if (!feedback) return;
  const name = nameInput ? nameInput.value.trim() : '';
  if (name.length < 2) {
    feedback.textContent = 'Nama minimal 2 karakter.';
    feedback.className = 'mt-3 text-sm text-red-600';
    return;
  }
  localStorage.setItem('visitor_name', name);
  feedback.textContent = `Terima kasih, ${name}. Pesan Anda telah terkirim.`;
  feedback.className = 'mt-3 text-sm text-green-600';
  if (nameInput) nameInput.value = '';
}


// ===== Message Us: validation & output =====
(function() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameEl = document.getElementById('name-input');
  const dobEl = document.getElementById('dob-input');
  const genderEl = document.getElementById('gender-input');
  const msgEl = document.getElementById('msg-input');
  const fb = document.getElementById('form-feedback');

  const outTime = document.getElementById('out-time');
  const outName = document.getElementById('out-name');
  const outDob  = document.getElementById('out-dob');
  const outMsg  = document.getElementById('out-msg');

  // Live current time (local)
  function updateTime() {
    try {
      const now = new Date();
      outTime.textContent = now.toLocaleString();
    } catch(e) {
      outTime.textContent = new Date().toString();
    }
  }
  updateTime();
  setInterval(updateTime, 1000);

  function setFeedback(text, isErr=true) {
    if (!fb) return;
    fb.textContent = text;
    fb.className = 'text-sm ' + (isErr ? 'text-red-600' : 'text-green-600');
  }

  function formatDateISOtoLocal(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = (nameEl?.value || '').trim();
    const dob = (dobEl?.value || '').trim();
    const gender = (genderEl?.value || '').trim();
    const msg = (msgEl?.value || '').trim();

    // Validation
    if (name.length < 2) return setFeedback('Nama minimal 2 karakter.', true);
    if (!dob) return setFeedback('Tanggal lahir wajib diisi.', true);
    const dobDate = new Date(dob + 'T00:00:00');
    const today = new Date(); today.setHours(0,0,0,0);
    if (isNaN(dobDate.getTime())) return setFeedback('Format tanggal lahir tidak valid.', true);
    if (dobDate > today) return setFeedback('Tanggal lahir tidak boleh di masa depan.', true);
    if (!gender) return setFeedback('Pilih jenis kelamin.', true);
    if (msg.length < 10) return setFeedback('Pesan minimal 10 karakter.', true);

    // Success: update output
    outName.textContent = name;
    outDob.textContent  = formatDateISOtoLocal(dob);
    outMsg.textContent  = msg;

    // Persist minimal data
    try { localStorage.setItem('visitor_name', name); } catch {}

    setFeedback('Data berhasil dikirim.', false);

    // Optional: reset form
    form.reset();
  });
})();


// ===== Visitor Name Modal =====
(function() {
  const modal = document.getElementById('visitor-modal');
  const input = document.getElementById('visitor-name-input');
  const btn = document.getElementById('visitor-submit');
  const usernameEl = document.getElementById('username');

  function setName(name) {
    localStorage.setItem('visitor_name', name);
    if (usernameEl) usernameEl.textContent = name;
  }

  // If name already exists in localStorage, skip modal
  const saved = localStorage.getItem('visitor_name');
  if (saved) {
    if (modal) modal.style.display = 'none';
    if (usernameEl) usernameEl.textContent = saved;
  }

  if (btn && input) {
    btn.addEventListener('click', () => {
      const val = input.value.trim();
      if (val.length < 2) {
        input.classList.add('ring-2','ring-red-500');
        return;
      }
      setName(val);
      if (modal) modal.style.display = 'none';
    });
  }
})();



// ===== Visitor Modal (first visit) =====
(function(){
  const modal = document.getElementById('visitor-modal');
  const form = document.getElementById('visitor-modal-form');
  const input = document.getElementById('visitor-modal-input');
  const skipBtn = document.getElementById('visitor-modal-skip');
  const closeBtn = document.getElementById('visitor-modal-close');
  const fb = document.getElementById('visitor-modal-feedback');
  const usernameSpan = document.getElementById('username');

  function setName(name){
    try { localStorage.setItem('visitor_name', name); } catch {}
    if (usernameSpan) usernameSpan.textContent = name || 'Guest';
  }

  // Show modal if no saved name
  let saved = null;
  try { saved = localStorage.getItem('visitor_name'); } catch {}
  if (!saved || saved.trim().length < 2){
    if (modal) modal.classList.remove('hidden');
    setName('Guest');
  } else {
    setName(saved.trim());
  }

  if (form){
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = (input?.value || '').trim();
      if (name.length < 2){
        if (fb){ fb.textContent = 'Nama minimal 2 karakter.'; fb.className = 'text-xs text-red-600'; }
        return;
      }
      setName(name);
      if (modal) modal.classList.add('hidden');
    });
  }
  if (skipBtn){
    skipBtn.addEventListener('click', ()=>{
      setName('Guest');
      if (modal) modal.classList.add('hidden');
    });
  }
  if (closeBtn){
    closeBtn.addEventListener('click', ()=>{
      if (modal) modal.classList.add('hidden');
    });
  }
})();

// ===== First-visit Visitor Modal =====
(function(){
  const usernameSpan = document.getElementById('username');
  function setName(name){
    try { localStorage.setItem('visitor_name', name); } catch {}
    if (usernameSpan) usernameSpan.textContent = name || 'Guest';
  }
  // initial greeting from storage
  let saved = null;
  try { saved = localStorage.getItem('visitor_name'); } catch {}
  setName(saved && saved.trim().length >= 2 ? saved.trim() : 'Guest');

  const modal = document.getElementById('visitor-modal');
  const form  = document.getElementById('visitor-modal-form');
  const input = document.getElementById('visitor-modal-input');
  const skip  = document.getElementById('visitor-modal-skip');
  const fb    = document.getElementById('visitor-modal-fb');

  function openModal(){
    if (!modal) return;
    modal.classList.remove('hidden');
    document.documentElement.classList.add('modal-open');
    setTimeout(() => { try { input && input.focus(); } catch(e){} }, 50);
  }
  function closeModal(){
    if (!modal) return;
    modal.classList.add('hidden');
    document.documentElement.classList.remove('modal-open');
  }

  // Show only on first visit (no valid name saved)
  if (!(saved && saved.trim().length >= 2)) {
    openModal();
  }

  if (form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (input?.value || '').trim();
      if (name.length < 2){
        if (fb){ fb.textContent = 'Nama minimal 2 karakter.'; fb.className = 'text-[12px] text-red-600 mt-1'; }
        return;
      }
      if (fb){ fb.textContent = 'Tersimpan. Selamat datang!'; fb.className = 'text-[12px] text-green-600 mt-1'; }
      setName(name);
      closeModal();
    });
  }
  if (skip){
    skip.addEventListener('click', () => {
      setName('Guest');
      closeModal();
    });
  }

  // Close modal on backdrop click
  if (modal){
    modal.addEventListener('click', (e) => {
      if (e.target === modal) { // click on overlay
        setName('Guest');
        closeModal();
      }
    });
  }
})();
