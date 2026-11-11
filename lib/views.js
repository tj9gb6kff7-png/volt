'use strict';

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// The first audience is the default view.
const AUDIENCES = [
  { id: 'volunteers', label: 'Volunteers' },
  { id: 'staff', label: 'Staff' },
];

const ICONS = {
  megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 9a4 4 0 0 1 0 6"/><path d="M18 6a8 8 0 0 1 0 12"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  group: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 0 1 5 5.8"/>',
  play: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
  lifebuoy: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="m5.6 5.6 3.9 3.9m5 5 3.9 3.9m0-12.8-3.9 3.9m-5 5-3.9 3.9"/>',
  handover: '<path d="M7 7h11l-3-3"/><path d="M17 17H6l3 3"/><path d="M18 7v4"/><path d="M6 17v-4"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/>',
  policy: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><path d="M9 12h7M9 16h7"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
};


const icon = (name, size = 22) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.link}</svg>`;

const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';
const face = (family, file, weight) =>
  [['latin', LATIN], ['latin-ext', LATIN_EXT]]
    .map(
      ([subset, range]) =>
        `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};font-display:swap;src:url(/fonts/${file}-${subset}-${weight}-normal.woff2) format("woff2");unicode-range:${range}}`
    )
    .join('\n');
const FONT_CSS = [face('Inter', 'inter', 900), face('Ubuntu', 'ubuntu', 400), face('Ubuntu', 'ubuntu', 500), face('Ubuntu', 'ubuntu', 700)].join('\n');

const DARK_TOKENS =
  '--bg:#1a0a2e;--surface:#452075;--inset:#1a0a2e;--ink:#fff;--muted:#d9cdea;--line:#623a96;--hero:#1a0a2e;' +
  '--thumb:#fdc220;--thumb-ink:#1a0a2e;--btn:#fdc220;--btn-ink:#1a0a2e;--btn-hover:#ffd457;--tile-mix:100%;--tile-ink:#1a0a2e;--focus:#82d0f4;--shadow:rgba(0,0,0,.35)';

const BASE_CSS = `
${FONT_CSS}
:root{--yellow:#fdc220;--green:#1bbe6f;--blue:#82d0f4;--red:#e63e12;--purple:#502379;
--bg:#f6f3fa;--surface:#fff;--inset:#f6f3fa;--ink:#1d1230;--muted:#5b5170;--line:#e4dcef;--hero:#502379;
--thumb:#502379;--thumb-ink:#fff;--btn:#502379;--btn-ink:#fff;--btn-hover:#3a1859;--tile-mix:28%;--tile-ink:#3a1859;--focus:#1b8fd6;--shadow:rgba(58,24,89,.14)}
:root[data-theme=dark]{${DARK_TOKENS}}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){${DARK_TOKENS}}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:400 16px/1.5 Ubuntu,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
h1,h2,.brand{font-family:Inter,"Arial Black","Helvetica Neue",Arial,sans-serif;font-weight:900}
a{color:inherit}
:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
.topbar{background:var(--hero);color:#fff}
.topbar-inner{max-width:1040px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.stripe{height:4px;background:linear-gradient(90deg,var(--yellow) 0 25%,var(--green) 0 50%,var(--blue) 0 75%,var(--red) 0)}
.brand{font-size:18px;letter-spacing:-.01em;display:flex;align-items:center;gap:10px}
.brand-dot{width:10px;height:10px;border-radius:50%;background:var(--yellow)}
.tools{display:flex;align-items:center;gap:10px;font-size:14px;flex-wrap:wrap}
.tools form{display:flex;align-items:center;gap:10px;margin:0}
.tools span{opacity:.9;overflow-wrap:anywhere}
.ghost{display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:14px;font-weight:500;color:#fff;background:transparent;border:1.5px solid rgba(255,255,255,.55);border-radius:8px;padding:6px 12px;cursor:pointer}
.ghost:hover{background:rgba(255,255,255,.14)}
.wrap{max-width:1040px;margin:0 auto;padding:0 20px}
.btn{font:inherit;font-weight:700;border:0;border-radius:10px;padding:12px 18px;background:var(--btn);color:var(--btn-ink);cursor:pointer}
.btn:hover{background:var(--btn-hover)}
.email{font-weight:500;user-select:all;-webkit-user-select:all;overflow-wrap:anywhere}
`;

const HEAD_JS = `(function(){try{var t=localStorage.getItem('volt-hub-theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}})();`;

const SHARED_JS = `
(function(){
  var root=document.documentElement,btn=document.querySelector('[data-theme-toggle]');
  function isDark(){return root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches}
  function label(){if(btn){btn.querySelector('span').textContent=isDark()?'Light mode':'Dark mode';btn.setAttribute('aria-pressed',isDark())}}
  if(btn)btn.addEventListener('click',function(){
    var next=isDark()?'light':'dark';root.dataset.theme=next;
    try{localStorage.setItem('volt-hub-theme',next)}catch(e){}
    label();
  });
  label();
  [].forEach.call(document.querySelectorAll('[data-copy]'),function(b){
    var text=b.querySelector('span'),orig=text.textContent,timer;
    b.addEventListener('click',function(){
      var value=b.dataset.copy;
      function done(ok){text.textContent=ok?'Copied':'Press Ctrl+C';clearTimeout(timer);timer=setTimeout(function(){text.textContent=orig},1800)}
      function fallback(){
        var el=b.parentNode.querySelector('.email'),r=document.createRange();r.selectNodeContents(el);
        var s=getSelection();s.removeAllRanges();s.addRange(r);
        var ok=false;try{ok=document.execCommand('copy')}catch(e){}
        done(ok);
      }
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(value).then(function(){done(true)},fallback);
      else fallback();
    });
  });
})();
`;

function topbar(extra = '') {
  return `<header class="topbar"><div class="topbar-inner">
  <div class="brand"><span class="brand-dot"></span>Volt Europa · HR Hub</div>
  <div class="tools">
    <button type="button" class="ghost" data-theme-toggle aria-pressed="false">${icon('moon', 16)}<span>Dark mode</span></button>
    ${extra}
  </div>
</div></header>
<div class="stripe"></div>`;
}

function page({ title, css, body, script = '', nonce }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="color-scheme" content="light dark">
<title>${esc(title)}</title>
<script nonce="${nonce}">${HEAD_JS}</script>
<style nonce="${nonce}">${BASE_CSS}${css}</style>
</head>
<body>
${body}
<script nonce="${nonce}">${SHARED_JS}${script}</script>
</body>
</html>`;
}

const LOGIN_CSS = `
.login{min-height:calc(100vh - 62px);display:grid;place-items:center;padding:32px 20px}
.box{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:32px;max-width:440px;width:100%}
.box h1{margin:0 0 10px;font-size:40px;line-height:1.05;letter-spacing:-.02em}
.box p{margin:0 0 20px;color:var(--muted)}
.note{border-radius:10px;padding:12px 14px;margin-bottom:20px;font-size:15px}
.note.error{background:#fdecec;color:#8a1c1c;border:1px solid #f3c2c2}
.small{font-size:14px;margin:20px 0 0!important}
.small .email{color:var(--ink)}
.gbtn{display:flex;align-items:center;justify-content:center;gap:10px;text-decoration:none;background:#fff;color:#1d1230;border:1.5px solid #b9add0}
.gbtn:hover{background:#f6f3fa;border-color:var(--purple)}
`;

function loginPage({ nonce, error }) {
  const body = `
${topbar()}
<main class="login">
  <div class="box">
    <h1>Sign in</h1>
    <p>The HR Hub is open to anyone with an @volteuropa.org account. Sign in with your Volt Google account, no password or code needed.</p>
    ${error ? `<div class="note error" role="alert">${esc(error)}</div>` : ''}
    <a class="btn gbtn" href="/auth/google">
      <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.6 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.6 5.9c4.5-4.1 7-10.2 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.2C1 16.5 0 20.1 0 24s1 7.5 2.6 10.8l7.9-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.2-13.5-9.9l-7.9 6.2C6.5 42.6 14.6 48 24 48z"/></svg>
      Sign in with Google
    </a>
    <p class="small">Trouble signing in? Write to <span class="email">help@volteuropa.org</span></p>
  </div>
</main>`;
  return page({ title: 'Sign in · Volt HR Hub', css: LOGIN_CSS, body, nonce });
}

const DASH_CSS = `
.hero{background:var(--hero);color:#fff;padding:36px 0 52px}
.hero h1{margin:0 0 10px;font-size:clamp(44px,9vw,84px);line-height:.95;letter-spacing:-.035em}
.hero p{margin:0;opacity:.9;max-width:60ch;font-size:17px}
.switch-row{margin-top:-20px;display:flex;justify-content:center;padding:0 20px}
.switch{position:relative;display:grid;grid-template-columns:1fr 1fr;background:var(--surface);border:1px solid var(--line);border-radius:999px;padding:4px;width:100%;max-width:250px;box-shadow:0 6px 20px var(--shadow)}
.switch button{position:relative;z-index:1;font:inherit;font-size:14px;font-weight:700;border:0;background:transparent;color:var(--muted);padding:6px 8px;border-radius:999px;cursor:pointer;transition:color .25s}
.switch button[aria-selected=true]{color:var(--thumb-ink)}
.thumb{position:absolute;top:4px;bottom:4px;left:4px;width:calc(50% - 4px);border-radius:999px;background:var(--thumb);transition:transform .35s cubic-bezier(.4,0,.2,1)}
.switch[data-active=staff] .thumb{transform:translateX(100%)}
.viewport{overflow:hidden}
.track{display:flex;width:200%;align-items:flex-start;transition:transform .4s cubic-bezier(.4,0,.2,1)}
.track[data-active=staff]{transform:translateX(-50%)}
.panel{width:50%;padding:30px 20px 8px}
.panel-inner{max-width:1000px;margin:0 auto}
.section{margin-bottom:32px;--accent:var(--yellow)}
.section:nth-of-type(4n+2){--accent:var(--green)}
.section:nth-of-type(4n+3){--accent:var(--blue)}
.section:nth-of-type(4n+4){--accent:var(--red)}
.section h2{font-size:24px;line-height:1.15;letter-spacing:-.02em;margin:0 0 14px;display:flex;align-items:center;gap:10px}
.section h2::before{content:"";width:12px;height:12px;border-radius:50%;background:var(--accent);flex:none}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
.card{display:flex;gap:14px;align-items:flex-start;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:18px;text-decoration:none;transition:border-color .15s,box-shadow .15s,transform .15s}
.card:hover{border-color:var(--accent);box-shadow:0 6px 18px var(--shadow);transform:translateY(-2px)}
.ico{flex:none;width:42px;height:42px;border-radius:11px;display:grid;place-items:center;background:color-mix(in srgb,var(--accent) var(--tile-mix),#fff);color:var(--tile-ink)}
.card strong,.contact strong{display:block;font-size:17px;font-weight:700;line-height:1.3;margin-bottom:3px}
.card small,.contact small{display:block;font-size:14px;color:var(--muted);line-height:1.4}
.contacts{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}
.contact{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:18px}
.copyrow{display:flex;align-items:center;gap:8px;margin-top:12px;background:var(--inset);border:1px solid var(--line);border-radius:10px;padding:6px 6px 6px 12px}
.copyrow .email{flex:1;min-width:0;font-size:16px}
.copy{display:inline-flex;align-items:center;gap:6px;flex:none;font:inherit;font-size:14px;font-weight:700;border:0;border-radius:8px;padding:7px 12px;background:var(--btn);color:var(--btn-ink);cursor:pointer}
.copy:hover{background:var(--btn-hover)}
.empty{color:var(--muted)}
@media (max-width:480px){.copyrow{flex-direction:column;align-items:stretch;padding:10px 10px 8px}.copy{justify-content:center}}
.foot{padding:8px 20px 40px;color:var(--muted);font-size:14px;text-align:center}
.foot .email{color:var(--ink)}
@media (prefers-reduced-motion:reduce){.track,.thumb,.card,.switch button{transition:none}}
`;

const DASH_JS = `
(function(){
  var ids=${JSON.stringify(AUDIENCES.map((a) => a.id))};
  var sw=document.querySelector('.switch'),track=document.querySelector('.track');
  var tabs=[].slice.call(sw.querySelectorAll('[role=tab]'));
  function show(id,focus){
    if(ids.indexOf(id)<0)id=ids[0];
    sw.dataset.active=id;track.dataset.active=id;
    tabs.forEach(function(t){
      var on=t.dataset.id===id;
      t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;
      document.getElementById('panel-'+t.dataset.id).inert=!on;
      if(on&&focus)t.focus();
    });
    if(location.hash.slice(1)!==id)history.replaceState(null,'','#'+id);
  }
  tabs.forEach(function(t){
    t.addEventListener('click',function(){show(t.dataset.id)});
    t.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();show(ids[(ids.indexOf(t.dataset.id)+1)%2],true)}
    });
  });
  var x0=null,y0=null;
  track.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
  track.addEventListener('touchend',function(e){
    if(x0===null)return;
    var dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;
    if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)show(ids[dx<0?1:0]);
  },{passive:true});
  window.addEventListener('hashchange',function(){show(location.hash.slice(1))});
  track.style.transition='none';
  show(location.hash.slice(1)||ids[0]);
  requestAnimationFrame(function(){requestAnimationFrame(function(){track.style.transition=''})});
})();
`;

function card(link) {
  return `<a class="card" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">
          <span class="ico">${icon(link.icon)}</span>
          <span><strong>${esc(link.title)}</strong><small>${esc(link.description || '')}</small></span>
        </a>`;
}

function contact(c) {
  return `<div class="contact">
          <strong>${esc(c.title)}</strong><small>${esc(c.description || '')}</small>
          <div class="copyrow">
            <span class="email">${esc(c.email)}</span>
            <button type="button" class="copy" data-copy="${esc(c.email)}" aria-label="Copy ${esc(c.email)}">${icon('copy', 16)}<span>Copy</span></button>
          </div>
        </div>`;
}

const forAudience = (items, id) => (items || []).filter((i) => (i.audience || []).includes(id));

function panel(audience, content) {
  const blocks = (content.sections || [])
    .map((s) => ({ title: s.title, links: forAudience(s.links, audience.id) }))
    .filter((s) => s.links.length)
    .map(
      (s) => `<section class="section">
        <h2>${esc(s.title)}</h2>
        <div class="grid">
        ${s.links.map(card).join('\n        ')}
        </div>
      </section>`
    );
  const contacts = forAudience(content.contacts, audience.id);
  if (contacts.length) {
    blocks.unshift(`<section class="section">
        <h2>Contacts</h2>
        <div class="contacts">
        ${contacts.map(contact).join('\n        ')}
        </div>
      </section>`);
  }
  return `<div class="panel" id="panel-${audience.id}" role="tabpanel" aria-labelledby="tab-${audience.id}">
      <div class="panel-inner">
      ${blocks.join('\n      ') || `<p class="empty">No links for ${esc(audience.label.toLowerCase())} yet.</p>`}
      </div>
    </div>`;
}

function dashboardPage({ nonce, email, content }) {
  const user = email
    ? `<form method="post" action="/logout"><span>${esc(email)}</span><button class="ghost" type="submit">Sign out</button></form>`
    : '';
  const first = AUDIENCES[0].id;
  const body = `
${topbar(user)}
<div class="hero"><div class="wrap">
  <h1>HR quick links</h1>
  <p>Forms, tutorials and contacts from the HR team. Pick your side.</p>
</div></div>
<div class="switch-row">
  <div class="switch" role="tablist" aria-label="Audience" data-active="${first}">
    <span class="thumb" aria-hidden="true"></span>
    ${AUDIENCES.map(
      (a, i) =>
        `<button type="button" role="tab" id="tab-${a.id}" data-id="${a.id}" aria-controls="panel-${a.id}" aria-selected="${i === 0}">${a.label}</button>`
    ).join('\n    ')}
  </div>
</div>
<main class="viewport">
  <div class="track" data-active="${first}">
    ${AUDIENCES.map((a) => panel(a, content)).join('\n    ')}
  </div>
</main>
<footer class="foot">Something missing or out of date? Write to <span class="email">humanresources@volteuropa.org</span></footer>`;
  return page({ title: 'Volt HR Hub', css: DASH_CSS, body, script: DASH_JS, nonce });
}

module.exports = { loginPage, dashboardPage, AUDIENCES };
