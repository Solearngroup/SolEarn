/* SolEarn app.js — single source of truth (migrated from broken inline script) */

// Preloader neon progress
(function(){
  const pre=document.getElementById('preloader');
  const bar=document.getElementById('preBar');
  const pct=document.getElementById('prePercent');
  let winLoaded=false; window.addEventListener('load',()=>{winLoaded=true});
  if(!pre||!bar||!pct) return;
  document.body.classList.add('lock-scroll');
  const start=performance.now(); const duration=1600;
  function raf(t){
    const elapsed=t-start; let r=Math.max(0,Math.min(1,elapsed/duration));
    let value = r<0.75 ? (r/0.75)*90 : 90+((r-0.75)/0.25)*10;
    if(!winLoaded && value>98) value=98;
    bar.style.width=value+'%'; pct.textContent=Math.floor(value);
    if((r>=1 && winLoaded) || value>=100){ pct.textContent='100'; bar.style.width='100%'; pre.classList.add('hide'); document.body.classList.remove('lock-scroll'); }
    else { requestAnimationFrame(raf); }
  }
  requestAnimationFrame(raf);
  setTimeout(()=>{ try{pct.textContent='100';bar.style.width='100%';pre.classList.add('hide');document.body.classList.remove('lock-scroll')}catch(e){} },5000);
})();

// DOM Ready
document.addEventListener('DOMContentLoaded',()=>{
  // HERO title split + glow
  const titleEl=document.querySelector('.hero-title');
  if(titleEl){ const raw=(titleEl.textContent||'').trim(); titleEl.setAttribute('aria-label',raw); titleEl.innerHTML=[...raw].map((ch,i)=>`<span style="--i:${i}">${ch}</span>`).join(''); titleEl.classList.add('animate-in'); }

  // Section titles underline reveal
  const titleObs=new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('revealed'); titleObs.unobserve(e.target); } }); },{threshold:.55});
  document.querySelectorAll('.section-title').forEach(h=>titleObs.observe(h));

  // Reveal on scroll
  const revealObserver=new IntersectionObserver(entries=>{ entries.forEach(entry=>{ if(entry.isIntersecting) entry.target.classList.add('active'); }); },{threshold:0.3});
  document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

  // Navbar blur on scroll
  const navbar=document.querySelector('.navbar');
  const setNavState=()=>{ window.scrollY>10 ? navbar.classList.add('scrolled') : navbar.classList.remove('scrolled'); };
  setNavState(); window.addEventListener('scroll',setNavState);

  // Active link highlight (closest to viewport center)
  const navLinks=Array.from(document.querySelectorAll('.navbar a[href^="#"]'));
  const targets=Array.from(document.querySelectorAll('header[id], section[id]'));
  function updateActiveLink(){
    const viewportCenter=window.innerHeight/2; let best=null,bestDist=Infinity;
    targets.forEach(sec=>{ const r=sec.getBoundingClientRect(); const secCenter=r.top+r.height/2; if(r.bottom>viewportCenter*0.6 && r.top<viewportCenter*1.4){ const d=Math.abs(secCenter-viewportCenter); if(d<bestDist){best=sec;bestDist=d;} } });
    if(!best){ targets.forEach(sec=>{ if(sec.getBoundingClientRect().top<=viewportCenter*0.8) best=sec; }); }
    if(best){ const id=`#${best.id}`; navLinks.forEach(a=>a.classList.toggle('active', a.getAttribute('href')===id)); }
  }
  updateActiveLink(); window.addEventListener('scroll',updateActiveLink,{passive:true}); window.addEventListener('resize',updateActiveLink); window.addEventListener('hashchange',updateActiveLink);

  // Mobile menu toggle
  const menuToggle=document.getElementById('menuToggle');
  const navLinksEl=document.getElementById('navLinks');
  if(menuToggle && navLinksEl){
    menuToggle.addEventListener('click',()=>{ const open=navLinksEl.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', open ? 'true':'false'); });
    navLinksEl.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{ navLinksEl.classList.remove('open'); menuToggle.setAttribute('aria-expanded','false'); }));
  }

  // Copy to clipboard (robust)
  const copyBtn=document.getElementById('copyContract');
  const contractValue=document.getElementById('contractValue');
  const contractBox=document.getElementById('contractBox');
  const tip=document.getElementById('copiedTip');
  const field=document.getElementById('copyField');
  const fallbackTip=document.getElementById('fallbackTip');

  async function tryNativeClipboard(text){ if(navigator.clipboard && window.isSecureContext){ try{ await navigator.clipboard.writeText(text); return true; }catch{ return false; } } return false; }
  function tryExecCommand(text){ const ta=document.createElement('textarea'); ta.value=text; ta.setAttribute('readonly',''); ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.focus(); ta.select(); let ok=false; try{ ok=document.execCommand('copy'); }catch(e){ ok=false; } document.body.removeChild(ta); return ok; }
  function showManualFallback(text){ if(field){ field.value=text; contractBox.classList.add('show-fallback'); field.style.display='block'; field.focus(); field.select(); if(fallbackTip) fallbackTip.setAttribute('aria-hidden','false'); copyBtn.textContent='Press Ctrl+C'; } else { window.prompt('Copy contract address:', text); } }

  if(copyBtn && contractValue){
    copyBtn.addEventListener('click', async ()=>{
      const full=(contractValue.dataset.full || contractValue.textContent || '').trim();
      const prev=copyBtn.textContent; contractBox.classList.remove('copied','show-fallback'); if(tip) tip.setAttribute('aria-hidden','true'); if(fallbackTip) fallbackTip.setAttribute('aria-hidden','true');
      let ok=await tryNativeClipboard(full); if(!ok) ok=tryExecCommand(full);
      if(ok){ contractBox.classList.add('copied'); if(tip) tip.setAttribute('aria-hidden','false'); copyBtn.textContent='Copied'; setTimeout(()=>{ contractBox.classList.remove('copied'); if(tip) tip.setAttribute('aria-hidden','true'); copyBtn.textContent=prev; },1600); }
      else{ showManualFallback(full); }
    });
  }

  // About video: preview ~1s then pause
  const v=document.getElementById('aboutVideo');
  if(v){
    const preview=()=>{ try{ v.preload='auto'; v.muted=true; const stop=()=>{ try{ v.pause(); }catch(e){} }; const p=v.play(); if(p && typeof p.then==='function'){ p.then(()=>setTimeout(stop,1000)).catch(()=>{}); } else { setTimeout(stop,1000); } }catch(e){} };
    if(v.readyState>=2) preview(); else v.addEventListener('loadeddata', preview, {once:true});
  }

  // FAQ accordion
  const faqWrap=document.querySelector('.faq-wrap');
  if(faqWrap){ faqWrap.querySelectorAll('.faq-item').forEach(item=>{ const btn=item.querySelector('.faq-q'); const panel=item.querySelector('.faq-a'); if(!btn||!panel) return; btn.setAttribute('type','button'); panel.style.maxHeight='0'; btn.addEventListener('click',()=>{ const willOpen=!item.classList.contains('open'); faqWrap.querySelectorAll('.faq-item.open').forEach(other=>{ if(other!==item){ other.classList.remove('open'); const op=other.querySelector('.faq-a'); if(op) op.style.maxHeight='0'; } }); item.classList.toggle('open',willOpen); panel.style.maxHeight = willOpen ? (panel.scrollHeight + 'px') : '0'; }); }); }

  // Parallax hero (desktop only)
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduce && window.innerWidth>900){
    const pEls=[{el:document.querySelector('.coin-wrapper'),m:18},{el:document.querySelector('.hero-content'),m:10}];
    window.addEventListener('mousemove',(ev)=>{ const x=(ev.clientX/window.innerWidth)-0.5; const y=(ev.clientY/window.innerHeight)-0.5; pEls.forEach(p=>{ if(p.el){ p.el.style.transform=`translate3d(${x*p.m}px, ${y*p.m}px, 0)`; }}); },{passive:true});
  }

  // CTA reactive shine position
  document.querySelectorAll('.btn-primary').forEach(btn=>{ btn.addEventListener('mousemove',(e)=>{ const r=btn.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width*100; btn.style.setProperty('--x', x+'%'); }); });
});
