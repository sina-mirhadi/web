(() => {
const $ = id => document.getElementById(id);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isHome = !!$('hero');
const fa = v => Number(v).toLocaleString('fa-IR');

/* toast */
window.toast = msg => {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; t.setAttribute('role', 'status');
  document.body.appendChild(t); setTimeout(() => t.remove(), 2800);
};

/* nav */
const nav = document.createElement('header');
nav.className = 'nav' + (isHome ? '' : ' solid');
nav.innerHTML = '<a class="logo" id="logo" data-cur="خونه" href="index.html">سینا</a><nav class="links"><a href="index.html#projects">پروژه‌ها</a><a href="about.html">درباره‌ی من</a><a href="faq.html">سوالات متداول</a><a href="certs.html">گواهی‌ها</a></nav>';
document.body.prepend(nav);
if (isHome) {
  let clicks = 0, timer;
  $('logo').addEventListener('click', e => {
    e.preventDefault(); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    clicks++; clearTimeout(timer); timer = setTimeout(() => clicks = 0, 1500);
    if (clicks >= 5) { toast('لطفا به لوگو فشار نیار.'); clicks = 0; }
  });
}

/* footer */
const f = document.createElement('footer');
f.className = 'footer';
f.innerHTML = `<div class="wrap">
<div class="big" id="big" dir="ltr" data-t="SINA" aria-hidden="true">SINA</div>
<div class="term" dir="ltr"><div id="log"><p>sina@portfolio:~$ help</p><p class="out">commands: help, whoami, ls, coffee, date, clear, sudo hire sina</p></div>
<label class="line"><b>sina@portfolio:~$</b><input id="cmd" autocomplete="off" spellcheck="false" aria-label="ترمینال"></label></div>
<div class="foot-row"><div class="status"><span class="dot"></span><span>ساعت در ایران: <time id="clock">--:--:--</time> <em id="mood"></em></span></div>
<button id="coffee" class="top" type="button">☕ چای هایی که امروز خوردم: <span id="cups"></span></button>
<button id="top" class="top" type="button">بازگشت به بالا ↑</button></div>
<small>© <span id="year"></span>ساخته شده با ☕ توسط سینا</small></div>`;
document.body.appendChild(f);
$('year').textContent = new Date().getFullYear();
$('top').addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

const fmt = new Intl.DateTimeFormat('fa-IR', { timeZone: 'Asia/Tehran', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
const hrFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tehran', hour: '2-digit', hour12: false });
const tick = () => {
  const d = new Date(); $('clock').textContent = fmt.format(d);
  const h = parseInt(hrFmt.format(d), 10) % 24;
  // $('mood').textContent = h < 6 ? '(احتمالا اشکال‌زدایی می‌کنم)' : '()';
};
tick(); setInterval(tick, 1000);

const big = $('big');
big.addEventListener('pointermove', e => {
  const r = big.getBoundingClientRect();
  big.style.setProperty('--mx', e.clientX - r.left + 'px'); big.style.setProperty('--my', e.clientY - r.top + 'px');
});
big.addEventListener('pointerleave', () => { big.style.setProperty('--mx', '-300px'); big.style.setProperty('--my', '-300px'); });

/* coffee counter */
let cups = 3;
try { cups = parseInt(localStorage.getItem('cups'), 10) || 3; } catch {}
const showCups = () => { $('cups').textContent = fa(cups); try { localStorage.setItem('cups', cups); } catch {} };
showCups();
const addCup = () => { cups++; showCups(); };
$('coffee').addEventListener('click', addCup);

/* terminal */
const log = $('log'), cmd = $('cmd');
const say = (t, cls) => { const p = document.createElement('p'); p.textContent = t; p.dir = 'auto'; if (cls) p.className = cls; log.appendChild(p); log.scrollTop = log.scrollHeight; };
const CMDS = {
  help: () => 'commands: help, whoami, ls, coffee, date, clear, sudo hire sina',
  whoami: () => 'sina: توسعه‌دهنده‌ی وب، سازنده‌ی بات، مصرف‌کننده‌ی قهوه',
  ls: () => 'projects/ (به‌زودی)  about.html  faq.html  certs.html  coffee.log',
  coffee: () => { addCup(); return '☕ یک فنجان دیگه اضافه شد. جمع: ' + fa(cups); },
  date: () => new Date().toString(),
  'sudo hire sina': () => '[sudo] password: ********\nدسترسی تایید شد. برای پیام دادن، تلگرام رو امتحان کن. فقط اول باید دکمه‌ی «ارتباط با من» رو بگیری.'
};
cmd.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const v = cmd.value.trim().replace(/\s+/g, ' '); cmd.value = '';
  say('sina@portfolio:~$ ' + v);
  if (!v) return;
  if (v === 'clear') { log.innerHTML = ''; return; }
  const fn = CMDS[v.toLowerCase()];
  say(fn ? fn() : `command not found: ${v}. دستور help رو امتحان کن.`, 'out');
});

/* tab title, console, scroll, konami */
const title = document.title;
document.addEventListener('visibilitychange', () => { document.title = document.hidden ? 'برگرد، من اینجام' : title; });
console.log('%cسلام همکار 👋', 'font:700 16px sans-serif;color:#4C8DFF');
console.log('حالا که اینجایی، بیا با هم کار کنیم. راه ارتباطی: تلگرام. فقط اول باید دکمه‌ی «ارتباط با من» رو بگیری :)');

let lastY = scrollY, lastT = performance.now(), cool = 0;
addEventListener('scroll', () => {
  const n = performance.now(), dy = Math.abs(scrollY - lastY), dt = n - lastT;
  if (dt > 0 && dy / dt > 4 && n > cool) { toast('آروم‌تر، پروژه‌ها فرار نمی‌کنن. (برخلاف دکمه)'); cool = n + 15000; }
  lastY = scrollY; lastT = n;
}, { passive: true });

const KON = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let ki = 0;
addEventListener('keydown', e => {
  if (e.target === cmd) return;
  ki = e.key === KON[ki] ? ki + 1 : (e.key === KON[0] ? 1 : 0);
  if (ki < KON.length) return;
  ki = 0; toast('حالت مخفی فعال شد.');
  if (reduce) return;
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('div'), s = 14 + Math.random() * 26;
    c.className = 'cube';
    c.style.cssText = `left:${Math.random() * 100}vw;width:${s}px;height:${s}px;--c:${['#4C8DFF', '#8FB8FF', '#fff'][i % 3]};--d:${2.5 + Math.random() * 2.5}s;animation-delay:${Math.random() * 1.5}s`;
    document.body.appendChild(c); setTimeout(() => c.remove(), 7000);
  }
});

/* ---------- cursor, magnetic buttons, spotlight + tilt, reveal ---------- */
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
if (fine) {
  const dot = document.createElement('div'), ring = document.createElement('div');
  dot.className = 'cur-dot'; ring.className = 'cur-ring'; ring.innerHTML = '<span></span>';
  document.body.append(ring, dot); document.documentElement.classList.add('has-cur');
  let x = -50, y = -50, rx = -50, ry = -50;
  addEventListener('pointermove', e => {
    x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`;
    const t = e.target.closest && e.target.closest('[data-cur],a,button,summary');
    ring.classList.toggle('big', !!t); ring.classList.toggle('label', !!(t && t.dataset.cur));
    if (t && t.dataset.cur) ring.firstChild.textContent = t.dataset.cur;
  });
  (function loop() { rx += (x - rx) * 0.18; ry += (y - ry) * 0.18; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
  if (!reduce) document.querySelectorAll('.btn-primary,.top').forEach(el => {
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.25}px ${(e.clientY - r.top - r.height / 2) * 0.35}px`; });
    el.addEventListener('pointerleave', () => el.style.translate = '');
  });
}
document.querySelectorAll('.sk,.cert,details').forEach(el => {
  el.classList.add('spot');
  const tilt = fine && !reduce && el.matches('.sk,.cert');
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--sx', px * 100 + '%'); el.style.setProperty('--sy', py * 100 + '%');
    if (tilt) el.style.transform = `perspective(700px) rotateX(${(0.5 - py) * 9}deg) rotateY(${(px - 0.5) * 9}deg)`;
  });
  el.addEventListener('pointerleave', () => el.style.transform = '');
});
if (!reduce) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
    setTimeout(() => e.target.style.transitionDelay = '0ms', 900);
  }), { threshold: 0.12 });
  document.querySelectorAll('.projects h2,.rot,.progress,.sk,.err,.page > *,.cert,.marquee').forEach((el, i) => {
    el.classList.add('rv'); el.style.transitionDelay = (i % 4) * 80 + 'ms'; io.observe(el);
  });
}
})();
