import { captions } from './captions';
import { slides, sources, type Slide } from './slides';
import { argbFromHex, hexFromArgb, Hct, SchemeExpressive, MaterialDynamicColors } from '@material/material-color-utilities';

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector<T>(s)!;
const fa = (n: number) => n.toLocaleString('fa-IR');
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const icons: Record<string,string> = {
 book:'<path d="M3 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-3H3zM21 4h-6a3 3 0 0 0-3 3v14a4 4 0 0 1 4-3h5z"/>',
 radio:'<rect x="3" y="7" width="18" height="14" rx="3"/><path d="m5 7 13-5M6 11h12"/><circle cx="8" cy="16" r="2"/><path d="M14 15h4m-4 3h4"/>',
 computer:'<rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8m-4-5v5"/>',
 globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
 phone:'<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4"/>',
 spark:'<path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7z"/>',
 check:'<path d="m5 12 4 4L19 6"/><circle cx="12" cy="12" r="10"/>',
 people:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 6"/>',
 flask:'<path d="M9 3h6m-5 0v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3L14 9V3M7 15h10"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
 notes:'<path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5"/>',
 settings:'<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>',
 fullscreen:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
 left:'<path d="m15 5-7 7 7 7"/>', right:'<path d="m9 5 7 7-7 7"/>', close:'<path d="m6 6 12 12M6 18 18 6"/>', play:'<path d="m9 5 11 7-11 7z"/>', link:'<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2m3 6a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2"/>', moon:'<path d="M21 13a9 9 0 0 1-10-10 9 9 0 1 0 10 10z"/>'
};
const icon = (name:string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.spark}</svg>`;

let current = 0, locked = false, entered = false;
let seed = '#396a48', mode:'auto'|'light'|'dark' = 'auto', contrast = 0, motion = true;
try { const saved = JSON.parse(localStorage.getItem('learning-theme') || '{}'); seed = saved.seed || seed; mode = saved.mode || mode; contrast = Number(saved.contrast) || 0; motion = saved.motion !== false; } catch { /* private mode still works */ }
const darkQuery = matchMedia('(prefers-color-scheme: dark)');
const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
function reduced() { return reducedQuery.matches || !motion; }
const roleKeys = ['primary','onPrimary','primaryContainer','onPrimaryContainer','secondary','onSecondary','secondaryContainer','onSecondaryContainer','tertiary','onTertiary','tertiaryContainer','onTertiaryContainer','error','onError','errorContainer','onErrorContainer','surface','onSurface','onSurfaceVariant','surfaceContainerLowest','surfaceContainerLow','surfaceContainer','surfaceContainerHigh','surfaceContainerHighest','outline','outlineVariant','inverseSurface','inverseOnSurface','inversePrimary'] as const;
function theme() {
 const dark = mode === 'dark' || (mode === 'auto' && darkQuery.matches);
 const scheme = new SchemeExpressive(Hct.fromInt(argbFromHex(seed)),dark,contrast);
 for (const key of roleKeys) {
  const role = MaterialDynamicColors[key];
  const cssKey = key.replace(/[A-Z]/g, c => '-'+c.toLowerCase());
  document.documentElement.style.setProperty('--md-sys-color-'+cssKey,hexFromArgb(role.getArgb(scheme)));
 }
 document.documentElement.dataset.theme = dark ? 'dark' : 'light';
 document.documentElement.dataset.motion = reduced() ? 'reduced' : 'expressive';
 try { localStorage.setItem('learning-theme', JSON.stringify({seed,mode,contrast,motion})); } catch { /* no persistence */ }
}
darkQuery.addEventListener('change',theme); reducedQuery.addEventListener('change',theme);

const sourceLinks = (refs: number[]) => refs.map(i=>`<a class="source-link" href="${sources[i].url}" target="_blank" rel="noopener noreferrer"><span>${esc(sources[i].title)}</span>${icon('link')}<small>${esc(sources[i].detail)}</small></a>`).join('');
const card = (item: NonNullable<Slide['items']>[number],i:number) => `<article class="card tone-${i%3}" style="view-transition-name: card-${i}"><div class="card-meta">${item.icon ? `<span class="icon-token">${icon(item.icon)}</span>`:''}${item.n ? `<span class="ordinal">${esc(item.n)}</span>`:''}</div><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p></article>`;
const decorativeShapes = `<svg class="slide-deco" viewBox="0 0 1200 600" fill="none" aria-hidden="true"><circle cx="1100" cy="80" r="90" class="deco-circle"/><circle cx="90" cy="520" r="140" class="deco-circle deco-circle-2"/><path d="M200 100c60-40 120-40 180 0s120 40 180 0 120-40 180 0 120 40 180 0" class="deco-wave"/></svg>`;


function content(s: Slide): string {
 const items = s.items || [];
 switch(s.kind) {
  case 'hero': return `<div class="hero-composition"><div class="hero-copy"><span class="hero-kicker">آموزش، در حالِ تغییر</span><h1 class="hero-title" style="view-transition-name: slide-title">${esc(s.title).replace(/\n/g,'<br>')}</h1><p class="hero-sub">${esc(s.subtitle!).replace(/\n/g,'<br>')}</p><button class="filled large" data-action="next">ادامهٔ ارائه ${icon('left')}</button><div class="hero-details"><span>۱۶ اسلاید</span><span>گذشته ← امروز ← آینده</span></div></div><div class="hero-visual" style="view-transition-name: feature"><img src="./assets/classroom.jpg" alt="کتاب‌ها، مدادها و ابزارهای یادگیری روی میز" width="1400" height="934"><div class="floating-token" style="view-transition-name: motif">${icon('book')}</div><div class="photo-label">ابزارها تغییر می‌کنند.<br><strong>کنجکاوی، ماندگار است.</strong></div></div></div>${decorativeShapes}`;
  case 'statement': return `<div class="statement with-deco">${decorativeShapes}<div class="statement-mark" style="view-transition-name: motif">${icon(s.id==='future'?'people':'spark')}</div><p class="big-equation" style="view-transition-name: feature">${esc(s.quote!)}</p><p class="statement-body">${esc(s.subtitle!).replace(/\n/g,'<br>')}</p></div>`;
  case 'timeline': return `<div class="timeline with-deco">${decorativeShapes}${items.map((it,i)=>`<article class="era" style="view-transition-name: card-${i}"><div class="era-top"><span class="era-icon">${icon(it.icon!)}</span><span class="era-date">${esc(it.n!)}</span></div><h3>${esc(it.title)}</h3><p>${esc(it.body)}</p><span class="era-index">${fa(i+1)}</span></article>`).join('')}</div><p class="caption">موج‌های شاخص؛ زمانِ رواج در کشورها و مدارس یکسان نبوده است.</p>`;
  case 'spotlight': return `<div class="spotlight"><div class="plato" style="view-transition-name: feature"><span class="micro">COMPUTER-ASSISTED LEARNING</span><strong dir="ltr">PLATO</strong><span class="plato-era">اوایل دههٔ ۱۹۶۰</span><div class="plato-grid" aria-hidden="true">${Array.from({length:40},(_,i)=>`<span class="cell c${i%5}"></span>`).join('')}</div><span>دانشگاه ایلینوی</span></div><div class="fact-list">${items.map((it,i)=>`<article style="view-transition-name: card-${i}"><span>${esc(it.n!)}</span><div><h3>${esc(it.title)}</h3><p>${esc(it.body)}</p></div></article>`).join('')}</div></div>`;
  case 'comparison': return `<div class="comparison">${items.map((it,i)=>`<article class="compare-panel tone-${i===0?0:2}" style="view-transition-name: card-${i}"><span class="panel-label">${esc(it.n!)}</span><div class="compare-icon">${icon(s.id==='ai'?(i?'eye':'spark'):(i?'spark':'book'))}</div><h3>${esc(it.title)}</h3><p>${esc(it.body)}</p></article>`).join('')}</div><p class="caption">${s.id==='ai'?'پاسخِ روان، لزوماً پاسخِ درست نیست.':'این یک امکان آموزشی است؛ نه تضمینِ بهتر بودن هر ابزار دیجیتال.'}</p>`;
  case 'cards': return `<div class="cards with-deco">${decorativeShapes}${items.map(card).join('')}</div>`;
  case 'steps': return `<div class="steps">${items.map((it,i)=>`<article class="step" style="view-transition-name: card-${i}"><span class="step-no">${fa(i+1)}</span><span class="step-time">${esc(it.n!)}</span><h3>${esc(it.title)}</h3><p>${esc(it.body)}</p></article>`).join('')}</div><div class="lesson-result">معیارِ موفقیت: دانش‌آموز بتواند عملکرد مدار را توضیح دهد.</div>`;
  case 'risks': return `<div class="risks">${items.map((it,i)=>`<article class="risk" style="view-transition-name: card-${i}"><span class="risk-no">${fa(i+1).padStart(2,'۰')}</span><h3>${esc(it.title)}</h3><p>${esc(it.body)}</p></article>`).join('')}</div>`;
  case 'criteria': return `<div class="criteria">${items.map((it,i)=>`<article class="criterion tone-${i%3}" style="view-transition-name: card-${i}"><span>${esc(it.n!)}</span><h3>${esc(it.title)}</h3><p>${esc(it.body)}</p></article>`).join('')}</div><p class="caption">بر اساس گزارش جهانی آموزش ۲۰۲۳ یونسکو</p>`;
  case 'video': return `<div class="embedded-film"><div class="video-shell"><video id="lesson-video" controls playsinline preload="metadata" poster="./assets/film-poster.jpg" aria-label="گزارش خان‌میگو با زیرنویس فارسی"><source src="./assets/film.mp4" type="video/mp4">مرورگر شما از پخش فیلم پشتیبانی نمی‌کند.</video></div><div class="video-actions"><button class="tonal-button" id="subtitle-toggle" aria-pressed="true">زیرنویس فارسی: روشن</button><span>۱۳:۱۸ • 720p • CBS / 60 Minutes</span></div><p class="video-question">${esc(s.quote!)}</p><p id="video-error" class="video-error" hidden>فیلم بارگذاری نشد. پوشهٔ public/assets را کنار فایل ارائه نگه دارید یا سایت را با npm run dev اجرا کنید.</p></div>`;
  case 'closing': return `<div class="closing-grid with-deco">${decorativeShapes}${items.map((it,i)=>`<article style="view-transition-name: card-${i}"><span class="closing-num">${esc(it.n!)}</span><h3>${esc(it.title)}</h3><p>${esc(it.body)}</p></article>`).join('')}</div><div class="closing-question">اگر فقط یک چیز در کلاسِ آینده تغییر کند، آن چیست؟</div>`;
  case 'sources': return `<div class="sources-grid">${sourceLinks(s.refs)}</div>`;
  default:return '';
 }
}
let filmTime=0, subtitlesOn=true;
function rememberMedia() {
 const video=document.querySelector<HTMLVideoElement>('#lesson-video');
 if(video) {filmTime=video.currentTime;video.pause();}
}
function prepareMedia() {
 const video=document.querySelector<HTMLVideoElement>('#lesson-video');
 if(!video) return;
 const track=video.addTextTrack('subtitles','فارسی','fa');
 for(const c of captions) {const cue=new VTTCue(c.start,c.end,'\u200f'+c.text);cue.align='center';track.addCue(cue);}
 track.mode=subtitlesOn?'showing':'disabled';
 video.addEventListener('loadedmetadata',()=>{if(filmTime>0)video.currentTime=Math.min(filmTime,video.duration);},{once:true});
 video.addEventListener('error',()=>$('#video-error').hidden=false);
 video.querySelector('source')?.addEventListener('error',()=>$('#video-error').hidden=false);
 video.addEventListener('pause',()=>{filmTime=video.currentTime;});
 video.addEventListener('ended',()=>{filmTime=0;});
 video.addEventListener('keydown',e=>e.stopPropagation());
 const toggle=$('#subtitle-toggle');
 toggle.textContent='زیرنویس فارسی: '+(subtitlesOn?'روشن':'خاموش');toggle.setAttribute('aria-pressed',String(subtitlesOn));
 toggle.addEventListener('click',()=>{subtitlesOn=!subtitlesOn;track.mode=subtitlesOn?'showing':'disabled';toggle.textContent='زیرنویس فارسی: '+(subtitlesOn?'روشن':'خاموش');toggle.setAttribute('aria-pressed',String(subtitlesOn));});
}
function paint() {
 rememberMedia();
 const s = slides[current];
 $('#slide').className = 'slide kind-'+s.kind;
 $('#slide').innerHTML = `${s.kind==='hero'?'':`<header class="slide-heading"><span class="eyebrow">${esc(s.label)}</span><h1 style="view-transition-name: slide-title">${esc(s.title).replace(/\n/g,'<br>')}</h1>${s.subtitle && !['statement','video','closing'].includes(s.kind)?`<p class="subtitle">${esc(s.subtitle)}</p>`:''}</header>`}${content(s)}`;
 $('#section-name').textContent = s.section;
 $('#slide-name').textContent = s.label;
 $('#counter').textContent = `${fa(current+1)} / ${fa(slides.length)}`;
 $('#progress').style.width = ((current+1)/slides.length*100)+'%';
 $('#time').textContent = s.minutes;
 $('#prev').toggleAttribute('disabled',current===0); $('#next').toggleAttribute('disabled',current===slides.length-1);
 $('#status').textContent = `اسلاید ${fa(current+1)} از ${fa(slides.length)}: ${s.title.replace(/\n/g,' ')}`;
 document.title = `${s.title.replace(/\n/g,' ')} | تکنولوژی در آموزش`;
 document.querySelectorAll('[data-jump]').forEach(el=> el.toggleAttribute('aria-current',Number((el as HTMLElement).dataset.jump)===current));
 document.querySelectorAll('[data-section]').forEach(el => {const on = (el as HTMLElement).dataset.section===s.section; el.classList.toggle('active',on);el.setAttribute('aria-pressed',String(on));});
 $('#slide').scrollTop = 0;prepareMedia();
}
function hashIndex() { const m=location.hash.match(/^#slide-(\d+)$/); return m ? Math.max(0,Math.min(slides.length-1,Number(m[1])-1)) : 0; }
async function go(target:number) {
 if (!entered) return;
 if (locked || target===current || target<0 || target>=slides.length) return;
 locked = true;
 const change = () => {current=target;paint();history.replaceState(null,'',`#slide-${current+1}`);};
 const vt = (document as Document & {startViewTransition?: (cb:()=>void)=>{finished:Promise<void>}}).startViewTransition;
 try {
  if(vt && !reduced()) { const t = vt.call(document,change); await t.finished; }
  else {change(); if(!reduced()) {const a = $('#slide').animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'cubic-bezier(.38,1.21,.22,1)'});await a.finished;} }
 } catch { /* interruption is safe */ } finally {locked=false;}
}
async function enterDeck() {
 if(locked || entered) return;
 const change=()=>{entered=true;$('#welcome').hidden=true;$('#deck-app').hidden=false;paint();history.replaceState(null,'',`#slide-${current+1}`);$('#slide').focus({preventScroll:true});};
 await changeScreen(change);
}
async function welcome() {
 if(locked || !entered) return;
 modal.close();rememberMedia();
 await changeScreen(()=>{entered=false;$('#deck-app').hidden=true;$('#welcome').hidden=false;history.replaceState(null,'','#slide-0');$('#status').textContent='صفحهٔ شروع. برای ورود، دکمهٔ ورود به ارائه را بزنید.';document.title='سلام، خوش آمدید | تکنولوژی در آموزش';$('#enter-deck').focus({preventScroll:true});});
}
async function changeScreen(change:()=>void) {
 locked=true;
 const vt=(document as Document & {startViewTransition?:(cb:()=>void)=>{finished:Promise<void>}}).startViewTransition;
 try {if(vt&&!reduced()) await vt.call(document,change).finished;else change();}finally{locked=false;}
}
const modal = $('#modal') as HTMLDialogElement;
function openModal(kind:string) {
 document.querySelector<HTMLVideoElement>('#lesson-video')?.pause();
 const s=slides[current];
 let title='',body='';
 if(kind==='overview') {title='نقشهٔ ارائه';body=`<p class="modal-intro">روی یک اسلاید بزنید تا به آن بروید.</p><div class="overview-grid">${slides.map((it,i)=>`<button class="overview-item ${i===current?'selected':''}" data-jump="${i}" ${i===current?'aria-current="true"':''}><span>${fa(i+1).padStart(2,'۰')}</span><strong>${esc(it.title.replace(/\n/g,' '))}</strong><small>${esc(it.section)}</small></button>`).join('')}</div>`;}
 if(kind==='notes') { title=`یادداشتِ ارائه‌دهنده • ${fa(current+1)}`;body=`<span class="panel-label">${esc(s.minutes)}</span><h3>${esc(s.title.replace(/\n/g,' '))}</h3><p class="notes-copy">${esc(s.note)}</p><div class="note-tip">این یادداشت‌ها برای توضیح شفاهی‌اند و روی خودِ اسلاید نمایش داده نمی‌شوند.</div>`; }
 if(kind==='sources') {title='منابع این اسلاید';body=`<div class="modal-sources">${sourceLinks(s.refs)}</div>`;}
 if(kind==='settings') {title='تنظیمات نمایش';body=`<fieldset><legend>رنگِ پایه</legend><div class="seed-options">${[['#396a48','سبز'],['#6750a4','بنفش'],['#00639b','آبی'],['#984061','صورتی']].map(([c,label])=>`<button class="seed ${seed===c?'selected':''}" data-seed="${c}" aria-pressed="${seed===c}" aria-label="تم ${label}"><span style="background:${c}"></span>${label}</button>`).join('')}</div></fieldset><fieldset><legend>روشنایی</legend><div class="segmented">${[['auto','سیستم'],['light','روشن'],['dark','تیره']].map(([v,label])=>`<button data-mode="${v}" aria-pressed="${mode===v}">${label}</button>`).join('')}</div></fieldset><fieldset><legend>کنتراست</legend><div class="segmented">${[[0,'استاندارد'],[.5,'متوسط'],[1,'زیاد']].map(([v,label])=>`<button data-contrast="${v}" aria-pressed="${contrast===v}">${label}</button>`).join('')}</div></fieldset><label class="switch-row"><span>انیمیشن‌ها<small>تنظیم کاهش حرکتِ دستگاه شما هم رعایت می‌شود.</small></span><input type="checkbox" id="motion-toggle" ${motion?'checked':''}></label><p class="modal-intro">تنظیمات ظاهر در همین مرورگر ذخیره می‌شود.</p>`;}
 if(kind==='help') { title='کنترل ارائه';body=`<div class="help-list"><p><kbd>←</kbd> یا <kbd>Space</kbd><span>اسلاید بعدی</span></p><p><kbd>→</kbd><span>اسلاید قبلی</span></p><p><kbd>Home</kbd> / <kbd>End</kbd><span>اول / آخر</span></p><p><kbd>O</kbd><span>نقشهٔ ارائه</span></p><p><kbd>N</kbd><span>یادداشت‌ها</span></p><p><kbd>F</kbd><span>تمام‌صفحه</span></p><p><kbd>Esc</kbd><span>بستن پنجره / خروج از تمام‌صفحه</span></p></div><p class="modal-intro">در گوشی: به راست بکشید تا به اسلاید بعدی بروید. لینک مستقیم هر اسلاید در نشانی سایت قرار دارد.</p>`;}
 $('#modal-title').textContent=title;$('#modal-body').innerHTML=body;
 if(!modal.open) modal.showModal();
 const input=$('#motion-toggle') as HTMLInputElement|null;
 input?.addEventListener('change',()=>{motion=input.checked;theme();});
}
async function fullscreen() {
 try {if(document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen();}
 catch {$('#status').textContent='تمام‌صفحه در این مرورگر در دسترس نیست؛ از حالت تمام‌صفحهٔ مرورگر استفاده کنید.'; openModal('help');}
}
document.addEventListener('click',e=>{
 const b=(e.target as Element).closest<HTMLElement>('[data-action],[data-jump],[data-seed],[data-mode],[data-contrast],[data-section]');
 if(!b) return;
 if(b.dataset.jump!==undefined) {modal.close();void go(Number(b.dataset.jump));return;}
 if(b.dataset.section) {void go(slides.findIndex(s=>s.section===b.dataset.section));return;}
 if(b.dataset.seed) {seed=b.dataset.seed;theme();openModal('settings');return;}
 if(b.dataset.mode) {mode=b.dataset.mode as typeof mode;theme();openModal('settings');return;}
 if(b.dataset.contrast) {contrast=Number(b.dataset.contrast);theme();openModal('settings');return;}
 const a=b.dataset.action;
 if(a==='enter') void enterDeck(); else if(a==='welcome') void welcome(); else if(a==='next') void go(current+1); else if(a==='prev') void go(current-1); else if(a==='close') modal.close(); else if(a==='fullscreen') void fullscreen(); else if(a) openModal(a);
});
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();}});
document.addEventListener('keydown',e=>{
 if(!entered) {if(e.key.toLowerCase()==='f' && !modal.open) void fullscreen();return;}
 if(modal.open || (e.target as Element).closest('input,textarea,select,button,a,video')) return;
 const media=document.querySelector<HTMLVideoElement>('#lesson-video');
 if(media && [' ','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key)) {
  e.preventDefault();
  if(e.key===' ') {if(media.paused)void media.play().catch(()=>{});else media.pause();}
  if(e.key==='ArrowLeft')media.currentTime=Math.max(0,media.currentTime-5);
  if(e.key==='ArrowRight')media.currentTime=Math.min(media.duration||798,media.currentTime+5);
  if(e.key==='ArrowUp')media.volume=Math.min(1,media.volume+.1);
  if(e.key==='ArrowDown')media.volume=Math.max(0,media.volume-.1);
  if(e.key==='Home')media.currentTime=0;if(e.key==='End')media.currentTime=media.duration||798;
  return;
 }
 if(['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' ','PageDown','PageUp','Home','End'].includes(e.key)) e.preventDefault();
 if(['ArrowLeft','ArrowDown',' ','PageDown'].includes(e.key)) void go(current+1);
 if(['ArrowRight','ArrowUp','PageUp'].includes(e.key)) void go(current-1);
 if(e.key==='Home') void go(0); if(e.key==='End') void go(slides.length-1);
 if(e.key.toLowerCase()==='n') openModal('notes'); if(e.key.toLowerCase()==='o') openModal('overview');if(e.key.toLowerCase()==='f') void fullscreen();
});
let touchX=0,touchY=0;
$('#slide').addEventListener('touchstart',e=>{if((e.target as Element).closest('video,.video-actions')){touchX=0;return;}touchX=e.changedTouches[0].clientX;touchY=e.changedTouches[0].clientY;},{passive:true});
$('#slide').addEventListener('touchend',e=>{if(!touchX||(e.target as Element).closest('video,.video-actions'))return;const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.7&&!modal.open) void go(current+(dx>0?1:-1));},{passive:true});
window.addEventListener('hashchange',()=>{if(location.hash==='#slide-0') void welcome();else if(entered) void go(hashIndex());});
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon((el as HTMLElement).dataset.icon!));
current=hashIndex();theme();paint();history.replaceState(null,'','#slide-0');$('#status').textContent='صفحهٔ شروع. برای ورود، دکمهٔ ورود به ارائه را بزنید.';document.title='سلام، خوش آمدید | تکنولوژی در آموزش';
// Stable hooks for local visual and keyboard QA, not used by presentation controls.
Object.assign(window,{learningDeck:{slides,sources,go,enterDeck,welcome,openModal,theme:()=>({seed,mode,contrast,motion})}});
