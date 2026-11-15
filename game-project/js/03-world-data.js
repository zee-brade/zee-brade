    // ============================================================================
    // 3. WORLD CONSTANTS, 4 TIMES OF DAY, ELEMENTAL PALETTES & TERRAIN MATH
    // ============================================================================
    const WORLD_SIZE = 340;
    const WATER_LEVEL = -0.35;
    const WATERFALL_POS = new THREE.Vector3(-36, 0, -28);

    const TIME_MOODS = [
      {
        name: 'Crisp Morning',
        emoji: '🌅',
        topColor: new THREE.Color(0x3a7bd5),
        horizonColor: new THREE.Color(0xf6d5a8),
        bottomColor: new THREE.Color(0xdce8dc),
        fogColor: new THREE.Color(0xebd2b5),
        fogDensity: 0.0038,
        sunColor: new THREE.Color(0xffe6bd),
        rimColor: new THREE.Color(0xfff1d0),
        sunIntensity: 1.45,
        hemiSky: new THREE.Color(0xa6d2ff),
        hemiGround: new THREE.Color(0x4d734b),
        hemiIntensity: 0.9,
        sunDir: new THREE.Vector3(0.45, 0.38, -0.80).normalize(),
        starIntensity: 0.0,
        auroraIntensity: 0.0,
        fireflyAlpha: 0.0
      },
      {
        name: 'Azure Day',
        emoji: '☀️',
        topColor: new THREE.Color(0x1b6ed6),
        horizonColor: new THREE.Color(0x9be2ff),
        bottomColor: new THREE.Color(0xd0f0e8),
        fogColor: new THREE.Color(0x9ee0fa),
        fogDensity: 0.0033,
        sunColor: new THREE.Color(0xfff9e6),
        rimColor: new THREE.Color(0xffffff),
        sunIntensity: 1.6,
        hemiSky: new THREE.Color(0xbce8ff),
        hemiGround: new THREE.Color(0x52804e),
        hemiIntensity: 1.0,
        sunDir: new THREE.Vector3(-0.22, 0.80, -0.55).normalize(),
        starIntensity: 0.0,
        auroraIntensity: 0.0,
        fireflyAlpha: 0.0
      },
      {
        name: 'Golden Sunset',
        emoji: '🌇',
        topColor: new THREE.Color(0x34285c),
        horizonColor: new THREE.Color(0xff8952),
        bottomColor: new THREE.Color(0xffb478),
        fogColor: new THREE.Color(0xf28d5e),
        fogDensity: 0.0044,
        sunColor: new THREE.Color(0xff9c59),
        rimColor: new THREE.Color(0xffb37a),
        sunIntensity: 1.45,
        hemiSky: new THREE.Color(0xffa475),
        hemiGround: new THREE.Color(0x3b354a),
        hemiIntensity: 0.8,
        sunDir: new THREE.Vector3(-0.55, 0.18, -0.81).normalize(),
        starIntensity: 0.25,
        auroraIntensity: 0.0,
        fireflyAlpha: 0.75
      },
      {
        name: 'Starry Aurora Night',
        emoji: '🌌',
        topColor: new THREE.Color(0x091126),
        horizonColor: new THREE.Color(0x1b3b5a),
        bottomColor: new THREE.Color(0x102238),
        fogColor: new THREE.Color(0x142a45),
        fogDensity: 0.0042,
        sunColor: new THREE.Color(0xb8dcff),
        rimColor: new THREE.Color(0x88e8ff),
        sunIntensity: 0.75,
        hemiSky: new THREE.Color(0x4573a8),
        hemiGround: new THREE.Color(0x182b36),
        hemiIntensity: 0.65,
        sunDir: new THREE.Vector3(0.32, 0.50, -0.80).normalize(),
        starIntensity: 1.0,
        auroraIntensity: 1.0,
        fireflyAlpha: 1.0
      }
    ];

    const ELEMENTAL_VISIONS = [
      { id: 'anemo', name: 'Anemo Teal', hex: '#2a9d8f', color: 0x2a9d8f, glow: 0x6efce8, unlockChests: 0 },
      { id: 'geo', name: 'Geo Gold', hex: '#e6b85c', color: 0xd99b26, glow: 0xffe89e, unlockChests: 0 },
      { id: 'electro', name: 'Electro Violet', hex: '#a855f7', color: 0x8b5cf6, glow: 0xd8b4fe, unlockChests: 2 },
      { id: 'pyro', name: 'Pyro Coral', hex: '#f43f5e', color: 0xe11d48, glow: 0xffccd5, unlockChests: 4 },
      { id: 'cryo', name: 'Cryo Frost', hex: '#38bdf8', color: 0x0284c7, glow: 0xbaf2ff, unlockChests: 6 }
    ];

    const REGIONS = [
      {
        id: 'meadows',
        name: 'Whispering Meadows',
        subtitle: 'Valley of Gentle Winds',
        check: (x, z) => z > -22 && x > -34
      },
      {
        id: 'falls',
        name: 'Crystal Falls & Mirror Lake',
        subtitle: 'Cascade of Pure Waters',
        check: (x, z) => x <= -12 && z <= -4 && z >= -48
      },
      {
        id: 'sakura',
        name: 'Sakura Shrine Hill',
        subtitle: 'Blossoms of Eternity',
        check: (x, z) => x <= -34 && z > -12
      },
      {
        id: 'skyward',
        name: 'Floating Sky Islands & Starlight Ruins',
        subtitle: 'Sanctum Above the Clouds',
        check: (x, z) => z <= -48 || (x > -12 && z <= -22)
      }
    ];

    // 3 Ancient Floating Sky Islands reachable via Anemo Wind Currents
    const SKY_ISLANDS = [
      { x: 24, y: 21, z: -34, radius: 7.8, thickness: 4.5 },
      { x: -34, y: 27, z: -56, radius: 8.6, thickness: 5.0 },
      { x: 0, y: 37, z: -84, radius: 10.6, thickness: 6.0 }
    ];

    // Glowing Anemo Wind Current Updraft Pillars & Boost Sky Rings
    const WIND_CURRENTS = [
      { id: 0, x: -22, z: -18, topY: 25, radius: 3.4, ringY: 16 },
      { id: 1, x: 24, z: -26, topY: 27, radius: 3.6, ringY: 18 },
      { id: 2, x: 0, z: -72, topY: 43, radius: 4.0, ringY: 28 }
    ];

    function smoothstep(edge0, edge1, x) {
      const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
      return t * t * (3 - 2 * t);
    }

    function getTerrainHeight(x, z) {
      let h = Math.sin(x * 0.032) * Math.cos(z * 0.032) * 3.0
            + Math.sin(x * 0.065 + z * 0.045) * 1.1
            + Math.cos(x * 0.018 - z * 0.022) * 1.8;

      // Carve Mirror Lake basin centered at (-14, -10)
      const lakeDist = Math.hypot((x + 14) * 0.85, (z + 10) * 1.05);
      const lakeFactor = 1.0 - smoothstep(14, 27, lakeDist);
      h = h * (1.0 - lakeFactor) + (-2.4) * lakeFactor;

      // High Rocky Cliffside at (-40, -30) for Crystal Falls
      const cliffDist = Math.hypot((x + 42) * 0.9, (z + 32) * 0.9);
      const cliffRise = 1.0 - smoothstep(8, 22, cliffDist);
      h += cliffRise * 17.5;

      // Scenic Landmark Plateaus
      const plateaus = [
        { x: 0, z: 54, r: 10, targetH: 2.2 },      // Whispering Meadows Overlook
        { x: 6, z: -6, r: 8, targetH: 0.65 },      // Mirror Lake Pier & Kael
        { x: 56, z: -58, r: 13, targetH: 6.4 },    // Windmill Ridge & Lyra
        { x: -64, z: 18, r: 13, targetH: 6.2 },    // Sakura Shrine Hill & Mina
        { x: 0, z: -96, r: 15, targetH: 5.8 }      // Starlight Ruins Sanctum
      ];

      for (let i = 0; i < plateaus.length; i++) {
        const p = plateaus[i];
        const d = Math.hypot(x - p.x, z - p.z);
        const blend = 1.0 - smoothstep(p.r * 0.45, p.r * 1.35, d);
        if (blend > 0) {
          h = h * (1.0 - blend) + p.targetH * blend;
        }
      }

      // Outer valley mountain foothills
      const radial = Math.hypot(x, z);
      const rim = smoothstep(125, 175, radial);
      h += rim * 16.0;

      return h;
    }

    function getBridgeHeight(x, z) {
      const bx = -14;
      const zStart = -32;
      const zEnd = 12;
      const halfWidth = 2.6;
      if (Math.abs(x - bx) <= halfWidth && z >= zStart && z <= zEnd) {
        const t = (z - zStart) / (zEnd - zStart);
        return 0.45 + Math.sin(t * Math.PI) * 2.0;
      }
      return -999;
    }

    function getSkyIslandHeight(x, z, playerY) {
      for (let i = 0; i < SKY_ISLANDS.length; i++) {
        const isl = SKY_ISLANDS[i];
        const d = Math.hypot(x - isl.x, z - isl.z);
        if (d <= isl.radius * 0.94 && playerY >= isl.y - 1.2) {
          return isl.y;
        }
      }
      return -999;
    }

    function getWalkableHeight(x, z, playerY = 0) {
      const th = getTerrainHeight(x, z);
      const bh = getBridgeHeight(x, z);
      const sh = getSkyIslandHeight(x, z, playerY);
      return Math.max(th, bh, sh);
    }

