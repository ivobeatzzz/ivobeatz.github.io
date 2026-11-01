/* IVO Beatz: idiomas. El original es el español; inglés y francés se aplican encima con un diccionario.
   Se carga en el <head> antes que nada para que la página no parpadee en español. */
(function(){
  var LANGS={es:"Español",en:"English",fr:"Français"},KEY="ivo_lang";
  function get(){try{return localStorage.getItem(KEY)}catch(e){return null}}
  function put(v){try{localStorage.setItem(KEY,v)}catch(e){}}
  var qp=/[?&]lang=(es|en|fr)\b/.exec(location.search),saved=get(),lang=qp?qp[1]:(LANGS[saved]?saved:"es");
  if(qp)put(qp[1]);
  var V=(document.currentScript&&/[?&]v=([\w.]+)/.exec(document.currentScript.src)||[])[1]||"1";
  window.IVO_LANG=lang;
  window.ivoSetLang=function(l){if(!LANGS[l])return;put(l);var u=new URL(location.href);u.searchParams.delete("lang");if(l!=="es")u.searchParams.set("lang",l);location.replace(u.toString())};
  // locales para fechas y números
  window.IVO_LOCALE={es:"es-ES",en:"en-GB",fr:"fr-FR"}[lang];
  if(lang!=="es"){
    document.documentElement.lang=lang;document.documentElement.classList.add("i18n-wait");
    document.write('<style>html.i18n-wait body{visibility:hidden}</style><script src="/i18n/'+lang+'.js?v='+V+'"><\/script>');
    setTimeout(function(){document.documentElement.classList.remove("i18n-wait")},2500);
  }

  /* ---------- motor de traducción ---------- */
  var ATTR=["placeholder","aria-label","title","alt","data-tip"],done=new WeakMap(),busy=false;
  function norm(t){return t.replace(/\s+/g," ").trim()}
  function dict(){return window.IVO_I18N||null}
  function tr(t){var I=dict();if(!I)return null;var k=norm(t);if(!k)return null;
    if(Object.prototype.hasOwnProperty.call(I.d,k))return I.d[k];
    for(var i=0;i<I.r.length;i++){var m=I.r[i][0].exec(k);if(m){var o=I.r[i][1];return typeof o==="function"?o.apply(null,m):k.replace(I.r[i][0],o)}}
    if(k.indexOf(" · ")>0){var p=k.split(" · "),c=0,out=p.map(function(x){var y=tr1(x);if(y!=null){c++;return y}return x});if(c)return out.join(" · ")}
    return null}
  function tr1(x){var I=dict(),k=norm(x);if(Object.prototype.hasOwnProperty.call(I.d,k))return I.d[k];for(var i=0;i<I.r.length;i++){var m=I.r[i][0].exec(k);if(m){var o=I.r[i][1];return typeof o==="function"?o.apply(null,m):k.replace(I.r[i][0],o)}}return null}
  window.ivoT=function(t){if(lang==="es")return t;var r=tr(t);return r==null?t:r};
  function skip(el){for(var e=el;e&&e.nodeType===1;e=e.parentNode){if(e.getAttribute("translate")==="no"||e.classList.contains("notranslate"))return true;var n=e.tagName;if(n==="SCRIPT"||n==="STYLE"||n==="TEXTAREA"||n==="CODE"||n==="NOSCRIPT")return true}return false}
  function text(n){var v=n.nodeValue;if(!v||!/[A-Za-zÀ-ÿ]/.test(v))return;if(done.get(n)===v)return;if(skip(n.parentNode))return;
    var r=tr(v);if(r!=null){var a=/^\s*/.exec(v)[0],b=/\s*$/.exec(v)[0];r=a+r+b;n.nodeValue=r;done.set(n,r)}else{done.set(n,v);if(window.IVO_I18N_MISS)window.IVO_I18N_MISS(norm(v))}}
  function attrs(el){if(skip(el))return;for(var i=0;i<ATTR.length;i++){var a=ATTR[i],v=el.getAttribute(a);if(!v)continue;var key="_t_"+a;if(el[key]===v)continue;var r=tr(v);if(r!=null){el.setAttribute(a,r);el[key]=r}else{el[key]=v;if(window.IVO_I18N_MISS&&/[a-zà-ÿ]{3}/i.test(v))window.IVO_I18N_MISS(norm(v))}}
    if(el.tagName==="INPUT"&&/^(submit|button)$/i.test(el.type)&&el.value){var r2=tr(el.value);if(r2!=null&&el._t_v!==el.value){el.value=r2;el._t_v=r2}}}
  function walk(root){if(!root)return;if(root.nodeType===3){text(root);return}if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
    if(root.nodeType===1)attrs(root);
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT),n;
    while((n=w.nextNode())){if(n.nodeType===3)text(n);else attrs(n)}}
  function head(){var t=tr(document.title);if(t!=null)document.title=t;
    Array.prototype.forEach.call(document.querySelectorAll('meta[name=description],meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"]'),function(m){var r=tr(m.getAttribute("content")||"");if(r!=null)m.setAttribute("content",r)});
    var og=document.querySelector('meta[property="og:locale"]');if(og)og.setAttribute("content",lang==="en"?"en_GB":"fr_FR")}
  function start(){if(lang==="es"||!dict())return;
    head();walk(document.body);document.documentElement.classList.remove("i18n-wait");
    new MutationObserver(function(ms){if(busy)return;busy=true;try{ms.forEach(function(m){
      if(m.type==="characterData")text(m.target);
      else if(m.type==="attributes")attrs(m.target);
      else for(var i=0;i<m.addedNodes.length;i++)walk(m.addedNodes[i])})}finally{busy=false}})
      .observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTR.concat(["value"])});
    // el título de la pestaña puede cambiar desde los scripts
    var tt=document.querySelector("title");if(tt)new MutationObserver(function(){var t=tr(document.title);if(t!=null&&t!==document.title)document.title=t}).observe(tt,{childList:true,characterData:true,subtree:true})}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();

  /* ---------- selector de idioma y aviso ---------- */
  var UI={es:{t:"Idioma",ask:"Esta web está en español. ¿Quieres verla en {L}?",yes:"Ver en {L}",no:"Seguir en español"},
          en:{t:"Language",ask:"This site is in Spanish. Would you like to see it in English?",yes:"View in English",no:"Stay in Spanish"},
          fr:{t:"Langue",ask:"Ce site est en espagnol. Voulez-vous le voir en français ?",yes:"Voir en français",no:"Rester en espagnol"}};
  function css(){if(document.getElementById("i18n-css"))return;var s=document.createElement("style");s.id="i18n-css";s.textContent=
    ".lsw{position:relative;display:inline-flex}.lsw>button{display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 11px;border-radius:999px;border:1px solid color-mix(in srgb,currentColor 22%,transparent);background:transparent;color:inherit;font:inherit;font-size:13px;font-weight:700;letter-spacing:.02em;cursor:pointer}"+
    ".lsw>button:focus-visible,.lsw-m button:focus-visible,.lsw-bar button:focus-visible{outline:3px solid #b9d86c;outline-offset:2px}"+
    ".lsw-m{position:absolute;right:0;top:calc(100% + 8px);z-index:80;min-width:160px;padding:6px;border-radius:14px;background:#fff;color:#111;box-shadow:0 12px 40px rgba(0,0,0,.22)}.lsw-m[hidden]{display:none}"+
    ".lsw-m button{display:flex;width:100%;justify-content:space-between;gap:12px;padding:10px 12px;border:0;border-radius:9px;background:none;color:inherit;font:inherit;font-size:14px;cursor:pointer;text-align:left}.lsw-m button:hover{background:#f1f2ec}.lsw-m button[aria-current=true]{font-weight:700}.lsw-m small{opacity:.55;font-weight:600}"+
    ".lsw-bar{position:fixed;left:16px;right:16px;bottom:16px;z-index:90;max-width:560px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;padding:14px 16px;border-radius:16px;background:#1d2316;color:#f3f4ee;box-shadow:0 16px 50px rgba(0,0,0,.35);font-size:14.5px;line-height:1.35}"+
    ".lsw-bar p{margin:0;flex:1 1 240px}.lsw-bar div{display:flex;gap:8px}.lsw-bar button{border:0;border-radius:999px;padding:9px 15px;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer}.lsw-bar .y{background:#b9d86c;color:#17240a}.lsw-bar .n{background:transparent;color:inherit;box-shadow:inset 0 0 0 1px rgba(255,255,255,.3)}"+
    ".fcopy .lsw-f{display:inline-flex;gap:4px}.lsw-f button{background:none;border:0;padding:2px 4px;color:inherit;font:inherit;font-size:13px;cursor:pointer;opacity:.7}.lsw-f button[aria-current=true]{opacity:1;font-weight:700;text-decoration:underline;text-underline-offset:3px}";
    document.head.appendChild(s)}
  function menu(){var w=document.createElement("div");w.className="lsw notranslate";w.setAttribute("translate","no");
    w.innerHTML='<button type="button" aria-haspopup="true" aria-expanded="false" aria-label="'+UI[lang].t+'"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>'+lang.toUpperCase()+'</button><div class="lsw-m" hidden role="menu">'+
      Object.keys(LANGS).map(function(k){return'<button type="button" role="menuitem" data-l="'+k+'"'+(k===lang?' aria-current="true"':'')+'>'+LANGS[k]+'<small>'+k.toUpperCase()+'</small></button>'}).join("")+'</div>';
    var b=w.firstChild,m=w.lastChild;
    b.addEventListener("click",function(e){e.stopPropagation();var o=m.hidden;m.hidden=!o;b.setAttribute("aria-expanded",o?"true":"false")});
    m.addEventListener("click",function(e){var x=e.target.closest("[data-l]");if(x)window.ivoSetLang(x.dataset.l)});
    document.addEventListener("click",function(){m.hidden=true;b.setAttribute("aria-expanded","false")});
    document.addEventListener("keydown",function(e){if(e.key==="Escape"){m.hidden=true;b.setAttribute("aria-expanded","false")}});
    return w}
  function foot(){var w=document.createElement("span");w.className="lsw-f notranslate";w.setAttribute("translate","no");w.setAttribute("role","group");w.setAttribute("aria-label",UI[lang].t);
    w.innerHTML=Object.keys(LANGS).map(function(k){return'<button type="button" data-l="'+k+'"'+(k===lang?' aria-current="true"':'')+' lang="'+k+'">'+LANGS[k]+'</button>'}).join("");
    w.addEventListener("click",function(e){var x=e.target.closest("[data-l]");if(x)window.ivoSetLang(x.dataset.l)});return w}
  function bar(){if(get()||qp||lang!=="es")return;var nl=(navigator.languages&&navigator.languages[0]||navigator.language||"").toLowerCase().slice(0,2);if(nl!=="en"&&nl!=="fr")return;
    var u=UI[nl],x=document.createElement("div");x.className="lsw-bar notranslate";x.setAttribute("translate","no");x.setAttribute("role","dialog");x.setAttribute("aria-label",u.t);x.lang=nl;
    x.innerHTML='<p>'+u.ask+'</p><div><button type="button" class="y">'+u.yes+'</button><button type="button" class="n">'+u.no+'</button></div>';
    x.querySelector(".y").addEventListener("click",function(){window.ivoSetLang(nl)});
    x.querySelector(".n").addEventListener("click",function(){put("es");x.remove()});
    document.body.appendChild(x)}
  window.ivoLangUi=function(opt){opt=opt||{};css();
    var h=opt.header&&document.querySelector(opt.header);if(h&&!h.querySelector(".lsw"))h.insertBefore(menu(),h.firstChild);
    var af=opt.after&&document.querySelector(opt.after);if(af&&!document.querySelector(".lsw")){var mm=menu();mm.style.marginRight="8px";af.parentNode.insertBefore(mm,af.nextSibling)}
    var f=opt.footer&&document.querySelector(opt.footer);if(f&&!f.querySelector(".lsw-f"))f.appendChild(foot());
    if(opt.ask!==false)setTimeout(bar,1200)};
})();
