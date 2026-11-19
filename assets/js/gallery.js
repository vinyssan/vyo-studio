/* VYO Studio — cartões de categoria, painel de galeria (masonry) e lightbox. JS puro. */
(function(){
  'use strict';
  var DATA=(window.VYO_GALLERY&&window.VYO_GALLERY.categorias)||[];
  var cats=DATA.filter(function(c){return c.visivel&&c.fotos&&c.fotos.length});
  var $=function(s,r){return (r||document).querySelector(s)};
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE='cubic-bezier(.22,.8,.2,1)';
  var SIZES=[480,960,1600];

  function dim(f,s){return f.orientacao==='h'?s:Math.round(s*f.w/f.h)}
  function hgt(f,s){return f.orientacao==='h'?Math.round(s*f.h/f.w):s}
  function srcset(c,f){return SIZES.map(function(s){return 'assets/img/'+c.slug+'/'+f.id+'-'+s+'.webp '+dim(f,s)+'w'}).join(', ')}
  function src(c,f,s){return 'assets/img/'+c.slug+'/'+f.id+'-'+s+'.webp'}
  function esc(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML}
  function bySlug(s){return cats.filter(function(c){return c.slug===s})[0]}
  function cover(c){return c.fotos.filter(function(f){return f.id===c.capa})[0]||c.fotos[0]}

  var ARROW='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>';

  /* ---------- cartões ---------- */
  function renderCards(){
    var box=$('#cards');if(!box)return;
    box.innerHTML=cats.map(function(c,i){
      var f=cover(c);
      return '<a class="card rv" style="--d:'+i+'" href="#/trabalhos/'+c.slug+'" data-slug="'+c.slug+'" aria-label="'+esc(c.titulo)+', '+c.fotos.length+' fotos">'+
        '<img src="'+src(c,f,960)+'" srcset="'+srcset(c,f)+'" sizes="(max-width:640px) 80vw,(max-width:1100px) 50vw,25vw" width="'+dim(f,960)+'" height="'+hgt(f,960)+'" loading="lazy" decoding="async" alt="" style="object-position:'+f.foco+'">'+
        '<div class="card__info glass"><div><h3>'+esc(c.titulo)+'</h3><p>'+esc(c.descricao)+'</p><small>'+c.fotos.length+' fotos</small></div>'+
        '<span class="card__arrow glass glass--pill">'+ARROW+'</span></div></a>';
    }).join('');
    var fc=$('#footCats');
    if(fc)fc.innerHTML=cats.map(function(c){return '<li><a href="#/trabalhos/'+c.slug+'">'+esc(c.titulo)+'</a></li>'}).join('');
    var tot=cats.reduce(function(n,c){return n+c.fotos.length},0);
    var t=$('#totalFotos');if(t)t.setAttribute('data-count',tot);
  }

  /* ---------- marquee ---------- */
  function renderMarquee(){
    var m=$('#marquee');if(!m)return;
    var all=[];
    cats.forEach(function(c){c.fotos.forEach(function(f){if(f.orientacao==='h')all.push([c,f])})});
    var rows=[all.filter(function(_,i){return i%2===0}),all.filter(function(_,i){return i%2===1})];
    m.innerHTML=rows.map(function(r,k){
      var h=r.map(function(p){return '<img src="'+src(p[0],p[1],480)+'" alt="" width="480" height="'+Math.round(480*p[1].h/p[1].w)+'" loading="lazy" decoding="async">'}).join('');
      return '<div class="marquee__row'+(k?' marquee__row--rev':'')+'">'+h+h+'</div>';
    }).join('');
  }

  /* ---------- painel ---------- */
  var panel=$('#panel'),app=$('#app'),masonry=$('#masonry'),chips=$('#chips');
  var cur=null,origin=null,openedByNav=false,lastFocus=null,isOpen=false;

  function wa(msg){return window.VYO&&window.VYO.setWa?window.VYO.setWa($('#ctaBtn'),msg):0}

  function fillPanel(c){
    cur=c;
    $('#panel-t').textContent=c.titulo;
    $('#panelDesc').textContent=c.descricao;
    $('#panelCount').textContent=c.fotos.length+' fotos';
    var f=cover(c);
    $('#panelBg').src=src(c,f,480);
    chips.innerHTML=cats.map(function(k){return '<a class="chip" role="listitem" href="#/trabalhos/'+k.slug+'"'+(k.slug===c.slug?' aria-current="true"':'')+'>'+esc(k.titulo)+'</a>'}).join('');
    masonry.innerHTML=c.fotos.map(function(f,i){
      return '<button class="shot" style="--i:'+Math.min(i,14)+';--ar:'+f.w+'/'+f.h+'" data-i="'+i+'" aria-label="Ampliar foto '+(i+1)+': '+esc(f.alt)+'">'+
        '<img src="'+src(c,f,480)+'" srcset="'+srcset(c,f)+'" sizes="(max-width:520px) 50vw,(max-width:1000px) 50vw,33vw" width="'+dim(f,480)+'" height="'+hgt(f,480)+'" loading="lazy" decoding="async" alt="'+esc(f.alt)+'" style="object-position:'+f.foco+'"></button>';
    }).join('');
    wa('Olá, Vinícius! Vi as fotos de '+c.titulo.toLowerCase()+' no seu portfólio e gostaria de conversar.');
    $('#ctaTxt').textContent=c.slug==='casamentos'?'Quer algo assim para o seu casamento?':'Quer algo assim para a sua história?';
  }

  function rectStr(r){return 'inset('+Math.max(0,r.top)+'px '+Math.max(0,innerWidth-r.right)+'px '+Math.max(0,innerHeight-r.bottom)+'px '+Math.max(0,r.left)+'px round 24px)'}

  function openPanel(c){
    var was=isOpen;
    fillPanel(c);
    if(was){panel.scrollTop=0;masonry.animate([{opacity:.0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:500,easing:EASE});return}
    isOpen=true;lastFocus=document.activeElement;
    panel.hidden=false;panel.scrollTop=0;
    document.documentElement.classList.add('no-scroll');
    app.inert=true;
    if(!reduce&&origin){
      panel.animate([{clipPath:rectStr(origin),opacity:.4},{clipPath:'inset(0px 0px 0px 0px round 0px)',opacity:1}],{duration:750,easing:EASE});
    }else{panel.animate([{opacity:0},{opacity:1}],{duration:reduce?1:400})}
    setTimeout(function(){var h=$('#panel-t');h&&h.focus({preventScroll:true})},60);
  }

  function closePanel(){
    if(!isOpen)return;
    isOpen=false;
    var card=cur&&document.querySelector('.card[data-slug="'+cur.slug+'"]');
    var r=card&&card.getBoundingClientRect();
    var done=function(){
      panel.hidden=true;app.inert=false;
      document.documentElement.classList.remove('no-scroll');
      if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true});
    };
    if(reduce){done();return}
    var visible=r&&r.bottom>0&&r.top<innerHeight;
    var kf=visible
      ?[{clipPath:'inset(0px 0px 0px 0px round 0px)',opacity:1,filter:'blur(0px)'},{clipPath:rectStr(r),opacity:0,filter:'blur(6px)'}]
      :[{opacity:1,transform:'scale(1)',filter:'blur(0px)'},{opacity:0,transform:'scale(.98)',filter:'blur(6px)'}];
    panel.animate(kf,{duration:500,easing:EASE}).finished.then(done,done);
  }

  function route(){
    var m=/^#\/trabalhos\/([\w-]+)$/.exec(location.hash);
    var c=m&&bySlug(m[1]);
    if(c){openPanel(c)}else if(isOpen){closePanel()}
  }
  window.addEventListener('hashchange',function(){openedByNav=true;route()});

  document.addEventListener('click',function(e){
    var card=e.target.closest&&e.target.closest('.card');
    if(card){origin=card.getBoundingClientRect()}
  },true);

  $('#panelBack').addEventListener('click',function(){
    if(openedByNav){history.back()}
    else{history.replaceState(null,'',location.pathname+location.search+'#trabalhos');closePanel()}
  });

  /* ---------- lightbox ---------- */
  var lb=$('#lb'),lbImg=$('#lbImg'),idx=0,lbOpen=false,lbFrom=null;
  function showPhoto(i,instant){
    var n=cur.fotos.length;idx=(i+n)%n;
    var f=cur.fotos[idx];
    var apply=function(){
      lbImg.srcset=SIZES.slice(1).map(function(s){return src(cur,f,s)+' '+dim(f,s)+'w'}).join(', ');
      lbImg.sizes='100vw';lbImg.src=src(cur,f,1600);lbImg.alt=f.alt;
      lbImg.width=dim(f,1600);lbImg.height=hgt(f,1600);
      $('#lbCap').textContent=f.alt;
      $('#lbCount').textContent=String(idx+1).padStart(2,'0')+' / '+String(n).padStart(2,'0');
      lbImg.classList.remove('swap');
    };
    if(instant||reduce){apply()}else{lbImg.classList.add('swap');setTimeout(apply,180)}
    var nx=cur.fotos[(idx+1)%n];(new Image()).src=src(cur,nx,1600);
  }
  function openLb(i,from){
    lbOpen=true;lbFrom=from;lb.hidden=false;panel.inert=true;
    showPhoto(i,true);
    requestAnimationFrame(function(){lb.classList.add('is-on')});
    $('#lbClose').focus();
  }
  function closeLb(){
    if(!lbOpen)return;lbOpen=false;lb.classList.remove('is-on');
    setTimeout(function(){lb.hidden=true},reduce?0:350);
    panel.inert=false;
    if(lbFrom&&lbFrom.focus)lbFrom.focus({preventScroll:true});
  }
  masonry.addEventListener('click',function(e){
    var b=e.target.closest('.shot');if(b)openLb(+b.getAttribute('data-i'),b);
  });
  $('#lbClose').addEventListener('click',closeLb);
  $('#lbPrev').addEventListener('click',function(){showPhoto(idx-1)});
  $('#lbNext').addEventListener('click',function(){showPhoto(idx+1)});
  lb.addEventListener('click',function(e){if(e.target===lb||e.target.classList.contains('lb__fig'))closeLb()});
  var sx=null;
  lb.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){
    if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;sx=null;
    if(Math.abs(dx)>50)showPhoto(idx+(dx<0?1:-1));
  });

  document.addEventListener('keydown',function(e){
    if(lbOpen){
      if(e.key==='Escape'){e.preventDefault();closeLb()}
      else if(e.key==='ArrowRight'){showPhoto(idx+1)}
      else if(e.key==='ArrowLeft'){showPhoto(idx-1)}
      else if(e.key==='Tab'){ /* mantém o foco dentro do lightbox */
        var f=[].slice.call(lb.querySelectorAll('button'));
        var i=f.indexOf(document.activeElement);
        if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}
        else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}
      }
    }else if(isOpen&&e.key==='Escape'){$('#panelBack').click()}
  });

  window.VYOGallery={init:function(){renderCards();renderMarquee();route()},closePanel:function(){$('#panelBack').click()},isOpen:function(){return isOpen}};
})();
