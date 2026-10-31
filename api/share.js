// Enlaces para compartir: /beat/<beat> y /preset/<preset>
// Devuelve la portada, el nombre y el precio para WhatsApp, Instagram, YouTube…
// y lleva al visitante a la ficha del beat o del preset en la tienda.
const SB = "https://juxmlitraftqvryteexu.supabase.co";
const KEY = "sb_publishable_q_49snDGE7abEhFbj-DY9Q_wXx0WZpp";
const SITE = "https://www.ivobeatz.com";
const KEY_NAMES = { C: "Do", "C#": "Do#", D: "Re", "D#": "Re#", E: "Mi", F: "Fa", "F#": "Fa#", G: "Sol", "G#": "Sol#", A: "La", "A#": "La#", B: "Si" };
const esc = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const keyName = (k) => { const m = /^([A-G]#?)(m?)$/.exec(String(k || "")); return m ? `${KEY_NAMES[m[1]]}${m[2] ? " menor" : " mayor"}` : ""; };
const STATIC_PRESETS = { mvrk: "mvrk", enzocerobulto: "enzocerobulto", ladiferencia2006: "ladiferencia2006", guxo: "Guxo", cero: "cero*", tarchi: "tarchi" };

async function rest(path) {
  try {
    const r = await fetch(`${SB}/rest/v1/${path}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
    return r.ok ? await r.json() : [];
  } catch (_e) { return []; }
}
async function presetPhoto(slug) {
  try {
    const r = await fetch(`${SITE}/og-presets.json`);
    if (!r.ok) return null;
    const m = await r.json();
    return m[slug] ? SITE + m[slug] : null;
  } catch (_e) { return null; }
}

module.exports = async function handler(req, res) {
  const type = req.query.t === "p" ? "p" : "b";
  const slug = String(req.query.slug || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 80);
  let title = "IVO Beatz";
  let desc = "Beats con licencia, mezcla y máster, plantillas vocales y herramientas.";
  let img = `${SITE}/og-image.jpg`, imgW = 1200, imgH = 630, ogType = "website";
  let target = `${SITE}/`;

  if (slug && type === "b") {
    const [b] = await rest(`beats?select=name,bpm,key,genre,price_from,cover_path,tags&slug=eq.${encodeURIComponent(slug)}&active=eq.true&limit=1`);
    if (b) {
      title = `${b.name} · ${b.bpm} BPM · ${b.key} · IVO Beatz`;
      desc = `Beat ${b.genre} de IVO Beatz en ${keyName(b.key)}. Escúchalo y llévatelo desde ${b.price_from} € con licencia y descarga al momento.`;
      if (b.cover_path) { img = `${SB}/storage/v1/object/public/fotos/${b.cover_path}`; imgW = 1000; imgH = 1000; }
      ogType = "music.song";
      target = `${SITE}/?beat=${encodeURIComponent(slug)}`;
    }
  } else if (slug && type === "p") {
    let artist = STATIC_PRESETS[slug] || null, price = 15;
    if (!artist) {
      const [p] = await rest(`presets?select=artist,price&slug=eq.${encodeURIComponent(slug)}&active=eq.true&limit=1`);
      if (p) { artist = p.artist; price = Number(p.price); }
    }
    if (artist) {
      title = `Vocal preset estilo ${artist} · IVO Beatz`;
      desc = `Plantilla de grabación con el preset vocal de ${artist} para FL Studio y Ableton Live. ${String(price).replace(".", ",")} € con descarga al momento.`;
      const ph = await presetPhoto(slug);
      if (ph) { img = ph; imgW = 860; imgH = 1075; }
      target = `${SITE}/?preset=${encodeURIComponent(slug)}`;
    }
  }

  const utm = String(req.query.utm_source || "").toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 30);
  if (utm) target += (target.includes("?") ? "&" : "?") + "utm_source=" + utm;
  const self = `${SITE}/${type === "p" ? "preset" : "beat"}/${slug}`;
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${esc(target.split("&utm_source")[0].split("?utm_source")[0])}">
<meta property="og:type" content="${ogType}"><meta property="og:site_name" content="IVO Beatz"><meta property="og:locale" content="es_ES">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(self)}">
<meta property="og:image" content="${esc(img)}"><meta property="og:image:width" content="${imgW}"><meta property="og:image:height" content="${imgH}"><meta property="og:image:alt" content="${esc(title)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${esc(img)}">
<meta name="theme-color" content="#0e0f0d"><link rel="icon" href="/favicon.ico">
<script>(function(){var u=new URL(${JSON.stringify(target)});if(!u.searchParams.get("utm_source")&&document.referrer){try{var h=new URL(document.referrer).hostname.replace(/^www\\./,"");if(h&&!/ivobeatz\\.com$/.test(h)){var s=/youtu/.test(h)?"youtube":/instagram/.test(h)?"instagram":/tiktok/.test(h)?"tiktok":/google\\./.test(h)?"google":/facebook|fb\\./.test(h)?"facebook":/(^|\\.)x\\.com|twitter|t\\.co/.test(h)?"x":/whatsapp/.test(h)?"whatsapp":h.slice(0,30);u.searchParams.set("utm_source",s)}}catch(e){}}location.replace(u.href)})();</script>
<noscript><meta http-equiv="refresh" content="0;url=${esc(target)}"></noscript>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0e0f0d;color:#f2f4ea;font:16px/1.5 system-ui,sans-serif}a{color:#b9d86c}</style></head>
<body><p>Abriendo <a href="${esc(target)}">${esc(title.split(" · ")[0])}</a> en IVO Beatz…</p></body></html>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=86400");
  res.statusCode = 200;
  res.end(html);
};
