    // ============================================================================
    // SHARED INSTANCED MEADOW SYSTEM: 6,500 grass clumps + up to 900 flowers.
    // Keeps foliage GPU-driven and avoids per-object meshes/draw calls.
    // ============================================================================
    function initMeadowFoliage(scene, getTerrainHeight) {
      const totalClumps = 6500;
      const totalFlowers = 900;
      const grassGeo = createStylizedGrassGeometry();
      const grassMat = createStylizedFoliageMaterial();
      const grassInstanced = new THREE.InstancedMesh(grassGeo, grassMat, totalClumps);
      grassInstanced.receiveShadow = true;
      grassInstanced.castShadow = false;

      const flowerGeo = createStylizedFlowerGeometry();
      const flowerMat = new THREE.MeshToonMaterial({
        color: 0xffffff,
        vertexColors: true,
        side: THREE.DoubleSide,
        gradientMap: GLOBAL_TOON_GRADIENT
      });
      const flowerInstanced = new THREE.InstancedMesh(flowerGeo, flowerMat, totalFlowers);
      flowerInstanced.receiveShadow = false;
      flowerInstanced.castShadow = false;

      const dummy = new THREE.Object3D();
      const flowerDummy = new THREE.Object3D();
      const grassPalette = [
        new THREE.Color(0x66c768),
        new THREE.Color(0x7ed97a),
        new THREE.Color(0x52b05b),
        new THREE.Color(0x86cf72),
        new THREE.Color(0x69c98b)
      ];
      const flowerPalette = [
        new THREE.Color(0xffffff),
        new THREE.Color(0x7dd3fc),
        new THREE.Color(0xfef08a)
      ];

      let placedGrass = 0;
      let placedFlowers = 0;
      // Slightly more attempts than the sample snippet so terrain/water rejection
      // doesn't leave the meadow visibly sparse on a random seed.
      const maxAttempts = totalClumps * 1.8;

      for (let i = 0; i < maxAttempts && placedGrass < totalClumps; i++) {
        const x = (Math.random() - 0.5) * 150;
        const z = (Math.random() - 0.5) * 150;
        const y = getTerrainHeight(x, z);

        // Keep vegetation out of the lake, high cliff faces, and bridge deck.
        if (!Number.isFinite(y) || y < Math.max(0.25, WATER_LEVEL + 0.6) || y > 9.5) continue;
        if (typeof getBridgeHeight === 'function' && getBridgeHeight(x, z) > -100) continue;

        const scale = 0.75 + Math.random() * 0.75;
        dummy.position.set(x, y - 0.03, z);
        dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
        dummy.scale.set(scale, scale * (0.85 + Math.random() * 0.4), scale);
        dummy.updateMatrix();
        grassInstanced.setMatrixAt(placedGrass, dummy.matrix);
        grassInstanced.setColorAt(placedGrass, grassPalette[Math.floor(Math.random() * grassPalette.length)]);

        // Flower heads are placed among clumps; no extra per-flower Mesh objects.
        if (placedFlowers < totalFlowers && Math.random() < 0.16) {
          flowerDummy.position.set(
            x + (Math.random() - 0.5) * 0.25,
            y,
            z + (Math.random() - 0.5) * 0.25
          );
          flowerDummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
          flowerDummy.scale.setScalar(0.72 + Math.random() * 0.55);
          flowerDummy.updateMatrix();
          flowerInstanced.setMatrixAt(placedFlowers, flowerDummy.matrix);
          flowerInstanced.setColorAt(
            placedFlowers,
            flowerPalette[Math.floor(Math.random() * flowerPalette.length)]
          );
          placedFlowers++;
        }

        placedGrass++;
      }

      grassInstanced.count = placedGrass;
      grassInstanced.instanceMatrix.needsUpdate = true;
      if (grassInstanced.instanceColor) grassInstanced.instanceColor.needsUpdate = true;
      grassInstanced.computeBoundingSphere();

      flowerInstanced.count = placedFlowers;
      flowerInstanced.instanceMatrix.needsUpdate = true;
      if (flowerInstanced.instanceColor) flowerInstanced.instanceColor.needsUpdate = true;
      flowerInstanced.computeBoundingSphere();

      scene.add(grassInstanced);
      scene.add(flowerInstanced);
      return {
        grassInstanced,
        flowerInstanced,
        placedGrass,
        placedFlowers
      };
    }

    // ============================================================================
    // 6. MAIN 3D CEL-SHADED OPEN-WORLD ENGINE
    // ============================================================================
    class AetheriaCelShadedGame {
      constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.sound = new AetheriaAudioEngine();

        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true,
          powerPreference: 'high-performance'
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.05;

        this.scene = new THREE.Scene();
        this.fog = new THREE.FogExp2(TIME_MOODS[0].fogColor.getHex(), TIME_MOODS[0].fogDensity);
        this.scene.fog = this.fog;

        this.camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.2, 850);

        this.hemiLight = new THREE.HemisphereLight(TIME_MOODS[0].hemiSky, TIME_MOODS[0].hemiGround, TIME_MOODS[0].hemiIntensity);
        this.scene.add(this.hemiLight);

        this.sunLight = new THREE.DirectionalLight(TIME_MOODS[0].sunColor, TIME_MOODS[0].sunIntensity);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 10;
        this.sunLight.shadow.camera.far = 220;
        const d = 70;
        this.sunLight.shadow.camera.left = -d;
        this.sunLight.shadow.camera.right = d;
        this.sunLight.shadow.camera.top = d;
        this.sunLight.shadow.camera.bottom = -d;
        this.sunLight.shadow.bias = -0.0005;
        this.scene.add(this.sunLight);
        this.scene.add(this.sunLight.target);

        this.gameState = 'TITLE';
        this.timeMoodIdx = 0;
        this.visionIdx = 0;
        this.shards = 0;
        this.hudHidden = false;
        this.currentRegion = null;
        this.nearestInteractable = null;
        this.activeDialogueNPC = null;

        const startY = getWalkableHeight(0, 54, 10);
        this.player = {
          pos: new THREE.Vector3(0, startY, 54),
          vel: new THREE.Vector3(0, 0, 0),
          yaw: 0,
          turnRate: 0,
          onGround: true,
          isGliding: false,
          isDashing: false,
          dashTimer: 0,
          isSitting: false,
          stamina: 100,
          maxStamina: 100,
          staminaExhausted: false,
          staminaAlpha: 0,
          stepTimer: 0
        };

        this.camRig = {
          yaw: 0,
          pitch: 0.20,
          dist: 7.4,
          targetDist: 7.4,
          fov: 58,
          currentPos: new THREE.Vector3(0, startY + 3.8, 61.2),
          currentLookAt: new THREE.Vector3(0, startY + 2.0, 44)
        };

        this.keys = {};
        this.joyVec = { x: 0, y: 0 };
        this.isOrbitDragging = false;
        this.lastPointer = { x: 0, y: 0 };

        // World Entities
        this.shrines = [];
        this.chests = [];
        this.npcs = [];
        this.foxes = [];
        this.birds = [];
        this.crystalflies = [];
        this.windColumnMeshes = [];
        this.skyRingMeshes = [];
        this.burstParticles = [];

        // Build World
        this.skyDome = createSkyDome();
        this.scene.add(this.skyDome);

        this.waterMesh = createMirrorLakeWater();
        this.scene.add(this.waterMesh);

        this.waterfall = createWaterfallCascade();
        this.scene.add(this.waterfall.group);

        this._buildTerrainBridgeAndSkyIslands();
        this._buildDistantMountainsAndCelestialRing();
        this._buildLandmarksShrinesChests();
        this._buildWindCurrentsAndSkyRings();
        this._buildNPCs();
        this._buildWildlife();
        this._buildInstancedGrassAndFlowers();
        this._buildParticles();

        this.traveler = new WindTravelerRig(this.scene);

        this._bindInputs();
        this._buildVisionUI();
        this._resizeMinimap();
      }

      // --------------------------------------------------------------------------
      // BUILD CEL-SHADED TERRAIN, CRYSTAL BROOK BRIDGE & FLOATING SKY ISLANDS
      // --------------------------------------------------------------------------
      _buildTerrainBridgeAndSkyIslands() {
        const segs = 180;
        const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, segs, segs);
        geo.rotateX(-Math.PI / 2);

        const posAttr = geo.attributes.position;
        const colors = new Float32Array(posAttr.count * 3);
        const colMeadow = new THREE.Color(0x52b05c);
        const colLush = new THREE.Color(0x3b944c);
        const colSakura = new THREE.Color(0x70ab68);
        const colSand = new THREE.Color(0xe0cb9f);
        const colStone = new THREE.Color(0x8894a8);
        const colCliff = new THREE.Color(0x6d7a8c);
        const tempCol = new THREE.Color();

        for (let i = 0; i < posAttr.count; i++) {
          const x = posAttr.getX(i);
          const z = posAttr.getZ(i);
          const y = getTerrainHeight(x, z);
          posAttr.setY(i, y);

          const onNorthTrail = Math.abs(x - Math.sin(z * 0.06) * 6) < 2.3 && z > -98 && z < 56;
          const onEastTrail = Math.abs(z - (-48 + Math.cos(x * 0.05) * 5)) < 2.2 && x > -58 && x < 58;

          if (y > 9.5) {
            tempCol.copy(colCliff);
          } else if (y < WATER_LEVEL + 0.45) {
            tempCol.copy(colSand);
          } else if (onNorthTrail || onEastTrail) {
            tempCol.copy(colStone).lerp(colSand, 0.45);
          } else if (x < -34 && z > -15) {
            tempCol.copy(colSakura).lerp(colMeadow, (Math.sin(x * 0.1) + 1) * 0.25);
          } else {
            const patch = (Math.sin(x * 0.08) * Math.cos(z * 0.08) + 1) * 0.5;
            tempCol.copy(colMeadow).lerp(colLush, patch);
          }

          colors[i * 3] = tempCol.r;
          colors[i * 3 + 1] = tempCol.g;
          colors[i * 3 + 2] = tempCol.b;
        }

        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.computeVertexNormals();

        const terrainMat = createCelMaterial({ vertexColors: true, rimStrength: 0.18 });
        const terrain = new THREE.Mesh(geo, terrainMat);
        terrain.receiveShadow = true;
        this.scene.add(terrain);

        // Arched Wooden Bridge over Crystal Brook / Mirror Lake
        const bridgeGroup = new THREE.Group();
        const woodMat = createCelMaterial({ color: 0x945d35, rimStrength: 0.25 });
        const postMat = createCelMaterial({ color: 0x6b3f20, rimStrength: 0.25 });

        const bx = -14;
        const zStart = -32;
        const zEnd = 12;
        const planks = 34;
        for (let i = 0; i <= planks; i++) {
          const t = i / planks;
          const pz = zStart + (zEnd - zStart) * t;
          const py = getBridgeHeight(bx, pz);

          const plank = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.24, 1.15), woodMat);
          plank.position.set(bx, py - 0.12, pz);
          plank.castShadow = true;
          plank.receiveShadow = true;
          bridgeGroup.add(plank);

          if (i % 6 === 0) {
            [-2.4, 2.4].forEach((offsetX) => {
              const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.35, 8), postMat);
              post.position.set(bx + offsetX, py + 0.55, pz);
              post.castShadow = true;
              addAnimeOutline(post, 1.08);
              bridgeGroup.add(post);
            });
          }
        }
        this.scene.add(bridgeGroup);

        // 3 Ancient Floating Sky Islands
        const islandGrassMat = createCelMaterial({ color: 0x5cc468, rimStrength: 0.35 });
        const islandRockMat = createCelMaterial({ color: 0x738296, rimStrength: 0.3 });
        const crystalGlowMat = createCelMaterial({ color: 0x6efce8, emissive: 0x2de0c4, emissiveIntensity: 1.2 });

        SKY_ISLANDS.forEach((isl) => {
          const group = new THREE.Group();
          group.position.set(isl.x, isl.y, isl.z);

          const cap = new THREE.Mesh(new THREE.CylinderGeometry(isl.radius, isl.radius * 0.94, 0.9, 16), islandGrassMat);
          cap.position.y = -0.45;
          cap.receiveShadow = true;
          addAnimeOutline(cap, 1.025);
          group.add(cap);

          const rockUnder = new THREE.Mesh(new THREE.ConeGeometry(isl.radius * 0.92, isl.thickness, 14), islandRockMat);
          rockUnder.rotation.x = Math.PI;
          rockUnder.position.y = -0.9 - isl.thickness * 0.5;
          addAnimeOutline(rockUnder, 1.03);
          group.add(rockUnder);

          const tipCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.9, 0), crystalGlowMat);
          tipCrystal.position.y = -1.4 - isl.thickness;
          group.add(tipCrystal);

          this.scene.add(group);
        });
      }

      _buildDistantMountainsAndCelestialRing() {
        const mountainMat = createCelMaterial({ color: 0x527485, rimStrength: 0.38 });
        const snowPeakMat = createCelMaterial({ color: 0xe6f2fc, rimStrength: 0.45 });

        const peakCount = 26;
        for (let i = 0; i < peakCount; i++) {
          const angle = (i / peakCount) * Math.PI * 2;
          const dist = 215 + (i % 3) * 28;
          const mx = Math.cos(angle) * dist;
          const mz = Math.sin(angle) * dist;
          const radius = 44 + (i % 4) * 14;
          const height = 65 + (i % 5) * 18;

          const cone = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 16), mountainMat);
          cone.position.set(mx, height * 0.42 - 8, mz);
          this.scene.add(cone);

          if (height > 85) {
            const capH = height * 0.28;
            const capR = radius * 0.28;
            const cap = new THREE.Mesh(new THREE.ConeGeometry(capR, capH, 16), snowPeakMat);
            cap.position.set(mx, height * 0.92 - capH * 0.5 - 8, mz);
            this.scene.add(cap);
          }
        }

        // Celestial Sky Halo Ring
        this.celestialRing = new THREE.Group();
        this.celestialRing.position.set(0, 92, -195);
        this.celestialRing.rotation.x = 0.35;

        const ringMat = createCelMaterial({
          color: 0xd4e2f5,
          emissive: 0x3b7699,
          emissiveIntensity: 0.4,
          rimStrength: 0.5
        });

        const outerRing = new THREE.Mesh(new THREE.TorusGeometry(26, 1.3, 14, 48), ringMat);
        const innerRing = new THREE.Mesh(new THREE.TorusGeometry(16, 0.8, 12, 36), ringMat);
        const spire = new THREE.Mesh(new THREE.OctahedronGeometry(5.5, 0), ringMat);
        spire.scale.set(0.6, 2.2, 0.6);

        this.celestialRing.add(outerRing, innerRing, spire);
        this.scene.add(this.celestialRing);
      }

      // --------------------------------------------------------------------------
      // BUILD 4 ANCIENT SHRINES, 8 TREASURE CHESTS, TORII GATE, WINDMILL & TREES
      // --------------------------------------------------------------------------
      _buildLandmarksShrinesChests() {
        const stoneMat = createCelMaterial({ color: 0x8796ab, rimStrength: 0.32 });
        const trimGoldMat = createCelMaterial({ color: 0xe6b85c, emissive: 0x593d08, emissiveIntensity: 0.2 });

        // 1. 4 Ancient Shrines
        const shrineConfigs = [
          { id: 0, name: 'Mirror Lake Shrine', x: 10, z: -12 },
          { id: 1, name: 'Sakura Overlook Shrine', x: -64, z: 18 },
          { id: 2, name: 'Windmill Ridge Shrine', x: 56, z: -58 },
          { id: 3, name: 'Starlight Sanctum Shrine', x: 0, z: -96 }
        ];

        shrineConfigs.forEach((cfg) => {
          const y = getTerrainHeight(cfg.x, cfg.z);
          const group = new THREE.Group();
          group.position.set(cfg.x, y, cfg.z);

          const base = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.1, 0.7, 12), stoneMat);
          base.position.y = 0.35;
          base.castShadow = true;
          base.receiveShadow = true;
          addAnimeOutline(base, 1.04);
          group.add(base);

          const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, 2.6, 8), stoneMat);
          pillar.position.y = 1.8;
          pillar.castShadow = true;
          addAnimeOutline(pillar, 1.05);
          group.add(pillar);

          const crystalMat = createCelMaterial({
            color: 0x42566e,
            emissive: 0x162436,
            emissiveIntensity: 0.4
          });
          const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.68, 0), crystalMat);
          crystal.position.y = 3.9;
          addAnimeOutline(crystal, 1.08);
          group.add(crystal);

          const beamMat = new THREE.MeshBasicMaterial({
            color: 0x5efce8,
            transparent: true,
            opacity: 0.0,
            side: THREE.DoubleSide,
            depthWrite: false
          });
          const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 1.35, 95, 16, 1, true), beamMat);
          beam.position.y = 48;
          group.add(beam);

          this.scene.add(group);
          this.shrines.push({
            id: cfg.id,
            name: cfg.name,
            x: cfg.x,
            y,
            z: cfg.z,
            lit: false,
            crystal,
            crystalMat,
            beamMat
          });
        });

        // Stone Torii Gate on Sakura Shrine Hill Overlook
        const toriiX = -52;
        const toriiZ = 16;
        const toriiY = getTerrainHeight(toriiX, toriiZ);
        const toriiGroup = new THREE.Group();
        toriiGroup.position.set(toriiX, toriiY, toriiZ);
        toriiGroup.rotation.y = Math.PI * 0.42;

        const toriiRedMat = createCelMaterial({ color: 0xc94a4a, rimStrength: 0.35 });
        [-2.4, 2.4].forEach((px) => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 6.2, 12), toriiRedMat);
          post.position.set(px, 3.1, 0);
          post.castShadow = true;
          addAnimeOutline(post, 1.05);
          toriiGroup.add(post);
        });
        const topKasagi = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.55, 0.85), toriiRedMat);
        topKasagi.position.set(0, 6.1, 0);
        addAnimeOutline(topKasagi, 1.03);
        const subNuki = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.36, 0.55), toriiRedMat);
        subNuki.position.set(0, 4.9, 0);
        addAnimeOutline(subNuki, 1.04);
        toriiGroup.add(topKasagi, subNuki);
        this.scene.add(toriiGroup);

        // 2. 8 Treasure Chests (Meadows, Bridge, Crystal Falls Cliff, Windmill, Sakura Hill & 3 Sky Islands)
        const chestCoords = [
          { x: -14, z: -10, yOverride: null },    // Center of Arched Wooden Bridge
          { x: 24, z: 32, yOverride: null },      // Whispering Meadows East Hill
          { x: -40, z: -32, yOverride: null },    // Top of Crystal Falls Cliff
          { x: -72, z: 24, yOverride: null },     // Sakura Shrine Hill Grove
          { x: 66, z: -68, yOverride: null },     // Behind Giant Windmill
          { x: 24, z: -34, yOverride: 21 },       // Floating Sky Island #1
          { x: -34, z: -56, yOverride: 27 },      // Floating Sky Island #2
          { x: 0, z: -84, yOverride: 37 }         // Highest Floating Sky Island #3
        ];

        const woodChestMat = createCelMaterial({ color: 0x8c522b, rimStrength: 0.3 });
        chestCoords.forEach((cc, idx) => {
          const y = cc.yOverride !== null ? cc.yOverride : getWalkableHeight(cc.x, cc.z, 10);
          const group = new THREE.Group();
          group.position.set(cc.x, y, cc.z);

          const box = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.75, 0.9), woodChestMat);
          box.position.y = 0.38;
          box.castShadow = true;
          addAnimeOutline(box, 1.05);
          group.add(box);

          const lidPivot = new THREE.Group();
          lidPivot.position.set(0, 0.75, -0.45);
          const lid = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.32, 0.96), trimGoldMat);
          lid.position.set(0, 0.14, 0.45);
          addAnimeOutline(lid, 1.05);
          lidPivot.add(lid);
          group.add(lidPivot);

          this.scene.add(group);
          this.chests.push({
            id: idx,
            x: cc.x,
            y,
            z: cc.z,
            opened: false,
            revealed: idx < 2,
            shards: 15 + idx * 5,
            lidPivot
          });
        });

        // 3. Rotating Giant Windmill on the Eastern Ridge
        const wmX = 62;
        const wmZ = -68;
        const wmY = getTerrainHeight(wmX, wmZ);
        const wmGroup = new THREE.Group();
        wmGroup.position.set(wmX, wmY, wmZ);
        wmGroup.rotation.y = -0.45;

        const tower = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 4.8, 16, 16), stoneMat);
        tower.position.y = 8;
        tower.castShadow = true;
        addAnimeOutline(tower, 1.025);
        wmGroup.add(tower);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(3.8, 4.5, 16), createCelMaterial({ color: 0xc45445, rimStrength: 0.35 }));
        roof.position.y = 18.2;
        addAnimeOutline(roof, 1.03);
        wmGroup.add(roof);

        this.windmillBlades = new THREE.Group();
        this.windmillBlades.position.set(0, 14.5, 3.6);
        const sailMat = createCelMaterial({ color: 0xfaf2e1, side: THREE.DoubleSide, rimStrength: 0.3 });
        for (let b = 0; b < 4; b++) {
          const blade = new THREE.Group();
          blade.rotation.z = (b * Math.PI) / 2;
          const beam = new THREE.Mesh(new THREE.BoxGeometry(0.35, 11.5, 0.25), woodChestMat);
          beam.position.y = 5.5;
          const cloth = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 8.5), sailMat);
          cloth.position.set(1.1, 6.2, 0.05);
          blade.add(beam, cloth);
          this.windmillBlades.add(blade);
        }
        wmGroup.add(this.windmillBlades);
        this.scene.add(wmGroup);

        // 4. Starlight Ruins Stone Archways
        [-12, 0, 12].forEach((offsetZ, idx) => {
          const rz = -84 + offsetZ;
          const ry = getTerrainHeight(0, rz);
          const archGroup = new THREE.Group();
          archGroup.position.set(0, ry, rz);
          const scale = 1 + idx * 0.12;
          archGroup.scale.set(scale, scale, scale);

          [-4.2, 4.2].forEach((px) => {
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 7.5, 12), stoneMat);
            col.position.set(px, 3.75, 0);
            col.castShadow = true;
            addAnimeOutline(col, 1.04);
            archGroup.add(col);
          });
          const lintel = new THREE.Mesh(new THREE.BoxGeometry(10.6, 1.1, 1.6), stoneMat);
          lintel.position.set(0, 7.8, 0);
          lintel.castShadow = true;
          addAnimeOutline(lintel, 1.03);
          archGroup.add(lintel);

          this.scene.add(archGroup);
        });

        // 5. Cel-Shaded Sakura & Emerald Trees
        const trunkMat = createCelMaterial({ color: 0x634436, rimStrength: 0.25 });
        const emeraldLeafMat = createCelMaterial({ color: 0x42a35b, rimColor: 0xc2ffba, rimStrength: 0.36 });
        const sakuraLeafMat = createCelMaterial({
          color: 0xffa6ca,
          emissive: 0x66223e,
          emissiveIntensity: 0.16,
          rimColor: 0xffe3ef,
          rimStrength: 0.45
        });

        for (let i = 0; i < 86; i++) {
          const angle = i * 2.39996;
          const rad = 16 + (i / 86) * 116;
          const tx = Math.cos(angle) * rad;
          const tz = Math.sin(angle) * rad;
          const ty = getTerrainHeight(tx, tz);

          if (ty < WATER_LEVEL + 0.6 || ty > 10.5) continue;
          if (Math.abs(tx - Math.sin(tz * 0.06) * 6) < 5.5) continue;
          if (Math.hypot(tx - 0, tz - 54) < 9) continue;
          if (shrineConfigs.some(s => Math.hypot(tx - s.x, tz - s.z) < 8)) continue;

          const isSakura = (tx < -28 && tz > -15) || (i % 7 === 0);
          const leafMat = isSakura ? sakuraLeafMat : emeraldLeafMat;
          const scale = 0.85 + (i % 5) * 0.16;

          const tree = new THREE.Group();
          tree.position.set(tx, ty, tz);
          tree.scale.set(scale, scale, scale);

          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.48, 3.4, 10), trunkMat);
          trunk.position.y = 1.7;
          trunk.castShadow = true;
          addAnimeOutline(trunk, 1.05);
          tree.add(trunk);

          const puffs = [
            [0, 4.4, 0, 2.3],
            [-1.3, 3.7, 0.8, 1.65],
            [1.3, 3.8, -0.7, 1.7],
            [0.3, 3.6, 1.3, 1.55]
          ];
          puffs.forEach(([px, py, pz, pr]) => {
            const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(pr, 2), leafMat);
            crown.position.set(px, py, pz);
            crown.castShadow = true;
            crown.receiveShadow = true;
            addAnimeOutline(crown, 1.03);
            tree.add(crown);
          });

          this.scene.add(tree);
        }
      }

      // --------------------------------------------------------------------------
      // GLOWING ANEMO WIND CURRENTS & BOOST SKY RINGS
      // --------------------------------------------------------------------------
      _buildWindCurrentsAndSkyRings() {
        const windMat = new THREE.ShaderMaterial({
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
          uniforms: { uTime: { value: 0.0 } },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform float uTime;
            varying vec2 vUv;
            void main() {
              float spiral = sin(vUv.x * 18.0 + vUv.y * 12.0 - uTime * 6.5);
              float ribbon = smoothstep(0.35, 0.85, spiral);
              float vertFade = smoothstep(0.0, 0.15, vUv.y) * (1.0 - smoothstep(0.75, 1.0, vUv.y));
              vec3 col = mix(vec3(0.25, 0.92, 0.78), vec3(0.85, 1.0, 0.96), ribbon);
              gl_FragColor = vec4(col, ribbon * vertFade * 0.42);
            }
          `
        });
        this.windColumnMat = windMat;

        const ringMat = createCelMaterial({
          color: 0x5efce8,
          emissive: 0x2ae3c4,
          emissiveIntensity: 0.9,
          transparent: true,
          opacity: 0.88
        });

        WIND_CURRENTS.forEach((wc) => {
          const baseY = Math.max(getTerrainHeight(wc.x, wc.z), WATER_LEVEL);
          const height = wc.topY - baseY;

          const colMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(wc.radius * 0.85, wc.radius * 1.15, height, 20, 1, true),
            windMat
          );
          colMesh.position.set(wc.x, baseY + height / 2, wc.z);
          this.scene.add(colMesh);
          this.windColumnMeshes.push(colMesh);

          const ringGroup = new THREE.Group();
          ringGroup.position.set(wc.x, wc.ringY, wc.z);
          ringGroup.rotation.x = Math.PI * 0.35;

          const torus = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.18, 12, 32), ringMat);
          addAnimeOutline(torus, 1.08);
          ringGroup.add(torus);
          this.scene.add(ringGroup);

          this.skyRingMeshes.push({ mesh: ringGroup, x: wc.x, y: wc.ringY, z: wc.z, cooldown: 0 });
        });
      }

      // --------------------------------------------------------------------------
      // 3 FRIENDLY NPCs (LYRA, KAEL, MINA)
      // --------------------------------------------------------------------------
      _buildNPCs() {
        const npcConfigs = [
          {
            id: 'lyra',
            name: 'Lyra',
            role: 'Wandering Bard',
            x: 48,
            z: -52,
            outfitColor: 0x389c7e,
            hairColor: 0x5c3c2e,
            accentColor: '#4ee2c0',
            getLines: () => [
              'Angin di bukit kincir ini selalu membawa melodi lembut. Tekan C untuk Sit & Chill dan dengarkan petikan harpa sambil menikmati pemandangan lembah!',
              'Di balik puncak tebing Crystal Falls dan di atas 3 pulau melayang tersembunyi peti harta karun kuno.'
            ]
          },
          {
            id: 'kael',
            name: 'Kael',
            role: 'Skywatcher',
            x: 6,
            z: -6,
            outfitColor: 0x3b6ea5,
            hairColor: 0xd9e4f5,
            accentColor: '#7dd3fc',
            getLines: () => [
              'Lihat pusaran angin Anemo Wind Current di atas Mirror Lake dan Starlight Ruins? Lompat lalu tekan Space lagi untuk membentangkan Wind Glider!',
              'Terbang menembus Boost Sky Rings di udara akan memberimu dorongan angin tinggi menuju Floating Sky Islands.'
            ]
          },
          {
            id: 'mina',
            name: 'Mina',
            role: 'Shrine Keeper',
            x: -56,
            z: 22,
            outfitColor: 0xd95b82,
            hairColor: 0x2b2438,
            accentColor: '#ffb8d2',
            getLines: () => {
              const litShrines = this.shrines.filter(s => s.lit).length;
              const openChests = this.chests.filter(c => c.opened).length;
              const caughtFlies = this.crystalflies.filter(f => f.caught).length;
              return [
                `Selamat datang di Sakura Shrine Hill, Wind Traveler. Sejauh ini kamu telah menyalakan ${litShrines}/4 Ancient Shrine, membuka ${openChests}/8 peti, dan menangkap ${caughtFlies}/8 Crystalfly.`,
                'Setiap Ancient Shrine yang menyala akan menyingkap lokasi peti harta karun terdekat pada mini-radar.'
              ];
            }
          }
        ];

        const tagsLayer = document.getElementById('npcTagsLayer');

        npcConfigs.forEach((cfg, idx) => {
          const y = getTerrainHeight(cfg.x, cfg.z);
          const group = new THREE.Group();
          group.position.set(cfg.x, y, cfg.z);

          const skinMat = createCelMaterial({ color: 0xffe5cf });
          const outfitMat = createCelMaterial({ color: cfg.outfitColor, rimStrength: 0.35 });
          const hairMat = createCelMaterial({ color: cfg.hairColor, rimStrength: 0.38 });

          const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 1.35, 14), outfitMat);
          body.position.y = 0.72;
          body.castShadow = true;
          addAnimeOutline(body, 1.045);
          group.add(body);

          const head = new THREE.Mesh(new THREE.SphereGeometry(0.31, 18, 18), skinMat);
          head.position.y = 1.72;
          head.castShadow = true;
          addAnimeOutline(head, 1.045);
          group.add(head);

          const hair = new THREE.Mesh(new THREE.SphereGeometry(0.335, 18, 14), hairMat);
          hair.position.set(0, 1.78, 0.03);
          addAnimeOutline(hair, 1.045);
          group.add(hair);

          const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.54, 10), outfitMat);
          rightArm.position.set(0.38, 1.25, 0);
          addAnimeOutline(rightArm, 1.06);
          group.add(rightArm);

          this.scene.add(group);

          const tagEl = document.createElement('div');
          tagEl.className = 'absolute -translate-x-1/2 -translate-y-full px-2.5 py-0.5 rounded-full bg-slate-950/60 backdrop-blur-sm border border-white/15 text-center transition-opacity duration-200';
          tagEl.innerHTML = `<div class="text-[11px] font-bold text-amber-200 leading-tight">${cfg.name}</div><div class="text-[9px] text-teal-200/85 leading-tight">${cfg.role}</div>`;
          tagsLayer.appendChild(tagEl);

          this.npcs.push({
            ...cfg,
            y,
            group,
            rightArm,
            tagEl,
            lineIdx: 0,
            phase: idx * 1.4
          });
        });
      }

      // --------------------------------------------------------------------------
      // LIVING WORLD: 4 FOREST FOXES, CIRCLING BIRDS & 8 ANEMO CRYSTALFLIES
      // --------------------------------------------------------------------------
      _buildWildlife() {
        const foxOrangeMat = createCelMaterial({ color: 0xf27d38, rimColor: 0xffd2a6, rimStrength: 0.35 });
        const foxWhiteMat = createCelMaterial({ color: 0xfaf7f2 });
        const foxDarkMat = createCelMaterial({ color: 0x2b2633 });

        const foxHomes = [
          { x: -12, z: 32 },
          { x: 22, z: 14 },
          { x: -46, z: 12 },
          { x: 34, z: -42 }
        ];

        foxHomes.forEach((home, idx) => {
          const foxGroup = new THREE.Group();
          const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.78), foxOrangeMat);
          torso.position.y = 0.34;
          torso.castShadow = true;
          addAnimeOutline(torso, 1.06);
          foxGroup.add(torso);

          const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.38), foxOrangeMat);
          head.position.set(0, 0.52, -0.44);
          addAnimeOutline(head, 1.06);
          foxGroup.add(head);

          [-0.12, 0.12].forEach((ex) => {
            const ear = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 6), foxDarkMat);
            ear.position.set(ex, 0.74, -0.4);
            foxGroup.add(ear);
          });

          const tail = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.55, 8), foxOrangeMat);
          tail.position.set(0, 0.42, 0.56);
          tail.rotation.x = 0.9;
          addAnimeOutline(tail, 1.06);
          const tailTip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.24, 8), foxWhiteMat);
          tailTip.position.set(0, 0.52, 0.74);
          tailTip.rotation.x = 0.9;
          foxGroup.add(tail, tailTip);

          const startY = getTerrainHeight(home.x, home.z);
          foxGroup.position.set(home.x, startY, home.z);
          this.scene.add(foxGroup);

          this.foxes.push({
            mesh: foxGroup,
            homeX: home.x,
            homeZ: home.z,
            x: home.x,
            z: home.z,
            angle: idx * 1.5,
            hopTimer: 0
          });
        });

        // Circling White Birds
        const birdMat = createCelMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        for (let i = 0; i < 10; i++) {
          const bird = new THREE.Group();
          const body = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.55, 6), birdMat);
          body.rotation.x = Math.PI / 2;
          const leftWing = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.24), birdMat);
          leftWing.position.x = -0.32;
          const rightWing = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.24), birdMat);
          rightWing.position.x = 0.32;
          bird.add(body, leftWing, rightWing);
          this.scene.add(bird);

          this.birds.push({
            group: bird,
            leftWing,
            rightWing,
            angle: (i / 10) * Math.PI * 2,
            radius: 26 + (i % 3) * 7,
            height: 24 + (i % 4) * 3,
            speed: 0.28 + (i % 3) * 0.04
          });
        }

        // 8 Glowing Anemo Crystalflies
        const flyCoords = [
          { x: -28, z: -22, yOff: 2.2 },
          { x: -14, z: -10, yOff: 3.4 },
          { x: -58, z: 16, yOff: 2.4 },
          { x: 46, z: -56, yOff: 2.5 },
          { x: 0, z: -90, yOff: 2.6 },
          { x: 24, z: -34, yOff: 22.8 },
          { x: -34, z: -56, yOff: 28.8 },
          { x: 0, z: -84, yOff: 38.8 }
        ];

        const wingMat = createCelMaterial({
          color: 0x6efce8,
          emissive: 0x3be8cf,
          emissiveIntensity: 1.2,
          transparent: true,
          opacity: 0.88,
          side: THREE.DoubleSide
        });

        flyCoords.forEach((fc, idx) => {
          const baseY = fc.yOff > 10 ? fc.yOff : getTerrainHeight(fc.x, fc.z) + fc.yOff;
          const flyGroup = new THREE.Group();
          flyGroup.position.set(fc.x, baseY, fc.z);

          const core = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.18, 0),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
          );
          const lWing = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.35), wingMat);
          lWing.position.x = -0.28;
          const rWing = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.35), wingMat);
          rWing.position.x = 0.28;

          flyGroup.add(core, lWing, rWing);
          this.scene.add(flyGroup);

          this.crystalflies.push({
            id: idx,
            baseX: fc.x,
            baseY,
            baseZ: fc.z,
            group: flyGroup,
            lWing,
            rWing,
            caught: false,
            phase: idx * 1.1
          });
        });
      }

      // --------------------------------------------------------------------------
      // INSTANCED GPU-ANIMATED SWAYING GRASS & WILDFLOWERS
      // --------------------------------------------------------------------------
      _buildInstancedGrassAndFlowers() {
        const meadow = initMeadowFoliage(this.scene, getTerrainHeight);
        this.foliageMesh = meadow.grassInstanced;
        this.flowerMesh = meadow.flowerInstanced;
        this.foliagePlacedCount = meadow.placedGrass;
        this.flowerPlacedCount = meadow.placedFlowers;
        this.foliageUniforms = foliageUniforms;
        // Preserve the legacy alias in case any existing debug hook references it.
        this.grassUniforms = foliageUniforms;
      }

      // --------------------------------------------------------------------------
      // SAKURA PETALS, WATERFALL MIST & NIGHT FIREFLIES
      // --------------------------------------------------------------------------
      _buildParticles() {
        const petalCount = 260;
        const pGeo = new THREE.BufferGeometry();
        const pPos = new Float32Array(petalCount * 3);
        for (let i = 0; i < petalCount; i++) {
          pPos[i * 3] = (Math.random() - 0.5) * 220;
          pPos[i * 3 + 1] = 2 + Math.random() * 24;
          pPos[i * 3 + 2] = (Math.random() - 0.5) * 220;
        }
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        this.petalSystem = new THREE.Points(
          pGeo,
          new THREE.PointsMaterial({ color: 0xffbfd9, size: 0.44, transparent: true, opacity: 0.88 })
        );
        this.scene.add(this.petalSystem);

        const mistCount = 120;
        const mGeo = new THREE.BufferGeometry();
        const mPos = new Float32Array(mistCount * 3);
        for (let i = 0; i < mistCount; i++) {
          mPos[i * 3] = WATERFALL_POS.x + 2.5 + (Math.random() - 0.5) * 8;
          mPos[i * 3 + 1] = WATER_LEVEL + Math.random() * 6;
          mPos[i * 3 + 2] = WATERFALL_POS.z + 2.5 + (Math.random() - 0.5) * 8;
        }
        mGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
        this.mistSystem = new THREE.Points(
          mGeo,
          new THREE.PointsMaterial({ color: 0xe6f9ff, size: 0.85, transparent: true, opacity: 0.48 })
        );
        this.scene.add(this.mistSystem);

        const ffCount = 180;
        const fGeo = new THREE.BufferGeometry();
        const fPos = new Float32Array(ffCount * 3);
        for (let i = 0; i < ffCount; i++) {
          fPos[i * 3] = (Math.random() - 0.5) * 200;
          fPos[i * 3 + 1] = 1.5 + Math.random() * 8;
          fPos[i * 3 + 2] = (Math.random() - 0.5) * 200;
        }
        fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
        this.fireflyMat = new THREE.PointsMaterial({
          color: 0x9effc5,
          size: 0.58,
          transparent: true,
          opacity: 0.0,
          blending: THREE.AdditiveBlending
        });
        this.fireflySystem = new THREE.Points(fGeo, this.fireflyMat);
        this.scene.add(this.fireflySystem);
      }

      // --------------------------------------------------------------------------
      // INPUTS, RESIZE & MINIMAP SETUP
      // --------------------------------------------------------------------------
      _resizeMinimap() {
        const mm = document.getElementById('minimapCanvas');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        mm.width = 112 * dpr;
        mm.height = 112 * dpr;
        this.mmCtx = mm.getContext('2d');
        this.mmCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      _bindInputs() {
        window.addEventListener('resize', () => {
          this.camera.aspect = window.innerWidth / window.innerHeight;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(window.innerWidth, window.innerHeight);
          this._resizeMinimap();
        });

        document.getElementById('btnStartGame').addEventListener('click', () => {
          this.sound.init();
          this.sound.playChime([261.63, 329.63, 392.00, 493.88, 587.33]);
          this.gameState = 'PLAYING';

          const overlay = document.getElementById('titleOverlay');
          overlay.style.opacity = '0';
          setTimeout(() => overlay.classList.add('hidden'), 700);

          const hud = document.getElementById('hudLayer');
          hud.classList.remove('hidden');
          hud.classList.add('flex');

          this._checkRegion(true);
        });

        window.addEventListener('keydown', (e) => {
          this.keys[e.code] = true;
          if (this.gameState !== 'PLAYING') return;
          this.sound.init();

          if (e.code === 'Space') {
            e.preventDefault();
            this.handleJumpOrGlide();
          } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
            e.preventDefault();
            this.handleDash();
          } else if (e.code === 'KeyE') {
            e.preventDefault();
            this.handleInteract();
          } else if (e.code === 'KeyC') {
            e.preventDefault();
            this.toggleSit();
          } else if (e.code === 'KeyH') {
            e.preventDefault();
            this.togglePhotoHUD();
          } else if (e.code === 'Escape') {
            this.closeDialogue();
            document.getElementById('helpModal').classList.add('hidden');
          }
        });

        window.addEventListener('keyup', (e) => {
          this.keys[e.code] = false;
        });

        // Mouse Drag Camera Orbit
        this.canvas.addEventListener('pointerdown', (e) => {
          if (this.gameState !== 'PLAYING') return;
          this.sound.init();
          this.isOrbitDragging = true;
          this.lastPointer.x = e.clientX;
          this.lastPointer.y = e.clientY;
          this.canvas.setPointerCapture(e.pointerId);
        });

        this.canvas.addEventListener('pointermove', (e) => {
          if (!this.isOrbitDragging) return;
          const dx = e.clientX - this.lastPointer.x;
          const dy = e.clientY - this.lastPointer.y;
          this.lastPointer.x = e.clientX;
          this.lastPointer.y = e.clientY;

          this.camRig.yaw -= dx * 0.0055;
          this.camRig.pitch = Math.max(-0.15, Math.min(0.88, this.camRig.pitch + dy * 0.0045));
        });

        const stopOrbit = () => { this.isOrbitDragging = false; };
        this.canvas.addEventListener('pointerup', stopOrbit);
        this.canvas.addEventListener('pointercancel', stopOrbit);

        window.addEventListener('wheel', (e) => {
          if (this.gameState !== 'PLAYING') return;
          this.camRig.targetDist = Math.max(4.2, Math.min(13.5, this.camRig.targetDist + e.deltaY * 0.005));
        }, { passive: true });

        // Toolbar Buttons
        document.getElementById('btnTimeCycle').addEventListener('click', () => {
          this.sound.init();
          this.timeMoodIdx = (this.timeMoodIdx + 1) % TIME_MOODS.length;
          const m = TIME_MOODS[this.timeMoodIdx];
          document.getElementById('btnTimeEmoji').textContent = m.emoji;
          document.getElementById('hudTimeIcon').textContent = m.emoji;
          document.getElementById('hudTimeLabel').textContent = m.name;
          this.showToast(`Waktu Dunia: ${m.name}`);
        });

        document.getElementById('btnChill').addEventListener('click', () => {
          this.sound.init();
          this.toggleSit();
        });

        document.getElementById('btnHelp').addEventListener('click', () => {
          document.getElementById('helpModal').classList.remove('hidden');
        });
        document.getElementById('btnCloseHelp').addEventListener('click', () => {
          document.getElementById('helpModal').classList.add('hidden');
        });

        document.getElementById('btnPhotoHide').addEventListener('click', () => this.togglePhotoHUD());
        document.getElementById('btnExitPhoto').addEventListener('click', () => this.togglePhotoHUD());

        document.getElementById('btnAudio').addEventListener('click', () => {
          const muted = this.sound.toggleMute();
          document.getElementById('iconAudioOn').classList.toggle('hidden', muted);
          document.getElementById('iconAudioOff').classList.toggle('hidden', !muted);
        });

        document.getElementById('interactPrompt').addEventListener('click', () => {
          this.sound.init();
          if (this.nearestInteractable) {
            this.handleInteract();
          } else if (!this.player.onGround && !this.player.isGliding) {
            this.handleJumpOrGlide();
          }
        });

        document.getElementById('btnNextDialogue').addEventListener('click', () => {
          if (this.activeDialogueNPC) this._openNPCDialogue(this.activeDialogueNPC);
        });

        document.getElementById('btnCloseDialogue').addEventListener('click', () => this.closeDialogue());

        // Mobile Virtual Thumbstick
        const joyBase = document.getElementById('joystickBase');
        const joyKnob = document.getElementById('joystickKnob');
        let joyActive = false;

        const updateJoy = (cx, cy) => {
          const rect = joyBase.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const maxR = rect.width * 0.36;
          let dx = cx - centerX;
          let dy = cy - centerY;
          const dist = Math.hypot(dx, dy);
          if (dist > maxR) {
            dx = (dx / dist) * maxR;
            dy = (dy / dist) * maxR;
          }
          joyKnob.style.transform = `translate(${dx}px, ${dy}px)`;
          this.joyVec.x = dx / maxR;
          this.joyVec.y = dy / maxR;
        };

        joyBase.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          this.sound.init();
          joyActive = true;
          joyBase.setPointerCapture(e.pointerId);
          updateJoy(e.clientX, e.clientY);
        });
        joyBase.addEventListener('pointermove', (e) => {
          if (joyActive) updateJoy(e.clientX, e.clientY);
        });
        const resetJoy = () => {
          joyActive = false;
          joyKnob.style.transform = 'translate(0px, 0px)';
          this.joyVec.x = 0;
          this.joyVec.y = 0;
        };
        joyBase.addEventListener('pointerup', resetJoy);
        joyBase.addEventListener('pointercancel', resetJoy);

        document.getElementById('touchJumpBtn').addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          this.sound.init();
          this.handleJumpOrGlide();
        });
        document.getElementById('touchDashBtn').addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          this.sound.init();
          this.handleDash();
        });
        document.getElementById('touchInteractBtn').addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          this.sound.init();
          this.handleInteract();
        });
        document.getElementById('touchSitBtn').addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          this.sound.init();
          this.toggleSit();
        });
      }

      _buildVisionUI() {
        const container = document.getElementById('cloakSelector');
        container.innerHTML = '';
        const openedCount = this.chests.filter(c => c.opened).length;

        ELEMENTAL_VISIONS.forEach((v, idx) => {
          const unlocked = openedCount >= v.unlockChests;
          const btn = document.createElement('button');
          btn.className = `w-4 h-4 rounded-full transition-transform ${
            idx === this.visionIdx ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100'
          } ${!unlocked ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'}`;
          btn.style.backgroundColor = v.hex;
          btn.title = unlocked ? v.name : `Buka ${v.unlockChests} Peti untuk ${v.name}`;

          btn.addEventListener('click', () => {
            if (!unlocked) {
              this.showToast(`Buka ${v.unlockChests} peti untuk membuka ${v.name}`);
              return;
            }
            this.visionIdx = idx;
            this.traveler.setElementalColor(v);
            this._buildVisionUI();
            this.showToast(`Resonansi Elemen: ${v.name}`);
          });
          container.appendChild(btn);
        });
      }

      // --------------------------------------------------------------------------
      // PLAYER ACTIONS
      // --------------------------------------------------------------------------
      handleJumpOrGlide() {
        this.player.isSitting = false;
        if (this.player.onGround) {
          this.player.vel.y = 9.4;
          this.player.onGround = false;
          this.sound.playStep(false);
        } else if (!this.player.isGliding && !this.player.staminaExhausted && this.player.stamina > 8) {
          this.player.isGliding = true;
          this.sound.playWindWhoosh(true);
        } else if (this.player.isGliding) {
          this.player.isGliding = false;
        }
      }

      handleDash() {
        if (this.player.isDashing || this.player.staminaExhausted || this.player.stamina < 18) return;
        this.player.isSitting = false;
        this.player.isDashing = true;
        this.player.dashTimer = 0.30;
        this.player.stamina = Math.max(0, this.player.stamina - 22);
        if (this.player.stamina <= 1) this.player.staminaExhausted = true;
        this.sound.playWindWhoosh(false);
        this._spawnLightBurst(this.player.pos.clone().add(new THREE.Vector3(0, 1.2, 0)), ELEMENTAL_VISIONS[this.visionIdx].glow, 18);
      }

      toggleSit() {
        if (!this.player.onGround) return;
        this.player.isSitting = !this.player.isSitting;
        if (this.player.isSitting) {
          this.showToast('Sit & Chill aktif — menikmati panorama Aetheria');
        }
      }

      togglePhotoHUD() {
        this.hudHidden = !this.hudHidden;
        document.getElementById('hudLayer').classList.toggle('hidden', this.hudHidden);
        document.getElementById('btnExitPhoto').classList.toggle('hidden', !this.hudHidden);
      }

      handleInteract() {
        if (!this.nearestInteractable) return;
        this.player.isSitting = false;
        this.traveler.triggerInteractPose();
        const item = this.nearestInteractable;

        // Spawn golden-teal starlight particles from right palm
        const palmWorld = new THREE.Vector3();
        this.traveler.handStarlight.getWorldPosition(palmWorld);
        this._spawnLightBurst(palmWorld, 0xffe89e, 14);

        if (item.kind === 'shrine') {
          const sh = item.obj;
          if (!sh.lit) {
            sh.lit = true;
            sh.crystalMat.color.setHex(0x66ffea);
            sh.crystalMat.emissive.setHex(0x2ee6c5);
            sh.crystalMat.emissiveIntensity = 1.6;
            sh.beamMat.opacity = 0.26;

            this.player.stamina = this.player.maxStamina;
            this.player.staminaExhausted = false;
            this.sound.playChime([261.63, 329.63, 392.00, 493.88, 587.33]);
            this._spawnLightBurst(new THREE.Vector3(sh.x, sh.y + 3.8, sh.z), 0x4ee2c0, 32);

            let revealed = 0;
            this.chests
              .filter(c => !c.opened && !c.revealed)
              .sort((a, b) => Math.hypot(a.x - sh.x, a.z - sh.z) - Math.hypot(b.x - sh.x, b.z - sh.z))
              .slice(0, 2)
              .forEach(c => {
                c.revealed = true;
                revealed++;
              });

            const litCount = this.shrines.filter(s => s.lit).length;
            document.getElementById('shrineCount').textContent = `${litCount}/4`;
            this.showToast(
              revealed > 0
                ? `${sh.name} menyala! ${revealed} peti terungkap di mini-radar.`
                : `${sh.name} telah selaras sepenuhnya!`
            );
          } else {
            this.player.stamina = this.player.maxStamina;
            this.sound.playHarpPluck();
            this.showToast('Energi angin memulihkan staminamu.');
          }
        } else if (item.kind === 'chest') {
          const ch = item.obj;
          if (!ch.opened) {
            ch.opened = true;
            ch.revealed = true;
            this.shards += ch.shards;
            this.sound.playChime([523.25, 659.25, 783.99, 1046.50]);
            this._spawnLightBurst(new THREE.Vector3(ch.x, ch.y + 1.0, ch.z), 0xf7c548, 28);

            const openedTotal = this.chests.filter(c => c.opened).length;
            document.getElementById('chestCount').textContent = `${openedTotal}/8`;
            document.getElementById('shardCount').textContent = `${this.shards}`;
            this._buildVisionUI();

            const unlocked = ELEMENTAL_VISIONS.find(v => v.unlockChests === openedTotal);
            if (unlocked) {
              this.visionIdx = ELEMENTAL_VISIONS.indexOf(unlocked);
              this.traveler.setElementalColor(unlocked);
              this._buildVisionUI();
              this.showToast(`+${ch.shards} Starlight Shards! Elemen baru: ${unlocked.name}`);
            } else {
              this.showToast(`Peti terbuka! +${ch.shards} Starlight Shards`);
            }
          }
        } else if (item.kind === 'crystalfly') {
          this._catchCrystalfly(item.obj);
        } else if (item.kind === 'npc') {
          this._openNPCDialogue(item.obj);
        }
      }

      _catchCrystalfly(cf) {
        if (cf.caught) return;
        cf.caught = true;
        cf.group.visible = false;
        this.shards += 10;
        this.sound.playChime([659.25, 880.00, 1174.66]);
        this._spawnLightBurst(cf.group.position.clone(), 0x6efce8, 22);

        const caughtTotal = this.crystalflies.filter(f => f.caught).length;
        document.getElementById('crystalCount').textContent = `${caughtTotal}/8`;
        document.getElementById('shardCount').textContent = `${this.shards}`;
        this.showToast(`Anemo Crystalfly tertangkap! +10 Starlight Shards`);
      }

      _openNPCDialogue(npc) {
        this.activeDialogueNPC = npc;
        const lines = npc.getLines();
        const text = lines[npc.lineIdx % lines.length];
        npc.lineIdx++;

        if (npc.id === 'lyra') {
          this.sound.playHarpPluck(5);
          setTimeout(() => this.sound.playHarpPluck(7), 220);
        } else {
          this.sound.playHarpPluck();
        }

        document.getElementById('dialogueSpeaker').textContent = npc.name;
        document.getElementById('dialogueRole').textContent = `• ${npc.role}`;
        document.getElementById('dialogueBadge').style.backgroundColor = npc.accentColor;
        document.getElementById('dialogueText').textContent = text;
        document.getElementById('dialogueBox').classList.remove('hidden');
      }

      closeDialogue() {
        this.activeDialogueNPC = null;
        document.getElementById('dialogueBox').classList.add('hidden');
      }

      _spawnLightBurst(origin, hexColor, count) {
        const mat = new THREE.MeshBasicMaterial({ color: hexColor, transparent: true, opacity: 1.0 });
        const geo = new THREE.OctahedronGeometry(0.16, 0);
        for (let i = 0; i < count; i++) {
          const mesh = new THREE.Mesh(geo, mat.clone());
          mesh.position.copy(origin);
          const angle = Math.random() * Math.PI * 2;
          const spd = 2.0 + Math.random() * 5.5;
          this.scene.add(mesh);
          this.burstParticles.push({
            mesh,
            vel: new THREE.Vector3(Math.cos(angle) * spd, 2.5 + Math.random() * 5.0, Math.sin(angle) * spd),
            life: 1.0
          });
        }
      }

      showToast(msg) {
        const el = document.getElementById('toastBanner');
        document.getElementById('toastText').textContent = msg;
        el.classList.remove('hidden');
        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => el.classList.add('hidden'), 3300);
      }

      _checkRegion(force = false) {
        const found = REGIONS.find(r => r.check(this.player.pos.x, this.player.pos.z)) || REGIONS[0];
        if (force || !this.currentRegion || this.currentRegion.id !== found.id) {
          this.currentRegion = found;
          document.getElementById('hudRegionName').textContent = found.name;
          document.getElementById('bannerTitle').textContent = found.name;
          document.getElementById('bannerSubtitle').textContent = found.subtitle;

          const banner = document.getElementById('regionBanner');
          banner.classList.remove('opacity-0', '-translate-y-3');
          banner.classList.add('opacity-100', 'translate-y-0');

          clearTimeout(this.bannerTimeout);
          this.bannerTimeout = setTimeout(() => {
            banner.classList.remove('opacity-100', 'translate-y-0');
            banner.classList.add('opacity-0', '-translate-y-3');
          }, 3000);
        }
      }

      // --------------------------------------------------------------------------
      // 60 FPS SIMULATION UPDATE
      // --------------------------------------------------------------------------
      update(dt, elapsed) {
        const distToWf = Math.hypot(this.player.pos.x - WATERFALL_POS.x, this.player.pos.z - WATERFALL_POS.z);
        this.sound.update(dt, this.player.isSitting, distToWf);

        // Interpolate Time-of-Day Sky, Fog & Cel Rim-Light Color
        const mood = TIME_MOODS[this.timeMoodIdx];
        const nightTarget = Math.max(mood.starIntensity || 0, mood.auroraIntensity || 0);
        const envLerp = 1 - Math.exp(-2.8 * dt);
        this.skyDome.material.uniforms.uTopColor.value.lerp(mood.topColor, envLerp);
        this.skyDome.material.uniforms.uHorizonColor.value.lerp(mood.horizonColor, envLerp);
        this.skyDome.material.uniforms.uBottomColor.value.lerp(mood.bottomColor, envLerp);
        this.skyDome.material.uniforms.uSunDir.value.lerp(mood.sunDir, envLerp).normalize();
        this.skyDome.material.uniforms.uSunColor.value.lerp(mood.sunColor, envLerp);
        this.skyDome.material.uniforms.uStarIntensity.value += (mood.starIntensity - this.skyDome.material.uniforms.uStarIntensity.value) * envLerp;
        this.skyDome.material.uniforms.uAuroraIntensity.value += (mood.auroraIntensity - this.skyDome.material.uniforms.uAuroraIntensity.value) * envLerp;
        this.skyDome.material.uniforms.uTime.value = elapsed;

        GLOBAL_RIM_COLOR.value.lerp(mood.rimColor, envLerp);
        this.fog.color.lerp(mood.fogColor, envLerp);
        this.fog.density += (mood.fogDensity - this.fog.density) * envLerp;

        this.sunLight.color.lerp(mood.sunColor, envLerp);
        this.sunLight.intensity += (mood.sunIntensity - this.sunLight.intensity) * envLerp;
        this.hemiLight.color.lerp(mood.hemiSky, envLerp);
        this.hemiLight.groundColor.lerp(mood.hemiGround, envLerp);
        this.hemiLight.intensity += (mood.hemiIntensity - this.hemiLight.intensity) * envLerp;

        this.waterMesh.material.uniforms.uTime.value = elapsed;
        this.waterMesh.material.uniforms.uSunDir.value.copy(this.skyDome.material.uniforms.uSunDir.value);
        this.waterMesh.material.uniforms.uSunColor.value.copy(this.skyDome.material.uniforms.uSunColor.value);
        this.waterfall.wfMat.uniforms.uTime.value = elapsed;
        this.waterfall.splashMat.uniforms.uTime.value = elapsed;
        if (this.windColumnMat) this.windColumnMat.uniforms.uTime.value = elapsed;

        // Animate Landmarks & Wildlife
        if (this.windmillBlades) this.windmillBlades.rotation.z += dt * 0.42;
        if (this.celestialRing) this.celestialRing.rotation.z += dt * 0.06;

        this.shrines.forEach((sh, idx) => {
          sh.crystal.rotation.y += dt * (sh.lit ? 2.2 : 0.7);
          sh.crystal.position.y = 3.9 + Math.sin(elapsed * 2.5 + idx) * (sh.lit ? 0.25 : 0.08);
        });

        this.chests.forEach((ch) => {
          const targetAngle = ch.opened ? -1.45 : 0;
          ch.lidPivot.rotation.x += (targetAngle - ch.lidPivot.rotation.x) * (1 - Math.exp(-10 * dt));
        });

        this.skyRingMeshes.forEach((sr, i) => {
          sr.mesh.rotation.z += dt * 1.4;
          sr.mesh.position.y = sr.y + Math.sin(elapsed * 2.2 + i) * 0.35;
          if (sr.cooldown > 0) sr.cooldown -= dt;
        });

        // Animate NPCs
        this.npcs.forEach((npc) => {
          const d = Math.hypot(npc.x - this.player.pos.x, npc.z - this.player.pos.z);
          if (d < 8.5) {
            const lookYaw = Math.atan2(this.player.pos.x - npc.x, this.player.pos.z - npc.z);
            npc.group.rotation.y += (lookYaw - npc.group.rotation.y) * (1 - Math.exp(-6 * dt));
            npc.rightArm.rotation.z = 2.4 + Math.sin(elapsed * 7.0 + npc.phase) * 0.35;
          } else {
            npc.rightArm.rotation.z = 0.15 + Math.sin(elapsed * 2.0 + npc.phase) * 0.05;
          }
        });

        // Animate 4 Forest Foxes
        this.foxes.forEach((fox) => {
          const distPlayer = Math.hypot(fox.x - this.player.pos.x, fox.z - this.player.pos.z);
          if (distPlayer < 5.5 && fox.hopTimer <= 0) {
            fox.hopTimer = 0.45;
            fox.angle = Math.atan2(fox.x - this.player.pos.x, fox.z - this.player.pos.z);
          } else {
            fox.angle += Math.sin(elapsed * 0.7 + fox.homeX) * 0.65 * dt;
          }

          const trotSpeed = fox.hopTimer > 0 ? 4.2 : 1.5;
          fox.x += Math.sin(fox.angle) * trotSpeed * dt;
          fox.z += Math.cos(fox.angle) * trotSpeed * dt;

          if (Math.hypot(fox.x - fox.homeX, fox.z - fox.homeZ) > 16) {
            fox.angle = Math.atan2(fox.homeX - fox.x, fox.homeZ - fox.z);
          }

          const fy = getTerrainHeight(fox.x, fox.z);
          let hopOffset = 0;
          if (fox.hopTimer > 0) {
            hopOffset = Math.sin((fox.hopTimer / 0.45) * Math.PI) * 0.75;
            fox.hopTimer -= dt;
          }

          fox.mesh.position.set(fox.x, fy + hopOffset, fox.z);
          fox.mesh.rotation.y = fox.angle + Math.PI;
        });

        // Animate Circling White Birds
        this.birds.forEach((b, idx) => {
          b.angle += b.speed * dt;
          const bx = -22 + Math.cos(b.angle) * b.radius;
          const bz = -30 + Math.sin(b.angle) * b.radius;
          const by = b.height + Math.sin(elapsed * 1.8 + idx) * 1.2;
          b.group.position.set(bx, by, bz);
          b.group.rotation.y = -b.angle;

          const flap = Math.sin(elapsed * 9.5 + idx) * 0.55;
          b.leftWing.rotation.z = flap;
          b.rightWing.rotation.z = -flap;
        });

        // Animate 8 Anemo Crystalflies
        this.crystalflies.forEach((cf) => {
          if (cf.caught) return;
          const cx = cf.baseX + Math.sin(elapsed * 1.4 + cf.phase) * 1.6;
          const cy = cf.baseY + Math.cos(elapsed * 2.1 + cf.phase) * 0.65;
          const cz = cf.baseZ + Math.cos(elapsed * 1.3 + cf.phase) * 1.6;
          cf.group.position.set(cx, cy, cz);

          const wingFlap = Math.sin(elapsed * 16.0 + cf.phase) * 0.65;
          cf.lWing.rotation.y = wingFlap;
          cf.rWing.rotation.y = -wingFlap;

          const distToPlayer = Math.hypot(cx - this.player.pos.x, cy - (this.player.pos.y + 1.2), cz - this.player.pos.z);
          if (distToPlayer < 2.2) {
            this._catchCrystalfly(cf);
          }
        });

        // Update Particles
        if (this.petalSystem) {
          const arr = this.petalSystem.geometry.attributes.position.array;
          for (let i = 0; i < arr.length; i += 3) {
            arr[i] += Math.sin(elapsed + i) * 1.4 * dt + 1.1 * dt;
            arr[i + 1] -= 1.35 * dt;
            arr[i + 2] += Math.cos(elapsed * 0.8 + i) * 1.2 * dt;
            if (arr[i + 1] < 0.2) arr[i + 1] = 24;
            if (arr[i] > 110) arr[i] = -110;
          }
          this.petalSystem.geometry.attributes.position.needsUpdate = true;
        }

        if (this.mistSystem) {
          const arr = this.mistSystem.geometry.attributes.position.array;
          for (let i = 0; i < arr.length; i += 3) {
            arr[i + 1] += 1.4 * dt;
            arr[i] += Math.sin(elapsed * 2.0 + i) * 0.5 * dt;
            if (arr[i + 1] > WATER_LEVEL + 6.5) {
              arr[i + 1] = WATER_LEVEL + 0.2;
            }
          }
          this.mistSystem.geometry.attributes.position.needsUpdate = true;
        }

        if (this.fireflySystem) {
          this.fireflyMat.opacity += (mood.fireflyAlpha - this.fireflyMat.opacity) * envLerp;
          const arr = this.fireflySystem.geometry.attributes.position.array;
          for (let i = 0; i < arr.length; i += 3) {
            arr[i] += Math.sin(elapsed * 1.3 + i) * 0.6 * dt;
            arr[i + 1] += Math.cos(elapsed * 1.7 + i) * 0.4 * dt;
          }
          this.fireflySystem.geometry.attributes.position.needsUpdate = true;
        }

        for (let i = this.burstParticles.length - 1; i >= 0; i--) {
          const bp = this.burstParticles[i];
          bp.life -= dt * 1.1;
          bp.vel.y -= 7.5 * dt;
          bp.mesh.position.addScaledVector(bp.vel, dt);
          bp.mesh.material.opacity = Math.max(0, bp.life);
          if (bp.life <= 0) {
            this.scene.remove(bp.mesh);
            this.burstParticles.splice(i, 1);
          }
        }

        // Title Screen Scenic Preview
        if (this.gameState === 'TITLE') {
          updateMeadowFoliage(elapsed, dt, this.player.pos, this.player.yaw, false, false, nightTarget);
          this.traveler.updateAnimation(dt, elapsed, {
            pos: this.player.pos,
            yaw: 0,
            turnRate: 0,
            speed: 0,
            isGliding: false,
            isSitting: false,
            onGround: true,
            isDashing: false,
            isTalking: false
          });

          const swayYaw = Math.sin(elapsed * 0.22) * 0.28;
          const camOffset = new THREE.Vector3(Math.sin(swayYaw) * 8.5, 3.6, Math.cos(swayYaw) * 8.5);
          this.camera.position.copy(this.player.pos).add(camOffset);
          this.camera.lookAt(this.player.pos.x - Math.sin(swayYaw) * 18, this.player.pos.y + 3.2, this.player.pos.z - 28);
          this.skyDome.position.copy(this.camera.position);
          return;
        }

        // Keyboard Camera Orbit (Q / E)
        if (this.keys['KeyQ']) this.camRig.yaw += 1.65 * dt;
        if (this.keys['KeyE'] && !this.nearestInteractable) this.camRig.yaw -= 1.65 * dt;

        // Movement Input
        let moveForward = 0;
        let moveRight = 0;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) moveForward += 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) moveForward -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) moveRight += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveRight -= 1;

        moveForward -= this.joyVec.y;
        moveRight += this.joyVec.x;

        const inputLen = Math.hypot(moveForward, moveRight);
        if (inputLen > 1) {
          moveForward /= inputLen;
          moveRight /= inputLen;
        }
        if (inputLen > 0.05) {
          this.player.isSitting = false;
          this.closeDialogue();
        }

        const camForward = new THREE.Vector3(-Math.sin(this.camRig.yaw), 0, -Math.cos(this.camRig.yaw));
        const camRight = new THREE.Vector3(Math.cos(this.camRig.yaw), 0, -Math.sin(this.camRig.yaw));

        const wishDir = new THREE.Vector3()
          .addScaledVector(camForward, moveForward)
          .addScaledVector(camRight, moveRight);

        this.player.turnRate = 0;
        if (wishDir.lengthSq() > 0.001) {
          wishDir.normalize();
          const targetYaw = Math.atan2(-wishDir.x, -wishDir.z);
          let diff = targetYaw - this.player.yaw;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          const stepYaw = diff * (1 - Math.exp(-14 * dt));
          this.player.yaw += stepYaw;
          this.player.turnRate = stepYaw / Math.max(dt, 0.001);
        }

        if (this.player.isDashing) {
          this.player.dashTimer -= dt;
          if (this.player.dashTimer <= 0) this.player.isDashing = false;
        }

        const runSpeed = this.player.isDashing ? 18.8 : (this.player.isGliding ? 11.8 : 8.6);
        const targetVx = (inputLen > 0.05 ? wishDir.x : (this.player.isDashing ? -Math.sin(this.player.yaw) : 0)) * runSpeed;
        const targetVz = (inputLen > 0.05 ? wishDir.z : (this.player.isDashing ? -Math.cos(this.player.yaw) : 0)) * runSpeed;

        const accelRate = this.player.onGround ? 14.0 : 5.8;
        const hLerp = 1 - Math.exp(-accelRate * dt);
        this.player.vel.x += (targetVx - this.player.vel.x) * hLerp;
        this.player.vel.z += (targetVz - this.player.vel.z) * hLerp;

        // Anemo Wind Current Updrafts
        let inWindUpdraft = false;
        for (const wc of WIND_CURRENTS) {
          const distXZ = Math.hypot(this.player.pos.x - wc.x, this.player.pos.z - wc.z);
          if (distXZ <= wc.radius && this.player.pos.y <= wc.topY) {
            inWindUpdraft = true;
            this.player.isSitting = false;
            this.player.onGround = false;
            this.player.isGliding = true;
            this.player.vel.y = Math.min(13.5, this.player.vel.y + 34.0 * dt);
            this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + 35 * dt);
            this.player.staminaExhausted = false;
            break;
          }
        }

        // Boost Sky Rings
        for (const sr of this.skyRingMeshes) {
          const dRing = Math.hypot(this.player.pos.x - sr.x, (this.player.pos.y + 1.2) - sr.y, this.player.pos.z - sr.z);
          if (dRing < 3.2 && sr.cooldown <= 0) {
            sr.cooldown = 2.0;
            this.player.vel.y = 14.5;
            this.player.vel.x += -Math.sin(this.player.yaw) * 14.0;
            this.player.vel.z += -Math.cos(this.player.yaw) * 14.0;
            this.sound.playWindWhoosh(true);
            this._spawnLightBurst(this.player.pos.clone().add(new THREE.Vector3(0, 1.4, 0)), 0x5efce8, 20);
          }
        }

        // Vertical Gravity & Gliding
        if (!inWindUpdraft) {
          if (this.player.isGliding) {
            this.player.vel.y = Math.max(-2.0, this.player.vel.y - 11.5 * dt);
            this.player.stamina = Math.max(0, this.player.stamina - 10.5 * dt);
            if (this.player.stamina <= 0.5) {
              this.player.staminaExhausted = true;
              this.player.isGliding = false;
            }
          } else {
            this.player.vel.y -= 23.0 * dt;
          }
        }

        const nextX = Math.max(-138, Math.min(138, this.player.pos.x + this.player.vel.x * dt));
        const nextZ = Math.max(-138, Math.min(138, this.player.pos.z + this.player.vel.z * dt));

        const nextGroundH = getWalkableHeight(nextX, nextZ, this.player.pos.y);
        if (nextGroundH >= WATER_LEVEL - 0.35 || !this.player.onGround) {
          this.player.pos.x = nextX;
          this.player.pos.z = nextZ;
        } else {
          this.player.vel.x *= 0.2;
          this.player.vel.z *= 0.2;
        }

        this.player.pos.y += this.player.vel.y * dt;

        const floorY = Math.max(getWalkableHeight(this.player.pos.x, this.player.pos.z, this.player.pos.y), WATER_LEVEL - 0.35);
        if (this.player.pos.y <= floorY) {
          this.player.pos.y = floorY;
          this.player.vel.y = 0;
          this.player.onGround = true;
          this.player.isGliding = false;
        } else {
          this.player.onGround = false;
        }

        if (!this.player.isDashing && !this.player.isGliding) {
          this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + 26.0 * dt);
          if (this.player.staminaExhausted && this.player.stamina >= 35) {
            this.player.staminaExhausted = false;
          }
        }

        // Feed live player state into the meadow's GPU-driven wind/dash/glide/night shader.
        updateMeadowFoliage(
          elapsed,
          dt,
          this.player.pos,
          this.player.yaw,
          this.player.isDashing,
          this.player.isGliding,
          nightTarget
        );

        const horizSpeed = Math.hypot(this.player.vel.x, this.player.vel.z);
        if (this.player.onGround && horizSpeed > 1.2) {
          this.player.stepTimer -= dt * (this.player.isDashing ? 1.6 : 1.0);
          if (this.player.stepTimer <= 0) {
            const onBridge = getBridgeHeight(this.player.pos.x, this.player.pos.z) > -100;
            this.sound.playStep(onBridge);
            this.player.stepTimer = 0.36;
          }
        }

        this.traveler.updateAnimation(dt, elapsed, {
          pos: this.player.pos,
          yaw: this.player.yaw,
          turnRate: this.player.turnRate,
          speed: horizSpeed,
          isGliding: this.player.isGliding,
          isSitting: this.player.isSitting,
          onGround: this.player.onGround,
          isDashing: this.player.isDashing,
          isTalking: Boolean(this.activeDialogueNPC)
        });

        // Shadow sun tracks player
        this.sunLight.position.copy(this.player.pos).addScaledVector(this.skyDome.material.uniforms.uSunDir.value, 65);
        this.sunLight.target.position.copy(this.player.pos);
        this.sunLight.target.updateMatrixWorld();

        // Smooth Spring-Arm TPP Camera (with FOV kick during Wind-Dash & vista orbit during Sit & Chill)
        if (this.player.isSitting && !this.isOrbitDragging) {
          this.camRig.yaw += dt * 0.16;
        }

        const targetFov = this.player.isDashing ? 66.5 : (this.player.isGliding ? 61.5 : 58.0);
        this.camRig.fov += (targetFov - this.camRig.fov) * (1 - Math.exp(-8 * dt));
        if (Math.abs(this.camera.fov - this.camRig.fov) > 0.05) {
          this.camera.fov = this.camRig.fov;
          this.camera.updateProjectionMatrix();
        }

        const targetDist = this.player.isSitting ? 9.6 : this.camRig.targetDist;
        this.camRig.dist += (targetDist - this.camRig.dist) * (1 - Math.exp(-6 * dt));

        const rightVec = new THREE.Vector3(Math.cos(this.camRig.yaw), 0, -Math.sin(this.camRig.yaw));
        const pivot = this.player.pos.clone()
          .add(new THREE.Vector3(0, this.player.isSitting ? 1.55 : 2.15, 0))
          .addScaledVector(rightVec, 0.55);

        const horizDist = Math.cos(this.camRig.pitch) * this.camRig.dist;
        const vertDist = Math.sin(this.camRig.pitch) * this.camRig.dist;

        const desiredCamPos = new THREE.Vector3(
          pivot.x + Math.sin(this.camRig.yaw) * horizDist,
          pivot.y + vertDist,
          pivot.z + Math.cos(this.camRig.yaw) * horizDist
        );

        const camGround = Math.max(getTerrainHeight(desiredCamPos.x, desiredCamPos.z), WATER_LEVEL) + 0.85;
        if (desiredCamPos.y < camGround) desiredCamPos.y = camGround;

        const camSmooth = 1 - Math.exp(-12 * dt);
        this.camRig.currentPos.lerp(desiredCamPos, camSmooth);

        const forwardLook = new THREE.Vector3(-Math.sin(this.camRig.yaw), -Math.sin(this.camRig.pitch) * 0.35, -Math.cos(this.camRig.yaw));
        const desiredLookAt = pivot.clone().addScaledVector(forwardLook, 6.5);
        this.camRig.currentLookAt.lerp(desiredLookAt, camSmooth);

        this.camera.position.copy(this.camRig.currentPos);
        this.camera.lookAt(this.camRig.currentLookAt);
        this.skyDome.position.copy(this.camera.position);

        this._updateHUD(dt);
      }

      _updateHUD(dt) {
        // 1. Genshin-Style Curved Circular Stamina Gauge
        const showStam = this.player.stamina < this.player.maxStamina - 0.5;
        const targetAlpha = showStam ? 1 : 0;
        this.player.staminaAlpha += (targetAlpha - this.player.staminaAlpha) * (1 - Math.exp(-9 * dt));

        const stamEl = document.getElementById('staminaContainer');
        const arcEl = document.getElementById('staminaArc');
        if (this.player.staminaAlpha > 0.02 && !this.hudHidden) {
          const rightVec = new THREE.Vector3(Math.cos(this.camRig.yaw), 0, -Math.sin(this.camRig.yaw));
          const anchorWorld = this.player.pos.clone()
            .add(new THREE.Vector3(0, 1.85, 0))
            .addScaledVector(rightVec, 0.88);
          anchorWorld.project(this.camera);

          const sx = (anchorWorld.x * 0.5 + 0.5) * window.innerWidth;
          const sy = (-anchorWorld.y * 0.5 + 0.5) * window.innerHeight;

          stamEl.style.left = `${sx}px`;
          stamEl.style.top = `${sy}px`;
          stamEl.style.opacity = this.player.staminaAlpha.toFixed(2);

          const ratio = Math.max(0, Math.min(1, this.player.stamina / this.player.maxStamina));
          arcEl.style.strokeDashoffset = (104 * (1 - ratio)).toFixed(1);
          arcEl.style.stroke = this.player.staminaExhausted
            ? '#fb7185'
            : (ratio < 0.28 ? '#fbbf24' : '#4ee2c0');
        } else {
          stamEl.style.opacity = '0';
        }

        // 2. Floating NPC Nameplates
        this.npcs.forEach((npc) => {
          const dist = Math.hypot(npc.x - this.player.pos.x, npc.z - this.player.pos.z);
          if (dist > 34 || this.hudHidden || this.gameState !== 'PLAYING') {
            npc.tagEl.style.opacity = '0';
            return;
          }
          const worldPos = new THREE.Vector3(npc.x, npc.y + 2.35, npc.z);
          worldPos.project(this.camera);
          if (worldPos.z > 1) {
            npc.tagEl.style.opacity = '0';
            return;
          }
          const sx = (worldPos.x * 0.5 + 0.5) * window.innerWidth;
          const sy = (-worldPos.y * 0.5 + 0.5) * window.innerHeight;
          npc.tagEl.style.left = `${sx}px`;
          npc.tagEl.style.top = `${sy}px`;
          npc.tagEl.style.opacity = Math.max(0, Math.min(1, 1 - (dist - 18) / 16)).toFixed(2);
        });

        // 3. Horizon Compass Bar
        const track = document.getElementById('compassTrack');
        if (track) {
          const camBearing = -this.camRig.yaw;
          const landmarks = [
            { label: 'N', angle: 0, color: 'text-amber-200' },
            { label: 'E', angle: Math.PI / 2, color: 'text-white/75' },
            { label: 'S', angle: Math.PI, color: 'text-white/75' },
            { label: 'W', angle: -Math.PI / 2, color: 'text-white/75' }
          ];

          this.shrines.forEach((sh) => {
            if (!sh.lit) {
              const ang = Math.atan2(sh.x - this.player.pos.x, -(sh.z - this.player.pos.z));
              landmarks.push({ label: '✦', angle: ang, color: 'text-teal-300 text-sm' });
            }
          });

          let html = '';
          landmarks.forEach((lm) => {
            let diff = lm.angle - camBearing;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            if (Math.abs(diff) < 1.15) {
              const pct = 50 + (diff / 1.15) * 46;
              html += `<span class="absolute ${lm.color} -translate-x-1/2" style="left:${pct.toFixed(1)}%">${lm.label}</span>`;
            }
          });
          track.innerHTML = html;
        }

        // 4. Contextual [E] / [Space] Prompts
        let best = null;
        let bestDist = 4.4;

        for (const sh of this.shrines) {
          const d = Math.hypot(sh.x - this.player.pos.x, sh.y - this.player.pos.y, sh.z - this.player.pos.z);
          if (d < bestDist) {
            bestDist = d;
            best = { kind: 'shrine', obj: sh, label: sh.lit ? 'Pulihkan Energi Angin' : `Selaraskan ${sh.name}` };
          }
        }
        for (const ch of this.chests) {
          if (ch.opened) continue;
          const d = Math.hypot(ch.x - this.player.pos.x, ch.y - this.player.pos.y, ch.z - this.player.pos.z);
          if (d < bestDist) {
            bestDist = d;
            best = { kind: 'chest', obj: ch, label: 'Buka Peti Harta Karun' };
          }
        }
        for (const cf of this.crystalflies) {
          if (cf.caught) continue;
          const d = Math.hypot(cf.group.position.x - this.player.pos.x, cf.group.position.y - (this.player.pos.y + 1.2), cf.group.position.z - this.player.pos.z);
          if (d < bestDist) {
            bestDist = d;
            best = { kind: 'crystalfly', obj: cf, label: 'Tangkap Anemo Crystalfly' };
          }
        }
        for (const npc of this.npcs) {
          const d = Math.hypot(npc.x - this.player.pos.x, npc.y - this.player.pos.y, npc.z - this.player.pos.z);
          if (d < bestDist) {
            bestDist = d;
            best = { kind: 'npc', obj: npc, label: `Bicara dengan ${npc.name}` };
          }
        }

        this.nearestInteractable = best;
        const prompt = document.getElementById('interactPrompt');
        const keyBadge = document.getElementById('interactKeyBadge');
        if (best) {
          keyBadge.textContent = 'E';
          document.getElementById('interactLabel').textContent = best.label;
          prompt.classList.remove('hidden');
        } else if (!this.player.onGround && !this.player.isGliding && this.player.stamina > 12) {
          keyBadge.textContent = 'Space';
          document.getElementById('interactLabel').textContent = 'Bentangkan Wind Glider';
          prompt.classList.remove('hidden');
        } else {
          prompt.classList.add('hidden');
        }

        this._checkRegion(false);
        this._renderMinimap();
      }

      _renderMinimap() {
        if (!this.mmCtx || this.hudHidden) return;
        const ctx = this.mmCtx;
        const size = 112;
        const half = size / 2;
        const scale = 0.52;

        ctx.save();
        ctx.clearRect(0, 0, size, size);
        ctx.beginPath();
        ctx.arc(half, half, half - 2, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = '#284a3b';
        ctx.fillRect(0, 0, size, size);

        // Mirror Lake on radar
        const lakeX = half + (-14 - this.player.pos.x) * scale;
        const lakeY = half + (-10 - this.player.pos.z) * scale;
        ctx.fillStyle = '#2d8db8';
        ctx.beginPath();
        ctx.arc(lakeX, lakeY, 22 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Wind Currents on radar
        this.skyRingMeshes.forEach((sr) => {
          const wx = half + (sr.x - this.player.pos.x) * scale;
          const wy = half + (sr.z - this.player.pos.z) * scale;
          ctx.strokeStyle = 'rgba(94, 252, 232, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(wx, wy, 4.5, 0, Math.PI * 2);
          ctx.stroke();
        });

        // Ancient Shrines
        this.shrines.forEach((sh) => {
          const sx = half + (sh.x - this.player.pos.x) * scale;
          const sy = half + (sh.z - this.player.pos.z) * scale;
          ctx.fillStyle = sh.lit ? '#4ee2c0' : '#94a3b8';
          ctx.beginPath();
          ctx.arc(sx, sy, 3.8, 0, Math.PI * 2);
          ctx.fill();
        });

        // Revealed Chests
        this.chests.forEach((ch) => {
          if (ch.opened || !ch.revealed) return;
          const cx = half + (ch.x - this.player.pos.x) * scale;
          const cy = half + (ch.z - this.player.pos.z) * scale;
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(cx - 2.2, cy - 2.2, 4.4, 4.4);
        });

        // NPCs
        this.npcs.forEach((npc) => {
          const nx = half + (npc.x - this.player.pos.x) * scale;
          const ny = half + (npc.z - this.player.pos.z) * scale;
          ctx.fillStyle = '#ffb8d2';
          ctx.beginPath();
          ctx.arc(nx, ny, 2.8, 0, Math.PI * 2);
          ctx.fill();
        });

        // Player Direction Arrow
        ctx.save();
        ctx.translate(half, half);
        ctx.rotate(-this.player.yaw);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(4, 4);
        ctx.lineTo(0, 2);
        ctx.lineTo(-4, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.restore();
      }

      render() {
        this.renderer.render(this.scene, this.camera);
      }
    }

    window.onload = function () {
      try {
        const game = new AetheriaCelShadedGame();
        let lastTime = performance.now();

        function animate(now) {
          const dt = Math.min((now - lastTime) / 1000, 0.05);
          lastTime = now;

          game.update(dt, now * 0.001);
          game.render();
          requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
      } catch (err) {
        console.error('Failed to initialize AETHERIA:', err);
      }
    };
