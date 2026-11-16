// オフラインでも開けるようにするための仕組み（エディタ本体とライブラリをiPadに保存）
const VER='yt-editor-v1';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
const LIBS=['https://cdn.jsdelivr.net/npm/mp4box@0.5.2/dist/mp4box.all.min.js','https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/build/mp4-muxer.min.js','https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(VER);await c.addAll(CORE);for(const u of LIBS){try{await c.add(new Request(u,{mode:'cors'}));}catch(_){}}self.skipWaiting();})());});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==VER)await caches.delete(k);await self.clients.claim();})());});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  // エディタ本体：ネットにつながっていれば最新、なければ保存したもの
  if(u.origin===location.origin){
    e.respondWith((async()=>{const c=await caches.open(VER);try{const res=await fetch(r);if(res.ok)c.put(r.url.split('#')[0].split('?')[0]===location.origin+'/'?'./':r,res.clone());return res;}catch(_){return (await c.match(r,{ignoreSearch:true}))||(await c.match('./index.html'))||Response.error();}})());
    return;
  }
  // ライブラリ・フォント・AIモデル：一度読んだら保存して使う
  if(/(^|\.)(jsdelivr\.net|gstatic\.com|googleapis\.com|huggingface\.co|hf\.co)$/.test(u.hostname)&&!/generativelanguage/.test(u.hostname)){
    e.respondWith((async()=>{const c=await caches.open(VER);const hit=await c.match(r);if(hit)return hit;const res=await fetch(r);if(res.ok||res.type==='opaque')c.put(r,res.clone()).catch(()=>{});return res;})());
  }
});
