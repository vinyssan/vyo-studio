/* VYO Studio — interações gerais. JS puro, sem dependências. */
(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var CFG=window.VYO_CONFIG||{};
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};

  /* ---------- contatos / WhatsApp / aviso ---------- */
  var toastEl=$('#toast'),toastT;
  function toast(msg){
    toastEl.textContent=msg;toastEl.classList.add('on');
    clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('on')},4200);
  }
  function waUrl(msg){return 'https://wa.me/'+String(CFG.whatsapp||'').replace(/\D/g,'')+'?text='+encodeURIComponent(msg||'')}
  function setWa(el,msg){if(!el)return;el.setAttribute('data-wa',msg);if(CFG.whatsapp){el.href=waUrl(msg);el.target='_blank';el.rel='noopener'}}
  window.VYO={toast:toast,waUrl:waUrl,setWa:setWa,cfg:CFG};

  $$('[data-wa]').forEach(function(a){var m=a.getAttribute('data-wa');if(m)setWa(a,m)});
  $$('[data-contact]').forEach(function(a){
    var k=a.getAttribute('data-contact');
    if(k==='instagram'&&CFG.instagram){a.href=CFG.instagram;a.target='_blank';a.rel='noopener'}
    if(k==='email'&&CFG.email){a.href='mailto:'+CFG.email}
  });
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('[data-wa],[data-contact]');
    if(!a)return;
    var k=a.getAttribute('data-contact');
    var ok=a.hasAttribute('data-wa')&&(!k||k==='whatsapp')?!!CFG.whatsapp:k==='instagram'?!!CFG.instagram:k==='email'?!!CFG.email:true;
    if(ok)return;                      // contato configurado: segue o link normalmente
    e.preventDefault();
    var nome=k==='instagram'?'o Instagram':k==='email'?'o e-mail':'o WhatsApp';
    toast('Falta configurar '+nome+' em assets/js/config.js');
    if(window.VYOGallery&&window.VYOGallery.isOpen())window.VYOGallery.closePanel();
    if(!a.closest('#contato'))setTimeout(function(){var c=$('#contato');c&&c.scrollIntoView({behavior:reduce?'auto':'smooth'})},window.VYOGallery&&window.VYOGallery.isOpen()?520:0);
  });
  if(CFG.mostrarFilmes){var fl=$('#filmes');if(fl)fl.hidden=false}

  /* ---------- preloader ---------- */
  var pre=$('#pre');
  function hidePre(){pre&&pre.classList.add('is-done')}
  if(document.readyState==='complete')setTimeout(hidePre,300);else window.addEventListener('load',function(){setTimeout(hidePre,300)});
  setTimeout(hidePre,2200);

  /* ---------- galeria (cartões, marquee, painel) ---------- */
  if(window.VYOGallery)window.VYOGallery.init();

  /* ---------- cabeçalho e menu ---------- */
  var header=$('#header'),menuBtn=$('#menuBtn');
  function onScrollHdr(){header.classList.toggle('is-scrolled',window.scrollY>40)}
  onScrollHdr();
  function setMenu(open){
    document.body.classList.toggle('menu-open',open);
    header.classList.toggle('menu-open',open);
    menuBtn.setAttribute('aria-expanded',open?'true':'false');
    menuBtn.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
    document.documentElement.classList.toggle('no-scroll',open);
  }
  menuBtn.addEventListener('click',function(){setMenu(!document.body.classList.contains('menu-open'))});
  $$('#nav a').forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.body.classList.contains('menu-open'))setMenu(false)});

  /* link ativo conforme a seção visível */
  var links={};$$('#nav a[href^="#"]').forEach(function(a){links[a.getAttribute('href').slice(1)]=a});
  var secs=['trabalhos','servicos','sobre','contato'].map(function(id){return $('#'+id)}).filter(Boolean);
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){
        if(en.isIntersecting){
          Object.keys(links).forEach(function(k){links[k].removeAttribute('aria-current')});
          if(links[en.target.id])links[en.target.id].setAttribute('aria-current','true');
        }
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    secs.forEach(function(s){io.observe(s)});
  }

  /* ---------- revelar ao rolar ---------- */
  var rvEls=$$('.rv,.arch,.steps');
  if('IntersectionObserver' in window&&!reduce){
    var ro=new IntersectionObserver(function(es){
      es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');var a=en.target.querySelector&&en.target.querySelector('.arch');if(a)a.classList.add('in');ro.unobserve(en.target)}});
    },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    rvEls.forEach(function(el){ro.observe(el.classList.contains('arch')?el.parentNode:el)});
    // cartões inseridos via JS
    new MutationObserver(function(){$$('.rv:not(.in)').forEach(function(el){ro.observe(el)})}).observe(document.body,{childList:true,subtree:true});
  }else rvEls.forEach(function(el){el.classList.add('in')});

  /* hero: texto entra sem esperar o scroll */
  requestAnimationFrame(function(){$$('.hero .rv').forEach(function(el){el.classList.add('in')})});

  /* ---------- contador do total ---------- */
  var tot=$('#totalFotos');
  if(tot){
    var go=function(){
      var n=+tot.getAttribute('data-count')||0;
      if(reduce){tot.textContent=n;return}
      var t0=performance.now();
      (function step(t){var p=clamp((t-t0)/1400,0,1);tot.textContent=Math.round(n*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step)})(t0);
    };
    if('IntersectionObserver' in window){
      var co=new IntersectionObserver(function(es){if(es[0].isIntersecting){go();co.disconnect()}},{threshold:.5});co.observe(tot);
    }else go();
  }

  /* ---------- hero: crossfade + contador ---------- */
  var slides=$$('.hero__slide'),cur=0,numEl=$('#heroNum'),heroEl=$('.hero'),timer,heroVisible=true;
  function show(n){
    var prev=slides[cur];prev.classList.remove('is-on');prev.classList.add('is-out');
    setTimeout(function(){prev.classList.remove('is-out')},1500);
    cur=n;slides[cur].classList.add('is-on');
    numEl.classList.add('swap');
    setTimeout(function(){numEl.textContent=String(cur+1).padStart(2,'0');numEl.classList.remove('swap')},260);
  }
  function play(){stop();if(reduce||slides.length<2)return;timer=setInterval(function(){if(!document.hidden&&heroVisible)show((cur+1)%slides.length)},6500)}
  function stop(){clearInterval(timer)}
  play();
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){heroVisible=es[0].isIntersecting}).observe(heroEl);

  /* ---------- parallax (hero, retrato) ---------- */
  var stack=$('#heroStack'),bg=$('#heroBg'),mini=$('#mini'),sobre=$('#sobre'),ticking=false;
  function onScroll(){
    onScrollHdr();
    if(ticking)return;ticking=true;
    requestAnimationFrame(function(){
      ticking=false;
      var y=window.scrollY,vh=innerHeight;
      if(!reduce){
        if(y<vh*1.2)bg.style.transform='translate3d(0,'+(y*.15).toFixed(1)+'px,0)';
        if(sobre&&mini){var r=sobre.getBoundingClientRect();var p=clamp((vh-r.top)/(vh+r.height),0,1);mini.style.setProperty('--py2',((p-.5)*-60).toFixed(1)+'px')}
      }
      words();
    });
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll);
  if(fine&&!reduce&&stack){
    heroEl.addEventListener('pointermove',function(e){
      var x=(e.clientX/innerWidth-.5)*2,y=(e.clientY/innerHeight-.5)*2;
      stack.style.setProperty('--px',(x*-10).toFixed(1)+'px');stack.style.setProperty('--py',(y*-10).toFixed(1)+'px');
    });
  }

  /* ---------- manifesto: palavra por palavra no scroll ---------- */
  var mt=$('[data-words]'),wEls=[];
  if(mt){
    mt.setAttribute('aria-label',mt.textContent);
    mt.innerHTML=mt.textContent.split(' ').map(function(w){return '<span class="w" aria-hidden="true">'+w+'</span>'}).join(' ');
    wEls=$$('.w',mt);
  }
  function words(){
    if(!wEls.length)return;
    if(reduce){wEls.forEach(function(w){w.classList.add('on')});return}
    var r=mt.getBoundingClientRect(),vh=innerHeight;
    var p=clamp((vh*.82-r.top)/(vh*.45),0,1);
    var n=Math.round(p*wEls.length);
    wEls.forEach(function(w,i){w.classList.toggle('on',i<n)});
  }
  onScroll();

  /* ---------- brilho do vidro + botões magnéticos ---------- */
  if(fine){
    document.addEventListener('pointermove',function(e){
      var g=e.target.closest&&e.target.closest('.glass');
      if(g){var r=g.getBoundingClientRect();g.style.setProperty('--mx',(e.clientX-r.left)+'px');g.style.setProperty('--my',(e.clientY-r.top)+'px')}
    },{passive:true});
    if(!reduce)$$('[data-magnet]').forEach(function(b){
      b.addEventListener('pointermove',function(e){
        var r=b.getBoundingClientRect();
        b.style.transform='translate('+clamp((e.clientX-r.left-r.width/2)*.12,-6,6).toFixed(1)+'px,'+clamp((e.clientY-r.top-r.height/2)*.2,-6,6).toFixed(1)+'px)';
      });
      b.addEventListener('pointerleave',function(){b.style.transform=''});
    });
  }

  /* ---------- formulário → WhatsApp ---------- */
  var form=$('#form');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var ok=true;
    ['f-nome','f-tipo','f-msg'].forEach(function(id){
      var el=$('#'+id),f=el.closest('.field'),bad=!el.value.trim();
      f.classList.toggle('bad',bad);el.setAttribute('aria-invalid',bad?'true':'false');
      if(bad&&ok){el.focus();ok=false}
    });
    if(!ok)return;
    var d=$('#f-data').value;
    var data=d?d.split('-').reverse().join('/'):'';
    var msg='Olá, Vinícius! Meu nome é '+$('#f-nome').value.trim()+'.\nTrabalho: '+$('#f-tipo').value+(data?'\nData prevista: '+data:'')+'\n\n'+$('#f-msg').value.trim();
    if(!CFG.whatsapp){toast('Falta configurar o WhatsApp em assets/js/config.js');return}
    window.open(waUrl(msg),'_blank','noopener');
  });
  $$('.field input,.field select,.field textarea',form).forEach(function(el){
    el.addEventListener('input',function(){el.closest('.field').classList.remove('bad');el.setAttribute('aria-invalid','false')});
  });
})();
