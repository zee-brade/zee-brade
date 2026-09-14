(() => {
  let pending = null;
  let selectedBg = 0;
  let selectedLayout = 0;
  let decor = "sparkles";

  const $ = id => document.getElementById(id);

  function renderOptions(){
    const bgWrap = $("backgroundOptions");
    const layoutWrap = $("layoutOptions");
    if(!bgWrap || !layoutWrap) return;

    bgWrap.innerHTML = "";
    window.ZeeboothFrames.backgrounds.forEach((bg,i)=>{
      const el=document.createElement("button");
      el.type="button";
      el.className="option-card"+(i===selectedBg?" active":"");
      el.innerHTML=`<div class="option-thumb"><img src="${bg.image}" alt=""></div><strong>${bg.name}</strong>`;
      el.onclick=()=>{selectedBg=i;renderOptions();renderFrame();};
      bgWrap.appendChild(el);
    });

    layoutWrap.innerHTML = "";
    window.ZeeboothFrames.layouts(pending.photos.length,pending.aspect).forEach((layout,i)=>{
      const el=document.createElement("button");
      el.type="button";
      el.className="option-card"+(i===selectedLayout?" active":"");
      el.innerHTML=`<div class="option-thumb" style="display:grid;grid-template-columns:repeat(${layout.cols},1fr);grid-template-rows:repeat(${layout.rows},1fr);gap:3px;padding:7px">${Array.from({length:pending.photos.length},()=>'<span style="background:rgba(255,255,255,.85);border-radius:5px"></span>').join("")}</div><strong>${layout.name}</strong>`;
      el.onclick=()=>{selectedLayout=i;renderOptions();renderFrame();};
      layoutWrap.appendChild(el);
    });
  }

  function renderFrame(){
    const frame = $("finalFrame");
    const grid = $("photoGrid");
    const deco = $("frameDecor");
    const bg = window.ZeeboothFrames.backgrounds[selectedBg];
    const layout = window.ZeeboothFrames.layouts(pending.photos.length,pending.aspect)[selectedLayout];

    frame.style.background = bg.css;
    grid.style.gridTemplateColumns = `repeat(${layout.cols}, minmax(0,1fr))`;
    grid.style.gridTemplateRows = `repeat(${layout.rows}, minmax(0,1fr))`;
    grid.innerHTML = "";
    pending.photos.forEach(photo=>{
      const slot=document.createElement("div");
      slot.className="photo-slot";
      slot.style.aspectRatio=pending.aspect.replace(":","/");
      const img=document.createElement("img");
      img.src=photo.dataUrl;
      img.alt="Captured Zeebooth photo";
      slot.appendChild(img);
      grid.appendChild(slot);
    });
    deco.className = "frame-decor"+(decor==="sparkles"?" sparkles":"");
  }

  function buildFinalComposite(){
    const frame = $("finalFrame");
    const rect = frame.getBoundingClientRect();
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(900, Math.round(rect.width*scale));
    canvas.height = Math.round(canvas.width / (rect.width/rect.height));
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = getComputedStyle(frame).backgroundColor || "#dde5ea";
    const bg = window.ZeeboothFrames.backgrounds[selectedBg];

    const bgImg = new Image();
    return new Promise(resolve=>{
      bgImg.onload = () => {
        ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);
        const layout = window.ZeeboothFrames.layouts(pending.photos.length,pending.aspect)[selectedLayout];
        const framePadding = canvas.width*.05;
        const gridW = canvas.width-framePadding*2;
        const gridH = canvas.height*0.78;
        const top = canvas.height*.08;
        const gap = canvas.width*.015;
        const cellW = (gridW-gap*(layout.cols-1))/layout.cols;
        const cellH = (gridH-gap*(layout.rows-1))/layout.rows;

        let loaded = 0;
        pending.photos.forEach((photo,i)=>{
          const img=new Image();
          img.onload=()=>{
            const r = i % layout.rows;
            const c = Math.floor(i / layout.rows);
            const x = framePadding + c*(cellW+gap);
            const y = top + r*(cellH+gap);
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x,y,cellW,cellH,canvas.width*.025);
            ctx.clip();

            const photoRatio = parseFloat(pending.aspect.split(":")[0]) / parseFloat(pending.aspect.split(":")[1]);
            let dw = cellW, dh = cellW/photoRatio;
            if(dh < cellH){ dh = cellH; dw = cellH*photoRatio; }
            ctx.drawImage(img,x+(cellW-dw)/2,y+(cellH-dh)/2,dw,dh);
            ctx.restore();

            loaded++;
            if(loaded===pending.photos.length){
              if(decor==="sparkles"){
                ctx.fillStyle="rgba(255,255,255,.88)";
                ctx.font=`${Math.max(24,canvas.width*.018)}px sans-serif`;
                ctx.fillText("✦  ✧     ✦        ✧   ✦",canvas.width*.05,canvas.height*.95);
              }
              ctx.fillStyle="rgba(42,53,62,.78)";
              ctx.font=`800 ${Math.max(18,canvas.width*.021)}px Plus Jakarta Sans, sans-serif`;
              ctx.textAlign="center";
              ctx.fillText("ZEEBOOTH",canvas.width/2,canvas.height*.975);
              resolve(canvas.toDataURL("image/png"));
            }
          };
          img.src=photo.dataUrl;
        });
      };
      bgImg.onerror=()=>resolve(frameToDataUrl(frame));
      bgImg.src=bg.image;
    });
  }

  function frameToDataUrl(node){
    const canvas=document.createElement("canvas");
    canvas.width=900;canvas.height=1125;
    const ctx=canvas.getContext("2d");
    const g=ctx.createLinearGradient(0,0,900,1125);
    g.addColorStop(0,"#eff3f5");g.addColorStop(1,"#bfcbd6");
    ctx.fillStyle=g;ctx.fillRect(0,0,900,1125);
    ctx.fillStyle="#2a363f";ctx.font="800 30px sans-serif";ctx.textAlign="center";
    ctx.fillText("ZEEBOOTH",450,1080);
    return canvas.toDataURL("image/png");
  }

  async function save(){
    const dataUrl=await buildFinalComposite();
    const photo={
      id:window.Zeebooth.uid("photo"),
      dataUrl,
      createdAt:new Date().toISOString(),
      shots:pending.photos.length,
      aspect:pending.aspect,
      background:window.ZeeboothFrames.backgrounds[selectedBg].id
    };
    window.ZeeboothStore.savePhoto(photo);
    window.ZeeboothStore.saveHistory({
      id:window.Zeebooth.uid("history"),
      createdAt:photo.createdAt,
      shots:photo.shots,
      aspect:photo.aspect,
      backgroundName:window.ZeeboothFrames.backgrounds[selectedBg].name,
      layoutName:window.ZeeboothFrames.layouts(pending.photos.length,pending.aspect)[selectedLayout].name,
      preview:dataUrl
    });
    window.ZeeboothStore.clearPending();
    location.href="photos.html";
  }

  document.addEventListener("DOMContentLoaded",()=>{
    pending=window.ZeeboothStore.getPending();
    if(!pending || !pending.photos?.length){
      location.href="camera.html";
      return;
    }
    renderOptions();
    renderFrame();

    $("sparkleDecor").onclick=()=>{decor="sparkles";$("sparkleDecor").classList.add("active");$("cleanDecor").classList.remove("active");renderFrame();};
    $("cleanDecor").onclick=()=>{decor="clean";$("cleanDecor").classList.add("active");$("sparkleDecor").classList.remove("active");renderFrame();};
    $("editorSaveButton").onclick=save;
  });
})();
