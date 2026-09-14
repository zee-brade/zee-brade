(() => {
  let hands = null;
  let enabled = true;
  let lastGesture = "none";
  let sameCount = 0;
  let cooldownUntil = 0;
  let onGesture = null;
  let loopStarted = false;

  const dist = (a,b) => Math.hypot(a.x-b.x, a.y-b.y);

  function fingerExtended(lm, tip, pip) {
    return dist(lm[tip], lm[0]) > dist(lm[pip], lm[0]) * 1.08;
  }

  function classify(lm) {
    const index = fingerExtended(lm,8,6);
    const middle = fingerExtended(lm,12,10);
    const ring = fingerExtended(lm,16,14);
    const pinky = fingerExtended(lm,20,18);

    if(index && middle && !ring && !pinky) return "blur";
    if(index && middle && ring && pinky) return "flower";

    const pinch = dist(lm[4], lm[8]) < 0.13;
    const crossLike = dist(lm[4], lm[20]) < 0.18 && dist(lm[4], lm[8]) < 0.22;
    if(pinch && crossLike) return "heart";

    return "none";
  }

  function handleResults(results) {
    if (!enabled || !results.multiHandLandmarks?.length) {
      lastGesture = "none";
      sameCount = 0;
      return;
    }
    const now = performance.now();
    if(now < cooldownUntil) return;

    const gesture = classify(results.multiHandLandmarks[0]);
    if(gesture === "none"){
      lastGesture = "none";
      sameCount = 0;
      return;
    }

    if (gesture === lastGesture) sameCount++;
    else { lastGesture = gesture; sameCount = 1; }

    if(sameCount >= 5){
      cooldownUntil = now + 3200;
      sameCount = 0;
      onGesture?.(gesture);
    }
  }

  window.ZeeboothGesture = {
    setEnabled(value){ enabled = !!value; },
    isEnabled(){ return enabled; },
    onTrigger(cb){ onGesture = cb; },

    async start(video) {
      if (loopStarted) return true;
      if (!window.Hands) return false;

      hands = new window.Hands({
        locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: .62,
        minTrackingConfidence: .62
      });
      hands.onResults(handleResults);

      const process = async () => {
        if (!video.videoWidth) return;
        try { await hands.send({image: video}); } catch {}
        requestAnimationFrame(process);
      };
      loopStarted = true;
      requestAnimationFrame(process);
      return true;
    }
  };
})();
