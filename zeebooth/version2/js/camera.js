(() => {
  let stream = null;
  let aspect = "3:4";
  let shotCount = 1;
  let countdown = 3;
  let gestureEnabled = true;
  let captured = [];
  let sessionBusy = false;
  let currentEffect = null;
  let lastGestureTrigger = 0;

  const $ = id => document.getElementById(id);

  function ratioValue(value){
    const [w,h] = value.split(":").map(Number);
    return w/h;
  }

  function updatePreviewRatio(){
    const stage = $("cameraStage");
    if(stage) stage.style.aspectRatio = ratioValue(aspect);
  }

  async function requestCamera(){
    try{
      if(stream) stream.getTracks().forEach(t=>t.stop());
      stream = await navigator.mediaDevices.getUserMedia({
        video:{facingMode:"user",width:{ideal:1920},height:{ideal:1080}},
        audio:false
      });
      $("cameraVideo").srcObject=stream;
      $("cameraVideo").muted=true;
      await $("cameraVideo").play();
      $("cameraHint").textContent="Ready · pose or press the shutter.";
      $("permissionDialog").classList.add("hidden");
      await window.ZeeboothGesture?.start($("cameraVideo"));
    }catch(err){
      $("cameraHint").textContent="Camera permission was not granted.";
      console.error(err);
    }
  }

  function sourceCrop(video){
    const vW=video.videoWidth, vH=video.videoHeight;
    const target=ratioValue(aspect);
    const sourceRatio=vW/vH;

    let sx=0, sy=0, sw=vW, sh=vH;
    if(sourceRatio>target){
      sw=vH*target;
      sx=(vW-sw)/2;
    }else if(sourceRatio<target){
      sh=vW/target;
      sy=(vH-sh)/2;
    }
    return {sx,sy,sw,sh};
  }

  function captureFrame(effectType=null){
    const video=$("cameraVideo");
    if(!video.videoWidth) return null;

    const crop=sourceCrop(video);
    const outputW=1200;
    const outputH=Math.round(outputW/ratioValue(aspect));
    const canvas=document.createElement("canvas");
    canvas.width=outputW;canvas.height=outputH;
    const ctx=canvas.getContext("2d");
    ctx.save();
    ctx.translate(outputW,0);
    ctx.scale(-1,1);
    ctx.drawImage(video,crop.sx,crop.sy,crop.sw,crop.sh,0,0,outputW,outputH);
    ctx.restore();

    if(effectType) window.ZeeboothEffects?.applyToCanvas(ctx,canvas,effectType);
    return {
      dataUrl:canvas.toDataURL("image/jpeg",.93),
      aspect
    };
  }

  async function runCountdown(seconds){
    if(!seconds) return;
    const el=$("countdownOverlay");
    for(let i=seconds;i>=1;i--){
      el.textContent=String(i);
      window.Zeebooth.beep(i);
      await new Promise(r=>setTimeout(r,760));
    }
    el.textContent="";
  }

  async function captureOne(effectType=null){
    if(sessionBusy && captured.length >= shotCount) return;
    sessionBusy=true;
    currentEffect=effectType || null;

    if(effectType) await window.ZeeboothEffects?.show(effectType,$("effectOverlay"));
    await runCountdown(countdown);

    const frame=captureFrame(effectType);
    if(frame){
      captured.push({...frame,effect:effectType});
      renderCaptured();
      window.Zeebooth.shutterSound();
    }
    sessionBusy=false;
    if(captured.length >= shotCount){
      $("sessionProgress").textContent=`${captured.length} / ${shotCount}`;
    }
  }

  function renderCaptured(){
    const strip=$("captureStrip");
    strip.innerHTML="";
    if(!captured.length){
      strip.innerHTML=`<div class="empty-slot">Your shots will appear here.</div>`;
    }
    captured.forEach((shot,i)=>{
      const el=document.createElement("div");
      el.className="capture-thumb";
      el.innerHTML=`<img src="${shot.dataUrl}" alt="Captured shot ${i+1}">`;
      strip.appendChild(el);
    });
    $("sessionProgress").textContent=`${captured.length} / ${shotCount}`;
  }

  function resetSession(){
    captured=[];
    currentEffect=null;
    renderCaptured();
  }

  function finishSession(){
    if(captured.length!==shotCount){
      $("cameraHint").textContent=`Capture all ${shotCount} photo${shotCount>1?"s":""} before editing.`;
      return;
    }
    window.ZeeboothStore.setPending({
      photos:captured,
      shots:shotCount,
      aspect,
      createdAt:new Date().toISOString()
    });
    location.href="editor.html";
  }

  function bind(){
    $("aspectSelect").addEventListener("change",e=>{
      aspect=e.target.value;
      updatePreviewRatio();
    });
    $("shotsSelect").addEventListener("change",e=>{
      shotCount=Number(e.target.value);
      resetSession();
      $("sessionProgress").textContent=`0 / ${shotCount}`;
    });
    $("countdownSelect").addEventListener("change",e=>countdown=Number(e.target.value));

    $("shutterButton").addEventListener("click",()=>captureOne(null));
    $("resetSessionButton").addEventListener("click",resetSession);
    $("finishSessionButton").addEventListener("click",finishSession);

    $("gestureToggle").addEventListener("click",()=>{
      gestureEnabled=!gestureEnabled;
      $("gestureToggle").classList.toggle("off",!gestureEnabled);
      $("gestureToggle").setAttribute("aria-pressed",String(gestureEnabled));
      $("gestureStatus").textContent=gestureEnabled?"ON":"OFF";
      window.ZeeboothGesture?.setEnabled(gestureEnabled);
      $("cameraHint").textContent=gestureEnabled
        ?"Gestures active · ✌️ 🖐️ 🫶"
        :"Gestures off · manual shutter only.";
    });

    $("startCameraButton").addEventListener("click",requestCamera);
    window.ZeeboothGesture?.onTrigger(async(type)=>{
      if(!gestureEnabled || sessionBusy || captured.length>=shotCount) return;
      const now=Date.now();
      if(now-lastGestureTrigger<3500) return;
      lastGestureTrigger=now;
      await captureOne(type);
    });

    updatePreviewRatio();
    if(navigator.mediaDevices?.getUserMedia){
      $("permissionDialog").classList.remove("hidden");
      $("cameraHint").textContent="Tap enable camera to begin.";
    }else{
      $("cameraHint").textContent="Camera API is not available in this browser.";
    }
  }

  document.addEventListener("DOMContentLoaded",bind);

  window.addEventListener("beforeunload",()=>{
    if(stream) stream.getTracks().forEach(t=>t.stop());
  });
})();
