const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const state = {
  route: "home",
  shots: 1,
  size: "4:5",
  filter: "Original",
  background: "Ivory",
  countdown: 3,
  captures: [],
  frameIndex: 0,
  finalBlob: null,
  finalDataUrl: null,
  stream: null,
  hands: null,
  cameraRunning: false,
  gestureBlur: false,
  shareData: null,
  currentSessionId: null,
  handTick: 0,
  handsTimer: null,
  handsLoading: false,
  handsBusy: false,
  imageCache: new Map(),
  renderToken: 0,
};

const FRAME_STYLES = [
  {name:"Ivory Classic", slug:"ivory-classic"},
  {name:"Rose Border", slug:"rose-border"},
  {name:"Editorial", slug:"editorial"},
  {name:"Polaroid", slug:"polaroid"},
  {name:"Soft Bloom", slug:"soft-bloom"},
  {name:"Minimal Air", slug:"minimal-air"},
  {name:"Signature", slug:"signature"},
];
const SIZES = [
  {label:"1:1", cls:"ratio-square"},
  {label:"4:5", cls:"ratio-portrait"},
  {label:"9:16", cls:"ratio-story"},
  {label:"16:9", cls:"ratio-landscape"},
];
const FILTERS = [
  {name:"Original", desc:"true-to-camera", css:"none"},
  {name:"Soft", desc:"gentle light", css:"brightness(1.04) saturate(.92) contrast(.96)"},
  {name:"Vintage", desc:"warm film", css:"sepia(.24) saturate(.88) contrast(1.03)"},
  {name:"Mono", desc:"quiet monochrome", css:"grayscale(1) contrast(1.04)"},
  {name:"Rose", desc:"dusty blush", css:"sepia(.08) saturate(1.15) hue-rotate(328deg)"},
  {name:"Dream", desc:"soft glow", css:"brightness(1.06) contrast(.93) saturate(.9) blur(.15px)"},
  {name:"Film", desc:"grainy contrast", css:"contrast(1.08) saturate(.88)"},
];
const BACKGROUNDS = [
  {name:"Ivory", desc:"clean pale ivory", css:"#FAF2E3"},
  {name:"Rose", desc:"dusty rose", css:"#DB627A"},
  {name:"Blush", desc:"soft blush", css:"linear-gradient(135deg,#f7ddd6,#e89baa)"},
  {name:"Sunset", desc:"warm gradient", css:"linear-gradient(135deg,#f5d8bc,#d86f86)"},
  {name:"Paper", desc:"paper-soft", css:"linear-gradient(145deg,#f9efe2 0%,#f5e1d6 100%)"},
  {name:"Night Rose", desc:"deep rose mood", css:"linear-gradient(145deg,#5b3643,#b85f74)"},
];

function randomId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function showToast(msg){ const el=$("#toast"); el.textContent=msg; el.classList.add("show"); clearTimeout(showToast.t); showToast.t=setTimeout(()=>el.classList.remove("show"),2200); }

function makeAmbient(){
  const wrap=$("#ambient-frames");
  for(let i=0;i<5;i++){const d=document.createElement("div");d.className="ambient-frame";wrap.appendChild(d)}
}

function initNav(){
  $$('[data-route]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.route)));
  const toggle=$('#nav-toggle');
  toggle?.addEventListener('click',()=>{
    const nav=$('#liquid-nav');
    const expanded=!nav.classList.contains('expanded');
    nav.classList.toggle('expanded',expanded);
    nav.classList.toggle('collapsed',!expanded);
    toggle.setAttribute('aria-expanded',String(expanded));
    toggle.setAttribute('aria-label',expanded?'Close navigation':'Open navigation');
    requestAnimationFrame(updateNavPill);
  });
  updateNavPill();
}
function navigate(route){
  const nav=$('#liquid-nav');
  if(nav?.classList.contains('expanded')){
    nav.classList.remove('expanded'); nav.classList.add('collapsed');
    $('#nav-toggle')?.setAttribute('aria-expanded','false');
  }
  if(route === 'about'){ route='home'; setTimeout(()=>showToast('About: a tiny browser-first photobooth.'),250); }
  if(route === 'camera') animateLiquidTransition();
  stopCameraIfLeaving(route);
  state.route=route;
  $$('.view').forEach(v=>v.classList.toggle('active-view',v.dataset.view===route));
  $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.route===route));
  updateNavPill();
  if(route === 'camera') setTimeout(initCameraPage,180);
  if(route === 'photos') renderHistory();
  if(route === 'home') renderHomeHistory();
  window.scrollTo({top:0,behavior:'smooth'});
}
function updateNavPill(){
  const nav=$('#liquid-nav'), active=$('.nav-item.active'), pill=$('#nav-pill'), items=$('#nav-items');
  if(!nav?.classList.contains('expanded') || !active || !pill || !items) return;
  const ir=active.getBoundingClientRect(), nr=items.getBoundingClientRect();
  pill.style.width=`${ir.width}px`; pill.style.translate=`${ir.left-nr.left}px 0`;
}
function animateLiquidTransition(){
  const blob=$('#transition-blob');
  blob.classList.remove('play'); void blob.offsetWidth; blob.classList.add('play');
  soundWhoosh();
  setTimeout(()=>{ blob.classList.remove('play'); blob.style.opacity='0'; },950);
}

function soundTone(freq=420,duration=.08,type="sine",gain=.025){
  try{
    const C=window.AudioContext||window.webkitAudioContext; if(!C)return;
    const ctx=new C(); const o=ctx.createOscillator(); const g=ctx.createGain();
    o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,ctx.currentTime);g.gain.linearRampToValueAtTime(gain,ctx.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+duration+.02);
  }catch(e){}
}
function soundShutter(){soundTone(900,.055,"square",.022); setTimeout(()=>soundTone(520,.12,"sine",.018),35)}
function soundWhoosh(){soundTone(180,.18,"sawtooth",.012);setTimeout(()=>soundTone(310,.22,"sine",.01),60)}

async function initCameraPage(){
  setupShotCount(); updateCameraControls(); renderCaptureSlots();
  const stage=$('#camera-stage'); stage.className=`camera-stage glass ${sizeClass(state.size)}`;
  setGesture(false);
  await startCamera();
}
function sizeClass(size){return SIZES.find(s=>s.label===size)?.cls||'ratio-portrait'}
async function startCamera(){
  if(state.cameraRunning)return;
  const video=$('#camera-video'), fallback=$('#camera-fallback');
  if(!navigator.mediaDevices?.getUserMedia){
    fallback.querySelector('span').textContent='Camera unavailable';
    fallback.querySelector('p').textContent='Use a modern browser on HTTPS or localhost.';
    return;
  }
  try{
    state.stream=await navigator.mediaDevices.getUserMedia({
      video:{facingMode:{ideal:'user'},width:{ideal:720,max:960},height:{ideal:960,max:1280},frameRate:{ideal:24,max:30}},
      audio:false
    });
    video.srcObject=state.stream;
    await video.play();
    state.cameraRunning=true;
    fallback.style.display='none';
    updateStatus('Camera ready');
    loadHandsDetector();
  }catch(err){
    fallback.style.display='grid';
    fallback.querySelector('span').textContent='Camera permission needed';
    fallback.querySelector('p').textContent='Allow camera access, then reload or try again.';
    updateStatus('Camera blocked');
  }
}
function stopCameraIfLeaving(route){
  if(route!=='camera'){
    if(state.handsTimer){clearInterval(state.handsTimer);state.handsTimer=null;}
    if(state.stream){state.stream.getTracks().forEach(t=>t.stop());state.stream=null;}
    state.cameraRunning=false;
    state.hands?.close?.(); state.hands=null; state.handsBusy=false; state.handsLoading=false;
    setGesture(false);
  }
}
function updateStatus(text){$('#status-text').textContent=text;}
function loadScriptOnce(src){
  return new Promise((resolve,reject)=>{
    const found=document.querySelector(`script[data-src="${src}"]`);
    if(found){
      if(found.dataset.loaded==='1'){resolve();return;}
      found.addEventListener('load',resolve,{once:true});
      found.addEventListener('error',reject,{once:true});
      return;
    }
    const tag=document.createElement('script');
    tag.src=src; tag.async=true; tag.crossOrigin='anonymous'; tag.dataset.src=src;
    tag.onload=()=>{tag.dataset.loaded='1';resolve()};
    tag.onerror=reject;
    document.head.appendChild(tag);
  });
}
async function loadHandsDetector(){
  if(state.handsLoading || state.hands || !state.cameraRunning)return;
  state.handsLoading=true;
  try{
    if(!window.Hands) await loadScriptOnce('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
    if(!state.cameraRunning || !window.Hands)return;
    state.hands=new Hands({locateFile:file=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
    state.hands.setOptions({maxNumHands:1,modelComplexity:0,minDetectionConfidence:.5,minTrackingConfidence:.5});
    state.hands.onResults(onHandResults);
    state.handsTimer=setInterval(async()=>{
      if(!state.cameraRunning || !state.hands || state.handsBusy)return;
      const video=$('#camera-video');
      if(!video.videoWidth || video.readyState<2)return;
      state.handsBusy=true;
      try{await state.hands.send({image:video});}catch(e){}
      state.handsBusy=false;
    },250);
    updateStatus('Gesture sensor ready');
  }catch(err){
    updateStatus('Camera ready');
    showToast('Gesture sensor unavailable on this browser');
  }finally{state.handsLoading=false;}
}
function onHandResults(res){
  const lm=res.multiHandLandmarks?.[0];
  if(!lm){setGesture(false);return;}
  const index=isFingerExtended(lm,8,7,6,5);
  const middle=isFingerExtended(lm,12,11,10,9);
  const ring=isFingerExtended(lm,16,15,14,13);
  const pinky=isFingerExtended(lm,20,19,18,17);
  setGesture(index && middle && !ring && !pinky);
}
function isFingerExtended(lm,tip,dip,pip,mcp){
  const bend=jointAngle(lm[tip],lm[dip],lm[pip]);
  const reach=distance(lm[tip],lm[0])>distance(lm[pip],lm[0])*1.08;
  return bend>155 && reach;
}
function jointAngle(a,b,c){
  const ab={x:a.x-b.x,y:a.y-b.y,z:a.z-b.z};
  const cb={x:c.x-b.x,y:c.y-b.y,z:c.z-b.z};
  const dot=ab.x*cb.x+ab.y*cb.y+ab.z*cb.z;
  const mag=Math.hypot(ab.x,ab.y,ab.z)*Math.hypot(cb.x,cb.y,cb.z);
  return mag?Math.acos(Math.max(-1,Math.min(1,dot/mag)))*180/Math.PI:0;
}
function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)}
function setGesture(on){
  if(state.gestureBlur===on)return;
  state.gestureBlur=on;
  $('#camera-stage').classList.toggle('gesture-blur',on);
  $('#gesture-indicator').classList.toggle('show',on);
}

function setupShotCount(){
  $$("#shot-count-options button").forEach(b=>{b.classList.toggle("active",Number(b.dataset.shots)===state.shots); b.onclick=()=>{state.shots=Number(b.dataset.shots); updateCameraControls(); renderCaptureSlots(); updateCaptureProgress(); soundTone(540,.06,"sine",.02)}})
}
function updateCaptureProgress(){ $("#captured-count").textContent=`${state.captures.length} / ${state.shots}`; $("#capture-progress").textContent=state.captures.length?`${state.captures.length} of ${state.shots} captured`:`ready to capture ${state.shots} shot${state.shots>1?'s':''}`; }
function updateCameraControls(){
  const stage=$("#camera-stage"); stage.className=`camera-stage glass ${sizeClass(state.size)}`;
  $("#size-control b").textContent=state.size; $("#filter-control b").textContent=state.filter; $("#background-control b").textContent=state.background; $("#countdown-control b").textContent=state.countdown===0?"Off":`${state.countdown}s`;
}
function renderCaptureSlots(){
  const wrap=$("#capture-slots"); wrap.innerHTML="";
  for(let i=0;i<state.shots;i++){const slot=document.createElement("div");slot.className="capture-slot";if(state.captures[i]){const img=document.createElement("img");img.src=state.captures[i].dataUrl;slot.appendChild(img)}else slot.textContent=i+1;wrap.appendChild(slot)}
  updateCaptureProgress();
}

async function takePhoto(){
  if(!state.cameraRunning){await startCamera(); if(!state.cameraRunning)return;}
  if(state.captures.length>=state.shots){showToast("All shots are captured. Let’s style them.");navigate("editor");return;}
  const shutter=$("#shutter-btn"); shutter.classList.remove("pressing"); void shutter.offsetWidth; shutter.classList.add("pressing");
  if(state.countdown>0){
    for(let n=state.countdown;n>=1;n--){await showCountdown(n);}
  }
  const video=$("#camera-video"), canvas=document.createElement("canvas");
  const vw=video.videoWidth||1280,vh=video.videoHeight||1600; const aspect=parseAspect(state.size); let cw=vw,ch=Math.round(cw/aspect);
  if(ch>vh){ch=vh;cw=Math.round(ch*aspect)}
  canvas.width=cw;canvas.height=ch;
  const ctx=canvas.getContext("2d"); const sx=(vw-cw)/2, sy=(vh-ch)/2; ctx.save();
  // Mirror to feel natural like a selfie camera.
  ctx.translate(cw,0);ctx.scale(-1,1);ctx.drawImage(video,sx,sy,cw,ch,0,0,cw,ch);ctx.restore();
  const imgData=ctx.getImageData(0,0,cw,ch);
  applyFilterToCanvasPixels(imgData, state.filter); ctx.putImageData(imgData,0,0);
  const dataUrl=canvas.toDataURL("image/jpeg",.92); state.captures.push({dataUrl,width:cw,height:ch,timestamp:Date.now()});
  $("#flash-overlay").classList.remove("fire"); void $("#flash-overlay").offsetWidth; $("#flash-overlay").classList.add("fire"); soundShutter(); renderCaptureSlots();
  if(state.captures.length>=state.shots){await sleep(420); openEditor();}
}
function parseAspect(size){if(size==="1:1")return 1;if(size==="9:16")return 9/16;if(size==="16:9")return 16/9;return 4/5}
function showCountdown(n){return new Promise(resolve=>{const el=$("#countdown-display");el.textContent=n;el.classList.remove("show");void el.offsetWidth;el.classList.add("show");soundTone(350+n*80,.08,"sine",.012);setTimeout(resolve,850)})}
function applyFilterToCanvasPixels(imageData,name){const d=imageData.data;const f=FILTERS.find(x=>x.name===name);if(!f||name==="Original")return;for(let i=0;i<d.length;i+=4){let r=d[i],g=d[i+1],b=d[i+2];if(name==="Mono"){const v=.299*r+.587*g+.114*b;r=g=b=v}else if(name==="Vintage"){r=r*.96+18;g=g*.9+8;b=b*.84}else if(name==="Rose"){r=r*1.03+7;g=g*.93;b=b*.96}else if(name==="Soft"){r=Math.min(255,r*1.04+4);g=Math.min(255,g*1.04+4);b=Math.min(255,b*1.03+4)}else if(name==="Dream"){r=Math.min(255,r*1.05+5);g=Math.min(255,g*1.04+4);b=Math.min(255,b*1.03+4)}else if(name==="Film"){r=Math.min(255,Math.max(0,(r-128)*1.08+128));g=Math.min(255,Math.max(0,(g-128)*1.08+128));b=Math.min(255,Math.max(0,(b-128)*1.08+128))}d[i]=r;d[i+1]=g;d[i+2]=b;}}

function openDrawer(type){
  const drawer=$("#control-drawer"),content=$("#drawer-content"),title=$("#drawer-title");content.innerHTML="";
  const make=(items,click)=>{const g=document.createElement("div");g.className="option-grid";items.forEach(item=>{const b=document.createElement("button");b.className="drawer-option";b.innerHTML=item.html||`<b>${item.name}</b><small>${item.desc||""}</small>`;if(item.name===state[type])b.classList.add("active");b.onclick=()=>{click(item);drawer.classList.remove("open");drawer.setAttribute("aria-hidden","true");updateCameraControls()};g.appendChild(b)});content.appendChild(g)};
  if(type==="size"){title.textContent="Camera size";make(SIZES.map(x=>({name:x.label,desc:"Aspect ratio",cls:x.cls})),item=>state.size=item.label)}
  if(type==="filter"){title.textContent="Filter";make(FILTERS.map(x=>({name:x.name,desc:x.desc,html:`<div class="filter-swatch" style="filter:${x.css}"></div><b>${x.name}</b><small>${x.desc}</small>`})),item=>state.filter=item.name)}
  if(type==="background"){title.textContent="Background";make(BACKGROUNDS.map(x=>({name:x.name,desc:x.desc,html:`<div class="filter-swatch" style="background:${x.css}"></div><b>${x.name}</b><small>${x.desc}</small>`})),item=>state.background=item.name)}
  if(type==="countdown"){title.textContent="Countdown";make([0,3,5].map(n=>({name:n===0?"Off":`${n}s`,desc:"Before every shot"})),item=>state.countdown=item.name==="Off"?0:Number(item.name.replace("s","")))}
  drawer.classList.add("open");drawer.setAttribute("aria-hidden","false");
}

async function openEditor(){
  navigate('editor'); state.frameIndex=0; state.finalBlob=null; state.finalDataUrl=null;
  await sleep(160); renderFrameChoices(); await renderFinal();
}
function frameCount(){return FRAME_STYLES.length*state.shots}
function renderFrameChoices(){
  const grid=$("#frame-grid");grid.innerHTML="";
  FRAME_STYLES.forEach((style,si)=>{const c=document.createElement("button");c.className="frame-choice";const canvas=document.createElement("canvas");canvas.width=170;canvas.height=Math.round(170/frameAspect());renderFrame(canvas.getContext("2d"),canvas.width,canvas.height,si,state.captures);c.appendChild(canvas);const sm=document.createElement("small");sm.textContent=style.name;c.appendChild(sm);c.onclick=()=>{state.frameIndex=si;renderFrameChoices();renderFinal()};if(si===state.frameIndex)c.classList.add("active");grid.appendChild(c)})
  $("#frame-title").textContent=FRAME_STYLES[state.frameIndex].name;$("#frame-counter").textContent=`${String(state.frameIndex+1).padStart(2,"0")} / ${String(FRAME_STYLES.length).padStart(2,"0")} • ${state.shots} photo${state.shots>1?'s':''}`;
}
function frameAspect(){return state.shots===1?4/5:state.shots===2?3/4:state.shots===3?2/3:2/3.2}
function finalDimensions(){const ratio=frameAspect();let w=1200,h=Math.round(w/ratio);return {w,h}}

function renderFinal(){
  const token=++state.renderToken;
  return new Promise(resolve=>{
    const canvas=$('#final-canvas'),{w,h}=finalDimensions();
    canvas.width=w; canvas.height=h;
    const ctx=canvas.getContext('2d',{alpha:false});
    $('#render-loading').classList.add('show');
    requestAnimationFrame(async()=>{
      try{
        await renderFrame(ctx,w,h,state.frameIndex,state.captures);
        if(token!==state.renderToken){resolve();return;}
        $('#render-loading').classList.remove('show');
        canvas.toBlob(blob=>{
          if(!blob){resolve();return;}
          state.finalBlob=blob;
          state.finalDataUrl=canvas.toDataURL('image/jpeg',.92);
          resolve();
        },'image/jpeg',.92);
      }catch(e){
        $('#render-loading').classList.remove('show');
        showToast('Could not render this frame');
        resolve();
      }
    });
  });
}
function drawCover(ctx,img,x,y,w,h){const r=Math.max(w/img.width,h/img.height);const dw=img.width*r,dh=img.height*r;ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}
function roundedRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function loadImage(src){
  if(state.imageCache.has(src)) return Promise.resolve(state.imageCache.get(src));
  return new Promise((resolve,reject)=>{const img=new Image();img.decoding='async';img.onload=()=>{state.imageCache.set(src,img);resolve(img)};img.onerror=reject;img.src=src})
}

async function renderFrame(ctx,w,h,styleIndex,captures){
  const bg=BACKGROUNDS.find(b=>b.name===state.background)?.css||"#FAF2E3"; drawBackground(ctx,w,h,bg);
  const imgs=[]; for(const c of captures)imgs.push(await loadImage(c.dataUrl));
  const rose="#DB627A", ink="#432933", ivory="#FAF2E3"; const pad=Math.round(Math.min(w,h)*.055); const gap=Math.round(Math.min(w,h)*.025);
  ctx.save(); ctx.lineCap="round";ctx.lineJoin="round";
  if(styleIndex===0){
    drawStack(ctx,w,h,imgs,pad,gap,ivory,"ivory");
  } else if(styleIndex===1){
    drawStack(ctx,w,h,imgs,pad,gap,rose,"rose");
  } else if(styleIndex===2){
    drawEditorial(ctx,w,h,imgs,pad,gap,ivory,rose);
  } else if(styleIndex===3){
    drawPolaroid(ctx,w,h,imgs,pad,gap,ivory,ink);
  } else if(styleIndex===4){
    drawBloom(ctx,w,h,imgs,pad,gap,ivory,rose);
  } else if(styleIndex===5){
    drawMinimalAir(ctx,w,h,imgs,pad,gap,ivory,ink);
  } else {
    drawSignature(ctx,w,h,imgs,pad,gap,ivory,rose,ink);
  }
  ctx.restore();
}
function drawBackground(ctx,w,h,bg){
  if(bg.startsWith("linear-gradient")){const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,"#F7DDD6");g.addColorStop(.55,"#E89BAA");g.addColorStop(1,"#DB627A");ctx.fillStyle=g}else if(bg==="#DB627A"){ctx.fillStyle=bg}else if(bg.includes("Night")){ctx.fillStyle="#6A3D4A"}else{const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,"#FAF2E3");g.addColorStop(1,"#F5E3D7");ctx.fillStyle=g}ctx.fillRect(0,0,w,h);
  const grain=ctx.createRadialGradient(w*.3,h*.2,20,w*.3,h*.2,Math.min(w,h)*.65);grain.addColorStop(0,"rgba(255,255,255,.16)");grain.addColorStop(1,"rgba(255,255,255,0)");ctx.fillStyle=grain;ctx.fillRect(0,0,w,h)
}
function photoRegions(w,h,n,pad,gap){
  const innerW=w-pad*2, innerH=h-pad*2; const ratio=4/5; let out=[];
  if(n===1){out=[{x:pad,y:pad+pad*.35,w:innerW,h:Math.min(innerH*.74,innerW/ratio)}]}
  else if(n===2){const hh=(innerH-gap)/2;out=[{x:pad,y:pad,w:innerW,h:hh},{x:pad,y:pad+hh+gap,w:innerW,h:hh}];}
  else if(n===3){const hh=(innerH-gap*2)/3;out=[{x:pad,y:pad,w:innerW,h:hh},{x:pad,y:pad+hh+gap,w:innerW,h:hh},{x:pad,y:pad+(hh+gap)*2,w:innerW,h:hh}];}
  else {const ww=(innerW-gap)/2, hh=(innerH-gap)/2;out=[{x:pad,y:pad,w:ww,h:hh},{x:pad+ww+gap,y:pad,w:ww,h:hh},{x:pad,y:pad+hh+gap,w:ww,h:hh},{x:pad+ww+gap,y:pad+hh+gap,w:ww,h:hh}]}
  return out;
}
function drawStack(ctx,w,h,imgs,pad,gap,color,mode){const regs=photoRegions(w,h,imgs.length,pad,gap);regs.forEach((r,i)=>{ctx.fillStyle=mode==="rose"?"rgba(255,255,255,.12)":"rgba(255,255,255,.58)";roundedRect(ctx,r.x-5,r.y-5,r.w+10,r.h+10,18);ctx.fill();ctx.save();roundedRect(ctx,r.x,r.y,r.w,r.h,12);ctx.clip();drawCover(ctx,imgs[i],r.x,r.y,r.w,r.h);ctx.restore()});ctx.fillStyle=color;ctx.font=`700 ${Math.round(w*.035)}px 'DM Sans'`;ctx.textAlign="center";ctx.fillText("PHOTObooth",w/2,h-pad*.55);ctx.font=`500 ${Math.round(w*.018)}px 'DM Sans'`;ctx.fillText(dateStamp(),w/2,h-pad*.22)}
function drawEditorial(ctx,w,h,imgs,pad,gap,ivory,rose){const bg="#FFF9F0";ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);const inner=w-pad*2; if(imgs.length===1){const r={x:pad,y:pad,w:inner,h:inner/.82};ctx.save();roundedRect(ctx,r.x,r.y,r.w,r.h,22);ctx.clip();drawCover(ctx,imgs[0],r.x,r.y,r.w,r.h);ctx.restore()}else{const topH=(h-pad*2-gap)*.58;const r1={x:pad,y:pad,w:inner,h:topH};ctx.save();roundedRect(ctx,r1.x,r1.y,r1.w,r1.h,22);ctx.clip();drawCover(ctx,imgs[0],r1.x,r1.y,r1.w,r1.h);ctx.restore();const rest=imgs.length-1, subW=(inner-gap*(rest-1))/rest;for(let i=1;i<imgs.length;i++){const rr={x:pad+(i-1)*(subW+gap),y:pad+topH+gap,w:subW,h:h-pad-(pad+topH+gap)-pad*.15};ctx.save();roundedRect(ctx,rr.x,rr.y,rr.w,rr.h,18);ctx.clip();drawCover(ctx,imgs[i],rr.x,rr.y,rr.w,rr.h);ctx.restore()}}
ctx.fillStyle=rose;ctx.font=`700 ${Math.round(w*.055)}px 'Playfair Display'`;ctx.fillText("little moments.",pad,h-pad*.32);ctx.fillStyle="#6f5a62";ctx.font=`500 ${Math.round(w*.018)}px 'DM Sans'`;ctx.fillText(dateStamp(),pad,h-pad*.13)}
function drawPolaroid(ctx,w,h,imgs,pad,gap,ivory,ink){ctx.fillStyle="#f4e9dc";ctx.fillRect(0,0,w,h);const regs=photoRegions(w,h,imgs.length,pad,gap);regs.forEach((r,i)=>{ctx.fillStyle="#fffaf2";roundedRect(ctx,r.x-7,r.y-7,r.w+14,r.h+34,10);ctx.fill();ctx.save();roundedRect(ctx,r.x,r.y,r.w,r.h,6);ctx.clip();drawCover(ctx,imgs[i],r.x,r.y,r.w,r.h);ctx.restore()});ctx.fillStyle=ink;ctx.textAlign="center";ctx.font=`600 ${Math.round(w*.022)}px 'Playfair Display'`;ctx.fillText("keep this feeling",w/2,h-pad*.34);ctx.font=`500 ${Math.round(w*.016)}px 'DM Sans'`;ctx.fillText(dateStamp(),w/2,h-pad*.16)}
function drawBloom(ctx,w,h,imgs,pad,gap,ivory,rose){ctx.fillStyle="#F8EEE7";ctx.fillRect(0,0,w,h);for(let i=0;i<8;i++){ctx.fillStyle=`rgba(219,98,122,${.035+i*.006})`;ctx.beginPath();ctx.arc((i*173)%w,(i*241)%h,Math.min(w,h)*(.07+i*.012),0,Math.PI*2);ctx.fill()}const regs=photoRegions(w,h,imgs.length,pad+10,gap+5);regs.forEach((r,i)=>{ctx.save();roundedRect(ctx,r.x,r.y,r.w,r.h,26);ctx.clip();drawCover(ctx,imgs[i],r.x,r.y,r.w,r.h);ctx.restore()});ctx.fillStyle=rose;ctx.font=`700 ${Math.round(w*.021)}px 'DM Sans'`;ctx.textAlign="center";ctx.fillText("soft bloom / "+dateStamp(),w/2,h-pad*.34)}
function drawMinimalAir(ctx,w,h,imgs,pad,gap,ivory,ink){ctx.fillStyle=ivory;ctx.fillRect(0,0,w,h);const regs=photoRegions(w,h,imgs.length,pad*1.25,gap*1.15);regs.forEach((r,i)=>{ctx.save();ctx.shadowColor="rgba(59,35,45,.13)";ctx.shadowBlur=22;ctx.shadowOffsetY=8;roundedRect(ctx,r.x,r.y,r.w,r.h,7);ctx.fillStyle="#fffdf8";ctx.fill();ctx.shadowColor="transparent";ctx.clip();drawCover(ctx,imgs[i],r.x+5,r.y+5,r.w-10,r.h-10);ctx.restore()});ctx.fillStyle=ink;ctx.textAlign="left";ctx.font=`500 ${Math.round(w*.018)}px 'DM Sans'`;ctx.fillText("photobooth study",pad,h-pad*.32);ctx.font=`700 ${Math.round(w*.032)}px 'Playfair Display'`;ctx.fillText(dateStamp(),pad,h-pad*.14)}
function drawSignature(ctx,w,h,imgs,pad,gap,ivory,rose,ink){ctx.fillStyle="#F3E5D9";ctx.fillRect(0,0,w,h);ctx.strokeStyle=rose;ctx.lineWidth=Math.max(4,w*.007);ctx.strokeRect(pad*.72,pad*.72,w-pad*1.44,h-pad*1.44);const regs=photoRegions(w,h,imgs.length,pad*1.3,gap);regs.forEach((r,i)=>{ctx.save();ctx.translate(r.x+r.w/2,r.y+r.h/2);ctx.rotate((i%2?1:-1)*.008);ctx.translate(-(r.x+r.w/2),-(r.y+r.h/2));ctx.save();roundedRect(ctx,r.x,r.y,r.w,r.h,14);ctx.clip();drawCover(ctx,imgs[i],r.x,r.y,r.w,r.h);ctx.restore();ctx.restore()});ctx.fillStyle=rose;ctx.font=`700 ${Math.round(w*.045)}px 'Playfair Display'`;ctx.textAlign="center";ctx.fillText("made of little things",w/2,h-pad*.33);ctx.fillStyle=ink;ctx.font=`600 ${Math.round(w*.014)}px 'DM Sans'`;ctx.fillText("PHOTObooth • "+dateStamp(),w/2,h-pad*.15)}
function dateStamp(){return new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}).toUpperCase()}

async function refreshFrame(){renderFrameChoices();await renderFinal()}

function storageKey(){return "photobooth-history-v1"}
function getHistory(){try{return JSON.parse(localStorage.getItem(storageKey())||"[]")}catch(e){return[]}}
function setHistory(items){localStorage.setItem(storageKey(),JSON.stringify(items.slice(0,30)))}
function saveFinalToHistory(){
  if(!state.finalDataUrl)return;
  const items=getHistory();items.unshift({id:randomId(),dataUrl:state.finalDataUrl,shots:state.shots,size:state.size,frame:FRAME_STYLES[state.frameIndex].name,createdAt:new Date().toISOString()});setHistory(items);showToast("Saved to your memory wall");
}
function renderHistory(){const grid=$("#photos-grid"),empty=$("#empty-state"),items=getHistory();grid.innerHTML="";empty.classList.toggle("show",!items.length);items.forEach((item,index)=>grid.appendChild(historyCard(item,index)));}
function renderHomeHistory(){const grid=$("#home-history-grid"),items=getHistory().slice(0,3);grid.innerHTML="";if(!items.length){grid.innerHTML=`<div class="empty-state show glass" style="grid-column:1/-1"><div class="empty-art">✦</div><h2>No saved frames yet.</h2><p>Take your first photo to fill this little wall.</p><button class="primary-btn compact" data-route="camera">Take a photo</button></div>`;$$('[data-route="camera"]',grid).forEach(b=>b.onclick=()=>navigate("camera"));return;}items.forEach((item,index)=>grid.appendChild(historyCard(item,index)));}
function historyCard(item,index){const wrap=document.createElement("article");wrap.className="history-card";wrap.style.animationDelay=`${index*70}ms`;const img=document.createElement("img");img.className="history-image";img.src=item.dataUrl;img.alt="Saved photobooth frame";const info=document.createElement("div");info.className="history-info";const date=new Date(item.createdAt);info.innerHTML=`<strong>${item.frame}</strong><small>${date.toLocaleString([], {dateStyle:"medium",timeStyle:"short"})} · ${item.shots} photo${item.shots>1?'s':''}</small>`;const actions=document.createElement("div");actions.className="history-actions";const dl=document.createElement("button");dl.className="mini-btn";dl.textContent="Download";dl.onclick=()=>downloadDataUrl(item.dataUrl,`photobooth-${item.id}.jpg`);const sh=document.createElement("button");sh.className="mini-btn";sh.textContent="Share";sh.onclick=()=>shareImage(item.dataUrl);const del=document.createElement("button");del.className="mini-btn danger";del.textContent="Delete";del.onclick=()=>{const all=getHistory().filter(x=>x.id!==item.id);setHistory(all);renderHistory();renderHomeHistory();showToast("Removed from memory wall")};actions.append(dl,sh,del);wrap.append(img,info,actions);return wrap}

function saveFinal(){
  if(!state.finalDataUrl){
    showToast('Preparing your final image…');
    renderFinal().then(()=>{if(state.finalDataUrl)saveFinal()});
    return;
  }
  saveFinalToHistory();
  // Synchronous anchor click preserves the mobile browser user gesture.
  downloadDataUrl(state.finalDataUrl,`photobooth-${Date.now()}.jpg`);
  showToast('Saved — frame included');
}
function downloadBlob(blob,name){
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=name; a.rel='noopener';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function downloadDataUrl(data,name){
  const a=document.createElement('a'); a.href=data; a.download=name; a.rel='noopener';
  document.body.appendChild(a); a.click(); a.remove();
}

async function shareImage(dataUrl){
  try{
    const blob=await (await fetch(dataUrl)).blob();const file=new File([blob],"photobooth.jpg",{type:"image/jpeg"});
    if(navigator.share && navigator.canShare?.({files:[file]})){await navigator.share({title:"My PHOTObooth frame",text:"Made with PHOTObooth ✦",files:[file]});return}
    const wa=`https://wa.me/?text=${encodeURIComponent("Made this with PHOTObooth ✦")}`;window.open(wa,"_blank","noopener,noreferrer");showToast("Web Share unavailable, opening WhatsApp share");
  }catch(e){showToast("Share cancelled")}
}

function wireCamera(){
  $("#start-camera-btn").onclick=()=>navigate("camera");
  $("#camera-back").onclick=()=>navigate("home");
  $("#camera-reset").onclick=()=>{state.captures=[];renderCaptureSlots();showToast("Session reset")};
  $("#shutter-btn").onclick=()=>takePhoto();
  $("#size-control").onclick=()=>openDrawer("size");$("#filter-control").onclick=()=>openDrawer("filter");$("#background-control").onclick=()=>openDrawer("background");$("#countdown-control").onclick=()=>openDrawer("countdown");
  $("#drawer-close").onclick=()=>$("#control-drawer").classList.remove("open");
  $("#editor-back").onclick=()=>navigate("camera");$("#editor-home").onclick=()=>navigate("home");
  $("#retake-btn").onclick=()=>{state.captures=[];state.finalBlob=null;state.finalDataUrl=null;state.imageCache.clear();navigate("camera")};
  $("#download-final-btn").onclick=()=>saveFinal();$("#share-final-btn").onclick=()=>{if(state.finalDataUrl)shareImage(state.finalDataUrl);else showToast("Preparing your final image…")};
}
function updateStatusIdle(){updateStatus("Ready")}

function boot(){makeAmbient();initNav();wireCamera();renderHomeHistory();updateStatusIdle();window.addEventListener("resize",updateNavPill);document.addEventListener("visibilitychange",()=>{if(document.hidden&&state.stream)state.stream.getTracks().forEach(t=>t.enabled=false);else if(state.stream)state.stream.getTracks().forEach(t=>t.enabled=true)});}
boot();
