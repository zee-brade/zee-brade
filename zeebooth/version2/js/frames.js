(() => {
  const BACKGROUNDS = [
    {
      id:"mist",
      name:"Silver Mist",
      image:"assets/backgrounds/home-scene-1.svg",
      css:"linear-gradient(145deg,#f1f4f5 0%,#c8d3dc 100%)"
    },
    {
      id:"dusty",
      name:"Dusty Blue",
      image:"assets/backgrounds/home-scene-2.svg",
      css:"linear-gradient(145deg,#dce4e9 0%,#b8c7d2 100%)"
    },
    {
      id:"petal",
      name:"Soft Petal",
      image:"assets/backgrounds/home-scene-1.svg",
      css:"linear-gradient(145deg,#eef0f3 0%,#d4dee5 48%,#e8e0e2 100%)"
    },
    {
      id:"night",
      name:"Quiet Night",
      image:"assets/backgrounds/home-scene-2.svg",
      css:"linear-gradient(145deg,#bec9d2 0%,#aeb8c1 100%)"
    }
  ];

  function layoutForCount(count, aspect){
    if(count === 1) return {name:"Solo", cols:1, rows:1};
    if(count === 2) return {name:"Duo", cols:1, rows:2};
    if(count === 3) return {name:"Trio", cols:1, rows:3};
    return {name:"Quad", cols:2, rows:2};
  }

  window.ZeeboothFrames = {
    backgrounds: BACKGROUNDS,
    layouts(count, aspect){
      const base = layoutForCount(count, aspect);
      return [
        base,
        { ...base, name: `${base.name} Wide`, cols: count === 4 ? 2 : 1, rows: count === 4 ? 2 : count },
        { ...base, name: `${base.name} Soft`, cols: count === 3 ? 3 : base.cols, rows: count === 3 ? 1 : base.rows }
      ];
    }
  };
})();
