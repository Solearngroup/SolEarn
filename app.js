/* SolEarn v2 — app.js */
(function(){ // Preloader progress
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
  // HERO title split animation
  const titleEl=document.querySelector('.hero-title');
  if(titleEl){
    const raw=(titleEl.textContent||'').trim();
    titleEl.setAttribute('aria-label',raw);
    titleEl.innerHTML=[...raw].map((ch,i)=>`<span style="animation-delay:${80+i*70}ms">${ch}</span>`).join('');
  }

  // Section title underline reveal
  const titleObs=new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('revealed'); titleObs.unobserve(e.target); } });
  },{threshold:.55});
  document.querySelectorAll('.section-title').forEach(h=>titleObs.observe(h));

  // Reveal on scroll
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{ if(entry.isIntersecting) entry.target.classList.add('active'); });
  },{threshold:0.3});
  document.querySelectorAll('.reveal, .roadmap-vertical .phase').forEach(el=>revealObserver.observe(el));

  // Navbar blur on scroll & active link
  const navbar=document.querySelector('.navbar');
  const setNavState=()=>{ if(!navbar) return; window.scrollY>10 ? navbar.classList.add('scrolled') : navbar.classList.remove('scrolled'); };
  setNavState(); window.addEventListener('scroll',setNavState);

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
    menuToggle.addEventListener('click',()=>{
      const open=navLinksEl.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', open ? 'true':'false');
    });
    navLinksEl.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      navLinksEl.classList.remove('open'); menuToggle.setAttribute('aria-expanded','false');
    }));
  }

  // Copy to clipboard
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

  // About video auto-preview ~1s
  const v=document.getElementById('aboutVideo');
  if(v){
    const preview=()=>{ try{ v.preload='auto'; v.muted=true; const stop=()=>{ try{ v.pause(); }catch(e){} }; const p=v.play(); if(p && typeof p.then==='function'){ p.then(()=>setTimeout(stop,1000)).catch(()=>{}); } else { setTimeout(stop,1000); } }catch(e){} };
    if(v.readyState>=2) preview(); else v.addEventListener('loadeddata', preview, {once:true});
  }

  // FAQ accordion
  const faqWrap=document.querySelector('.faq-wrap');
  if(faqWrap){ faqWrap.querySelectorAll('.faq-item').forEach(item=>{
    const btn=item.querySelector('.faq-q'); const panel=item.querySelector('.faq-a'); if(!btn||!panel) return;
    btn.setAttribute('type','button'); panel.style.maxHeight='0';
    btn.addEventListener('click',()=>{
      const willOpen=!item.classList.contains('open');
      faqWrap.querySelectorAll('.faq-item.open').forEach(other=>{ if(other!==item){ other.classList.remove('open'); const op=other.querySelector('.faq-a'); if(op) op.style.maxHeight='0'; } });
      item.classList.toggle('open',willOpen); panel.style.maxHeight = willOpen ? (panel.scrollHeight + 'px') : '0';
    });
  }); }

  // ===== Live Stats (DexScreener) =====
  (function initLiveStats(){
    const PAIR = 'E56jizCu8qZfkX5QkZHTrLs4aYCyBnzuX13ckvyUS2zd'; // Solana pair ID
    const URL = `https://api.dexscreener.com/latest/dex/pairs/solana/${PAIR}`;

    const $ = (id)=>document.getElementById(id);
    const elPrice=$('statPrice'), elPriceChg=$('statPriceChg');
    const elMcap=$('statMcap'), elMcapChg=$('statMcapChg');
    const elVol=$('statVol'), elVolChg=$('statVolChg');

    function fmtUsd(n){
      if(n==null || isNaN(n)) return '—';
      const v = Number(n);
      if(v >= 1e9) return '$'+(v/1e9).toFixed(2)+'B';
      if(v >= 1e6) return '$'+(v/1e6).toFixed(2)+'M';
      if(v >= 1e3) return '$'+(v/1e3).toFixed(2)+'K';
      if(v >= 1) return '$'+v.toFixed(4);
      return '$'+v.toFixed(8).replace(/0+$/,'').replace(/\.$/,'');
    }
    function fmtPct(p){
      if(p==null || isNaN(p)) return '—';
      return (p>=0?'+':'') + Number(p).toFixed(2) + '%';
    }
    function setDelta(el, pct){
      if(!el) return;
      el.classList.remove('up','down');
      if(pct==null || isNaN(pct)){ el.textContent='—'; return; }
      el.textContent = fmtPct(pct);
      el.classList.add(pct>=0?'up':'down');
    }

    async function tick(){
      try{
        const res = await fetch(URL, { cache:'no-store' });
        const data = await res.json();
        const p = data && data.pairs && data.pairs[0];
        if(!p) return;

        const price = p.priceUsd ? parseFloat(p.priceUsd) : null;
        const priceChg = p.priceChange && (p.priceChange.h24 ?? p.priceChange.h6 ?? p.priceChange.h1 ?? p.priceChange.m5);
        const mcap = p.marketCap ?? null;
        const vol24 = p.volume && (p.volume.h24 ?? null);
        const vol6 = p.volume && (p.volume.h6 ?? null);

        if(elPrice) elPrice.textContent = price!=null ? (price>=1? '$'+price.toFixed(6): '$'+price.toFixed(10).replace(/0+$/,'').replace(/\.$/,'')) : '—';
        if(elPriceChg) setDelta(elPriceChg, priceChg);

        if(elMcap) elMcap.textContent = fmtUsd(mcap);
        if(elMcapChg) setDelta(elMcapChg, priceChg); // approx

        if(elVol) elVol.textContent = fmtUsd(vol24);
        let volPct = null;
        if(vol24!=null && vol6!=null && vol6>0){ volPct = ((vol24 - vol6)/vol6)*100; }
        if(elVolChg) setDelta(elVolChg, volPct);
      }catch(e){ /* silent */ }
    }
    tick();
    setInterval(tick, 30000); // 30s
  })();

  // CTA shine follow
  document.querySelectorAll('.btn-primary').forEach(btn=>{
    btn.addEventListener('mousemove',(e)=>{
      const r=btn.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width*100; btn.style.setProperty('--x', x+'%');
    });
  });

  // Year
  const y=document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();


  // Swap phone iframe fallback if blocked by X-Frame-Options
  document.querySelectorAll('.swap-phone .phone').forEach(ph=>{
    const iframe=ph.querySelector('iframe');
    if(!iframe) return;
    let done=false;
    const show=()=>{ if(done) return; done=true; ph.classList.add('error'); };
    const timer=setTimeout(show, 4000);
    iframe.addEventListener('load',()=>{ clearTimeout(timer); });
  });

});
