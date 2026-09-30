(async () => {
const st=document.createElement('style'); st.textContent=`header,nav,[class*="sticky"]{display:none!important} [data-reveal]{opacity:1!important;transform:none!important} html,body{overflow:hidden!important} *{animation-play-state:paused!important}`; document.head.appendChild(st);
const sec=document.querySelector('h1').closest('section');
[...document.body.querySelectorAll('section')].forEach(s=>{ if(s!==sec) s.style.display='none'});
const cta=[...sec.querySelectorAll('a')].find(a=>a.textContent.includes('Start free trial')); cta.parentElement.style.display='none';
const fine=[...sec.querySelectorAll('p')].find(p=>p.textContent.includes('days free')); if(fine) fine.style.display='none';
const f=sec.querySelector('figure'); [...f.parentElement.children].forEach(ch=>{ if(ch!==f) ch.style.visibility='hidden'});
f.style.transform='translate(40px,10px) rotate(-5deg)';
const h1=sec.querySelector('h1'); h1.style.fontSize='80px'; h1.style.lineHeight='1.02'; h1.innerHTML='Real learning,<br><span class="italic text-forest" style="white-space:nowrap">hiding in real life.</span>';
const col=h1.parentElement; col.style.maxWidth='760px';
const p=[...sec.querySelectorAll('p')].find(p=>p.textContent.includes('We hand you')); p.style.fontSize='25px'; p.style.maxWidth='560px'; p.textContent='The next real-world activity, matched to your kids. You just do it together.';
const eb=h1.previousElementSibling; if(eb){ eb.style.zoom='1.3'; }
const b=document.createElement('div'); b.style.cssText='position:absolute;left:0;margin-top:34px;display:flex;align-items:center;gap:12px;font-size:25px;color:#1f2a37';
b.innerHTML='<img src="/logo-icon-transparent.png" style="height:42px"><span>anywhere <span style="font-style:italic;font-weight:600;color:#3d5c3b">learning</span></span>';
p.after(b);
window.scrollTo(0,0);
await document.fonts.ready;
const r=f.getBoundingClientRect(); return {secH:sec.offsetHeight, fig:[r.x|0,r.y|0], h1:h1.getBoundingClientRect().bottom|0, brand:b.getBoundingClientRect().bottom|0};
})()
