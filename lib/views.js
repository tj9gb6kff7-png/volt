'use strict';

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const AUDIENCES = [
  { id: 'staff', label: 'Staff' },
  { id: 'volunteers', label: 'Volunteers' },
];

const ICONS = {
  megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 9a4 4 0 0 1 0 6"/><path d="M18 6a8 8 0 0 1 0 12"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  group: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 0 1 5 5.8"/>',
  play: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
  lifebuoy: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="m5.6 5.6 3.9 3.9m5 5 3.9 3.9m0-12.8-3.9 3.9m-5 5-3.9 3.9"/>',
  handover: '<path d="M7 7h11l-3-3"/><path d="M17 17H6l3 3"/><path d="M18 7v4"/><path d="M6 17v-4"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
};

const icon = (name) =>
  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.link}</svg>`;

const BASE_CSS = `
:root{--purple:#502379;--purple-dark:#3a1859;--ink:#1d1230;--muted:#5b5170;--line:#e4dcef;--bg:#f6f3fa;--card:#fff;--yellow:#fdc220;--focus:#1b8fd6}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 Ubuntu,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
a{color:inherit}
:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
.topbar{background:var(--purple);color:#fff}
.topbar-inner{max-width:1040px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.brand{font-weight:700;font-size:18px;letter-spacing:.2px;display:flex;align-items:center;gap:10px}
.brand-dot{width:10px;height:10px;border-radius:50%;background:var(--yellow)}
.wrap{max-width:1040px;margin:0 auto;padding:0 20px}
.btn{font:inherit;font-weight:600;border:0;border-radius:10px;padding:12px 18px;background:var(--purple);color:#fff;cursor:pointer}
.btn:hover{background:var(--purple-dark)}
`;

function page({ title, css, body, nonce }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)}</title>
<style nonce="${nonce}">${BASE_CSS}${css}</style>
</head>
<body>
${body}
</body>
</html>`;
}

const LOGIN_CSS = `
.login{min-height:calc(100vh - 56px);display:grid;place-items:center;padding:32px 20px}
.box{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:32px;max-width:440px;width:100%}
.box h1{margin:0 0 8px;font-size:26px;line-height:1.2}
.box p{margin:0 0 20px;color:var(--muted)}
label{display:block;font-weight:600;margin-bottom:6px}
input[type=email]{width:100%;font:inherit;padding:12px 14px;border:1.5px solid #b9add0;border-radius:10px;margin-bottom:16px;background:#fff;color:var(--ink)}
.box .btn{width:100%}
.note{border-radius:10px;padding:12px 14px;margin-bottom:20px;font-size:15px}
.note.error{background:#fdecec;color:#8a1c1c;border:1px solid #f3c2c2}
.note.ok{background:#eaf7ee;color:#1c5e33;border:1px solid #bfe3ca}
.small{font-size:14px;margin:20px 0 0!important}
`;

function loginPage({ nonce, error, sentTo, email }) {
  const form = `
      <form method="post" action="/login">
        <label for="email">Volt email address</label>
        <input id="email" name="email" type="email" required autocomplete="email" inputmode="email"
          placeholder="firstname.lastname@volteuropa.org" value="${esc(email || '')}">
        <button class="btn" type="submit">Email me a sign-in link</button>
      </form>`;
  const body = `
<header class="topbar"><div class="topbar-inner"><div class="brand"><span class="brand-dot"></span>Volt Europa · HR Hub</div></div></header>
<main class="login">
  <div class="box">
    ${
      sentTo
        ? `<h1>Check your inbox</h1>
    <div class="note ok" role="status">We sent a sign-in link to <strong>${esc(sentTo)}</strong>. It works for 15 minutes.</div>
    <p>Nothing after a minute? Look in spam, or <a href="/login">try again</a>.</p>`
        : `<h1>Sign in</h1>
    <p>The HR Hub is open to anyone with an @volteuropa.org email. We'll send you a link, no password needed.</p>
    ${error ? `<div class="note error" role="alert">${esc(error)}</div>` : ''}${form}`
    }
    <p class="small">Trouble signing in? Email <a href="mailto:help@volteuropa.org">help@volteuropa.org</a>.</p>
  </div>
</main>`;
  return page({ title: 'Sign in · Volt HR Hub', css: LOGIN_CSS, body, nonce });
}

const DASH_CSS = `
.user{display:flex;align-items:center;gap:12px;font-size:14px}
.user span{opacity:.9;overflow-wrap:anywhere}
.user button{font:inherit;font-size:14px;font-weight:600;color:#fff;background:transparent;border:1.5px solid rgba(255,255,255,.6);border-radius:8px;padding:6px 12px;cursor:pointer}
.user button:hover{background:rgba(255,255,255,.14)}
.hero{background:var(--purple);color:#fff;padding:28px 0 56px}
.hero h1{margin:0 0 6px;font-size:clamp(26px,4vw,36px);line-height:1.15}
.hero p{margin:0;opacity:.9;max-width:60ch}
.switch-row{margin-top:-26px;display:flex;justify-content:center;padding:0 20px}
.switch{position:relative;display:grid;grid-template-columns:1fr 1fr;background:#fff;border:1px solid var(--line);border-radius:999px;padding:5px;width:100%;max-width:380px;box-shadow:0 6px 20px rgba(58,24,89,.14)}
.switch button{position:relative;z-index:1;font:inherit;font-weight:700;border:0;background:transparent;color:var(--muted);padding:11px 10px;border-radius:999px;cursor:pointer;transition:color .25s}
.switch button[aria-selected=true]{color:#fff}
.thumb{position:absolute;top:5px;bottom:5px;left:5px;width:calc(50% - 5px);border-radius:999px;background:var(--purple);transition:transform .35s cubic-bezier(.4,0,.2,1)}
.switch[data-active=volunteers] .thumb{transform:translateX(100%)}
.viewport{overflow:hidden}
.track{display:flex;width:200%;align-items:flex-start;transition:transform .4s cubic-bezier(.4,0,.2,1)}
.track[data-active=volunteers]{transform:translateX(-50%)}
.panel{width:50%;padding:28px 20px 8px}
.panel-inner{max-width:1000px;margin:0 auto}
.section{margin-bottom:28px}
.section h2{font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:0 0 12px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
.card{display:flex;gap:14px;align-items:flex-start;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;text-decoration:none;transition:border-color .15s,box-shadow .15s,transform .15s}
.card:hover{border-color:var(--purple);box-shadow:0 6px 18px rgba(80,35,121,.12);transform:translateY(-2px)}
.ico{flex:none;width:42px;height:42px;border-radius:11px;display:grid;place-items:center;background:#efe8f7;color:var(--purple)}
.card strong{display:block;font-size:17px;line-height:1.3;margin-bottom:3px}
.card small{display:block;font-size:14px;color:var(--muted);line-height:1.4;overflow-wrap:anywhere}
.empty{color:var(--muted)}
.foot{padding:8px 20px 40px;color:var(--muted);font-size:14px;text-align:center}
@media (prefers-reduced-motion:reduce){.track,.thumb,.card,.switch button{transition:none}}
`;

const DASH_JS = `
(function(){
  var ids=['staff','volunteers'];
  var sw=document.querySelector('.switch'),track=document.querySelector('.track');
  var tabs=[].slice.call(sw.querySelectorAll('[role=tab]'));
  function show(id,focus){
    if(ids.indexOf(id)<0)id='staff';
    sw.dataset.active=id;track.dataset.active=id;
    tabs.forEach(function(t){
      var on=t.dataset.id===id;
      t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;
      document.getElementById('panel-'+t.dataset.id).inert=!on;
      if(on&&focus)t.focus();
    });
    try{localStorage.setItem('volt-hub-tab',id)}catch(e){}
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
    if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)show(dx<0?'volunteers':'staff');
  },{passive:true});
  window.addEventListener('hashchange',function(){show(location.hash.slice(1))});
  var saved=null;try{saved=localStorage.getItem('volt-hub-tab')}catch(e){}
  track.style.transition='none';
  show(location.hash.slice(1)||saved||'staff');
  requestAnimationFrame(function(){requestAnimationFrame(function(){track.style.transition=''})});
})();
`;

function card(link) {
  const external = /^https?:/.test(link.url);
  return `<a class="card" href="${esc(link.url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
          <span class="ico">${icon(link.icon)}</span>
          <span><strong>${esc(link.title)}</strong><small>${esc(link.description || '')}</small></span>
        </a>`;
}

function panel(audience, sections) {
  const blocks = sections
    .map((s) => ({ title: s.title, links: (s.links || []).filter((l) => (l.audience || []).includes(audience.id)) }))
    .filter((s) => s.links.length)
    .map(
      (s) => `<section class="section">
        <h2>${esc(s.title)}</h2>
        <div class="grid">
        ${s.links.map(card).join('\n        ')}
        </div>
      </section>`
    );
  return `<div class="panel" id="panel-${audience.id}" role="tabpanel" aria-labelledby="tab-${audience.id}">
      <div class="panel-inner">
      ${blocks.join('\n      ') || `<p class="empty">No links for ${esc(audience.label.toLowerCase())} yet.</p>`}
      </div>
    </div>`;
}

function dashboardPage({ nonce, email, sections }) {
  const body = `
<header class="topbar"><div class="topbar-inner">
  <div class="brand"><span class="brand-dot"></span>Volt Europa · HR Hub</div>
  <form class="user" method="post" action="/logout"><span>${esc(email)}</span><button type="submit">Sign out</button></form>
</div></header>
<div class="hero"><div class="wrap">
  <h1>HR quick links</h1>
  <p>Forms, tutorials and contacts from the HR team. Pick your side.</p>
</div></div>
<div class="switch-row">
  <div class="switch" role="tablist" aria-label="Audience" data-active="staff">
    <span class="thumb" aria-hidden="true"></span>
    ${AUDIENCES.map(
      (a, i) =>
        `<button type="button" role="tab" id="tab-${a.id}" data-id="${a.id}" aria-controls="panel-${a.id}" aria-selected="${i === 0}">${a.label}</button>`
    ).join('\n    ')}
  </div>
</div>
<main class="viewport">
  <div class="track" data-active="staff">
    ${AUDIENCES.map((a) => panel(a, sections)).join('\n    ')}
  </div>
</main>
<footer class="foot">Something missing or out of date? Email <a href="mailto:humanresources@volteuropa.org">humanresources@volteuropa.org</a>.</footer>
<script nonce="${nonce}">${DASH_JS}</script>`;
  return page({ title: 'Volt HR Hub', css: DASH_CSS, body, nonce });
}

module.exports = { loginPage, dashboardPage, AUDIENCES };
