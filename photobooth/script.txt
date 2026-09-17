(()=>{
const $=id=>document.getElementById(id), sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ratio=r=>{const [a,b]=r.split(':').map(Number);return a/b};
const fmt=x=>{try{return new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short'}).format(new Date(x))}catch{return new Date(x).toLocaleString()}};
const now=()=>new Date().toISOString();
const toast=m=>{const t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2200)};

const S={view:'home',stream:null,facing:'user',aspect:'4:5',shots:1,countdown:3,gesture:true,sound:true,mirror:true,grid:true,filter:'clean',captures:[],busy:false,hands:null,handLoop:false,lastGesture:'none',sameGesture:0,gestureCooldown:0,activeEffect:null,pending:null,theme:'noir',layout:0,finish:'editorial',fit:'cover',posX:50,posY:50};

const THEMES={
 noir:{name:'Noir lembut',label:'NIGHT EDITION',bg:'linear-gradient(140deg,#0a0b0d,#282b2f 45%,#0a0b0d)',c1:'#0a0b0d',c2:'#282b2f',ink:'#f7f3ec',muted:'#b7afa6',accent:'#eee7dc',sub:'#76706a'},
 paper:{name:'Kertas',label:'STUDIO PAPER',bg:'linear-gradient(140deg,#f2eee4,#dfd2bf)',c1:'#f2eee4',c2:'#dfd2bf',ink:'#181818',muted:'#6e675e',accent:'#c68d67',sub:'#7d746b'},
 peach:{name:'Blush',label:'SOFT PEACH',bg:'linear-gradient(140deg,#e7b79f,#f0d6c7 46%,#a76a62)',c1:'#e7b79f',c2:'#a76a62',ink:'#241719',muted:'#6f4f4c',accent:'#824943',sub:'#725d5a'},
 chrome:{name:'Pearl',label:'SILVER FLASH',bg:'linear-gradient(140deg,#bcc3ca,#f5f6f8 46%,#69737d)',c1:'#bcc3ca',c2:'#69737d',ink:'#121518',muted:'#495159',accent:'#232a31',sub:'#5e666c'},
 citrus:{name:'Sage',label:'MORNING FILM',bg:'linear-gradient(140deg,#f1e49a,#a7ae68 55%,#4f5b3a)',c1:'#f1e49a',c2:'#4f5b3a',ink:'#1c2115',muted:'#4f583b',accent:'#28321b',sub:'#536043'},
 plum:{name:'Mauve',label:'PLUM AFTER DARK',bg:'linear-gradient(140deg,#1c1520,#6b4866 55%,#241627)',c1:'#1c1520',c2:'#6b4866',ink:'#f9f2f7',muted:'#c9b4c3',accent:'#f1d5e5',sub:'#9a7f96'}
};

const LAYOUTS={
 1:[
   {id:'hero',name:'Hero Portrait',desc:'Full frame / hero photo',ratio:'4:5',slots:1,type:'single',shape:'round'},
   {id:'postcard',name:'Postcard',desc:'Wide photo + caption',ratio:'4:5',slots:1,type:'single',shape:'square'},
   {id:'arch',name:'Gallery Arch',desc:'Editorial portrait',ratio:'4:5',slots:1,type:'arch',shape:'arch'},
   {id:'tall',name:'Tall Print',desc:'Narrow portrait',ratio:'4:5',slots:1,type:'tall',shape:'round'},
   {id:'landscape',name:'Landscape Card',desc:'Wide crop inside portrait',ratio:'4:5',slots:1,type:'landscape',shape:'round'},
   {id:'mini',name:'Mini Polaroid',desc:'Centered snapshot',ratio:'4:5',slots:1,type:'mini',shape:'round'}
  ],
 2:[
   {id:'diptych',name:'Diptych',desc:'Two equal panels',ratio:'4:5',slots:2,type:'diptych',shape:'round'},
   {id:'stack',name:'Twin Stack',desc:'Vertical print',ratio:'4:5',slots:2,type:'stack',shape:'round'},
   {id:'film',name:'Film Couple',desc:'Horizontal contact',ratio:'2:3',slots:2,type:'film',shape:'square'},
   {id:'tall-twin',name:'Twin Portrait',desc:'Tall magazine pair',ratio:'4:5',slots:2,type:'tall-twin',shape:'arch'},
   {id:'one-big-one-small',name:'Asymmetry',desc:'Hero + detail',ratio:'4:5',slots:2,type:'asym',shape:'round'},
   {id:'polaroids',name:'Dual Polaroid',desc:'Offset snapshots',ratio:'4:5',slots:2,type:'offset',shape:'round'}
  ],
 3:[
   {id:'triptych',name:'Triptych',desc:'Three equal panels',ratio:'2:3',slots:3,type:'triptych',shape:'round'},
   {id:'strip3',name:'Classic Strip',desc:'Three vertical cuts',ratio:'2:3',slots:3,type:'strip3',shape:'square'},
   {id:'collage3',name:'Editorial 3',desc:'Hero + two details',ratio:'4:5',slots:3,type:'collage3',shape:'round'},
   {id:'stack3',name:'Story Stack',desc:'Three story beats',ratio:'4:5',slots:3,type:'stack3',shape:'arch'},
   {id:'contact3',name:'Contact Sheet',desc:'Three film cells',ratio:'2:3',slots:3,type:'contact3',shape:'square'},
   {id:'polaroid3',name:'Three Polaroids',desc:'Offset snapshots',ratio:'4:5',slots:3,type:'polaroid3',shape:'round'}
  ],
 4:[
   {id:'grid4',name:'2×2 Grid',desc:'Balanced four-up',ratio:'3:2',slots:4,type:'grid4',shape:'round'},
   {id:'strip4',name:'Classic 4 Strip',desc:'Four vertical cuts',ratio:'2:3',slots:4,type:'strip4',shape:'square'},
   {id:'editorial4',name:'Editorial 4',desc:'Hero + three details',ratio:'4:5',slots:4,type:'editorial4',shape:'round'},
   {id:'contact4',name:'Film Contact',desc:'Four contact cells',ratio:'2:3',slots:4,type:'contact4',shape:'square'},
   {id:'quads',name:'Quad Portrait',desc:'Tall magazine grid',ratio:'4:5',slots:4,type:'quads',shape:'arch'},
   {id:'polaroid4',name:'Four Polaroids',desc:'Layered snapshot set',ratio:'4:5',slots:4,type:'polaroid4',shape:'round'}
  ]
};
function activeLayouts(){return LAYOUTS[S.pending?.photos?.length||S.shots]||LAYOUTS[1]}
function currentLayout(){return activeLayouts()[S.layout]||activeLayouts()[0]}

const DB_NAME='zeebooth-local-v3';
const DB_VERSION=1;
const PHOTO_STORE='photos';
const HISTORY_STORE='history';
let STORAGE={photos:[],history:[]};

function openDB(){
  return new Promise((resolve,reject)=>{
    if(!('indexedDB' in window)){reject(new Error('indexeddb-unavailable'));return}
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(PHOTO_STORE))db.createObjectStore(PHOTO_STORE,{keyPath:'id'});
      if(!db.objectStoreNames.contains(HISTORY_STORE))db.createObjectStore(HISTORY_STORE,{keyPath:'id'});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||new Error('indexeddb-open-failed'));
  });
}
async function hydrateStorage(){
  try{
    const db=await openDB();
    const tx=db.transaction([PHOTO_STORE,HISTORY_STORE],'readonly');
    const photosReq=tx.objectStore(PHOTO_STORE).getAll();
    const historyReq=tx.objectStore(HISTORY_STORE).getAll();
    const [photos,history]=await Promise.all([
      new Promise((res,rej)=>{photosReq.onsuccess=()=>res(photosReq.result||[]);photosReq.onerror=()=>rej(photosReq.error)}),
      new Promise((res,rej)=>{historyReq.onsuccess=()=>res(historyReq.result||[]);historyReq.onerror=()=>rej(historyReq.error)})
    ]);
    STORAGE.photos=photos.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
    STORAGE.history=history.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  }catch(e){
    STORAGE={photos:[],history:[]};
    console.warn('IndexedDB unavailable',e);
    toast('Storage lokal tidak tersedia di browser ini.');
  }
  renderPhotos();
  renderHistory();
  renderRecent();
}
function read(){return STORAGE}
async function write(x){
  try{
    const db=await openDB();
    await new Promise((resolve,reject)=>{
      const tx=db.transaction([PHOTO_STORE,HISTORY_STORE],'readwrite');
      const ps=tx.objectStore(PHOTO_STORE);
      const hs=tx.objectStore(HISTORY_STORE);
      ps.clear(); hs.clear();
      for(const p of x.photos||[])ps.put(p);
      for(const h of x.history||[])hs.put(h);
      tx.oncomplete=resolve;
      tx.onerror=()=>reject(tx.error||new Error('indexeddb-write-failed'));
      tx.onabort=()=>reject(tx.error||new Error('indexeddb-write-aborted'));
    });
    STORAGE={photos:[...(x.photos||[])],history:[...(x.history||[])]};
    return true;
  }catch(e){
    console.error(e);
    return false;
  }
}
function removePendingStorage(){
  try{sessionStorage.removeItem('zeebooth.pending')}catch{}
}

function go(v){
 S.view=v;document.querySelectorAll('.view').forEach(x=>x.classList.toggle('on',x.id===v));document.querySelectorAll('.dock button').forEach(x=>x.classList.toggle('active',x.dataset.go===v));window.scrollTo({top:0,behavior:'smooth'});
 if(v==='camera')prepCamera(); if(v==='editor')renderEditor(); if(v==='photos')renderPhotos(); if(v==='history')renderHistory(); if(v==='home')renderRecent();
}
function bindNav(){document.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(!b)return;e.preventDefault();go(b.dataset.go)})}

function setAspect(r){S.aspect=r;const st=$('stage');if(st)st.style.aspectRatio=ratio(r);document.querySelectorAll('#ratios button').forEach(b=>b.classList.toggle('active',b.dataset.r===r));updateHud()}
function updateHud(){const ready=!!S.stream; $('hudTimer').textContent=S.countdown?String(S.countdown).padStart(2,'0')+'s':'READY';$('hudMode').textContent=S.gesture?'GESTURE READY':'MANUAL';$('hudLens').textContent=S.mirror?'MIRROR':'1×';$('readyChip').textContent=ready?'AKTIF':'BELUM AKTIF';$('readyChip').style.color=ready?'#8fe2b1':'#8f99a3'}
function setVideoFilter(){const map={clean:'none',soft:'contrast(1.02) saturate(.96) brightness(1.02)',mono:'grayscale(1) contrast(1.06)',warm:'sepia(.2) saturate(1.16) contrast(1.02)'};$('video').style.filter=map[S.filter]||'none';}
function setMirror(){S.mirror=!S.mirror;$('video').style.transform=S.mirror?'scaleX(-1)':'none';$('mirrorToggle').classList.toggle('active',S.mirror);updateHud()}
function setGrid(){S.grid=!S.grid;$('gridLines').classList.toggle('off',!S.grid);$('gridToggle').classList.toggle('active',S.grid)}
function setGestureLabel(){const el=$('gestureLabel');el.innerHTML=`<span class="sensor-dot"></span>${S.gesture?'GESTURE READY':'MANUAL ONLY'}`}

async function enableCamera(){
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('unsupported');
  S.stream?.getTracks?.().forEach(t=>t.stop());
  S.stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:S.facing},width:{ideal:1920,min:720},height:{ideal:1440,min:540},frameRate:{ideal:30,max:30},resizeMode:'crop-and-scale'}});
  const v=$('video');v.srcObject=S.stream;v.muted=true;await v.play();$('permission').classList.add('off');
  const set=S.stream.getVideoTracks()[0]?.getSettings?.()||{};$('cameraResolution').textContent=set.width?`${set.width}×${set.height}`:'AKTIF';$('topStatus').textContent='Kamera tersambung';$('sensorStatus').textContent=S.gesture?'Sensor tangan siap':'Mode gesture dimatikan';$('hint').textContent='Kamera aktif. Atur pose lalu tekan Shutter untuk mengambil foto.';
  updateHud();setVideoFilter();startHands();updateActions();
 }catch(e){$('topStatus').textContent='Izin kamera diperlukan';$('cameraResolution').textContent='BLOCKED';$('permMsg').textContent=e.message==='unsupported'?'Browser ini tidak mendukung akses kamera.':'Izin kamera belum diberikan. Periksa pengaturan kamera browser.';$('hint').textContent='Kamera tidak tersedia.';updateActions();}
}
async function flipCamera(){S.facing=S.facing==='user'?'environment':'user';if(S.stream)await enableCamera();}
function updateActions(){const ready=!!(S.stream?.active&&$('video').videoWidth);$('shutter').disabled=!ready||S.busy||S.captures.length>=S.shots;$('finish').disabled=S.captures.length!==S.shots;$('reset').disabled=!S.captures.length;updateHud()}
function crop(v){const vw=v.videoWidth,vh=v.videoHeight,target=ratio(S.aspect),vr=vw/vh;let sx=0,sy=0,sw=vw,sh=vh;if(vr>target){sw=vh*target;sx=(vw-sw)/2}else if(vr<target){sh=vw/target;sy=(vh-sh)/2}return{sx,sy,sw,sh}}
function drawHeart(ctx,cx,cy,size,fill,stroke){
  ctx.save();
  ctx.translate(cx,cy);
  ctx.beginPath();
  ctx.moveTo(0,size*.38);
  ctx.bezierCurveTo(-size*.64,-size*.02,-size*.64,-size*.55,-size*.25,-size*.62);
  ctx.bezierCurveTo(-size*.05,-size*.65,0,-size*.48,0,-size*.34);
  ctx.bezierCurveTo(0,-size*.48,size*.05,-size*.65,size*.25,-size*.62);
  ctx.bezierCurveTo(size*.64,-size*.55,size*.64,-size*.02,0,size*.38);
  ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill()}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=Math.max(2,size*.04);ctx.stroke()}
  ctx.restore();
}
function drawFlowerBurst(ctx,w,h){
  const cx=w/2,cy=h/2;
  const petals=[['#ff9fb6',0],['#ffd28e',45],['#b4d8b2',90],['#9dbce8',135],['#d7a6df',180],['#ffb69f',225],['#b7d6ef',270],['#f4c1d6',315]];
  petals.forEach(([color,deg])=>{
    const a=deg*Math.PI/180;
    const px=cx+Math.cos(a)*Math.min(w,h)*.23;
    const py=cy+Math.sin(a)*Math.min(w,h)*.23;
    ctx.save();
    ctx.translate(px,py);ctx.rotate(a+Math.PI/2);
    ctx.fillStyle=color;ctx.globalAlpha=.75;
    ctx.beginPath();ctx.ellipse(0,0,Math.min(w,h)*.055,Math.min(w,h)*.13,0,0,Math.PI*2);ctx.fill();
    ctx.restore();
  });
  ctx.fillStyle='rgba(255,241,187,.95)';
  ctx.beginPath();ctx.arc(cx,cy,Math.min(w,h)*.045,0,Math.PI*2);ctx.fill();
}
function drawHeartBurst(ctx,w,h){
  const s=Math.min(w,h);
  const pts=[[.18,.18,.045],[.82,.18,.038],[.14,.72,.032],[.86,.72,.05],[.5,.1,.028],[.5,.86,.036]];
  pts.forEach(([px,py,sz],i)=>{
    drawHeart(ctx,w*px,h*py,s*sz,'rgba(255,143,176,.78)','rgba(255,236,243,.85)');
  });
  ctx.strokeStyle='rgba(255,202,221,.7)';
  ctx.lineWidth=Math.max(3,s*.012);
  ctx.beginPath();ctx.arc(w/2,h/2,s*.27,0,Math.PI*2);ctx.stroke();
}
function capture(){
  const v=$('video');if(!v.videoWidth)return null;
  const c=crop(v),w=ratio(S.aspect)>=1.25?1600:1400,h=Math.round(w/ratio(S.aspect));
  const o=document.createElement('canvas');o.width=w;o.height=h;
  const x=o.getContext('2d');
  x.save();
  if(S.mirror){x.translate(w,0);x.scale(-1,1)}
  const filters={
    clean:'none',
    soft:'contrast(1.02) saturate(.96) brightness(1.02)',
    mono:'grayscale(1) contrast(1.06)',
    warm:'sepia(.2) saturate(1.16) contrast(1.02)'
  };
  const effectFilter=S.activeEffect==='blur'?'blur(7px)':'';
  x.filter=[filters[S.filter]||'none',effectFilter].filter(Boolean).join(' ');
  x.drawImage(v,c.sx,c.sy,c.sw,c.sh,0,0,w,h);
  x.restore();
  if(S.activeEffect==='flower')drawFlowerBurst(x,w,h);
  if(S.activeEffect==='heart')drawHeartBurst(x,w,h);
  return{dataUrl:o.toDataURL('image/jpeg',.94),aspect:S.aspect,filter:S.filter,effect:S.activeEffect||'none'};
}
function sound(freq=560,len=.12){if(!S.sound)return;try{const c=new AudioContext(),o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=freq;g.gain.value=.0001;o.connect(g);g.connect(c.destination);g.gain.exponentialRampToValueAtTime(.06,c.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+len);o.start();o.stop(c.currentTime+len+.01)}catch{}}
async function countdown(){if(!S.countdown)return;for(let i=S.countdown;i>0;i--){$('count').textContent=i;sound(520+i*45,.11);await sleep(720)}$('count').textContent=''}
async function shoot(effectOverride=null){
  if(S.busy||S.captures.length>=S.shots)return;
  S.busy=true;
  if(effectOverride)S.activeEffect=effectOverride;
  $('hint').textContent=effectOverride?'Tahan pose… gesture terkunci.':'Pertahankan pose…';
  await countdown();
  const p=capture();
  if(p){
    S.captures.push(p);
    renderStrip();
    flash();
    sound(240,.16);
    await sleep(120);
  }
  S.busy=false;
  S.activeEffect=null;
  setEffectPreview(null);
  setGestureLabel();
  if(S.captures.length>=S.shots){
    $('hint').textContent='Sesi selesai. Lihat hasilnya atau foto ulang.';
    toast('Foto berhasil diambil.');
  }else{
    $('hint').textContent=`Foto ${S.captures.length} dari ${S.shots}. Siapkan pose berikutnya.`;
  }
  updateActions();
}
function flash(){const f=$('flashfx');f.classList.remove('on');void f.offsetWidth;f.classList.add('on')}
function renderStrip(){const s=$('strip');s.innerHTML='';if(!S.captures.length)s.innerHTML='<span class="capture-empty">Preview foto akan muncul di sini.</span>';S.captures.forEach((p,i)=>{const d=document.createElement('div');d.className='thumb';d.innerHTML=`<img src="${p.dataUrl}" alt="Foto ${i+1}">`;s.appendChild(d)});$('progress').textContent=`${S.captures.length} / ${S.shots}`;updateActions()}
function reset(){S.captures=[];S.activeEffect=null;S.gestureCooldown=0;setEffectPreview(null);renderStrip();$('hint').textContent=S.gesture?'Sensor gesture siap. Gesture akan mengambil foto otomatis.':'Shutter manual aktif.'}

function fingerExtended(l,tip,pip,mcp){
  const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  return d(l[tip],l[0]) > d(l[pip],l[0])*1.16 && d(l[tip],l[mcp]) > d(l[pip],l[mcp])*1.08;
}
function classifyHand(l){
  if(!l)return'none';
  const index=fingerExtended(l,8,6,5);
  const middle=fingerExtended(l,12,10,9);
  const ring=fingerExtended(l,16,14,13);
  const pinky=fingerExtended(l,20,18,17);
  if(index&&middle&&!ring&&!pinky)return'peace';
  if(index&&middle&&ring&&pinky)return'open';
  return'none';
}
function classifyGesture(hands){
  if(!hands?.length)return'none';
  if(hands.length>=2){
    const a=hands[0],b=hands[1];
    const d=(p,q)=>Math.hypot(p.x-q.x,p.y-q.y);
    const indexGap=d(a[8],b[8]);
    const thumbGap=d(a[4],b[4]);
    const wristGap=d(a[0],b[0]);
    const heartShape=indexGap<.18 && thumbGap<.2 && wristGap>.14;
    if(heartShape)return'heart';
  }
  const single=classifyHand(hands[0]);
  return single;
}
function setEffectPreview(effect){
  const fx=$('fx'),state=$('gestureLabel'),video=$('video');
  fx.className='fx';
  state.classList.remove('effect-blur','effect-flower','effect-heart');
  if(!effect){
    video.style.filter='';
    setVideoFilter();
    return;
  }
  fx.classList.add('on',effect);
  state.classList.add('effect-'+effect);
  if(effect==='blur'){
    const base={clean:'none',soft:'contrast(1.02) saturate(.96) brightness(1.02)',mono:'grayscale(1) contrast(1.06)',warm:'sepia(.2) saturate(1.16) contrast(1.02)'}[S.filter]||'none';
    video.style.filter=`blur(7px) ${base}`;
  }else{
    video.style.filter='';
    setVideoFilter();
  }
}
function triggerGesture(effect){
  if(!S.gesture||S.busy||Date.now()<S.gestureCooldown)return;
  if(S.captures.length>=S.shots)return;
  S.gestureCooldown=Date.now()+2600;
  S.activeEffect=effect;
  $('sensorStatus').textContent=`${effect==='blur'?'PEACE / BLUR':effect==='flower'?'OPEN PALM / FLOWER':'HEART'} siap`;
  $('gestureLabel').innerHTML=`<span class="sensor-dot"></span>${effect==='blur'?'BLUR MODE':effect==='flower'?'FLOWER MODE':'HEART MODE'}`;
  setEffectPreview(effect);
  sound(effect==='blur'?620:effect==='flower'?760:680,.08);
  shoot(effect);
}
function handsResults(res){
  if(!S.gesture||!res.multiHandLandmarks?.length){
    S.lastGesture='none';S.sameGesture=0;
    if(S.activeEffect&&!S.busy){S.activeEffect=null;setEffectPreview(null);setGestureLabel()}
    $('sensorStatus').textContent=S.gesture?'Tunjukkan gesture…':'Mode gesture dimatikan';
    return;
  }
  const hands=res.multiHandLandmarks.slice(0,2);
  const g=classifyGesture(hands);
  if(g==='none'){
    S.lastGesture='none';S.sameGesture=0;
    $('sensorStatus').textContent='Tangan terdeteksi';
    return;
  }
  if(g===S.lastGesture)S.sameGesture++;else{S.lastGesture=g;S.sameGesture=1}
  const label=g==='peace'?'Peace → Blur':g==='open'?'Open Palm → Flower':'Heart → Heart Effect';
  $('sensorStatus').textContent=label;
  $('gestureLabel').innerHTML=`<span class="sensor-dot"></span>${label}`;
  if(S.sameGesture>=5){
    S.sameGesture=0;
    triggerGesture(g==='peace'?'blur':g==='open'?'flower':'heart');
  }
}
function startHands(){
  if(S.handLoop||!window.Hands||!S.stream)return;
  S.hands=new Hands({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`});
  S.hands.setOptions({
    maxNumHands:2,
    modelComplexity:1,
    minDetectionConfidence:.55,
    minTrackingConfidence:.55
  });
  S.hands.onResults(handsResults);
  S.handLoop=true;
  let last=0;
  (async function loop(ts=0){
    if(!S.stream?.active){S.handLoop=false;return}
    if(ts-last>70){
      last=ts;
      try{if($('video').videoWidth)await S.hands.send({image:$('video')})}catch{}
    }
    requestAnimationFrame(loop)
  })()
}
function stopCamera(){S.handLoop=false;try{S.hands?.close?.()}catch{}S.hands=null;S.stream?.getTracks?.().forEach(t=>t.stop());S.stream=null;updateActions()}
function prepCamera(){setAspect(S.aspect);renderStrip();setGestureLabel();updateActions();setVideoFilter();$('sensorStatus').textContent=S.gesture?'Sensor tangan siap':'Mode gesture dimatikan';$('hint').textContent=S.stream?.active?(S.gesture?'Kamera aktif. Tahan gesture untuk auto-shutter.':'Kamera aktif. Gunakan Shutter manual.'):'Aktifkan kamera untuk membuka semua kontrol.';if(S.stream?.active)$('permission').classList.add('off')}

function layoutBoxes(t,W,H){const p=t.aspect||S.pending?.aspect||S.aspect,pr=ratio(p),gap=Math.min(W,H)*.018,padX=W*.075,padTop=H*.07,padBottom=H*.16,usableW=W-padX*2,usableH=H-padTop-padBottom;const B=[];const add=(x,y,w,h,shape='round')=>B.push({x,y,w,h,shape});
 if(t.type==='single'||t.type==='mini'){const w=usableW*(t.type==='mini'?.72:1),h=w/pr;add((W-w)/2,padTop+(usableH-h)/2,w,h,t.shape)}
 else if(t.type==='tall'){const w=usableW*.68,h=w/pr;add((W-w)/2,padTop,w,h,'round')}
 else if(t.type==='landscape'){const w=usableW,h=w/(3/2);add(padX,padTop+(usableH-h)/2,w,h,'round')}
 else if(t.type==='arch'){const w=usableW*.74,h=w/pr;add((W-w)/2,padTop+(usableH-h)/2,w,h,'arch')}
 else if(t.type==='diptych'){const w=(usableW-gap)/2,h=w/pr;add(padX,padTop,w,h,'round');add(padX+w+gap,padTop,w,h,'round')}
 else if(t.type==='stack'){const w=usableW,h=Math.min(w/pr,(usableH-gap)/2);add(padX,padTop,w,h,'round');add(padX,padTop+h+gap,w,h,'round')}
 else if(t.type==='film'){const w=(usableW-gap)/2,h=w/pr*.68;const top=padTop+(usableH-h)/2;add(padX,top,w,h,'square');add(padX+w+gap,top,w,h,'square')}
 else if(t.type==='tall-twin'){const w=(usableW-gap)/2,h=(w/pr)*.98;add(padX,padTop,w,h,'arch');add(padX+w+gap,padTop,w,h,'arch')}
 else if(t.type==='asym'){const bigW=usableW*.58,smallW=usableW-bigW-gap,bigH=Math.min(bigW/pr*.98,usableH);add(padX,padTop,bigW,bigH,'round');add(padX+bigW+gap,padTop+bigH*.18,smallW,bigH*.64,'round')}
 else if(t.type==='offset'){const w=usableW*.72,h=w/pr*.92;add(padX,padTop+15,w,h,'round');add(W-padX-w,padTop+usableH-h-8,w,h,'round')}
 else if(t.type==='triptych'||t.type==='strip3'){const w=(usableW-gap*2)/3,h=Math.min(w/pr,usableH);const top=padTop+(usableH-h)/2;for(let i=0;i<3;i++)add(padX+i*(w+gap),top,w,h,t.type==='triptych'?'round':'square')}
 else if(t.type==='collage3'){const bigW=usableW*.54,bigH=Math.min(bigW/pr,usableH),smallW=(usableW-gap-bigW),smallH=(usableH-gap)/2;add(padX,padTop,bigW,bigH,'round');add(padX+bigW+gap,padTop,smallW,smallH,'round');add(padX+bigW+gap,padTop+smallH+gap,smallW,smallH,'round')}
 else if(t.type==='stack3'){const w=usableW,h=Math.min(w/pr*.82,(usableH-gap*2)/3);const top=padTop+(usableH-(h*3+gap*2))/2;for(let i=0;i<3;i++)add(padX,top+i*(h+gap),w,h,'arch')}
 else if(t.type==='contact3'){const w=usableW,h=(usableW/pr)*.68;const top=padTop+(usableH-h)/2;for(let i=0;i<3;i++)add(padX,top+i*(h+gap),w,h,'square')}
 else if(t.type==='polaroid3'){const w=usableW*.58,h=w/pr*.86;add(padX,padTop,w,h,'round');add(W-padX-w/1.2,padTop+usableH*.28,w,h,'round');add(padX+usableW*.14,padTop+usableH*.57,w,h,'round')}
 else if(t.type==='grid4'){const w=(usableW-gap)/2,h=w/pr;const total=2*h+gap,top=padTop+(usableH-total)/2;for(let i=0;i<4;i++){const row=Math.floor(i/2),col=i%2;add(padX+col*(w+gap),top+row*(h+gap),w,h,'round')}}
 else if(t.type==='strip4'||t.type==='contact4'){const w=usableW,h=(usableW/pr)*.56;const total=4*h+gap*3,top=padTop+(usableH-total)/2;for(let i=0;i<4;i++)add(padX,top+i*(h+gap),w,h,'square')}
 else if(t.type==='editorial4'){const bigW=usableW*.52,bigH=Math.min(bigW/pr,usableH);const rightW=usableW-bigW-gap,rightH=(usableH-gap)/3;add(padX,padTop,bigW,bigH,'round');for(let i=0;i<3;i++)add(padX+bigW+gap,padTop+i*(rightH+gap),rightW,rightH,'round')}
 else if(t.type==='quads'){const w=(usableW-gap)/2,h=w/pr*.84,total=2*h+gap,top=padTop+(usableH-total)/2;for(let i=0;i<4;i++){const row=Math.floor(i/2),col=i%2;add(padX+col*(w+gap),top+row*(h+gap),w,h,'arch')}}
 else if(t.type==='polaroid4'){const w=usableW*.52,h=w/pr*.78;const pos=[[padX,padTop],[W-padX-w,padTop+usableH*.22],[padX+usableW*.12,padTop+usableH*.46],[W-padX-w*.9,padTop+usableH*.64]];pos.forEach(([x,y])=>add(x,y,w,h,'round'))}
 return B}
function frameRatio(t){if(t.ratio==='2:3')return .667;if(t.ratio==='3:2')return 1.5;return 1/(1.0/.75)}
function frameHeightRatio(t){if(t.type==='grid4')return 1.5;if(t.type==='diptych')return .95;if(t.type==='triptych')return .78;if(t.type==='film'||t.type==='contact3'||t.type==='contact4'||t.type==='strip3'||t.type==='strip4')return .66;if(t.type==='landscape')return 1.18;if(t.type==='film')return .72;return .78}
function applyTheme(){const th=THEMES[S.theme];const f=$('final');f.style.setProperty('--frame-surface',th.bg);f.style.setProperty('--frame-bg',th.bg);f.style.setProperty('--frame-ink',th.ink);f.style.setProperty('--frame-muted',th.muted);$('frameThemeLabel').textContent=th.label;document.querySelectorAll('.theme').forEach(x=>x.classList.toggle('active',x.dataset.theme===S.theme))}
function renderThemes(){const wrap=$('themes');wrap.innerHTML='';Object.entries(THEMES).forEach(([id,t])=>{const b=document.createElement('button');b.className='theme'+(id===S.theme?' active':'');b.dataset.theme=id;b.innerHTML=`<i style="background:${t.bg}"></i><b>${t.name}</b><small>${t.label}</small>`;b.onclick=()=>{S.theme=id;applyTheme();renderFrame()};wrap.appendChild(b)})}
function renderLayouts(){const wrap=$('layouts');wrap.innerHTML='';activeLayouts().forEach((t,i)=>{const b=document.createElement('button');b.className='layout'+(i===S.layout?' active':'');const thumb=document.createElement('div');thumb.className='layout-thumb';thumb.setAttribute('data-type',t.type);const mini=layoutBoxes(t,100,100);mini.slice(0,t.slots).forEach((m,j)=>{const q=document.createElement('i');q.className='lt-'+(j+1);q.style.left=m.x+'%';q.style.top=m.y+'%';q.style.width=m.w+'%';q.style.height=m.h+'%';thumb.appendChild(q)});b.appendChild(thumb);b.insertAdjacentHTML('beforeend',`<b>${t.name}</b><span>${t.desc}</span>`);b.onclick=()=>{S.layout=i;renderLayouts();renderFrame()};wrap.appendChild(b)})}
function renderFrame(){if(!S.pending)return;const t=currentLayout(),f=$('final'),g=$('photoGrid'),boxes=layoutBoxes(t,100,100);f.style.aspectRatio=frameHeightRatio(t);applyTheme();f.className=`final theme-${S.theme} finish-${S.finish}`;g.innerHTML='';S.pending.photos.forEach((p,i)=>{const b=boxes[i];if(!b)return;const d=document.createElement('div');d.className=`slot slot-${i+1} shape-${b.shape}`;d.style.left=b.x+'%';d.style.top=b.y+'%';d.style.width=b.w+'%';d.style.height=b.h+'%';d.style.setProperty('--px',S.posX+'%');d.style.setProperty('--py',S.posY+'%');if(S.fit==='contain')d.style.background='#101214';d.innerHTML=`<img src="${p.dataUrl}" alt="captured photo" style="object-fit:${S.fit}">`;g.appendChild(d)});$('frameInfo').textContent=`${t.name.toUpperCase()} / ${S.pending.photos.length} FOTO`;$('exportInfo').textContent=S.fit==='cover'?'PNG / KUALITAS TINGGI':'PNG / UTUH';$('decor').textContent=S.finish==='contact'?`${S.pending.photos.length} / ${THEMES[S.theme].name.toUpperCase()}`:new Date().getFullYear();}
function renderEditor(){if(!S.pending?.photos?.length){go('camera');return}const arr=activeLayouts();S.layout=Math.min(S.layout,arr.length-1);$('editorText').textContent=`${S.pending.photos.length} foto · ${S.pending.aspect} · pilihan frame terkurasi`;renderThemes();renderLayouts();renderFrame()}

function drawImageCover(ctx,im,x,y,w,h,fit,px,py){const ar=im.width/im.height,tr=w/h;let dw=w,dh=h;if(fit==='contain'){const s=Math.min(w/im.width,h/im.height);dw=im.width*s;dh=im.height*s}else if(ar>tr){dh=h;dw=dh*ar}else{dw=w;dh=dw/ar}const cx=x+(w-dw)*(px/100),cy=y+(h-dh)*(py/100);ctx.drawImage(im,cx,cy,dw,dh)}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function path(c,b){if(b.shape==='arch'){c.beginPath();const r=Math.min(b.w*.22,b.h*.18);c.moveTo(b.x+r,b.y);c.lineTo(b.x+b.w-r,b.y);c.quadraticCurveTo(b.x+b.w,b.y,b.x+b.w,b.y+r);c.lineTo(b.x+b.w,b.y+b.h);c.lineTo(b.x,b.y+b.h);c.lineTo(b.x,b.y+r);c.quadraticCurveTo(b.x,b.y,b.x+r,b.y);c.closePath();return}if(b.shape==='square'){c.rect(b.x,b.y,b.w,b.h);return}rr(c,b.x,b.y,b.w,b.h,Math.min(28,b.w*.05))}
async function loadImg(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
async function composite(){const t=currentLayout(),th=THEMES[S.theme],boxes=layoutBoxes(t,100,100);const c=document.createElement('canvas'),w=1400,h=Math.round(1400/frameHeightRatio(t));c.width=w;c.height=h;const x=c.getContext('2d');const grd=x.createLinearGradient(0,0,w,h);grd.addColorStop(0,th.c1||'#17181a');grd.addColorStop(.52,th.c2||th.c1||'#25292d');grd.addColorStop(1,th.c1||'#0b0d0f');x.fillStyle=grd;x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.04)';x.fillRect(34,34,w-68,h-68);
 const scaleX=w/100,scaleY=h/100;for(let i=0;i<boxes.length&&i<S.pending.photos.length;i++){const b=boxes[i],B={x:b.x*scaleX,y:b.y*scaleY,w:b.w*scaleX,h:b.h*scaleY,shape:b.shape};x.save();path(x,B);x.clip();try{const im=await loadImg(S.pending.photos[i].dataUrl);if(S.fit==='contain'){x.fillStyle='#101214';x.fillRect(B.x,B.y,B.w,B.h)}drawImageCover(x,im,B.x,B.y,B.w,B.h,S.fit,S.posX,S.posY)}catch{}x.restore();x.save();x.strokeStyle='rgba(0,0,0,.16)';x.lineWidth=4;path(x,B);x.stroke();x.restore()}
 x.fillStyle=th.ink;x.font='800 25px DM Sans';x.fillText(th.label,86,h-74);x.textAlign='right';x.fillStyle=th.muted;x.font='700 18px DM Sans';x.fillText(`${t.name.toUpperCase()}  ·  ${new Date().getFullYear()}`,w-86,h-74);x.textAlign='left';x.fillStyle='rgba(255,255,255,.08)';x.fillRect(86,h-51,w-172,1);return c.toDataURL('image/png')}
async function save(){
  try{
    const data=await composite();
    const st=read();
    const stamp=now();
    const t=currentLayout();
    const photo={id:'p-'+Date.now(),dataUrl:data,createdAt:stamp,shots:S.pending.photos.length,aspect:S.pending.aspect,theme:S.theme,layout:t.name};
    const next={
      photos:[photo,...st.photos].slice(0,40),
      history:[{
        id:'h-'+Date.now(),createdAt:stamp,shots:photo.shots,aspect:photo.aspect,
        theme:S.theme,layoutName:t.name,preview:data
      },...st.history].slice(0,40)
    };
    if(!(await write(next))){
      toast('Gagal menyimpan ke penyimpanan perangkat.');
      return;
    }
    removePendingStorage();
    S.pending=null;
    renderPhotos();renderHistory();renderRecent();go('photos');
    toast('Frame berhasil disimpan di perangkat ini.');
  }catch(e){
    console.error(e);
    toast('Gagal menyimpan hasil. Coba lagi.');
  }
}
function renderPhotos(){const st=read(),w=$('photosList'),e=$('photosEmpty');w.innerHTML='';e.style.display=st.photos.length?'none':'block';st.photos.forEach(p=>{const d=document.createElement('article');d.className='photo-card';d.innerHTML=`<img src="${p.dataUrl}" alt="saved frame"><div class="photo-body"><div><b>${p.layout||'Frame jadi'}</b><span>${fmt(p.createdAt)} · ${p.theme||'studio'}</span></div><div class="actions2"><button class="mini-btn" data-d="${p.id}">Unduh</button><button class="mini-btn" data-x="${p.id}">Hapus</button></div></div>`;w.appendChild(d)});w.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const p=st.photos.find(x=>x.id===b.dataset.d);if(p){const a=document.createElement('a');a.href=p.dataUrl;a.download='zeebooth-'+Date.now()+'.png';a.click()}});w.querySelectorAll('[data-x]').forEach(b=>b.onclick=async()=>{const s=read();const next={photos:s.photos.filter(x=>x.id!==b.dataset.x),history:s.history};if(await write(next)){renderPhotos();toast('Foto dihapus dari perangkat.')}else toast('Gagal menghapus foto.')})}
function renderHistory(){const st=read(),w=$('historyList'),e=$('historyEmpty');w.innerHTML='';e.style.display=st.history.length?'none':'block';st.history.forEach(h=>{const d=document.createElement('article');d.className='history-card';d.innerHTML=`<img src="${h.preview}" alt="session preview"><div><b>${h.shots} foto per sesi</b><span>${fmt(h.createdAt)} · ${h.aspect}</span><span>${h.layoutName||'Frame'} · ${h.theme||'studio'}</span></div><button class="btn secondary" data-go="photos">Lihat Foto</button>`;w.appendChild(d)})}
function renderRecent(){const h=read().history;$('recentText')&&($('recentText').textContent=h.length?'Sesi terakhir · '+fmt(h[0].createdAt):'Belum ada sesi tersimpan')}

function bind(){
 bindNav();readUploaded();$('enable').onclick=enableCamera;$('shutter').onclick=shoot;$('reset').onclick=reset;$('finish').onclick=()=>{if(S.captures.length!==S.shots){toast(`Ambil semua ${S.shots} foto terlebih dahulu.`);return}S.pending={photos:S.captures.slice(),aspect:S.aspect,createdAt:now()};S.layout=0;go('editor')};
 document.querySelectorAll('#ratios button').forEach(b=>b.onclick=()=>setAspect(b.dataset.r));document.querySelectorAll('#shots button').forEach(b=>b.onclick=()=>{S.shots=+b.dataset.n;document.querySelectorAll('#shots button').forEach(x=>x.classList.toggle('active',x===b));reset()});document.querySelectorAll('#countdowns button').forEach(b=>b.onclick=()=>{S.countdown=+b.dataset.c;document.querySelectorAll('#countdowns button').forEach(x=>x.classList.toggle('active',x===b));updateHud()});
 $('mirrorToggle').onclick=setMirror;$('gridToggle').onclick=setGrid;$('cameraSwitch').onclick=flipCamera;$('soundToggle').onclick=()=>{S.sound=!S.sound;$('soundToggle').classList.toggle('active',S.sound)};
 document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{S.filter=b.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));setVideoFilter()});$('gesture').onclick=()=>{S.gesture=!S.gesture;$('gesture').classList.toggle('on',S.gesture);S.lastGesture='none';S.sameGesture=0;S.gestureCooldown=0;S.activeEffect=null;setEffectPreview(null);setGestureLabel();$('sensorStatus').textContent=S.gesture?'Sensor tangan siap':'Mode gesture dimatikan'};
 document.querySelectorAll('.finish').forEach(b=>b.onclick=()=>{S.finish=b.dataset.finish;document.querySelectorAll('.finish').forEach(x=>x.classList.toggle('active',x===b));renderFrame()});document.querySelectorAll('#fit button').forEach(b=>b.onclick=()=>{S.fit=b.dataset.fit;document.querySelectorAll('#fit button').forEach(x=>x.classList.toggle('active',x===b));renderFrame()});$('posX').oninput=()=>{S.posX=+$('posX').value;renderFrame()};$('posY').oninput=()=>{S.posY=+$('posY').value;renderFrame()};$('save').onclick=save;
}
function readUploaded(){}

function initMotion(){
  const viewSelector='.view > *, .view .hero-copy > *, .view .hero-visual > *, .view .feature-grid > *, .view .home-banner > *, .view .booth-console, .view .booth-controls > *, .view .studio-grid > *, .view .editor-controls > *, .view .photo-grid-list > *, .view .history-list > *';
  const items=[...document.querySelectorAll(viewSelector)].filter(el=>!el.closest('.dock')&&!el.classList.contains('view'));
  const seen=new Set();
  items.forEach((el,i)=>{el.classList.add('reveal-on-scroll');el.style.setProperty('--reveal-delay',`${Math.min(i%7,6)*55}ms`)});
  if(!('IntersectionObserver' in window)){items.forEach(el=>el.classList.add('is-visible'));return}
  const obs=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');seen.add(entry.target);obs.unobserve(entry.target)}})},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  items.forEach(el=>obs.observe(el));
  // Animate dynamic content as it is rendered later.
  const mo=new MutationObserver((records)=>{for(const r of records){for(const node of r.addedNodes){if(!(node instanceof Element))continue;if(node.matches('.photo-card,.history-card,.theme,.layout,.finish,.quick,.filter')||node.querySelector('.photo-card,.history-card,.theme,.layout,.finish,.quick,.filter')){const dyn=node.matches('.photo-card,.history-card,.theme,.layout,.finish,.quick,.filter')?[node]:[...node.querySelectorAll('.photo-card,.history-card,.theme,.layout,.finish,.quick,.filter')];dyn.forEach((el,j)=>{if(!el.classList.contains('reveal-on-scroll')){el.classList.add('reveal-on-scroll');el.style.setProperty('--reveal-delay',`${Math.min(j,5)*45}ms`);requestAnimationFrame(()=>el.classList.add('is-visible'))}})}}}});
  mo.observe(document.querySelector('main')||document.body,{childList:true,subtree:true});
}
function initParallax(){
  const target=document.querySelector('.hero-visual'); if(!target||matchMedia('(max-width: 900px)').matches)return;
  let raf=0;window.addEventListener('pointermove',e=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const x=(e.clientX/innerWidth-.5),y=(e.clientY/innerHeight-.5);target.style.transform=`translate3d(${x*7}px,${y*5}px,0)`})},{passive:true});
}

document.addEventListener('DOMContentLoaded',async()=>{bind();renderPhotos();renderHistory();renderRecent();setAspect(S.aspect);setGestureLabel();updateHud();initMotion();initParallax();await hydrateStorage();});
addEventListener('beforeunload',stopCamera);addEventListener('pagehide',stopCamera);document.addEventListener('visibilitychange',()=>{if(document.hidden&&S.view==='camera')stopCamera()});
})();
