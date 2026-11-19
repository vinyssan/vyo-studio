/* VYO Studio — portfólio em abas (capa, perfil, projetos, contato). JS puro, sem dependências. */
(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CFG=window.VYO_CONFIG||{};
  var cats=((window.VYO_GALLERY&&window.VYO_GALLERY.categorias)||[]).filter(function(c){return c.visivel&&c.fotos&&c.fotos.length});
  var ORDER=['inicio','perfil','projetos','contato'];
  var EASE='cubic-bezier(.7,0,.2,1)';
  var SIZES=[480,960,1600];
  var body=document.body,main=$('#main'),bar=$('#bar');
  var filter='todos';

  function esc(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML}
  function dim(f,s){return f.orientacao==='h'?s:Math.round(s*f.w/f.h)}
  function hgt(f,s){return f.orientacao==='h'?Math.round(s*f.h/f.w):s}
  function src(c,f,s){return 'assets/img/'+c.slug+'/'+f.id+'-'+s+'.webp'}
  function srcset(c,f){return SIZES.map(function(s){return src(c,f,s)+' '+dim(f,s)+'w'}).join(', ')}
  function cover(c){return c.fotos.filter(function(f){return f.id===c.capa})[0]||c.fotos[0]}
  function bySlug(s){return cats.filter(function(c){return c.slug===s})[0]}

  /* ---------- aviso e contatos ---------- */
  var toastEl=$('#toast'),toastT;
  function toast(m){toastEl.textContent=m;toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('on')},4200)}
  function waUrl(m){return 'https://wa.me/'+String(CFG.whatsapp||'').replace(/\D/g,'')+'?text='+encodeURIComponent(m||'')}
  $$('[data-contact]').forEach(function(a){
    var k=a.getAttribute('data-contact');
    if(k==='whatsapp'&&CFG.whatsapp){a.href=waUrl(a.getAttribute('data-wa'));a.target='_blank';a.rel='noopener'}
    if(k==='instagram'&&CFG.instagram){a.href=CFG.instagram;a.target='_blank';a.rel='noopener'}
    if(k==='email'&&CFG.email){a.href='mailto:'+CFG.email}
  });
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('[data-contact]');
    if(!a)return;
    var k=a.getAttribute('data-contact');
    var ok=(k==='whatsapp'&&CFG.whatsapp)||(k==='instagram'&&CFG.instagram)||(k==='email'&&CFG.email);
    if(!ok){e.preventDefault();toast('Falta configurar '+(k==='whatsapp'?'o WhatsApp':k==='instagram'?'o Instagram':'o e-mail')+' em assets/js/config.js')}
  });

  /* ---------- reflexo do vidro acompanha o cursor ---------- */
  document.addEventListener('pointermove',function(e){
    var g=e.target.closest&&e.target.closest('.glass');if(!g)return;
    var r=g.getBoundingClientRect();g.style.setProperty('--mx',(e.clientX-r.left)+'px');g.style.setProperty('--my',(e.clientY-r.top)+'px');
  },{passive:true});

  /* ---------- conteúdo vindo dos dados ---------- */
  function fillStatic(){
    var ch=$('#chips');
    if(ch){
      ch.innerHTML=cats.map(function(c){
        var f=cover(c);
        return '<button class="cat" type="button" data-f="'+c.slug+'" aria-pressed="false"><span class="cat__img"><img src="'+src(c,f,480)+'" srcset="'+srcset(c,f)+'" sizes="(max-width:600px) 45vw,22vw" width="'+dim(f,480)+'" height="'+hgt(f,480)+'" alt="" loading="lazy" decoding="async" style="object-position:'+f.foco+'"></span><span class="cat__t">'+esc(c.titulo)+'</span><span class="cat__b">Ver fotos</span></button>';
      }).join('')+'<button class="cats__all" type="button" data-f="todos" aria-pressed="true">Ver todas as fotos</button>';
      ch.addEventListener('click',function(e){
        var b=e.target.closest('[data-f]');if(!b)return;
        setFilter(b.getAttribute('data-f'),true);
        var top=$('#mosaic').getBoundingClientRect().top+window.scrollY-96;
        window.scrollTo({top:top,behavior:reduce?'auto':'smooth'});
      });
    }
  }

  /* ---------- mosaico de projetos ---------- */
  var list=[];
  function itemsFor(slug){
    if(slug!=='todos'&&bySlug(slug))return bySlug(slug).fotos.map(function(f){return {c:bySlug(slug),f:f}});
    var out=[],i=0,more=true; // intercala as categorias para variar o mosaico
    while(more){more=false;cats.forEach(function(c){if(c.fotos[i]){out.push({c:c,f:c.fotos[i]});more=true}});i++}
    return out;
  }
  function paintMosaic(){
    list=itemsFor(filter);
    var m=$('#mosaic');
    m.innerHTML=list.map(function(it,i){
      var f=it.f;
      return '<button class="tile" type="button" style="--k:'+Math.min(i,24)+';aspect-ratio:'+f.w+'/'+f.h+'" data-i="'+i+'">'+
        '<img src="'+src(it.c,f,480)+'" srcset="'+srcset(it.c,f)+'" sizes="(max-width:600px) 50vw,(max-width:1000px) 33vw,25vw" width="'+dim(f,480)+'" height="'+hgt(f,480)+'" alt="'+esc(f.alt)+'" loading="lazy" decoding="async" style="object-position:'+f.foco+'">'+
        '<span class="tile__cap">'+esc(it.c.titulo)+'</span></button>';
    }).join('');
    $$('#chips [data-f]').forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-f')===filter?'true':'false')});
  }
  function playMosaic(){
    var m=$('#mosaic');m.classList.remove('in','out');void m.offsetWidth;
    requestAnimationFrame(function(){requestAnimationFrame(function(){m.classList.add('in')})});
  }
  function setFilter(slug,animate){
    if(slug!=='todos'&&!bySlug(slug))slug='todos';
    if(slug===filter&&$('#mosaic').children.length)return;
    filter=slug;
    var m=$('#mosaic');
    if(!animate||reduce){paintMosaic();playMosaic();return}
    m.classList.add('out');
    setTimeout(function(){paintMosaic();playMosaic()},270);
  }
  $('#mosaic').addEventListener('click',function(e){
    var t=e.target.closest('.tile');if(t)openLb(+t.getAttribute('data-i'),t);
  });

  /* ---------- lightbox ---------- */
  var lb=$('#lb'),lbImg=$('#lbImg'),lbCap=$('#lbCap'),lbIdx=0,lbFrom=null,lbOpen=false;
  function lbShow(i,dir){
    var n=list.length;lbIdx=(i+n)%n;var it=list[lbIdx];
    var im=new Image();
    im.onload=function(){
      lbImg.src=im.src;lbImg.alt=it.f.alt;
      lbCap.textContent=it.c.titulo+' · '+(lbIdx+1)+' / '+n+' — '+it.f.alt;
      if(dir&&!reduce)lbImg.animate([{clipPath:dir>0?'inset(0 0 0 100%)':'inset(0 100% 0 0)'},{clipPath:'inset(0)'}],{duration:480,easing:EASE});
    };
    im.src=src(it.c,it.f,1600);
  }
  function openLb(i,from){
    lbFrom=from;lbOpen=true;
    var r=from.getBoundingClientRect();
    lb.style.setProperty('--ox',(r.left+r.width/2)+'px');lb.style.setProperty('--oy',(r.top+r.height/2)+'px');
    main.setAttribute('inert','');bar.setAttribute('inert','');body.classList.add('lock');
    lbShow(i,0);lb.classList.add('is-on');
    setTimeout(function(){$('#lbX').focus()},60);
  }
  function closeLb(){
    if(!lbOpen)return;lbOpen=false;
    if(lbFrom&&document.contains(lbFrom)){var r=lbFrom.getBoundingClientRect();lb.style.setProperty('--ox',(r.left+r.width/2)+'px');lb.style.setProperty('--oy',(r.top+r.height/2)+'px')}
    lb.classList.remove('is-on');main.removeAttribute('inert');bar.removeAttribute('inert');body.classList.remove('lock');
    if(lbFrom)lbFrom.focus({preventScroll:true});
  }
  $('#lbX').addEventListener('click',closeLb);
  $('#lbP').addEventListener('click',function(){lbShow(lbIdx-1,-1)});
  $('#lbN').addEventListener('click',function(){lbShow(lbIdx+1,1)});
  lb.addEventListener('click',function(e){if(e.target===lb||e.target.classList.contains('lb__fig'))closeLb()});
  var sx=null;
  lb.addEventListener('pointerdown',function(e){sx=e.clientX});
  lb.addEventListener('pointerup',function(e){if(sx===null)return;var d=e.clientX-sx;sx=null;if(Math.abs(d)>60)lbShow(lbIdx+(d<0?1:-1),d<0?1:-1)});
  document.addEventListener('keydown',function(e){
    if(lbOpen){
      if(e.key==='Escape')closeLb();
      else if(e.key==='ArrowRight')lbShow(lbIdx+1,1);
      else if(e.key==='ArrowLeft')lbShow(lbIdx-1,-1);
      else if(e.key==='Tab'){ // prende o foco dentro do lightbox
        var f=$$('button',lb),i=f.indexOf(document.activeElement);
        if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}
        else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}
      }
      return;
    }
  });
  $$('#menu a').forEach(function(a){
    a.addEventListener('mouseenter',function(){$$('#menu a').forEach(function(x){x.classList.remove('is-sel')});a.classList.add('is-sel')});
  });

  /* ---------- seções: entrada ao rolar e aba ativa ---------- */
  var secs=$$('.scr');
  function enter(sec){
    sec.classList.add('is-on');
    if(sec.id==='projetos')playMosaic();
  }
  function setActive(id){
    $$('.tabs a').forEach(function(a){if(a.getAttribute('href')==='#'+id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
    
  }
  if('IntersectionObserver' in window&&!reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){enter(en.target);io.unobserve(en.target)}})},{threshold:0,rootMargin:'0px 0px -14% 0px'});
    secs.forEach(function(x){io.observe(x)});
  }else secs.forEach(enter);
  if('IntersectionObserver' in window){
    var act=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting)setActive(en.target.id)})},{rootMargin:'-45% 0px -50% 0px'});
    secs.forEach(function(x){act.observe(x)});
  }
  setActive('inicio');
  // paralaxe leve da palavra gigante com o mouse
  var capa=$('#inicio');
  if(!reduce&&window.matchMedia('(hover:hover)').matches){
    capa.addEventListener('pointermove',function(e){var r=capa.getBoundingClientRect();capa.style.setProperty('--px',((e.clientX-r.left)/r.width-.5).toFixed(3))},{passive:true});
    capa.addEventListener('pointerleave',function(){capa.style.setProperty('--px',0)});
  }

  /* ---------- formulário → WhatsApp ---------- */
  var form=$('#form');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var n=$('#f-nome'),t=$('#f-tipo'),m=$('#f-msg'),err=$('#ferr'),bad=[];
    [n,t,m].forEach(function(x){x.classList.remove('bad');if(!x.value.trim())bad.push(x)});
    if(bad.length){bad.forEach(function(x){x.classList.add('bad')});err.textContent='Preencha nome, tipo de trabalho e mensagem.';bad[0].focus();return}
    err.textContent='';
    if(!CFG.whatsapp){toast('Falta configurar o WhatsApp em assets/js/config.js');return}
    var msg='Olá, Vinícius! Me chamo '+n.value.trim()+'.\nTipo de trabalho: '+t.value+'.\n'+m.value.trim();
    var a=document.createElement('a');a.href=waUrl(msg);a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();
  });

  /* ---------- início ---------- */
  fillStatic();
  paintMosaic();
})();
