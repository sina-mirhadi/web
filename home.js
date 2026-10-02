(() => {
const $ = id => document.getElementById(id);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hero = $('hero'), wrap = $('escape'), btn = $('contactBtn'), tip = $('tip'), tg = $('tgBtn');

/* ---------- 3D: liquid iridescent blob (custom shader) ---------- */
if (window.THREE) {
  const renderer = new THREE.WebGLRenderer({ canvas: $('scene'), antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100); camera.position.z = 9;
  const group = new THREE.Group(); scene.add(group);
  const U = { uT: { value: 0 }, uM: { value: 0 } };
  const vs = `
    uniform float uT, uM; varying vec3 vN, vV; varying float vD;
    float h(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
    float n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
      return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
    vec3 disp(vec3 d){float k=n(d*1.6+uT*.35)*(.5+uM*.7)+n(d*3.4-uT*.5)*.2;return d*(1.6+k);}
    void main(){
      vec3 d=normalize(position);
      vec3 t1=normalize(cross(d,vec3(0.,1.,.001))); vec3 t2=normalize(cross(d,t1));
      vec3 p0=disp(d), p1=disp(normalize(d+t1*.01)), p2=disp(normalize(d+t2*.01));
      vec3 N=normalize(cross(p1-p0,p2-p0));
      vD=length(p0)-1.6;
      vec4 mv=modelViewMatrix*vec4(p0,1.);
      vN=normalize(normalMatrix*N); vV=-mv.xyz;
      gl_Position=projectionMatrix*mv;
    }`;
  const fs = `
    uniform float uT; varying vec3 vN, vV; varying float vD;
    void main(){
      vec3 N=normalize(vN), V=normalize(vV);
      float f=pow(1.-max(dot(N,V),0.),2.2);
      vec3 base=mix(vec3(.04,.10,.26),vec3(.22,.45,.95),vD*1.3+.2);
      float s=f*2.+vD*1.8+uT*.12;
      vec3 irid=(.5+.5*cos(6.283*(vec3(0.,.33,.67)*.6+s)))*vec3(.6,.82,1.);
      vec3 col=mix(base,irid,f*.85)+pow(f,3.)*vec3(.55,.75,1.);
      vec3 H=normalize(normalize(vec3(.5,.8,.7))+V);
      col+=pow(max(dot(N,H),0.),70.)*.9;
      gl_FragColor=vec4(col,1.);
    }`;
  const blob = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), new THREE.ShaderMaterial({ uniforms: U, vertexShader: vs, fragmentShader: fs }));
  group.add(blob);
  const N = 300, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 4 + Math.random() * 7, a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1);
    pos.set([r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a), r * Math.cos(b)], i * 3);
  }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0x8fb8ff, size: 0.045, transparent: true, opacity: 0.7 }));
  scene.add(dust);

  const m = { x: 0, y: 0 }, vel = { v: 0 }; let lx = 0, ly = 0, base = { x: 0, y: 0, s: 1 };
  addEventListener('pointermove', e => {
    m.x = e.clientX / innerWidth - 0.5; m.y = e.clientY / innerHeight - 0.5;
    vel.v = Math.min(1, vel.v + Math.hypot(e.clientX - lx, e.clientY - ly) / 220); lx = e.clientX; ly = e.clientY;
  });
  const resize = () => {
    const w = hero.clientWidth, h = hero.clientHeight, wide = w > 900;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    base = wide ? { x: -3.6, y: 0, s: 1.3 } : { x: 0, y: 1.7, s: 0.8 };
  };
  addEventListener('resize', resize); resize();
  let visible = true;
  new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(hero);
  const clock = new THREE.Clock(); let tt = 0;
  const draw = () => {
    tt += clock.getDelta() * (window.__boost || 1);
    U.uT.value = tt; vel.v *= 0.94; U.uM.value += (vel.v - U.uM.value) * 0.08;
    const sc = Math.min(scrollY / hero.clientHeight, 1);
    group.position.set(base.x, base.y + sc * 2.2, 0); group.scale.setScalar(base.s * (1 - sc * 0.35));
    group.rotation.y += (m.x * 0.9 - group.rotation.y) * 0.05;
    group.rotation.x += (m.y * 0.6 - group.rotation.x) * 0.05;
    blob.rotation.y = tt * 0.15; dust.rotation.y = tt * 0.02;
    renderer.render(scene, camera);
  };
  const frame = () => { requestAnimationFrame(frame); if (visible) draw(); };
  reduce ? draw() : frame();
}

/* ---------- escaping contact button ---------- */
const slot = document.querySelector('.ghost'), countEl = $('count');
const touch = matchMedia('(hover: none)').matches;
const fa = v => Number(v).toLocaleString('fa-IR');
const TIPS = ['فعلا شماره‌ای ازم در دسترس نیست. از طریق تلگرام با هم در ارتباط باشیم.', 'شماره‌ام فعلا در دسترس نیست. ایمیل هم همین‌طور.', 'کبوتر نامه‌بر در تعمیره. تلگرام بهتره.', 'از طریق تلگرام در ارتباط باشیم. قول می‌دم اون یکی فرار نکنه.'];
let cur = { x: 0, y: 0 }, escaped = false, busy = false, tipTimer, pointer = { x: -999, y: -999 }, n = 0, surrendered = false, tapped = false, lastD = 999;
const rel = el => { const r = el.getBoundingClientRect(), h = hero.getBoundingClientRect(); return { x: r.left - h.left, y: r.top - h.top, w: r.width, h: r.height }; };
const T = p => `translate(${p.x}px,${p.y}px)`;
const apply = p => { cur = p; wrap.style.transform = T(p); };
const home = () => { const s = rel(slot); apply({ x: s.x, y: s.y }); };
home();
addEventListener('load', () => { if (!escaped) home(); });
addEventListener('resize', () => {
  if (!escaped) return home();
  const b = rel(wrap);
  apply({ x: Math.min(cur.x, hero.clientWidth - b.w - 12), y: Math.min(cur.y, hero.clientHeight - b.h - 12) });
});
const hit = (a, b, pad) => a.x < b.x + b.w + pad && a.x + a.w > b.x - pad && a.y < b.y + b.h + pad && a.y + a.h > b.y - pad;

function pickSpot() {
  const W = hero.clientWidth, H = hero.clientHeight, b = rel(wrap), hr = hero.getBoundingClientRect();
  const copy = rel(document.querySelector('.copy'));
  let best = null, bestD = -1;
  for (let i = 0; i < 50; i++) {
    const p = { x: 12 + Math.random() * (W - b.w - 24), y: 70 + Math.random() * (H - b.h - 90), w: b.w, h: b.h };
    if (hit(p, copy, 16)) continue;
    const d = Math.hypot(p.x + b.w / 2 - (pointer.x - hr.left), p.y + b.h / 2 - (pointer.y - hr.top));
    if (d > bestD) { bestD = d; best = p; }
    if (d > 280 && i > 8) break;
  }
  lastD = bestD;
  return best || { x: 12, y: H - b.h - 20 };
}

function effect(b) {
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  [0, 120].forEach(delay => {
    const r = document.createElement('span');
    r.className = 'ring'; r.style.cssText = `left:${cx}px;top:${cy}px`;
    hero.appendChild(r);
    r.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: .9 }, { transform: 'translate(-50%,-50%) scale(9)', opacity: 0 }],
      { duration: 700, delay, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'backwards' }).onfinish = () => r.remove();
  });
  for (let i = 0; i < 16; i++) {
    const s = document.createElement('span');
    s.className = 'spark'; s.style.cssText = `left:${cx}px;top:${cy}px;${i % 3 ? '' : 'background:#fff'}`;
    hero.appendChild(s);
    const a = Math.random() * 6.283, d = 40 + Math.random() * 90;
    s.animate([{ transform: 'translate(-50%,-50%)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(a) * d}px),calc(-50% + ${Math.sin(a) * d}px)) scale(.2)`, opacity: 0 }],
      { duration: 600 + Math.random() * 300, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => s.remove();
  }
}

const setTip = t => { tip.textContent = t; };
function showTip() {
  tip.classList.toggle('below', cur.y < 130);
  tip.classList.add('show');
  clearTimeout(tipTimer);
  tipTimer = setTimeout(() => tip.classList.remove('show'), 3400);
  tg.classList.add('show'); tg.tabIndex = 0;
}
function surrender() {
  surrendered = true;
  btn.textContent = 'باشه، تو بردی';
  setTip('باشه، تو بردی. حالا کلیک کن.'); showTip();
}

function jump() {
  if (busy || surrendered) return;
  busy = true; escaped = true; n++;
  // countEl.textContent = `(n >= 5 ? ' — خسته شو حاجی' : '')`;
  const next = pickSpot();
  setTip(n > 1 && lastD < 200 ? 'ببخشید! از بالای سرت رد می‌شم.' : TIPS[(n - 1) % TIPS.length]);
  showTip();
  const done = () => { busy = false; if (n >= 10) surrender(); };
  if (reduce) { apply(next); done(); return; }
  effect(rel(wrap));
  const out = wrap.animate([{ transform: `${T(cur)} scale(1)`, filter: 'blur(0)', opacity: 1 },
    { transform: `${T(cur)} scale(.7)`, filter: 'blur(10px)', opacity: 0 }], { duration: 220, easing: 'ease-in', fill: 'forwards' });
  out.onfinish = () => {
    apply(next);
    wrap.animate([{ transform: `${T(next)} scale(1.25)`, filter: 'blur(10px)', opacity: 0 },
      { transform: `${T(next)} scale(1)`, filter: 'blur(0)', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.9,.3,1)' }).onfinish = done;
    out.cancel();
  };
}

addEventListener('pointermove', e => {
  pointer = { x: e.clientX, y: e.clientY };
  if (touch || busy || surrendered) return;
  const r = wrap.getBoundingClientRect(), m = 70;
  if (e.clientX > r.left - m && e.clientX < r.right + m && e.clientY > r.top - m && e.clientY < r.bottom + m) jump();
});
btn.addEventListener('pointerdown', e => { pointer = { x: e.clientX, y: e.clientY }; if (!touch && !surrendered) jump(); });
btn.addEventListener('click', () => {
  if (surrendered || (touch && tapped)) return modal.showModal();
  if (touch) { tapped = true; setTip('روی موبایل فرار نمی‌کنم، خسته‌ام. دوباره بزن.'); showTip(); return; }
  jump();
});
btn.addEventListener('focus', () => { if (btn.matches(':focus-visible')) { setTip('اینجا هم مخفی می‌شم؟'); showTip(); } });

/* ---------- telegram popup ---------- */
const modal = $('tgModal');
tg.addEventListener('click', () => modal.showModal());
$('closeModal').addEventListener('click', () => modal.close());
modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
$('copyBtn').addEventListener('click', async e => {
  const b = e.currentTarget;
  try { await navigator.clipboard.writeText('@ForExampleSina'); b.textContent = 'کپی شد'; }
  catch { b.textContent = 'به‌صورت دستی کپی کنید'; }
  setTimeout(() => b.textContent = 'کپی آیدی', 1800);
});

/* ---------- dizzy shape ---------- */
let hold, ease;
hero.addEventListener('pointerdown', e => {
  if (e.target !== hero && e.target !== $('scene')) return;
  const hr = hero.getBoundingClientRect();
  hold = setTimeout(() => {
    window.__boost = 6;
    const b = document.createElement('div'); b.className = 'bubble'; b.textContent = 'هوی نکن';
    b.style.cssText = `left:${e.clientX - hr.left}px;top:${e.clientY - hr.top}px`;
    hero.appendChild(b); setTimeout(() => b.remove(), 1700);
  }, 700);
});
['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => hero.addEventListener(ev, () => {
  clearTimeout(hold); clearInterval(ease);
  ease = setInterval(() => { window.__boost = Math.max(1, (window.__boost || 1) - 0.2); if (window.__boost <= 1) clearInterval(ease); }, 60);
}));

/* ---------- typewriter ---------- */
const typed = $('typed'), PH = ['چایی دوس دارم.', 'خستمه', 'هرازگاهی بات تلگرامی میزنم.', 'طراح سایتم که هستم.'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  if (reduce) { typed.textContent = PH[0]; return; }
  let pi = 0, first = true;
  for (;;) {
    const s = PH[pi++ % PH.length], bad = first ? Math.floor(s.length * 0.6) : -1; first = false;
    let out = '';
    for (let i = 0; i < s.length; i++) {
      if (i === bad) { typed.textContent = out + 'ت'; await sleep(450); typed.textContent = out; await sleep(250); }
      out += s[i]; typed.textContent = out; await sleep(55);
    }
    await sleep(1900);
    while (out.length) { out = out.slice(0, -1); typed.textContent = out; await sleep(25); }
    await sleep(300);
  }
})();

/* ---------- projects section ---------- */
const R = ['این بخش هنوز درحال تعمیره.', 'اینجا رو بعدا پر میکنم.', 'برو دیگه.'];
let ri = 0; $('rot').textContent = R[0];
setInterval(() => { ri = (ri + 1) % R.length; $('rot').textContent = R[ri]; }, 4500);
let p = 0; const bar = document.querySelector('.bar i'), pl = $('pl');
const pt = setInterval(() => {
  p = Math.min(99, p + Math.random() * 9);
  bar.style.width = p + '%';
  pl.textContent = `Deploy: ${fa(Math.floor(p))}٪` + (p >= 99 ? ' (بزودی . . .)' : '');
  if (p >= 99) clearInterval(pt);
}, 350);
/* ---------- headline word reveal ---------- */
const h1 = document.querySelector('.copy h1');
h1.innerHTML = h1.textContent.split(' ').map((w, i) => `<span class="w" style="animation-delay:${i * 90}ms">${w}</span>`).join(' ');
})();
