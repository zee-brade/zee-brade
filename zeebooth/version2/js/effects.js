(() => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  window.ZeeboothEffects = {
    async show(type, overlay) {
      if (!overlay) return;
      overlay.className = "effect-overlay";
      void overlay.offsetWidth;
      if (type === "blur") overlay.classList.add("is-blur");
      if (type === "flower") overlay.classList.add("is-flower");
      if (type === "heart") overlay.classList.add("is-heart");
      await sleep(680);
      overlay.className = "effect-overlay";
    },

    applyToCanvas(ctx, canvas, type) {
      const w = canvas.width, h = canvas.height;
      if (type === "blur") {
        const temp = document.createElement("canvas");
        temp.width = w; temp.height = h;
        const tctx = temp.getContext("2d");
        tctx.filter = "blur(12px)";
        tctx.drawImage(canvas, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(temp, -7, -7, w + 14, h + 14);
      }

      if (type === "flower") {
        ctx.save();
        ctx.translate(w/2,h/2);
        const petals = 12;
        for(let i=0;i<petals;i++){
          ctx.save();
          ctx.rotate((Math.PI*2/petals)*i);
          ctx.beginPath();
          ctx.fillStyle = "rgba(255,255,255,.78)";
          ctx.ellipse(0,-Math.min(w,h)*0.38, Math.min(w,h)*0.06, Math.min(w,h)*0.15, 0, 0, Math.PI*2);
          ctx.fill();
          ctx.restore();
        }
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,244,178,.9)";
        ctx.arc(0,0,Math.min(w,h)*0.055,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }

      if (type === "heart") {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,.9)";
        ctx.lineWidth = Math.max(8, Math.min(w,h)*.018);
        ctx.shadowColor = "rgba(255,255,255,.75)";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        const cx = w/2, cy = h/2, s = Math.min(w,h)*.25;
        ctx.moveTo(cx, cy+s*.35);
        ctx.bezierCurveTo(cx-s*1.35, cy-s*.35, cx-s*.75, cy-s*.95, cx, cy-s*.28);
        ctx.bezierCurveTo(cx+s*.75, cy-s*.95, cx+s*1.35, cy-s*.35, cx, cy+s*.35);
        ctx.stroke();
        ctx.restore();
      }
    }
  };
})();
